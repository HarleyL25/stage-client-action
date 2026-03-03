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
}

export type ActionType = "email" | "call" | "note" | "escalate" | "ops" | "meeting" | "research" | "decision" | "finance" | "resolve";

export interface WorkflowAction {
  id: string;
  label: string;
  description: string;
  type: ActionType;
  indent?: boolean;
}

export interface ActionGroup {
  condition?: string;
  actions: WorkflowAction[];
}

export const STAGES: Stage[] = [
  { id: "invoice-overdue", name: "Invoice Overdue", urgency: 1 },
  { id: "unresponsive-calling", name: "Unresponsive — Calling", urgency: 2 },
  { id: "persistent-non-response", name: "Persistent Non-response — Ops Check", urgency: 3 },
  { id: "ops-intervention", name: "Ops Intervention Requested", urgency: 4 },
  { id: "escalated-sales-ops", name: "Escalated to Sales & Ops", urgency: 5 },
  { id: "awaiting-bh-decision", name: "Awaiting Business Head Decision", urgency: 6 },
  { id: "collections-writeoff", name: "Collections / Write-off", urgency: 7 },
];
