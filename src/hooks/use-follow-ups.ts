import { useState, useCallback, useEffect } from "react";
import { FollowUp } from "@/data/ar-types";
import { MOCK_FOLLOW_UPS } from "@/data/ar-mock-data";

const STORAGE_KEY = "ar-follow-ups";

function loadFromStorage(): Record<string, FollowUp[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return {};
}

function saveToStorage(data: Record<string, FollowUp[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
}

let nextId = Date.now();
function generateId(): string {
  return `fu-${nextId++}`;
}

// Generate realistic demo follow-ups for any invoice based on days overdue
function generateDemoFollowUps(invoiceId: string, daysOverdue: number, contactName: string, isCardPayment: boolean): FollowUp[] {
  if (daysOverdue < 5) return [];

  const today = new Date();
  const entries: FollowUp[] = [];
  let idCounter = 0;
  const mkId = () => `demo-${invoiceId}-${idCounter++}`;
  const daysAgo = (d: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().slice(0, 10);
  };

  const name = contactName || "Customer";

  // 1st reminder email — sent when ~5 days overdue
  if (daysOverdue >= 5) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 3), type: "email",
      summary: "1st reminder sent",
      details: isCardPayment
        ? `Dear ${name},\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team`
        : `Dear ${name},\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team`,
    });
  }

  // Call attempt #1 — ~8 days overdue
  if (daysOverdue >= 10) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 7), type: "call",
      summary: "Call attempt #1 — No answer", callOutcome: "no-answer",
    });
  }

  // 2nd reminder email — ~14 days overdue
  if (daysOverdue >= 15) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 12), type: "email",
      summary: "2nd reminder sent",
      details: isCardPayment
        ? `Dear ${name},\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team`
        : `Dear ${name},\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment at the earliest and confirm.\n\nOnce done, kindly share the payment details for our reference.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team`,
    });
  }

  // Call attempt #2 — ~18 days
  if (daysOverdue >= 20) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 17), type: "call",
      summary: "Call attempt #2 — Voicemail, left message", callOutcome: "voicemail",
    });
  }

  // Final reminder email — ~25 days
  if (daysOverdue >= 28) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 24), type: "email",
      summary: "3rd and final reminder sent",
      details: `Dear ${name},\n\nThis is our final reminder regarding the overdue payment for the attached invoice.\n\nDespite multiple attempts to reach you, we have not received a response.\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.\n\nKind regards,\nAR Team`,
    });
  }

  // Escalation to Ops — ~32 days
  if (daysOverdue >= 35) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 31), type: "escalation",
      summary: "Escalated to Ops Team", escalationTarget: "ops",
    });
  }

  // Escalation to Trevor — ~40 days
  if (daysOverdue >= 42) {
    entries.push({
      id: mkId(), invoiceId, date: daysAgo(daysOverdue - 38), type: "escalation",
      summary: "Escalated to Trevor", escalationTarget: "trevor",
    });
  }

  return entries;
}

// Cache for generated demo follow-ups so they stay stable across renders
const demoCache = new Map<string, FollowUp[]>();

export function useFollowUps() {
  const [userFollowUps, setUserFollowUps] = useState<Record<string, FollowUp[]>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(userFollowUps);
  }, [userFollowUps]);

  const getFollowUps = useCallback(
    (invoiceId: string, daysOverdue?: number, contactName?: string, paymentMode?: string): FollowUp[] => {
      const mock = MOCK_FOLLOW_UPS[invoiceId] || [];
      const user = userFollowUps[invoiceId] || [];

      // If no mock data exists for this invoice and we have overdue info, generate demo data
      let demo: FollowUp[] = [];
      if (mock.length === 0 && daysOverdue !== undefined && daysOverdue >= 5) {
        if (!demoCache.has(invoiceId)) {
          const isCard = !!(paymentMode && (paymentMode.toLowerCase().includes("credit") || paymentMode.toLowerCase().includes("paypal") || paymentMode.toLowerCase().includes("cc")));
          demoCache.set(invoiceId, generateDemoFollowUps(invoiceId, daysOverdue, contactName || "Customer", isCard));
        }
        demo = demoCache.get(invoiceId) || [];
      }

      return [...user, ...mock, ...demo].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    [userFollowUps]
  );

  const addFollowUp = useCallback(
    (invoiceId: string, followUp: Omit<FollowUp, "id" | "invoiceId">) => {
      const entry: FollowUp = {
        ...followUp,
        id: generateId(),
        invoiceId,
      };
      setUserFollowUps((prev) => ({
        ...prev,
        [invoiceId]: [entry, ...(prev[invoiceId] || [])],
      }));
      return entry;
    },
    []
  );

  const getAllFollowUps = useCallback((): Record<string, FollowUp[]> => {
    const allIds = new Set([...Object.keys(MOCK_FOLLOW_UPS), ...Object.keys(userFollowUps)]);
    const result: Record<string, FollowUp[]> = {};
    for (const id of allIds) {
      const mock = MOCK_FOLLOW_UPS[id] || [];
      const user = userFollowUps[id] || [];
      result[id] = [...user, ...mock].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return result;
  }, [userFollowUps]);

  return { getFollowUps, addFollowUp, getAllFollowUps };
}
