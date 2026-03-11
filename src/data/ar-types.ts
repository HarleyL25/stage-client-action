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

// ── Sorting / Filtering ──────────────────────────────────────────

export type ClientSortKey = "totalOutstanding" | "mostOverdue" | "lastAction" | "companyName";

export type OverdueFilter = "all" | "critical" | "medium" | "low";

export type PaymentStatusFilter = "all" | "unpaid" | "partially-paid" | "disputed" | "payment-promised";
