import { ActionGroup, StageId, SubStatus } from "./ar-types";

let counter = 0;
const id = () => `action-${++counter}`;

export function getActionsForStageAndStatus(stageId: StageId, subStatus: SubStatus): ActionGroup[] {
  counter = 0;

  switch (stageId) {
    case "invoice-overdue":
      return [{ actions: [
        { id: id(), label: "Send Follow-up Email", description: "Send initial follow-up email to the client about the overdue invoice", type: "email" },
        { id: id(), label: "Log Contact Attempt", description: "Record the outreach attempt with date and method", type: "note" },
      ]}];

    case "unresponsive-calling":
      return [{ actions: [
        { id: id(), label: "Call Client", description: "Call the client directly — target 3+ calls this week", type: "call" },
        { id: id(), label: "Source Alternative Contacts", description: "Research alternative contacts via market research, historical emails, or project records", type: "research" },
        { id: id(), label: "Log Call Attempt", description: "Record call attempt with outcome and notes", type: "note" },
      ]}];

    case "persistent-non-response":
      if (subStatus === "Unresponsive") {
        return [
          { condition: "Client is still unresponsive", actions: [
            { id: id(), label: "Send 2nd Reminder Email", description: "Send second reminder email about overdue payment", type: "email" },
            { id: id(), label: "Call Client", description: "Increase calling frequency to 5–7 calls per week", type: "call" },
            { id: id(), label: "Check with Ops Team", description: "Contact Ops via group chat, call, or weekly meeting to check for delivery concern, quality issue, or price disparity", type: "ops" },
            { id: id(), label: "Request Ops Resolution", description: "Ask Ops to resolve any flagged issue affecting payment", type: "ops" },
            { id: id(), label: "Log Contact Attempts", description: "Record all contact attempts with dates and outcomes", type: "note" },
          ]},
        ];
      }
      if (subStatus === "Has Ops Query") {
        return [
          { condition: "Client responded — Ops query raised", actions: [
            { id: id(), label: "Forward Query to Ops", description: "Direct the client's query to the Ops team for resolution", type: "ops" },
            { id: id(), label: "Monitor Ops Response", description: "Flag if Ops doesn't reply within Day 2–4", type: "note" },
            { id: id(), label: "Follow Up with Ops", description: "Send follow-up to Ops team if no response received", type: "ops" },
            { id: id(), label: "Escalate to Trevor", description: "Send escalation email to Trevor — Ops has been silent for 1 week", type: "escalate" },
          ]},
        ];
      }
      if (subStatus === "Has AR Query") {
        return [
          { condition: "Client responded — AR query raised", actions: [
            { id: id(), label: "Address Query", description: "Respond to the client's AR-related query directly", type: "email" },
            { id: id(), label: "Confirm Payment", description: "Confirm client payment once the query is resolved", type: "resolve" },
          ]},
        ];
      }
      if (subStatus === "Billing Error") {
        return [
          { condition: "Billing error identified", actions: [
            { id: id(), label: "Raise Credit Note", description: "Create a credit note to correct the billing error", type: "finance" },
            { id: id(), label: "Confirm Resolution", description: "Confirm client pays balance amount or invoice is cancelled", type: "resolve" },
          ]},
        ];
      }
      return [{ actions: [
        { id: id(), label: "Review Client Status", description: "Review current status and determine appropriate next action", type: "note" },
      ]}];

    case "ops-intervention":
      if (subStatus === "Unresponsive") {
        return [
          { condition: "Client is still unresponsive", actions: [
            { id: id(), label: "Send 3rd Reminder Email", description: "Send third and final reminder email", type: "email" },
            { id: id(), label: "Call Client", description: "Increase calling frequency to 8+ calls per week", type: "call" },
            { id: id(), label: "Request Ops Intervention", description: "Formally request Ops team to intervene and follow up with client directly", type: "ops" },
            { id: id(), label: "Request Resolution Date", description: "Ensure Ops provides a specific date to resolve any open queries", type: "ops" },
            { id: id(), label: "Follow Up with Ops", description: "Follow up with Ops if no response received", type: "ops" },
          ]},
        ];
      }
      if (subStatus === "Awaiting Ops" || subStatus === "Escalated to Trevor") {
        return [
          { condition: "Ops escalation path", actions: [
            { id: id(), label: "Follow Up with Ops", description: "Check on Ops team's intervention status", type: "ops" },
            { id: id(), label: "Escalate to Trevor", description: "Send escalation email — Ops has been silent for 1 week", type: "escalate" },
            { id: id(), label: "Escalate to Ofir", description: "Trevor to escalate to Ofir if still no response after another week", type: "escalate" },
          ]},
        ];
      }
      return [{ actions: [
        { id: id(), label: "Review Status", description: "Review current intervention status and next steps", type: "note" },
      ]}];

    case "escalated-sales-ops":
      return [{ actions: [
        { id: id(), label: "Share Client List", description: "Share problematic client list with Sales and Ops (30+ days overdue or multiple invoices)", type: "ops" },
        { id: id(), label: "Schedule Weekly Meeting", description: "Discuss next course of action in weekly meeting", type: "meeting" },
        { id: id(), label: "Assign Ownership", description: "Confirm whether Sales or Ops will take ownership of resolution", type: "decision" },
        { id: id(), label: "Follow Up with Ops", description: "Follow up with Ops if no response on resolution", type: "ops" },
        { id: id(), label: "Escalate to Trevor", description: "Escalate if Ops silent for 1 week", type: "escalate" },
        { id: id(), label: "Escalate to Ofir", description: "Trevor to escalate to Ofir if still no response after another week", type: "escalate" },
      ]}];

    case "awaiting-bh-decision":
      return [{ actions: [
        { id: id(), label: "Present Case", description: "Present the full case details to Business Head for review", type: "meeting" },
        { id: id(), label: "Record Decision", description: "Log BH decision: Cancel / Write-off / Move to Collections", type: "decision" },
        { id: id(), label: "Seek David's Approval", description: "If moving to collections, get approval from David", type: "escalate", indent: true },
        { id: id(), label: "Initiate Collections", description: "Once approved, begin the collections procedure", type: "finance", indent: true },
      ]}];

    case "collections-writeoff":
      return [
        { condition: "Record final outcome", actions: [
          { id: id(), label: "Mark as Paid in Full", description: "Client paid the invoice in full — close the account", type: "resolve" },
          { id: id(), label: "Mark Partial Payment", description: "Client paid partially — log remaining balance to be written off", type: "finance" },
          { id: id(), label: "Write Off & Close", description: "Total outstanding written off — log and close the account", type: "finance" },
        ]},
      ];

    default:
      return [];
  }
}
