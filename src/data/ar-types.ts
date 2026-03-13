// ── Follow-up tracking ────────────────────────────────────────────

export type FollowUpType = "email" | "call" | "note" | "escalation";

export type CallOutcome =
  | "no-answer"
  | "voicemail"
  | "spoke-will-pay"
  | "spoke-dispute"
  | "spoke-referred"
  | "spoke-other";

export type EscalationTarget = "ops" | "trevor" | "ofir" | "david";

export type ResolutionType = "paid" | "credit-note" | "written-off";

export interface FollowUp {
  id: string;
  invoiceId: string;
  date: string; // ISO date
  type: FollowUpType;
  summary: string;
  details?: string;
  callOutcome?: CallOutcome;
  escalationTarget?: EscalationTarget;
}

// ── Invoice ───────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  daysOverdue: number;
  paymentStatus: string;
  potentialNumber: string;
  contractNumber: string;
  service: string;
  projectName: string;
  paymentMode: string;
  billingEntity: string;
  followUps: FollowUp[];
}

// ── Stakeholder (contact person) ──────────────────────────────────

export interface Stakeholder {
  id: string; // slugified email
  name: string;
  email: string;
  phone: string;
  invoices: Invoice[];
}

// ── Client Group (company) ────────────────────────────────────────

export interface PaymentRecord {
  invoiceNumber: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  paidDate: string;
  daysToPayAfterDue: number; // negative = paid before due
}

export interface ClientGroup {
  id: string;
  companyName: string;
  stakeholders: Stakeholder[];
  // Computed
  totalOutstanding: number;
  invoiceCount: number;
  mostOverdueDays: number;
  lastFollowUpDate: string | null;
  lastFollowUpSummary: string | null;
  nextStep: string;
  // Payment intelligence
  paymentHistory: PaymentRecord[];
  avgDaysToPay: number | null;
  onTimeRate: number | null; // 0-1
  paymentScore: number | null; // 1-10
}

// ── Actions ───────────────────────────────────────────────────────

export type ActionId =
  | "send-reminder"
  | "log-call"
  | "add-note"
  | "escalate"
  | "mark-resolved";

export interface ActionDef {
  id: ActionId;
  label: string;
  description: string;
}

export const ACTIONS: ActionDef[] = [
  { id: "send-reminder", label: "Send Reminder", description: "Email reminder to the client" },
  { id: "log-call", label: "Log Call", description: "Record a call attempt and outcome" },
  { id: "add-note", label: "Add Note", description: "Add an internal note" },
  { id: "escalate", label: "Escalate", description: "Escalate to Ops, Trevor, Ofir, or David" },
  { id: "mark-resolved", label: "Mark Resolved", description: "Paid, Credit Note, or Written Off" },
];

export const CALL_OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: "no-answer", label: "No answer" },
  { value: "voicemail", label: "Went to voicemail — left message" },
  { value: "spoke-will-pay", label: "Spoke — will pay" },
  { value: "spoke-dispute", label: "Spoke — disputed invoice" },
  { value: "spoke-referred", label: "Spoke — referred to someone else" },
  { value: "spoke-other", label: "Spoke — other" },
];

export const ESCALATION_TARGETS: { value: EscalationTarget; label: string; email: string }[] = [
  { value: "ops", label: "Ops Team", email: "ops-team@company.com" },
  { value: "trevor", label: "Trevor", email: "trevor@company.com" },
  { value: "ofir", label: "Ofir", email: "ofir@company.com" },
  { value: "david", label: "David", email: "david@company.com" },
];

export const RESOLUTION_TYPES: { value: ResolutionType; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "credit-note", label: "Credit Note Issued" },
  { value: "written-off", label: "Written Off" },
];

// ── AR Stages (from flowchart) ───────────────────────────────────

export type ArStageId =
  | "first-notice"
  | "initial-calls"
  | "second-followup"
  | "third-followup"
  | "sales-ops-review"
  | "management-decision"
  | "collections";

export interface ArStage {
  id: ArStageId;
  label: string;
  shortLabel: string;
  dayRange: [number, number]; // inclusive [min, max], max=Infinity for last stage
  color: string;             // tailwind color token (e.g. "blue", "red")
  description: string;
}

export const AR_STAGES: ArStage[] = [
  { id: "first-notice",        label: "0–1 Days",    shortLabel: "0–1d",    dayRange: [0, 1],    color: "blue",   description: "First email reminder sent" },
  { id: "initial-calls",       label: "2–7 Days",    shortLabel: "2–7d",    dayRange: [2, 7],    color: "blue",   description: "3+ calls per week" },
  { id: "second-followup",     label: "8–14 Days",   shortLabel: "8–14d",   dayRange: [8, 14],   color: "yellow", description: "2nd reminder, 5-7 calls/week" },
  { id: "third-followup",      label: "15–20 Days",  shortLabel: "15–20d",  dayRange: [15, 20],  color: "orange", description: "3rd reminder, 8+ calls/week, Ops intervention" },
  { id: "sales-ops-review",    label: "21–30 Days",  shortLabel: "21–30d",  dayRange: [21, 30],  color: "red",    description: "Problematic list shared, weekly meeting" },
  { id: "management-decision", label: "31–37 Days",  shortLabel: "31–37d",  dayRange: [31, 37],  color: "red",    description: "Business Head decides next step" },
  { id: "collections",         label: "38+ Days",    shortLabel: "38d+",    dayRange: [38, Infinity], color: "darkred", description: "Final outcome: paid, write-off, or collections" },
];

export function getStageForDays(daysOverdue: number): ArStage {
  for (const stage of AR_STAGES) {
    if (daysOverdue >= stage.dayRange[0] && daysOverdue <= stage.dayRange[1]) {
      return stage;
    }
  }
  return AR_STAGES[AR_STAGES.length - 1];
}

// ── Team Members ─────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ar-exec" | "ar-lead" | "management";
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "deepak",  name: "Deepak",  email: "deepak@flatwallsolutions.com",  role: "ar-exec" },
  { id: "priya",   name: "Priya",   email: "priya@flatwallsolutions.com",   role: "ar-exec" },
  { id: "rahul",   name: "Rahul",   email: "rahul@flatwallsolutions.com",   role: "ar-exec" },
  { id: "anita",   name: "Anita",   email: "anita@flatwallsolutions.com",   role: "ar-exec" },
  { id: "trevor",  name: "Trevor",  email: "trevor@flatwallsolutions.com",  role: "ar-lead" },
  { id: "wafir",   name: "Wafir",   email: "wafir@flatwallsolutions.com",   role: "management" },
];

// ── Monthly Revenue ──────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string;       // "YYYY-MM"
  totalBilled: number;
  totalCollected: number;
  outstanding: number; // billed - collected
}

// ── Sorting / Filtering ──────────────────────────────────────────

export type ClientSortKey = "totalOutstanding" | "mostOverdue" | "lastAction" | "companyName" | "needsAttention";

export type OverdueFilter = "all" | "critical" | "medium" | "low";

export type PaymentStatusFilter = "all" | "unpaid" | "partially-paid" | "disputed" | "payment-promised";
