export type SubStatus =
  | "Unresponsive"
  | "Has Ops Query"
  | "Has AR Query"
  | "Billing Error"
  | "Awaiting Ops"
  | "Escalated to Trevor"
  | "Escalated to Ofir"
  | "Paid";

export type StageId =
  | "invoice-overdue"
  | "unresponsive-calling"
  | "persistent-non-response"
  | "ops-intervention"
  | "escalated-sales-ops"
  | "awaiting-bh-decision"
  | "collections-writeoff";

export interface Stage {
  id: StageId;
  name: string;
  urgency: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dayRange: string;
}

export interface HistoryEntry {
  date: string;
  type: "email" | "call" | "note";
  summary: string;
  body?: string;
}

export interface Client {
  id: string;
  name: string;
  invoiceAmount: number;
  daysOverdue: number;
  lastAction: string;
  lastActionDaysAgo: number;
  subStatus: SubStatus;
  stageId: StageId;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  history?: HistoryEntry[];
}

export type ActionType = "email" | "call" | "note" | "escalate" | "ops" | "meeting" | "research" | "decision" | "finance" | "resolve";

export interface WorkflowAction {
  id: string;
  label: string;
  description: string;
  type: ActionType;
  indent?: boolean;
  externalRecipient?: { name: string; email: string };
  decisionOptions?: string[];
}

export interface ActionGroup {
  condition?: string;
  actions: WorkflowAction[];
}

export const STAGES: Stage[] = [
  { id: "invoice-overdue",          name: "Invoice Overdue",                       urgency: 1, dayRange: "Day 1" },
  { id: "unresponsive-calling",     name: "Unresponsive — Calling",                urgency: 2, dayRange: "Day 2–7" },
  { id: "persistent-non-response",  name: "Persistent Non-response — Ops Check",   urgency: 3, dayRange: "Day 8–14" },
  { id: "ops-intervention",         name: "Ops Intervention Requested",             urgency: 4, dayRange: "Day 15–20" },
  { id: "escalated-sales-ops",      name: "Escalated to Sales & Ops",              urgency: 5, dayRange: "Day 21–30" },
  { id: "awaiting-bh-decision",     name: "Awaiting Business Head Decision",        urgency: 6, dayRange: "Day 31–37" },
  { id: "collections-writeoff",     name: "Collections / Write-off",               urgency: 7, dayRange: "Day 38+" },
];
