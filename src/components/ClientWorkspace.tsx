import { useState, useEffect } from "react";
import {
  ClientGroup, Invoice, Stakeholder, FollowUp,
  ACTIONS, CALL_OUTCOMES, ESCALATION_TARGETS, RESOLUTION_TYPES,
  CallOutcome, EscalationTarget, ResolutionType, FollowUpType,
  getStageForDays,
} from "@/data/ar-types";
import { computeNextStep } from "@/hooks/use-invoices";
import { useFollowUps } from "@/hooks/use-follow-ups";
import { useInvoiceMeta } from "@/hooks/use-invoice-meta";
import { cn } from "@/lib/utils";
import {
  Mail, Phone, StickyNote, AlertTriangle, Copy, ChevronDown, ChevronRight,
  ChevronLeft, Clock, ExternalLink, FileText, TrendingDown, TrendingUp,
  CheckCircle2, Send, Lightbulb, Building2, BarChart3, X, Paperclip,
  PhoneCall, User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface DailySummary {
  totalAccounts: number;
  contactedToday: number;
  callsToday: number;
  promisesExpiring: number;
  opsQueriesPending: number;
}

interface ClientWorkspaceProps {
  client: ClientGroup | null;
  onGoBack?: () => void;
  dailySummary?: DailySummary;
  nextClient?: { id: string; name: string; daysOverdue: number } | null;
  onSelectClient?: (id: string) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function paymentStatusBadge(status: string): { label: string; className: string } {
  const s = status.toLowerCase();
  if (s.includes("disputed")) return { label: "Disputed", className: "badge-disputed" };
  if (s.includes("partial")) return { label: "Partially Paid", className: "badge-partial" };
  if (s.includes("promise")) return { label: "Payment Promised", className: "badge-promised" };
  if (s.includes("paid")) return { label: "Paid", className: "badge-paid" };
  if (s.includes("pending")) return { label: "Payment Pending", className: "badge-unpaid" };
  return { label: status || "Unpaid", className: "badge-unpaid" };
}

function overdueBadge(days: number): string {
  if (days >= 45) return "severity-critical";
  if (days >= 30) return "severity-high";
  if (days >= 15) return "severity-medium";
  return "severity-low";
}

// ── AR Stage Badge ──────────────────────────────────────────────────

function StageBadge({ daysOverdue }: { daysOverdue: number }) {
  const stage = getStageForDays(daysOverdue);
  return (
    <span className={cn("text-[9px] font-semibold rounded-md px-1.5 py-0.5 whitespace-nowrap", `stage-${stage.color}`)}>
      {stage.shortLabel}
    </span>
  );
}

// ── Call Progress ───────────────────────────────────────────────────

function getCallTarget(daysOverdue: number): number {
  if (daysOverdue >= 15) return 8;
  if (daysOverdue >= 8) return 6;  // midpoint of 5-7
  if (daysOverdue >= 1) return 3;
  return 0;
}

function getCallsThisWeek(followUps: FollowUp[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  return followUps.filter(
    (f) => f.type === "call" && new Date(f.date) >= startOfWeek
  ).length;
}

function CallProgress({ followUps, daysOverdue }: { followUps: FollowUp[]; daysOverdue: number }) {
  const target = getCallTarget(daysOverdue);
  if (target === 0) return null;
  const calls = getCallsThisWeek(followUps);
  const pct = Math.min(100, Math.round((calls / target) * 100));
  const color = pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <PhoneCall className="w-3 h-3 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-medium text-muted-foreground">Calls this week</span>
          <span className="text-[10px] font-mono font-semibold tabular-nums text-foreground">{calls}/{target}</span>
        </div>
        <div className="call-progress-track">
          <div className={cn("call-progress-fill", color)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Email Templates ─────────────────────────────────────────────────

export type EmailTemplateType = "reminder" | "ops-query-ack" | "post-resolution";

const EMAIL_TEMPLATE_OPTIONS: { value: EmailTemplateType; label: string }[] = [
  { value: "reminder", label: "Payment Reminder" },
  { value: "ops-query-ack", label: "OPS Query Acknowledgment" },
  { value: "post-resolution", label: "Post-Resolution Follow-up" },
];

function generateEmailTemplate(
  invoice: Invoice,
  stakeholder: Stakeholder,
  companyName: string,
  reminderCount: number,
  senderName: string,
  templateType: EmailTemplateType = "reminder",
): { subject: string; body: string } {
  const isCardPayment = invoice.paymentMode?.toLowerCase().includes("credit") ||
    invoice.paymentMode?.toLowerCase().includes("paypal") ||
    invoice.paymentMode?.toLowerCase().includes("cc");

  const subjectBase = `Invoice ${invoice.invoiceNumber} - ${companyName}`;
  const signOff = `\n\nKind regards,\n${senderName}`;

  // OPS query acknowledgment — customer raised a concern, we forward to ops
  if (templateType === "ops-query-ack") {
    return {
      subject: `Re: ${subjectBase} - Query Acknowledged`,
      body: `Dear ${stakeholder.name},\n\nThank you for your message regarding invoice #${invoice.invoiceNumber}.\n\nWe have noted your concern and have shared your query with our operations team. A member of the team will be in touch with you shortly to address this matter.\n\nIn the meantime, please do not hesitate to reach out if you have any additional questions or require further assistance.${signOff}`,
    };
  }

  // Post-resolution — ops resolved the concern, now please pay
  if (templateType === "post-resolution") {
    return {
      subject: `Re: ${subjectBase} - Issue Resolved`,
      body: isCardPayment
        ? `Dear ${stakeholder.name},\n\nWe are writing to inform you that the concern you raised regarding invoice #${invoice.invoiceNumber} has been reviewed and addressed by our team.\n\nNow that the matter has been resolved, we would appreciate if you could process the pending payment by clicking on the below link at your earliest convenience.\n\nShould you have any further questions, please do not hesitate to contact us.${signOff}`
        : `Dear ${stakeholder.name},\n\nWe are writing to inform you that the concern you raised regarding invoice #${invoice.invoiceNumber} has been reviewed and addressed by our team.\n\nNow that the matter has been resolved, we would appreciate if you could initiate the pending payment at your earliest convenience and confirm once done.\n\nShould you have any further questions, please do not hesitate to contact us.${signOff}`,
    };
  }

  // Standard reminders
  if (reminderCount === 0) {
    return {
      subject: `${subjectBase} - Reminder 1`,
      body: isCardPayment
        ? `Dear ${stakeholder.name},\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.${signOff}`
        : `Dear ${stakeholder.name},\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.${signOff}`,
    };
  }

  if (reminderCount === 1) {
    return {
      subject: `${subjectBase} - Reminder 2`,
      body: isCardPayment
        ? `Dear ${stakeholder.name},\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.${signOff}`
        : `Dear ${stakeholder.name},\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment at the earliest and confirm.\n\nOnce done, kindly share the payment details for our reference.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.${signOff}`,
    };
  }

  return {
    subject: `${subjectBase} - Final Reminder`,
    body: `Dear ${stakeholder.name},\n\nThis is our final reminder regarding the overdue payment for invoice #${invoice.invoiceNumber}.\n\nDespite multiple attempts to reach you, we have not received a response. The details are as follows:\n\n- Invoice: ${invoice.invoiceNumber}\n- Amount: ${formatCurrency(invoice.amount)}\n- Due Date: ${formatDate(invoice.dueDate)}\n- Days Overdue: ${invoice.daysOverdue}\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.${signOff}`,
  };
}

// ── Follow-Up Timeline Item ─────────────────────────────────────────

const followUpIcons: Record<FollowUpType, React.ElementType> = {
  email: Mail, call: Phone, note: StickyNote, escalation: AlertTriangle,
};
const followUpColors: Record<FollowUpType, string> = {
  email: "bg-blue-50 text-blue-600 border-blue-200",
  call: "bg-amber-50 text-amber-600 border-amber-200",
  note: "bg-slate-100 text-slate-500 border-slate-200",
  escalation: "bg-red-50 text-red-600 border-red-200",
};

function FollowUpItem({ entry }: { entry: FollowUp }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = followUpIcons[entry.type];
  const hasDetails = !!entry.details;

  return (
    <div className="flex gap-3 group/fu">
      <div className="flex flex-col items-center">
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 border", followUpColors[entry.type])}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="w-px flex-1 bg-border/60 mt-1" />
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-medium text-foreground leading-tight">{entry.summary}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 font-mono tabular-nums">{formatDate(entry.date)}</span>
        </div>
        {entry.escalationTarget && (
          <span className="inline-block text-[10px] font-medium rounded-md px-1.5 py-0.5 mt-1 bg-red-50 text-red-700 border border-red-200">
            To: {ESCALATION_TARGETS.find(t => t.value === entry.escalationTarget)?.label}
          </span>
        )}
        {entry.callOutcome && (
          <span className="inline-block text-[10px] font-medium rounded-md px-1.5 py-0.5 mt-1 bg-amber-50 text-amber-700 border border-amber-200">
            {CALL_OUTCOMES.find(c => c.value === entry.callOutcome)?.label}
          </span>
        )}
        {hasDetails && (
          <>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 mt-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors font-medium"
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {expanded ? "Hide details" : "View details"}
            </button>
            {expanded && entry.details && (
              <pre className="mt-2 text-[11px] text-muted-foreground bg-muted/60 rounded-lg px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed border border-border">
                {entry.details}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Email Thread View ──────────────────────────────────────────────

function EmailThread({ emails }: { emails: FollowUp[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-muted/30 transition-colors"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-200">
          <Mail className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-semibold text-foreground">Emails Sent</span>
          <span className="text-[10px] text-muted-foreground ml-1.5">({emails.length})</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{formatDate(emails[0]?.date)}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border">
          {emails.map((email, idx) => (
            <div key={email.id} className={cn("px-4 py-3", idx > 0 && "border-t border-border/60")}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-[11px] font-medium text-foreground truncate">{email.summary}</p>
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums shrink-0">{formatDate(email.date)}</span>
              </div>
              {email.details && (
                <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed mt-1">
                  {email.details}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Payment Intelligence ────────────────────────────────────────────

function PaymentIntelligence({ client }: { client: ClientGroup }) {
  const { paymentHistory, avgDaysToPay, onTimeRate, paymentScore } = client;

  if (paymentHistory.length === 0) {
    return (
      <div className="p-3">
        <p className="text-[11px] text-muted-foreground">No payment history available for this client.</p>
      </div>
    );
  }

  const scoreColor = paymentScore !== null
    ? paymentScore >= 7 ? "text-green-600" : paymentScore >= 4 ? "text-amber-600" : "text-red-600"
    : "text-muted-foreground";
  const scoreBarColor = paymentScore !== null
    ? paymentScore >= 7 ? "bg-green-500" : paymentScore >= 4 ? "bg-amber-500" : "bg-red-500"
    : "bg-muted";

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground mb-0.5">Avg Days to Pay</p>
          <p className={cn("text-base font-bold font-mono tabular-nums", scoreColor)}>
            {avgDaysToPay !== null ? (avgDaysToPay > 0 ? `+${avgDaysToPay}` : avgDaysToPay) : "--"}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground mb-0.5">On-Time Rate</p>
          <p className="text-base font-bold font-mono tabular-nums text-foreground">
            {onTimeRate !== null ? `${Math.round(onTimeRate * 100)}%` : "--"}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground mb-0.5">Score</p>
          <div className="flex items-baseline gap-1">
            <p className={cn("text-base font-bold font-mono tabular-nums", scoreColor)}>{paymentScore ?? "--"}</p>
            <span className="text-[10px] text-muted-foreground">/10</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
            <div className={cn("h-full rounded-full", scoreBarColor)} style={{ width: `${(paymentScore ?? 0) * 10}%` }} />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent Payments</p>
        <div className="space-y-1">
          {paymentHistory.slice(0, 4).map((rec) => (
            <div key={rec.invoiceNumber} className="flex items-center gap-2 text-[11px] py-1">
              <span className="font-mono text-muted-foreground w-28 shrink-0">{rec.invoiceNumber}</span>
              <span className="font-mono font-medium text-foreground w-20 shrink-0 text-right tabular-nums">{formatCurrency(rec.amount)}</span>
              <span className="text-muted-foreground flex-1 text-right">
                {rec.daysToPayAfterDue <= 0 ? (
                  <span className="text-green-600 flex items-center gap-0.5 justify-end"><TrendingUp className="w-3 h-3" /> On time</span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-0.5 justify-end"><TrendingDown className="w-3 h-3" /> +{rec.daysToPayAfterDue}d late</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export function ClientWorkspace({ client, onGoBack, dailySummary, nextClient, onSelectClient }: ClientWorkspaceProps) {
  const { addFollowUp, getFollowUps } = useFollowUps();
  const { getMeta, setMeta } = useInvoiceMeta();

  const [activeStakeholderIdx, setActiveStakeholderIdx] = useState(0);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailFrom, setEmailFrom] = useState("Finance Team");
  const [emailCc, setEmailCc] = useState("billing@flatwallsolutions.com");
  const [emailTemplateType, setEmailTemplateType] = useState<EmailTemplateType>("reminder");
  const [activePanel, setActivePanel] = useState<"call" | "note" | "escalate" | "resolve" | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [escalationTarget, setEscalationTarget] = useState<typeof ESCALATION_TARGETS[number] | null>(null);
  const [escalationSubject, setEscalationSubject] = useState("");
  const [escalationBody, setEscalationBody] = useState("");
  const [noteText, setNoteText] = useState("");
  const [quickCallOutcome, setQuickCallOutcome] = useState<string | null>(null);
  const [pendingOpsFlag, setPendingOpsFlag] = useState(false);
  const [pendingPromiseDate, setPendingPromiseDate] = useState<string>("");
  const [showPaymentIntel, setShowPaymentIntel] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Auto-select first invoice when client changes
  useEffect(() => {
    if (client) {
      setActiveStakeholderIdx(0);
      const firstInvoice = client.stakeholders[0]?.invoices[0];
      setSelectedInvoiceId(firstInvoice?.id ?? null);
    } else {
      setSelectedInvoiceId(null);
    }
  }, [client?.id]);

  // Populate email when invoice is selected
  useEffect(() => {
    if (!client || !selectedInvoiceId) return;
    const stakeholder = client.stakeholders[activeStakeholderIdx];
    if (!stakeholder) return;
    const invoice = stakeholder.invoices.find(i => i.id === selectedInvoiceId);
    if (!invoice) return;

    const followUps = getFollowUps(invoice.id, invoice.daysOverdue, stakeholder.name, invoice.paymentMode);
    const emailCount = followUps.filter(f => f.type === "email").length;
    const tmpl = generateEmailTemplate(invoice, stakeholder, client.companyName, emailCount, emailFrom, emailTemplateType);
    setEmailSubject(tmpl.subject);
    setEmailBody(tmpl.body);
    setEmailTo(stakeholder.email);
  }, [selectedInvoiceId, activeStakeholderIdx, client?.id, emailFrom, emailTemplateType]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4 border border-border">
          <Building2 className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold">Select a client</p>
        <p className="text-xs mt-1 text-center max-w-[240px]">
          Choose a client from the list to view their invoices and follow-up history.
        </p>
      </div>
    );
  }

  const stakeholder: Stakeholder | undefined = client.stakeholders[activeStakeholderIdx];
  const invoices = stakeholder?.invoices || [];
  const selectedInvoice = selectedInvoiceId ? invoices.find(i => i.id === selectedInvoiceId) : null;
  const followUps = selectedInvoice ? getFollowUps(selectedInvoice.id, selectedInvoice.daysOverdue, stakeholder?.name, selectedInvoice.paymentMode) : [];
  const nextStep = selectedInvoice ? computeNextStep(followUps, selectedInvoice.daysOverdue) : client.nextStep;

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id);
  };

  const handleSendEmail = () => {
    if (!selectedInvoice) return;
    addFollowUp(selectedInvoice.id, {
      date: new Date().toISOString().slice(0, 10),
      type: "email",
      summary: `Email sent: ${emailSubject}`,
      details: emailBody,
    });
    toast.success(`Email sent to ${emailTo}`, {
      description: `CC: ${emailCc}`,
      action: nextClient && onSelectClient ? {
        label: `Next: ${nextClient.name} →`,
        onClick: () => onSelectClient(nextClient.id),
      } : undefined,
    });
  };

  const handleSelectEscalationTarget = (target: typeof ESCALATION_TARGETS[number]) => {
    if (!selectedInvoice) return;
    setEscalationTarget(target);
    setEscalationSubject(`Escalation: ${client.companyName} \u2014 Invoice ${selectedInvoice.invoiceNumber}`);
    setEscalationBody(
      `Hi ${target.label},\n\nI'm escalating the following overdue invoice for your attention:\n\n` +
      `Client: ${client.companyName}\n` +
      `Invoice: ${selectedInvoice.invoiceNumber}\n` +
      `Amount: ${formatCurrency(selectedInvoice.amount)}\n` +
      `Days Overdue: ${selectedInvoice.daysOverdue}\n` +
      `Payment Status: ${selectedInvoice.paymentStatus}\n` +
      `\nPlease advise on next steps.\n\nThank you`
    );
  };

  const handleSendEscalation = () => {
    if (!selectedInvoice || !escalationTarget) return;
    const today = new Date().toISOString().slice(0, 10);
    addFollowUp(selectedInvoice.id, {
      date: today, type: "escalation",
      summary: `Escalated to ${escalationTarget.label}`,
      escalationTarget: escalationTarget.value as EscalationTarget,
      details: escalationBody,
    });
    toast.success(`Escalation email sent to ${escalationTarget.label}`, {
      description: escalationSubject,
      action: nextClient && onSelectClient ? {
        label: `Next: ${nextClient.name} →`,
        onClick: () => onSelectClient(nextClient.id),
      } : undefined,
    });
    setEscalationTarget(null);
    setEscalationSubject("");
    setEscalationBody("");
    setActivePanel(null);
  };

  const togglePanel = (panel: "call" | "note" | "escalate" | "resolve") => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      setSelectedOutcome("");
      setNoteText("");
      setEscalationTarget(null);
      setEscalationSubject("");
      setEscalationBody("");
    }
  };

  const handlePanelConfirm = (type: "call" | "note" | "resolve") => {
    if (!selectedInvoice) return;
    const today = new Date().toISOString().slice(0, 10);

    if (type === "call") {
      addFollowUp(selectedInvoice.id, {
        date: today, type: "call",
        summary: `Call -- ${CALL_OUTCOMES.find(c => c.value === selectedOutcome)?.label || selectedOutcome}`,
        callOutcome: selectedOutcome as CallOutcome,
        details: noteText || undefined,
      });
      toast.success(`Call logged for ${client.companyName}`, {
        action: nextClient && onSelectClient ? {
          label: `Next: ${nextClient.name} →`,
          onClick: () => onSelectClient(nextClient.id),
        } : undefined,
      });
    } else if (type === "note") {
      addFollowUp(selectedInvoice.id, {
        date: today, type: "note",
        summary: noteText.slice(0, 100), details: noteText,
      });
      toast.success("Note added");
    } else if (type === "resolve") {
      const resolution = RESOLUTION_TYPES.find(r => r.value === selectedOutcome);
      addFollowUp(selectedInvoice.id, {
        date: today, type: "note",
        summary: `Resolved: ${resolution?.label || selectedOutcome}`,
        details: noteText || undefined,
      });
      toast.success(`Marked as ${resolution?.label}`, {
        action: nextClient && onSelectClient ? {
          label: `Next: ${nextClient.name} →`,
          onClick: () => onSelectClient(nextClient.id),
        } : undefined,
      });
    }

    setActivePanel(null);
    setSelectedOutcome("");
    setNoteText("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Client Header ── */}
      <div className="shrink-0 border-b border-border bg-card">
        <div className="px-4 pt-3 pb-2.5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{client.companyName}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {(() => {
                  const allPaid = client.stakeholders.every(s =>
                    s.invoices.every(inv => {
                      const ps = inv.paymentStatus?.toLowerCase() ?? "";
                      return ps.includes("paid") && !ps.includes("partial");
                    })
                  );
                  if (allPaid) return `${client.invoiceCount} invoice${client.invoiceCount !== 1 ? "s" : ""} — Paid`;
                  return `${client.invoiceCount} invoice${client.invoiceCount !== 1 ? "s" : ""} overdue \u00b7 Most overdue: ${client.mostOverdueDays}d`;
                })()}
              </p>
            </div>
          </div>

          {stakeholder && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[12px] font-semibold text-foreground">{stakeholder.name}</span>
              <span className="text-border">|</span>
              <button
                onClick={() => { navigator.clipboard.writeText(stakeholder.email); toast.success("Email copied"); }}
                className="flex items-center gap-1 text-[11px] text-primary/80 hover:text-primary transition-colors"
              >
                <Mail className="w-3 h-3" />
                {stakeholder.email}
                <Copy className="w-2.5 h-2.5 opacity-40" />
              </button>
              {stakeholder.phone && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{stakeholder.phone}</span>
                  <button
                    onClick={() => toast.success(`Calling ${stakeholder.name}`, { description: stakeholder.phone })}
                    className="flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {client.stakeholders.length > 1 && (
          <div className="flex gap-0 px-4 border-t border-border">
            {client.stakeholders.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => { setActiveStakeholderIdx(idx); setSelectedInvoiceId(s.invoices[0]?.id ?? null); }}
                className={cn(
                  "px-3 py-2 text-[11px] font-medium transition-colors relative",
                  activeStakeholderIdx === idx ? "text-foreground tab-indicator" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.name}
                <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">{s.invoices.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Daily Progress Bar ── */}
      {dailySummary && (
        <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-1.5 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-foreground tabular-nums">{dailySummary.contactedToday}/{dailySummary.totalAccounts}</span>
            <span className="text-[10px] text-muted-foreground">contacted</span>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${dailySummary.totalAccounts > 0 ? Math.round((dailySummary.contactedToday / dailySummary.totalAccounts) * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {dailySummary.callsToday > 0 && (
              <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{dailySummary.callsToday} calls today</span>
            )}
            {dailySummary.promisesExpiring > 0 && (
              <span className="flex items-center gap-1 text-red-600 font-medium"><Clock className="w-2.5 h-2.5" />{dailySummary.promisesExpiring} promise{dailySummary.promisesExpiring !== 1 ? "s" : ""} due</span>
            )}
            {dailySummary.opsQueriesPending > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-medium"><AlertTriangle className="w-2.5 h-2.5" />{dailySummary.opsQueriesPending} OPS pending</span>
            )}
          </div>
          {nextClient && onSelectClient && (
            <button
              onClick={() => onSelectClient(nextClient.id)}
              className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 ml-auto"
            >
              Next: {nextClient.name} ({nextClient.daysOverdue}d)
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto ar-scrollbar">
        <div className="flex gap-0 h-full">
          {/* Left: Invoice list (narrow) */}
          <div className="w-[200px] shrink-0 border-r border-border bg-muted/20 overflow-y-auto ar-scrollbar">
            <div className="p-1.5 space-y-1">
              {invoices.map((inv) => {
                const isActive = selectedInvoiceId === inv.id;
                const isPaid = (() => { const ps = inv.paymentStatus?.toLowerCase() ?? ""; return ps.includes("paid") && !ps.includes("partial"); })();
                const meta = getMeta(inv.id);
                return (
                    <button
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv.id)}
                      className={cn(
                        "w-full text-left rounded-md px-2.5 py-1.5 transition-all border",
                        isActive
                          ? "border-primary/30 bg-primary/5"
                          : "border-transparent hover:bg-muted/60 hover:border-border/50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-mono font-semibold text-foreground truncate">{inv.invoiceNumber}</span>
                        <span className="text-[10px] font-mono font-bold text-foreground shrink-0 tabular-nums">
                          {formatCurrency(inv.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[10px] text-muted-foreground truncate">{inv.projectName}</p>
                        {isPaid ? (
                          <span className="text-[9px] font-semibold rounded px-1 py-px shrink-0 bg-emerald-500/10 text-emerald-600">Paid</span>
                        ) : (
                          <span className={cn("text-[9px] font-semibold rounded px-1 py-px shrink-0", overdueBadge(inv.daysOverdue))}>
                            {inv.daysOverdue}d
                          </span>
                        )}
                      </div>
                      {/* Only show flags that need attention */}
                      {meta.promiseToPayDate && new Date(meta.promiseToPayDate) < new Date(new Date().toISOString().slice(0, 10)) && (
                        <p className="text-[9px] text-red-600 font-medium mt-0.5">
                          Promise to pay missed
                        </p>
                      )}
                      {meta.opsQueryStatus === "forwarded" && (
                        <p className="text-[9px] text-amber-600 font-medium mt-0.5">
                          Awaiting Ops
                        </p>
                      )}
                    </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected invoice detail */}
          <div className="flex-1 overflow-y-auto ar-scrollbar">
            {selectedInvoice ? (
              <div className="p-4 space-y-3.5">
                {/* Invoice detail card */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Top bar: invoice number + badges */}
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/30 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-mono font-bold text-foreground">{selectedInvoice.invoiceNumber}</span>
                      <span className={cn("text-[10px] font-semibold rounded-md px-1.5 py-0.5", paymentStatusBadge(selectedInvoice.paymentStatus).className)}>
                        {paymentStatusBadge(selectedInvoice.paymentStatus).label}
                      </span>
                      {!(() => { const ps = selectedInvoice.paymentStatus?.toLowerCase() ?? ""; return ps.includes("paid") && !ps.includes("partial"); })() && (
                        <>
                          <span className={cn("text-[10px] font-semibold rounded-md px-1.5 py-0.5", overdueBadge(selectedInvoice.daysOverdue))}>
                            {selectedInvoice.daysOverdue}d overdue
                          </span>
                          <StageBadge daysOverdue={selectedInvoice.daysOverdue} />
                        </>
                      )}
                    </div>
                    <span className="text-base font-mono font-bold text-foreground tabular-nums">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-4 py-2.5">
                    {[
                      { label: "Due Date", value: formatDate(selectedInvoice.dueDate) },
                      { label: "Payment Mode", value: selectedInvoice.paymentMode },
                      { label: "Service", value: selectedInvoice.service },
                      { label: "Project", value: selectedInvoice.projectName },
                      { label: "Contract", value: selectedInvoice.contractNumber },
                      { label: "Billing Entity", value: selectedInvoice.billingEntity },
                    ].filter(c => c.value).map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                        <span className="text-[12px] font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Intelligence (collapsible) */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setShowPaymentIntel(v => !v)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-muted/30 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Payment Intelligence</span>
                    {client.paymentScore !== null && (
                      <span className={cn(
                        "text-[10px] font-bold tabular-nums",
                        client.paymentScore >= 7 ? "text-green-600" : client.paymentScore >= 4 ? "text-amber-600" : "text-red-600"
                      )}>
                        {client.paymentScore}/10
                      </span>
                    )}
                    <div className="ml-auto">
                      {showPaymentIntel ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </button>
                  {showPaymentIntel && (
                    <div className="border-t border-border">
                      <PaymentIntelligence client={client} />
                    </div>
                  )}
                </div>

                {/* Next step */}
                <div className="rounded-lg bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/20 px-3.5 py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Lightbulb className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Next Step</span>
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">{nextStep}</p>
                  {/* Call progress inline */}
                  {selectedInvoice.daysOverdue > 0 && getCallTarget(selectedInvoice.daysOverdue) > 0 && (
                    <div className="mt-2 pt-2 border-t border-primary/10">
                      <CallProgress followUps={followUps} daysOverdue={selectedInvoice.daysOverdue} />
                    </div>
                  )}
                </div>

                {/* Activity + Quick Actions */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  {/* Last activity summary */}
                  {followUps.length > 0 && (() => {
                    const last = followUps[0];
                    const daysAgo = Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24));
                    const Icon = followUpIcons[last.type];
                    return (
                      <div className="flex items-center gap-2.5 px-3.5 py-2 bg-muted/20 border-b border-border">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 border", followUpColors[last.type])}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{last.summary}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono tabular-nums">
                          {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Quick call log — select outcome then confirm */}
                  <div className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Log call</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CALL_OUTCOMES.map((outcome) => (
                        <button
                          key={outcome.value}
                          onClick={() => setQuickCallOutcome(quickCallOutcome === outcome.value ? null : outcome.value)}
                          className={cn(
                            "rounded-md border px-2 py-1 text-[10px] font-medium transition-colors",
                            quickCallOutcome === outcome.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          {outcome.label}
                        </button>
                      ))}
                    </div>
                    {quickCallOutcome && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60">
                        <Button
                          size="sm"
                          className="gap-1.5 text-[11px] h-7"
                          onClick={() => {
                            if (!selectedInvoice) return;
                            const label = CALL_OUTCOMES.find(c => c.value === quickCallOutcome)?.label || quickCallOutcome;
                            addFollowUp(selectedInvoice.id, {
                              date: new Date().toISOString().slice(0, 10),
                              type: "call",
                              summary: `Call — ${label}`,
                              callOutcome: quickCallOutcome as CallOutcome,
                            });
                            toast.success(`Call logged: ${label}`, {
                              action: nextClient && onSelectClient ? {
                                label: `Next: ${nextClient.name} →`,
                                onClick: () => onSelectClient(nextClient.id),
                              } : undefined,
                            });
                            setQuickCallOutcome(null);
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Log call
                        </Button>
                        <button
                          onClick={() => setQuickCallOutcome(null)}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Active flags */}
                  {(getMeta(selectedInvoice.id).opsQueryStatus === "forwarded" || getMeta(selectedInvoice.id).promiseToPayDate) && (
                    <div className="px-3.5 py-2 border-t border-border space-y-1.5">
                      {getMeta(selectedInvoice.id).opsQueryStatus === "forwarded" && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium text-amber-700 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            OPS query forwarded — awaiting resolution
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setMeta(selectedInvoice.id, { opsQueryStatus: "resolved" })}
                              className="text-[10px] font-medium text-green-600 hover:text-green-700 transition-colors px-1.5 py-0.5 rounded border border-green-200 hover:bg-green-50"
                            >
                              Mark resolved
                            </button>
                            <button
                              onClick={() => setMeta(selectedInvoice.id, { opsQueryStatus: null })}
                              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                              title="Remove flag"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      {getMeta(selectedInvoice.id).promiseToPayDate && (() => {
                        const pDate = getMeta(selectedInvoice.id).promiseToPayDate!;
                        const isMissed = new Date(pDate) < new Date(new Date().toISOString().slice(0, 10));
                        return (
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-[10px] font-medium flex items-center gap-1.5", isMissed ? "text-red-600" : "text-blue-600")}>
                              <Clock className="w-3 h-3" />
                              Promise to pay: {formatDate(pDate)}{isMissed ? " — MISSED" : ""}
                            </span>
                            <button
                              onClick={() => setMeta(selectedInvoice.id, { promiseToPayDate: null })}
                              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                              title="Remove flag"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Set flags — with confirmation */}
                  <div className="px-3.5 py-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 shrink-0">Flag:</span>
                      {!getMeta(selectedInvoice.id).opsQueryStatus && !pendingOpsFlag && (
                        <button
                          onClick={() => setPendingOpsFlag(true)}
                          className="text-[10px] font-medium text-muted-foreground hover:text-amber-600 transition-colors px-1.5 py-0.5 rounded border border-border/60 hover:border-amber-200 hover:bg-amber-50/50"
                        >
                          Forward to OPS
                        </button>
                      )}
                      {!getMeta(selectedInvoice.id).promiseToPayDate && !pendingPromiseDate && (
                        <button
                          onClick={() => setPendingPromiseDate("pending")}
                          className="text-[10px] font-medium text-muted-foreground hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded border border-border/60 hover:border-blue-200 hover:bg-blue-50/50"
                        >
                          Promise to pay
                        </button>
                      )}
                    </div>

                    {/* OPS confirm row */}
                    {pendingOpsFlag && (
                      <div className="flex items-center gap-2 pl-0.5">
                        <span className="text-[10px] font-medium text-amber-700">Forward this invoice to OPS?</span>
                        <Button
                          size="sm"
                          className="gap-1 text-[10px] h-6 bg-amber-600 hover:bg-amber-700"
                          onClick={() => {
                            setMeta(selectedInvoice.id, { opsQueryStatus: "forwarded" });
                            setPendingOpsFlag(false);
                            toast.success("OPS query flagged");
                          }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> Confirm
                        </Button>
                        <button
                          onClick={() => setPendingOpsFlag(false)}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Promise to pay confirm row */}
                    {pendingPromiseDate && (
                      <div className="flex items-center gap-2 pl-0.5">
                        <span className="text-[10px] font-medium text-blue-700 shrink-0">Pay by:</span>
                        <input
                          type="date"
                          value={pendingPromiseDate === "pending" ? "" : pendingPromiseDate}
                          onChange={(e) => setPendingPromiseDate(e.target.value)}
                          className="text-[10px] font-medium bg-muted/30 border border-border rounded px-1.5 py-0.5 outline-none focus:border-primary/50 text-foreground"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="gap-1 text-[10px] h-6"
                          disabled={!pendingPromiseDate || pendingPromiseDate === "pending"}
                          onClick={() => {
                            setMeta(selectedInvoice.id, { promiseToPayDate: pendingPromiseDate });
                            toast.success(`Promise to pay set: ${pendingPromiseDate}`);
                            setPendingPromiseDate("");
                          }}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> Set
                        </Button>
                        <button
                          onClick={() => setPendingPromiseDate("")}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Thread */}
                {(() => {
                  const emailFollowUps = followUps.filter(f => f.type === "email");
                  if (emailFollowUps.length === 0) return null;
                  return <EmailThread emails={emailFollowUps} />;
                })()}

                {/* Email composer */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email Draft</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {EMAIL_TEMPLATE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setEmailTemplateType(opt.value)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-medium transition-colors",
                            emailTemplateType === opt.value
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 py-1.5 border-b border-border/60 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground shrink-0">From:</span>
                    <input
                      type="text" value={emailFrom} onChange={e => setEmailFrom(e.target.value)}
                      className="flex-1 text-[11px] font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="px-4 py-1.5 border-b border-border/60 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground shrink-0">To:</span>
                    <span className="text-[11px] font-medium text-foreground">{emailTo}</span>
                  </div>
                  <div className="px-4 py-1.5 border-b border-border/60 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground shrink-0">Cc:</span>
                    <input
                      type="text" value={emailCc} onChange={e => setEmailCc(e.target.value)}
                      className="flex-1 text-[11px] font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                      placeholder="CC recipients"
                    />
                  </div>
                  <div className="px-4 py-1.5 border-b border-border/60">
                    <input
                      type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                      className="w-full text-[12px] font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                      placeholder="Subject"
                    />
                  </div>

                  <textarea
                    value={emailBody} onChange={e => setEmailBody(e.target.value)}
                    className="w-full resize-none px-4 py-2.5 text-[12px] bg-transparent outline-none text-foreground leading-relaxed font-sans min-h-[140px]"
                    placeholder="Write your email..."
                  />

                  {/* Attachment indicator */}
                  <div className="flex items-center gap-1.5 px-4 py-1.5 border-t border-border/40">
                    <Paperclip className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {selectedInvoice?.invoiceNumber}.pdf
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">attached</span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSendEmail} disabled={!emailSubject.trim() || !emailBody.trim()} className="gap-1.5 text-[11px] h-7">
                        <Send className="w-3 h-3" />
                        Send Email
                      </Button>
                      <button
                        onClick={() => {
                          const mailtoUrl = `mailto:${emailTo}?cc=${encodeURIComponent(emailCc)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                          window.open(mailtoUrl);
                        }}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in client
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(emailBody);
                        toast.success("Email body copied to clipboard");
                      }}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={activePanel === "note" ? "default" : "outline"} onClick={() => togglePanel("note")} className="gap-1.5 text-[11px] h-8 border-border">
                    <StickyNote className="w-3.5 h-3.5" /> Add Note
                  </Button>
                  <Button
                    size="sm"
                    variant={activePanel === "escalate" ? "default" : "outline"}
                    onClick={() => togglePanel("escalate")}
                    className="gap-1.5 text-[11px] h-8 border-border"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                  </Button>
                  <Button size="sm" variant={activePanel === "resolve" ? "default" : "outline"} onClick={() => togglePanel("resolve")} className="gap-1.5 text-[11px] h-8 border-border">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                  </Button>
                </div>

                {/* Inline Add Note panel */}
                {activePanel === "note" && (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5" />
                        Add Note
                      </h4>
                      <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Textarea placeholder="Type your note..." value={noteText} onChange={e => setNoteText(e.target.value)} className="min-h-[80px] text-[12px]" autoFocus />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => handlePanelConfirm("note")} disabled={!noteText.trim()} className="gap-1.5 text-[11px] h-7">
                        <CheckCircle2 className="w-3 h-3" /> Save Note
                      </Button>
                    </div>
                  </div>
                )}

                {/* Inline escalation panel */}
                {activePanel === "escalate" && (
                  <div className="rounded-xl border border-red-200/80 bg-red-50/30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-red-200/60">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-red-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {escalationTarget ? `Escalate to ${escalationTarget.label}` : "Escalate To"}
                      </h4>
                      <div className="flex items-center gap-2">
                        {escalationTarget && (
                          <button
                            onClick={() => { setEscalationTarget(null); setEscalationSubject(""); setEscalationBody(""); }}
                            className="text-[10px] text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            Change
                          </button>
                        )}
                        <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {!escalationTarget ? (
                      <div className="grid grid-cols-2 gap-2 p-4">
                        {ESCALATION_TARGETS.map((target) => (
                          <button
                            key={target.value}
                            onClick={() => handleSelectEscalationTarget(target)}
                            className="rounded-lg border border-border bg-card p-3 text-left hover:border-red-300 hover:bg-red-50/40 transition-colors"
                          >
                            <p className="text-[12px] font-semibold text-foreground">{target.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{target.email}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="px-4 py-2 border-b border-red-200/40 flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground shrink-0">To:</span>
                          <span className="text-[11px] font-medium text-foreground">{escalationTarget.label}</span>
                          <span className="text-[10px] text-muted-foreground">({escalationTarget.email})</span>
                        </div>
                        <div className="px-4 py-2.5 border-b border-red-200/40">
                          <input
                            type="text" value={escalationSubject} onChange={e => setEscalationSubject(e.target.value)}
                            className="w-full text-[13px] font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                            placeholder="Subject"
                          />
                        </div>
                        <textarea
                          value={escalationBody} onChange={e => setEscalationBody(e.target.value)}
                          className="w-full resize-none px-4 py-3 text-[12px] bg-transparent outline-none text-foreground leading-relaxed font-sans min-h-[140px]"
                          placeholder="Write your escalation email..."
                        />
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-red-200/40 bg-red-50/50">
                          <Button
                            size="sm"
                            onClick={handleSendEscalation}
                            disabled={!escalationSubject.trim() || !escalationBody.trim()}
                            className="gap-1.5 text-[11px] h-7 bg-red-600 hover:bg-red-700"
                          >
                            <Send className="w-3 h-3" />
                            Send Escalation
                          </Button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(escalationBody);
                              toast.success("Escalation email copied to clipboard");
                            }}
                            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inline Resolve panel */}
                {activePanel === "resolve" && (
                  <div className="rounded-xl border border-green-200/80 bg-green-50/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-green-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Resolved
                      </h4>
                      <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {RESOLUTION_TYPES.map((res) => (
                        <button
                          key={res.value}
                          onClick={() => setSelectedOutcome(res.value)}
                          className={cn(
                            "rounded-lg border p-2.5 text-[11px] font-medium transition-colors",
                            selectedOutcome === res.value
                              ? "border-green-400 bg-green-100/60 text-green-800"
                              : "border-border bg-card text-foreground hover:border-green-300"
                          )}
                        >
                          {res.label}
                        </button>
                      ))}
                    </div>
                    <Textarea placeholder="Additional notes (optional)..." value={noteText} onChange={e => setNoteText(e.target.value)} className="min-h-[50px] text-[12px]" />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => handlePanelConfirm("resolve")} disabled={!selectedOutcome} className="gap-1.5 text-[11px] h-7">
                        <CheckCircle2 className="w-3 h-3" /> Resolve
                      </Button>
                    </div>
                  </div>
                )}

                {/* Follow-up timeline (collapsible) */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setShowTimeline(v => !v)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-muted/30 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Follow-up Timeline ({followUps.length})
                    </span>
                    <div className="ml-auto">
                      {showTimeline ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </button>
                  {showTimeline && (
                    <div className="border-t border-border p-4">
                      {followUps.length > 0 ? (
                        <div>{followUps.map((fu) => <FollowUpItem key={fu.id} entry={fu} />)}</div>
                      ) : (
                        <p className="text-[12px] text-muted-foreground text-center py-4">No follow-ups yet. Send the email above to get started.</p>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <FileText className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">Select an invoice from the left</p>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
