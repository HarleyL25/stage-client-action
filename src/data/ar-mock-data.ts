import { Client } from "./ar-types";

export const MOCK_CLIENTS: Client[] = [
  // Invoice Overdue
  { id: "c1", name: "Meridian Logistics", invoiceAmount: 12500, daysOverdue: 1, lastAction: "Invoice sent", lastActionDaysAgo: 1, subStatus: "Unresponsive", stageId: "invoice-overdue", contactName: "Sarah Chen", contactEmail: "s.chen@meridianlog.com", contactPhone: "+1-555-0101" },
  { id: "c2", name: "Atlas Engineering", invoiceAmount: 8200, daysOverdue: 1, lastAction: "Invoice sent", lastActionDaysAgo: 1, subStatus: "Unresponsive", stageId: "invoice-overdue", contactName: "James Walker", contactEmail: "j.walker@atlaseng.com", contactPhone: "+1-555-0102" },
  { id: "c3", name: "Summit Materials", invoiceAmount: 34000, daysOverdue: 1, lastAction: "Invoice sent", lastActionDaysAgo: 0, subStatus: "Unresponsive", stageId: "invoice-overdue", contactName: "Linda Park", contactEmail: "l.park@summitmat.com", contactPhone: "+1-555-0103" },

  // Unresponsive — Calling
  { id: "c4", name: "Coastal Fabrication", invoiceAmount: 19300, daysOverdue: 4, lastAction: "Call attempt #2", lastActionDaysAgo: 1, subStatus: "Unresponsive", stageId: "unresponsive-calling", contactName: "Mike Torres", contactEmail: "m.torres@coastalfab.com", contactPhone: "+1-555-0104" },
  { id: "c5", name: "Vertex Solutions", invoiceAmount: 6700, daysOverdue: 6, lastAction: "Call attempt #3", lastActionDaysAgo: 0, subStatus: "Unresponsive", stageId: "unresponsive-calling", contactName: "Priya Sharma", contactEmail: "p.sharma@vertexsol.com", contactPhone: "+1-555-0105" },
  { id: "c6", name: "Redstone Mining", invoiceAmount: 45000, daysOverdue: 5, lastAction: "Alt contact sourced", lastActionDaysAgo: 1, subStatus: "Unresponsive", stageId: "unresponsive-calling", contactName: "David Brooks", contactEmail: "d.brooks@redstonemining.com", contactPhone: "+1-555-0106" },

  // Persistent Non-response — Ops Check
  { id: "c7", name: "Northern Industries", invoiceAmount: 28000, daysOverdue: 14, lastAction: "Call attempt #6", lastActionDaysAgo: 2, subStatus: "Unresponsive", stageId: "persistent-non-response", contactName: "Rachel Kim", contactEmail: "r.kim@northernind.com", contactPhone: "+1-555-0107" },
  { id: "c8", name: "Acme Corp", invoiceAmount: 5400, daysOverdue: 9, lastAction: "2nd reminder email sent", lastActionDaysAgo: 1, subStatus: "Has Ops Query", stageId: "persistent-non-response", contactName: "Tom Bradley", contactEmail: "t.bradley@acmecorp.com", contactPhone: "+1-555-0108" },
  { id: "c9", name: "Pioneer Tech", invoiceAmount: 15800, daysOverdue: 12, lastAction: "Ops team notified", lastActionDaysAgo: 3, subStatus: "Has AR Query", stageId: "persistent-non-response", contactName: "Anna Lee", contactEmail: "a.lee@pioneertech.com", contactPhone: "+1-555-0109" },
  { id: "c10", name: "Granite Construction", invoiceAmount: 22100, daysOverdue: 11, lastAction: "Credit note raised", lastActionDaysAgo: 0, subStatus: "Billing Error", stageId: "persistent-non-response", contactName: "Carlos Ruiz", contactEmail: "c.ruiz@granitecon.com", contactPhone: "+1-555-0110" },

  // Ops Intervention Requested
  { id: "c11", name: "Delta Manufacturing", invoiceAmount: 41000, daysOverdue: 18, lastAction: "3rd reminder sent", lastActionDaysAgo: 2, subStatus: "Unresponsive", stageId: "ops-intervention", contactName: "Helen Zhang", contactEmail: "h.zhang@deltamfg.com", contactPhone: "+1-555-0111" },
  { id: "c12", name: "Ironclad Systems", invoiceAmount: 9600, daysOverdue: 16, lastAction: "Ops intervention requested", lastActionDaysAgo: 4, subStatus: "Awaiting Ops", stageId: "ops-intervention", contactName: "Neil Patel", contactEmail: "n.patel@ironcladsys.com", contactPhone: "+1-555-0112" },
  { id: "c13", name: "Skyline Builders", invoiceAmount: 33500, daysOverdue: 20, lastAction: "Escalation email to Trevor", lastActionDaysAgo: 1, subStatus: "Escalated to Trevor", stageId: "ops-intervention", contactName: "Grace Murphy", contactEmail: "g.murphy@skylinebuilders.com", contactPhone: "+1-555-0113" },

  // Escalated to Sales & Ops
  { id: "c14", name: "Pacific Traders", invoiceAmount: 67000, daysOverdue: 25, lastAction: "Shared with Sales team", lastActionDaysAgo: 3, subStatus: "Awaiting Ops", stageId: "escalated-sales-ops", contactName: "Robert Yang", contactEmail: "r.yang@pacifictraders.com", contactPhone: "+1-555-0114" },
  { id: "c15", name: "Zenith Corp", invoiceAmount: 18200, daysOverdue: 28, lastAction: "Weekly meeting discussion", lastActionDaysAgo: 1, subStatus: "Escalated to Trevor", stageId: "escalated-sales-ops", contactName: "Lisa Nguyen", contactEmail: "l.nguyen@zenithcorp.com", contactPhone: "+1-555-0115" },
  { id: "c16", name: "Falcon Industries", invoiceAmount: 52300, daysOverdue: 30, lastAction: "Trevor escalated to Ofir", lastActionDaysAgo: 0, subStatus: "Escalated to Ofir", stageId: "escalated-sales-ops", contactName: "Omar Hassan", contactEmail: "o.hassan@falconind.com", contactPhone: "+1-555-0116" },

  // Awaiting Business Head Decision
  { id: "c17", name: "Legacy Partners", invoiceAmount: 89000, daysOverdue: 35, lastAction: "Case presented to BH", lastActionDaysAgo: 2, subStatus: "Awaiting Ops", stageId: "awaiting-bh-decision", contactName: "Diana Ross", contactEmail: "d.ross@legacypartners.com", contactPhone: "+1-555-0117" },
  { id: "c18", name: "Apex Holdings", invoiceAmount: 14500, daysOverdue: 33, lastAction: "Awaiting David's approval", lastActionDaysAgo: 4, subStatus: "Awaiting Ops", stageId: "awaiting-bh-decision", contactName: "Kevin Wu", contactEmail: "k.wu@apexholdings.com", contactPhone: "+1-555-0118" },

  // Collections / Write-off
  { id: "c19", name: "Orion Enterprises", invoiceAmount: 27600, daysOverdue: 42, lastAction: "Collections initiated", lastActionDaysAgo: 5, subStatus: "Unresponsive", stageId: "collections-writeoff", contactName: "Fiona Grant", contactEmail: "f.grant@orionent.com", contactPhone: "+1-555-0119" },
  { id: "c20", name: "Nebula Ltd", invoiceAmount: 3200, daysOverdue: 45, lastAction: "Write-off approved", lastActionDaysAgo: 1, subStatus: "Unresponsive", stageId: "collections-writeoff", contactName: "Sam Mitchell", contactEmail: "s.mitchell@nebulaltd.com", contactPhone: "+1-555-0120" },
];
