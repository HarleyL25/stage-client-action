import { ActionGroup, StageId, SubStatus } from "./ar-types";

let counter = 0;
const id = () => `action-${++counter}`;

export function getActionsForStageAndStatus(stageId: StageId, subStatus: SubStatus): ActionGroup[] {
  counter = 0;

  switch (stageId) {
    case "invoice-overdue":
      return [{ items: [
        { id: id(), text: "Send initial follow-up email", checked: false },
        { id: id(), text: "Log contact attempt", checked: false },
      ]}];

    case "unresponsive-calling":
      return [{ items: [
        { id: id(), text: "Begin calling client (target: 3+ calls this week)", checked: false },
        { id: id(), text: "Source alternative contacts via market research, historical emails, or projects", checked: false },
        { id: id(), text: "Log each call attempt", checked: false },
      ]}];

    case "persistent-non-response":
      if (subStatus === "Unresponsive") {
        return [
          { condition: "Client is still unresponsive", items: [
            { id: id(), text: "Send 2nd reminder email", checked: false },
            { id: id(), text: "Increase calls to 5–7 per week", checked: false },
            { id: id(), text: "Check with Ops (group chat / call / weekly meeting) for delivery concern, quality issue, or price disparity", checked: false },
            { id: id(), text: "Request Ops to resolve any flagged issue", checked: false },
            { id: id(), text: "Log all contact attempts", checked: false },
          ]},
        ];
      }
      if (subStatus === "Has Ops Query") {
        return [
          { condition: "Client responded — Ops query raised", items: [
            { id: id(), text: "Direct query to Ops team", checked: false },
            { id: id(), text: "Monitor Ops response (flag if no reply within Day 2–4)", checked: false },
            { id: id(), text: "Follow up with Ops if no response received", checked: false },
            { id: id(), text: "Escalate to Trevor if Ops silent for 1 week", checked: false },
          ]},
        ];
      }
      if (subStatus === "Has AR Query") {
        return [
          { condition: "Client responded — AR query raised", items: [
            { id: id(), text: "Address query directly", checked: false },
            { id: id(), text: "Confirm client payment once resolved", checked: false },
          ]},
        ];
      }
      if (subStatus === "Billing Error") {
        return [
          { condition: "Billing error identified", items: [
            { id: id(), text: "Raise credit note", checked: false },
            { id: id(), text: "Confirm client pays balance amount or invoice is cancelled", checked: false },
          ]},
        ];
      }
      return [{ items: [
        { id: id(), text: "Review client status and determine next action", checked: false },
      ]}];

    case "ops-intervention":
      if (subStatus === "Unresponsive") {
        return [
          { condition: "Client is still unresponsive", items: [
            { id: id(), text: "Send 3rd reminder email", checked: false },
            { id: id(), text: "Increase calls to 8+ per week", checked: false },
            { id: id(), text: "Formally request Ops team to intervene and follow up with client", checked: false },
            { id: id(), text: "Ensure Ops provides a resolution date for any open queries", checked: false },
            { id: id(), text: "Follow up with Ops if no response", checked: false },
          ]},
        ];
      }
      if (subStatus === "Awaiting Ops" || subStatus === "Escalated to Trevor") {
        return [
          { condition: "Ops escalation path", items: [
            { id: id(), text: "Follow up with Ops team on intervention status", checked: false },
            { id: id(), text: "Escalate to Trevor if Ops silent for 1 week", checked: false },
            { id: id(), text: "Trevor to escalate to Ofir if still no response after another week", checked: false },
          ]},
        ];
      }
      return [{ items: [
        { id: id(), text: "Review intervention status", checked: false },
      ]}];

    case "escalated-sales-ops":
      return [{ items: [
        { id: id(), text: "Share problematic client list with Sales and Ops (invoices 30+ days overdue or multiple invoices outstanding)", checked: false },
        { id: id(), text: "Discuss next course of action in weekly meeting", checked: false },
        { id: id(), text: "Confirm whether Sales or Ops will take ownership of resolution", checked: false },
        { id: id(), text: "Follow up with Ops if no response", checked: false },
        { id: id(), text: "Escalate to Trevor if Ops silent for 1 week", checked: false },
        { id: id(), text: "Trevor to escalate to Ofir if still no response after another week", checked: false },
      ]}];

    case "awaiting-bh-decision":
      return [{ items: [
        { id: id(), text: "Present case to Business Head", checked: false },
        { id: id(), text: "Await decision: Cancel / Write-off / Move to Collections", checked: false },
        { id: id(), text: "If moving to collections: seek David's approval", checked: false, indent: true },
        { id: id(), text: "Once approved: initiate collections procedure", checked: false, indent: true },
      ]}];

    case "collections-writeoff":
      return [
        { condition: "Final outcome — mark whichever applies:", items: [
          { id: id(), text: "Client paid invoice in full", checked: false },
          { id: id(), text: "Client paid partially — log balance amount to be written off", checked: false },
          { id: id(), text: "Total outstanding written off — log and close", checked: false },
        ]},
      ];

    default:
      return [];
  }
}
