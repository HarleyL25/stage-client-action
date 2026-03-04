import { ActionGroup, StageId, SubStatus } from "./ar-types";

let counter = 0;
const id = () => `action-${++counter}`;

const OPS  = { name: "Ops Team",  email: "ops-team@company.com" };
const TREVOR = { name: "Trevor",  email: "trevor@company.com" };
const OFIR   = { name: "Ofir",    email: "ofir@company.com" };
const DAVID  = { name: "David",   email: "david@company.com" };

export function getActionsForStageAndStatus(stageId: StageId, subStatus: SubStatus): ActionGroup[] {
  counter = 0;

  switch (stageId) {
    case "invoice-overdue":
      return [{ actions: [
        { id: id(), label: "Send Follow-up Email", description: "Send initial follow-up email to the client about the overdue invoice", type: "email" },
        { id: id(), label: "Log Contact Attempt", description: "Record the outreach attempt with outcome", type: "call" },
      ]}];

    case "unresponsive-calling":
      return [{ actions: [
        { id: id(), label: "Source Alternative Contacts", description: "Research alternative contacts via market research, historical emails, or project records", type: "research" },
        { id: id(), label: "Log Call Attempt", description: "Record call attempt with outcome", type: "call" },
      ]}];

    case "persistent-non-response":
      if (subStatus === "Unresponsive") {
        return [
          { condition: "Client is still unresponsive", actions: [
            { id: id(), label: "Send 2nd Reminder Email", description: "Send second reminder email about overdue payment", type: "email" },
            { id: id(), label: "Check with Ops Team", description: "Email Ops to check for any delivery concern, quality issue, or price disparity blocking payment", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Request Ops Resolution", description: "Ask Ops to resolve any flagged issue affecting payment", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Log Call Attempt", description: "Record call attempt with outcome", type: "call" },
          ]},
        ];
      }
      if (subStatus === "Has Ops Query") {
        return [
          { condition: "Client responded — Ops query raised", actions: [
            { id: id(), label: "Forward Query to Ops", description: "Email Ops team with the client's query for resolution", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Monitor Ops Response", description: "Flag if Ops doesn't reply within Day 2–4", type: "note" },
            { id: id(), label: "Follow Up with Ops", description: "Email Ops team if no response received", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Escalate to Trevor", description: "Email Trevor — Ops has been silent for 1 week", type: "escalate", externalRecipient: TREVOR },
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
            { id: id(), label: "Request Ops Intervention", description: "Email Ops team to formally request they intervene and follow up with the client directly", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Request Resolution Date", description: "Email Ops to provide a specific date by which any open query will be resolved", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Follow Up with Ops", description: "Email Ops if no response received", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Log Call Attempt", description: "Record call attempt with outcome", type: "call" },
          ]},
        ];
      }
      if (subStatus === "Awaiting Ops" || subStatus === "Escalated to Trevor") {
        return [
          { condition: "Ops escalation path", actions: [
            { id: id(), label: "Follow Up with Ops", description: "Email Ops team to check on intervention status", type: "ops", externalRecipient: OPS },
            { id: id(), label: "Escalate to Trevor", description: "Email Trevor — Ops has been silent for 1 week", type: "escalate", externalRecipient: TREVOR },
            { id: id(), label: "Escalate to Ofir", description: "Email Ofir — Trevor to escalate if still no response after another week", type: "escalate", externalRecipient: OFIR },
          ]},
        ];
      }
      return [{ actions: [
        { id: id(), label: "Review Status", description: "Review current intervention status and next steps", type: "note" },
      ]}];

    case "escalated-sales-ops":
      if (subStatus === "Awaiting Ops") {
        return [{ condition: "Awaiting Ops resolution", actions: [
          { id: id(), label: "Assign Ownership", description: "Confirm whether Sales or Ops will take ownership of resolution", type: "decision", decisionOptions: ["Sales Team takes ownership", "Ops Team takes ownership"] },
          { id: id(), label: "Follow Up with Ops", description: "Email Ops team if no response on resolution", type: "ops", externalRecipient: OPS },
          { id: id(), label: "Escalate to Trevor", description: "Email Trevor — Ops silent for 1 week", type: "escalate", externalRecipient: TREVOR },
        ]}];
      }
      if (subStatus === "Escalated to Trevor") {
        return [{ condition: "Escalated to Trevor — awaiting response", actions: [
          { id: id(), label: "Follow Up with Trevor", description: "Email Trevor to check on progress — no response after 1 week", type: "escalate", externalRecipient: TREVOR },
          { id: id(), label: "Escalate to Ofir", description: "Email Ofir — Trevor has not resolved after 1 week", type: "escalate", externalRecipient: OFIR },
        ]}];
      }
      if (subStatus === "Escalated to Ofir") {
        return [{ condition: "Escalated to Ofir — final escalation", actions: [
          { id: id(), label: "Follow Up with Ofir", description: "Email Ofir to check on decision or next steps", type: "escalate", externalRecipient: OFIR },
          { id: id(), label: "Record Ofir's Decision", description: "Log the outcome of Ofir's escalation — resolution, write-off, or Business Head referral", type: "decision", decisionOptions: ["Issue resolved — payment arranged", "Write off agreed", "Escalate to Business Head"] },
        ]}];
      }
      // fallback
      return [{ actions: [
        { id: id(), label: "Assign Ownership", description: "Confirm whether Sales or Ops will take ownership of resolution", type: "decision" },
        { id: id(), label: "Follow Up with Ops", description: "Email Ops if no response on resolution", type: "ops", externalRecipient: OPS },
        { id: id(), label: "Escalate to Trevor", description: "Email Trevor — Ops silent for 1 week", type: "escalate", externalRecipient: TREVOR },
        { id: id(), label: "Escalate to Ofir", description: "Email Ofir — Trevor to escalate if still no response after another week", type: "escalate", externalRecipient: OFIR },
      ]}];

    case "awaiting-bh-decision":
      return [{ actions: [
        { id: id(), label: "Present Case", description: "Present the full case details to Business Head for review", type: "meeting" },
        { id: id(), label: "Record Decision", description: "Log BH decision: Cancel / Write-off / Move to Collections", type: "decision", decisionOptions: ["Cancel invoice", "Write off balance", "Move to Collections"] },
        { id: id(), label: "Seek David's Approval", description: "Email David — approval required to initiate collections", type: "escalate", indent: true, externalRecipient: DAVID },
        { id: id(), label: "Initiate Collections", description: "Once approved, begin the collections procedure", type: "finance", indent: true },
      ]}];

    case "collections-writeoff":
      return [
        { condition: "Record final outcome", actions: [
          { id: id(), label: "Mark as Paid in Full", description: "Client paid the invoice in full — close the account", type: "resolve", decisionOptions: ["Client paid in full"] },
          { id: id(), label: "Mark Partial Payment", description: "Client paid partially — log remaining balance to be written off", type: "finance" },
          { id: id(), label: "Write Off & Close", description: "Total outstanding written off — log and close the account", type: "finance" },
        ]},
      ];

    default:
      return [];
  }
}
