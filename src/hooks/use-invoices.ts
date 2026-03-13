import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ClientGroup, Invoice, Stakeholder, FollowUp, PaymentRecord } from "@/data/ar-types";
import { fetchOverdueInvoices, fetchAllInvoices, fetchStats, ApiStats, ApiInvoice } from "@/data/api";
import { MOCK_INVOICES, MOCK_PAYMENT_HISTORY } from "@/data/ar-mock-data";
import { useFollowUps } from "./use-follow-ups";

// ── Days Overdue (dynamic) ─────────────────────────────────────────

export function computeDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

// ── Next Step Logic ───────────────────────────────────────────────

export function computeNextStep(followUps: FollowUp[], daysOverdue: number): string {
  if (followUps.length === 0) {
    if (daysOverdue >= 45) return "Urgent: Send reminder & escalate to Ops immediately";
    if (daysOverdue >= 30) return "Overdue 30+ days — send reminder & call immediately";
    return "Send first reminder email";
  }

  const emails = followUps.filter((f) => f.type === "email");
  const calls = followUps.filter((f) => f.type === "call");
  const escalations = followUps.filter((f) => f.type === "escalation");

  const lastFollowUp = followUps[0]; // already sorted newest first
  const daysSinceLast = Math.floor(
    (Date.now() - new Date(lastFollowUp.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check escalation state
  const hasOpsEscalation = escalations.some((e) => e.escalationTarget === "ops");
  const hasTrevorEscalation = escalations.some((e) => e.escalationTarget === "trevor");
  const hasOfirEscalation = escalations.some((e) => e.escalationTarget === "ofir");
  const hasDavidEscalation = escalations.some((e) => e.escalationTarget === "david");

  if (hasDavidEscalation) return "Awaiting David's decision";
  if (hasOfirEscalation && daysSinceLast >= 5) return "Follow up with Ofir or escalate to David";
  if (hasOfirEscalation) return "Awaiting Ofir's response";
  if (hasTrevorEscalation && daysSinceLast >= 7) return "Escalate to Ofir";
  if (hasTrevorEscalation) return "Awaiting Trevor's response";
  if (hasOpsEscalation && daysSinceLast >= 5) return "Escalate to Trevor";
  if (hasOpsEscalation) return "Awaiting Ops response";

  // Day 31+: Must be escalated — business decision required
  if (daysOverdue >= 31 && !hasOpsEscalation) {
    return "Share problematic list with Sales/Ops — escalate to Trevor & Ofir";
  }

  // Day 21-30: Problematic list stage — request Ops/Sales intervention
  if (daysOverdue >= 21 && emails.length >= 3) {
    return "Share with Sales/Ops team — research alternative contacts";
  }

  // Day 15-20: 3rd follow-up stage — 8+ calls/week, request Ops intervention
  if (daysOverdue >= 15 && emails.length >= 2) {
    if (calls.length < 8) return "Increase call frequency (8+/week) — send 3rd reminder";
    return "Request Ops team to intervene and follow up with client";
  }

  // Day 8-14: 2nd follow-up stage — 5-7 calls/week
  if (daysOverdue >= 8 && emails.length >= 1) {
    if (daysSinceLast >= 2 && emails.length < 2) return "Send 2nd reminder email — increase calls to 5-7/week";
    if (calls.length < 3 && daysSinceLast >= 1) return "Call client (target: 5-7 calls/week)";
    return "Continue follow-up calls — check for OPS concerns";
  }

  // Day 1-7: First follow-up stage — 3 calls/week
  if (emails.length >= 1 && calls.length === 0 && daysSinceLast >= 1) return "Call the client (target: 3 calls/week)";
  if (calls.length >= 1 && emails.length < 2 && daysSinceLast >= 2) return "Send follow-up email";
  if (daysSinceLast >= 3) return "Follow up — no activity in " + daysSinceLast + " days";

  return "Review and decide next action";
}

// ── Payment Intelligence ──────────────────────────────────────────

function computePaymentScore(history: PaymentRecord[]): {
  avgDaysToPay: number | null;
  onTimeRate: number | null;
  paymentScore: number | null;
} {
  if (history.length === 0) return { avgDaysToPay: null, onTimeRate: null, paymentScore: null };

  const avgDays = Math.round(
    history.reduce((sum, r) => sum + r.daysToPayAfterDue, 0) / history.length
  );
  const onTime = history.filter((r) => r.daysToPayAfterDue <= 0).length;
  const onTimeRate = Math.round((onTime / history.length) * 100) / 100;

  // Score: 10 = always on time, 1 = chronically late
  let score: number;
  if (avgDays <= 0) score = 10;
  else if (avgDays <= 5) score = 8;
  else if (avgDays <= 10) score = 7;
  else if (avgDays <= 15) score = 5;
  else if (avgDays <= 25) score = 3;
  else if (avgDays <= 35) score = 2;
  else score = 1;

  return { avgDaysToPay: avgDays, onTimeRate, paymentScore: score };
}

// ── Grouping Logic ────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function groupInvoices(
  apiInvoices: ApiInvoice[],
  allFollowUps: Record<string, FollowUp[]>,
  paymentHistoryMap: Record<string, PaymentRecord[]>,
  skipStatusFilter = false
): ClientGroup[] {
  const eligible = skipStatusFilter
    ? apiInvoices
    : apiInvoices.filter((inv) => {
        const isPastDue = inv.daysOverdue > 0 || (inv.dueDate && new Date(inv.dueDate) < new Date());
        const status = inv.paymentStatus?.toLowerCase() || "";
        const isPaid = status.includes("paid") && !status.includes("partial");
        const isCancelled = status.includes("cancelled");
        return isPastDue && !isPaid && !isCancelled;
      });

  const groupMap = new Map<string, ApiInvoice[]>();

  for (const inv of eligible) {
    const key = inv.companyName;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(inv);
  }

  const groups: ClientGroup[] = [];

  for (const [companyName, invoices] of groupMap) {
    // Group by contact email → stakeholders
    const stakeholderMap = new Map<string, { inv: ApiInvoice; invoices: Invoice[] }>();

    for (const apiInv of invoices) {
      const email = apiInv.contactEmail || "unknown";
      if (!stakeholderMap.has(email)) {
        stakeholderMap.set(email, { inv: apiInv, invoices: [] });
      }

      const followUps = allFollowUps[apiInv.id] || [];
      const dynamicDaysOverdue = computeDaysOverdue(apiInv.dueDate);
      stakeholderMap.get(email)!.invoices.push({
        id: apiInv.id,
        invoiceNumber: apiInv.invoiceNumber,
        amount: apiInv.amount,
        invoiceDate: apiInv.invoiceDate,
        dueDate: apiInv.dueDate,
        daysOverdue: dynamicDaysOverdue,
        paymentStatus: apiInv.paymentStatus,
        potentialNumber: apiInv.potentialNumber,
        contractNumber: apiInv.contractNumber,
        service: apiInv.service,
        projectName: apiInv.projectName,
        paymentMode: apiInv.paymentMode,
        billingEntity: apiInv.billingEntity,
        followUps,
      });
    }

    const stakeholders: Stakeholder[] = [];
    for (const [email, data] of stakeholderMap) {
      // Sort invoices by daysOverdue desc within stakeholder
      data.invoices.sort((a, b) => b.daysOverdue - a.daysOverdue);
      stakeholders.push({
        id: slugify(email),
        name: data.inv.contactName,
        email,
        phone: data.inv.contactPhone,
        invoices: data.invoices,
      });
    }

    // Compute aggregates
    const allInvoices = stakeholders.flatMap((s) => s.invoices);
    const totalOutstanding = allInvoices.reduce((s, inv) => s + inv.amount, 0);
    const invoiceCount = allInvoices.length;
    const mostOverdueDays = Math.max(...allInvoices.map((inv) => inv.daysOverdue), 0);

    // Last follow-up across all invoices
    const allInvoiceFollowUps = allInvoices
      .flatMap((inv) => inv.followUps)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastFollowUpDate = allInvoiceFollowUps[0]?.date ?? null;
    const lastFollowUpSummary = allInvoiceFollowUps[0]?.summary ?? null;

    // Next step: based on the most overdue invoice's follow-ups
    const mostOverdueInvoice = allInvoices.reduce(
      (max, inv) => (inv.daysOverdue > max.daysOverdue ? inv : max),
      allInvoices[0]
    );
    const nextStep = computeNextStep(mostOverdueInvoice.followUps, mostOverdueInvoice.daysOverdue);

    // Payment intelligence
    const history = paymentHistoryMap[companyName] || [];
    const { avgDaysToPay, onTimeRate, paymentScore } = computePaymentScore(history);

    groups.push({
      id: slugify(companyName),
      companyName,
      stakeholders,
      totalOutstanding,
      invoiceCount,
      mostOverdueDays,
      lastFollowUpDate,
      lastFollowUpSummary,
      nextStep,
      paymentHistory: history,
      avgDaysToPay,
      onTimeRate,
      paymentScore,
    });
  }

  // Sort by most overdue by default
  groups.sort((a, b) => b.mostOverdueDays - a.mostOverdueDays);

  return groups;
}

// ── Convert mock data to ApiInvoice format ────────────────────────

function mockToApiInvoices(): ApiInvoice[] {
  return MOCK_INVOICES.map((m) => ({
    id: m.id,
    invoiceNumber: m.invoiceNumber,
    amount: m.amount,
    invoiceDate: m.invoiceDate,
    dueDate: m.dueDate,
    daysOverdue: m.daysOverdue,
    paymentStatus: m.paymentStatus,
    companyName: m.companyName,
    contactName: m.contactName,
    contactEmail: m.contactEmail,
    contactPhone: m.contactPhone,
    potentialNumber: m.potentialNumber,
    contractNumber: m.contractNumber,
    service: m.service,
    projectName: m.projectName,
    paymentMode: m.paymentMode,
    billingEntity: m.billingEntity,
  }));
}

// ── Hooks ─────────────────────────────────────────────────────────

export function useInvoices() {
  const { getAllFollowUps } = useFollowUps();

  const queryResult = useQuery<ApiInvoice[]>({
    queryKey: ["invoices", "overdue"],
    queryFn: fetchOverdueInvoices,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
    placeholderData: mockToApiInvoices(),
  });

  // Fetch all invoices (including paid) just for unique payment statuses
  const allInvoicesQuery = useQuery<ApiInvoice[]>({
    queryKey: ["invoices", "all"],
    queryFn: fetchAllInvoices,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    retry: 1,
  });

  const allFollowUps = getAllFollowUps();

  const clientGroups = useMemo(
    () =>
      groupInvoices(
        queryResult.data || mockToApiInvoices(),
        allFollowUps,
        MOCK_PAYMENT_HISTORY
      ),
    [queryResult.data, allFollowUps]
  );

  const allClientGroups = useMemo(
    () =>
      allInvoicesQuery.data
        ? groupInvoices(allInvoicesQuery.data, allFollowUps, MOCK_PAYMENT_HISTORY, true)
        : clientGroups,
    [allInvoicesQuery.data, allFollowUps, clientGroups]
  );

  const allPaymentStatuses = useMemo(() => {
    const statuses = new Set<string>();
    const invoices = allInvoicesQuery.data || queryResult.data || [];
    for (const inv of invoices) {
      if (inv.paymentStatus) statuses.add(inv.paymentStatus);
    }
    return Array.from(statuses).sort();
  }, [allInvoicesQuery.data, queryResult.data]);

  return {
    clientGroups,
    allClientGroups,
    allPaymentStatuses,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    dataUpdatedAt: queryResult.dataUpdatedAt,
  };
}

export function useStats() {
  return useQuery<ApiStats>({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });
}
