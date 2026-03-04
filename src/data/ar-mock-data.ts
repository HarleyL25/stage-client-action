import { Client } from "./ar-types";

export const MOCK_CLIENTS: Client[] = [
  // Invoice Overdue
  {
    id: "c1", name: "Meridian Logistics", invoiceAmount: 12500, daysOverdue: 1,
    lastAction: "Invoice sent", lastActionDaysAgo: 1, subStatus: "Unresponsive",
    stageId: "invoice-overdue", contactName: "Sarah Chen",
    contactEmail: "s.chen@meridianlog.com", contactPhone: "+1-555-0101",
    history: [
      {
        date: "2026-03-02", type: "email", summary: "Invoice sent",
        body: "Hi Sarah,\n\nPlease find attached invoice #INV-2026-0312 for $12,500 in respect of services rendered in February.\n\nPayment is due within 30 days. Please don't hesitate to reach out with any questions.\n\nBest regards,\nAR Team",
      },
    ],
  },
  {
    id: "c2", name: "Atlas Engineering", invoiceAmount: 8200, daysOverdue: 1,
    lastAction: "Invoice sent", lastActionDaysAgo: 1, subStatus: "Unresponsive",
    stageId: "invoice-overdue", contactName: "James Walker",
    contactEmail: "j.walker@atlaseng.com", contactPhone: "+1-555-0102",
    history: [
      {
        date: "2026-03-02", type: "email", summary: "Invoice sent",
        body: "Hi James,\n\nPlease find attached invoice #INV-2026-0287 for $8,200.\n\nKindly arrange payment at your earliest convenience.\n\nBest regards,\nAR Team",
      },
    ],
  },
  {
    id: "c3", name: "Summit Materials", invoiceAmount: 34000, daysOverdue: 1,
    lastAction: "Invoice sent", lastActionDaysAgo: 0, subStatus: "Unresponsive",
    stageId: "invoice-overdue", contactName: "Linda Park",
    contactEmail: "l.park@summitmat.com", contactPhone: "+1-555-0103",
    history: [
      {
        date: "2026-03-03", type: "email", summary: "Invoice sent",
        body: "Hi Linda,\n\nPlease find attached invoice #INV-2026-0341 for $34,000 covering March services.\n\nPlease confirm receipt and arrange payment within the agreed terms.\n\nBest regards,\nAR Team",
      },
    ],
  },

  // Unresponsive — Calling
  {
    id: "c4", name: "Coastal Fabrication", invoiceAmount: 19300, daysOverdue: 4,
    lastAction: "Call attempt #2", lastActionDaysAgo: 1, subStatus: "Unresponsive",
    stageId: "unresponsive-calling", contactName: "Mike Torres",
    contactEmail: "m.torres@coastalfab.com", contactPhone: "+1-555-0104",
    history: [
      {
        date: "2026-02-28", type: "email", summary: "Invoice sent",
        body: "Hi Mike,\n\nPlease find attached invoice #INV-2026-0298 for $19,300. Payment due within 30 days.\n\nBest regards,\nAR Team",
      },
      { date: "2026-03-01", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-03-02", type: "call", summary: "Call attempt #2 — Went to voicemail, left message" },
    ],
  },
  {
    id: "c5", name: "Vertex Solutions", invoiceAmount: 6700, daysOverdue: 6,
    lastAction: "Call attempt #3", lastActionDaysAgo: 0, subStatus: "Unresponsive",
    stageId: "unresponsive-calling", contactName: "Priya Sharma",
    contactEmail: "p.sharma@vertexsol.com", contactPhone: "+1-555-0105",
    history: [
      {
        date: "2026-02-26", type: "email", summary: "Invoice sent",
        body: "Hi Priya,\n\nInvoice #INV-2026-0271 for $6,700 is attached. Please arrange payment by the due date.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-27", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-03-01", type: "call", summary: "Call attempt #2 — Went to voicemail" },
      { date: "2026-03-03", type: "call", summary: "Call attempt #3 — No answer" },
    ],
  },
  {
    id: "c6", name: "Redstone Mining", invoiceAmount: 45000, daysOverdue: 5,
    lastAction: "Alt contact sourced", lastActionDaysAgo: 1, subStatus: "Unresponsive",
    stageId: "unresponsive-calling", contactName: "David Brooks",
    contactEmail: "d.brooks@redstonemining.com", contactPhone: "+1-555-0106",
    history: [
      {
        date: "2026-02-27", type: "email", summary: "Invoice sent",
        body: "Hi David,\n\nInvoice #INV-2026-0305 for $45,000 is attached. We appreciate your prompt attention to this matter.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-28", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-03-01", type: "call", summary: "Call attempt #2 — No answer" },
      { date: "2026-03-02", type: "note", summary: "Sourced alternative contact: CFO Jenny Marsh via LinkedIn (j.marsh@redstonemining.com)" },
    ],
  },

  // Persistent Non-response — Ops Check
  {
    id: "c7", name: "Northern Industries", invoiceAmount: 28000, daysOverdue: 14,
    lastAction: "Call attempt #6", lastActionDaysAgo: 2, subStatus: "Unresponsive",
    stageId: "persistent-non-response", contactName: "Rachel Kim",
    contactEmail: "r.kim@northernind.com", contactPhone: "+1-555-0107",
    history: [
      {
        date: "2026-02-18", type: "email", summary: "Invoice sent",
        body: "Hi Rachel,\n\nInvoice #INV-2026-0255 for $28,000 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-19", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-02-20", type: "call", summary: "Call attempt #2 — Voicemail, left message" },
      {
        date: "2026-02-21", type: "email", summary: "1st reminder sent",
        body: "Hi Rachel,\n\nThis is a reminder that invoice #INV-2026-0255 for $28,000 is now 7 days overdue. Please arrange payment or contact us to discuss.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-24", type: "call", summary: "Call attempt #3 — No answer" },
      { date: "2026-02-25", type: "call", summary: "Call attempt #4 — No answer" },
      { date: "2026-02-26", type: "call", summary: "Call attempt #5 — Voicemail" },
      { date: "2026-03-01", type: "call", summary: "Call attempt #6 — No answer" },
    ],
  },
  {
    id: "c8", name: "Acme Corp", invoiceAmount: 5400, daysOverdue: 9,
    lastAction: "2nd reminder email sent", lastActionDaysAgo: 1, subStatus: "Has Ops Query",
    stageId: "persistent-non-response", contactName: "Tom Bradley",
    contactEmail: "t.bradley@acmecorp.com", contactPhone: "+1-555-0108",
    history: [
      {
        date: "2026-02-23", type: "email", summary: "Invoice sent",
        body: "Hi Tom,\n\nInvoice #INV-2026-0261 for $5,400 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-25", type: "call", summary: "Call attempt #1 — No answer" },
      {
        date: "2026-02-27", type: "email", summary: "1st reminder sent",
        body: "Hi Tom,\n\nThis is a reminder regarding invoice #INV-2026-0261 for $5,400 which is now overdue. Please advise on payment status.\n\nBest regards,\nAR Team",
      },
      {
        date: "2026-02-28", type: "email", summary: "Client replied — raised Ops query",
        body: "Hi,\n\nThanks for following up. We actually have an open issue with the delivery from your team — one shipment was short by 20 units. We can't process payment until this is resolved.\n\nPlease check with your Ops team.\n\nThanks,\nTom",
      },
      {
        date: "2026-03-02", type: "email", summary: "2nd reminder sent, Ops query flagged",
        body: "Hi Tom,\n\nThank you for raising this. I've flagged the delivery discrepancy with our Ops team and they will follow up with you directly. Once resolved, we kindly ask that payment is processed promptly.\n\nBest regards,\nAR Team",
      },
    ],
  },
  {
    id: "c9", name: "Pioneer Tech", invoiceAmount: 15800, daysOverdue: 12,
    lastAction: "Ops team notified", lastActionDaysAgo: 3, subStatus: "Has AR Query",
    stageId: "persistent-non-response", contactName: "Anna Lee",
    contactEmail: "a.lee@pioneertech.com", contactPhone: "+1-555-0109",
    history: [
      {
        date: "2026-02-20", type: "email", summary: "Invoice sent",
        body: "Hi Anna,\n\nInvoice #INV-2026-0244 for $15,800 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-22", type: "call", summary: "Call attempt #1 — Spoke briefly, Anna said she'd check" },
      {
        date: "2026-02-25", type: "email", summary: "Client replied — query on line items",
        body: "Hi,\n\nI've reviewed the invoice and there seems to be a discrepancy on line item 3 — we were quoted $4,200 but billed $5,800. Can you clarify?\n\nAnna",
      },
      {
        date: "2026-02-27", type: "email", summary: "Ops notified of query",
        body: "Hi Anna,\n\nThank you for flagging this. I've raised it with our team and will get back to you with a clarification shortly.\n\nBest regards,\nAR Team",
      },
    ],
  },
  {
    id: "c10", name: "Granite Construction", invoiceAmount: 22100, daysOverdue: 11,
    lastAction: "Credit note raised", lastActionDaysAgo: 0, subStatus: "Billing Error",
    stageId: "persistent-non-response", contactName: "Carlos Ruiz",
    contactEmail: "c.ruiz@granitecon.com", contactPhone: "+1-555-0110",
    history: [
      {
        date: "2026-02-21", type: "email", summary: "Invoice sent",
        body: "Hi Carlos,\n\nInvoice #INV-2026-0250 for $22,100 is attached.\n\nBest regards,\nAR Team",
      },
      {
        date: "2026-02-24", type: "email", summary: "Client replied — billing error",
        body: "Hi,\n\nWe've received the invoice but it includes charges for the cancelled order #ORD-884. We should not be billed for that. Please issue a corrected invoice.\n\nCarlos",
      },
      { date: "2026-02-26", type: "call", summary: "Spoke with Carlos — confirmed billing error, credit note to be raised" },
      { date: "2026-03-03", type: "note", summary: "Credit note CN-2026-0041 raised for $3,200. Corrected invoice to be sent." },
    ],
  },

  // Ops Intervention Requested
  {
    id: "c11", name: "Delta Manufacturing", invoiceAmount: 41000, daysOverdue: 18,
    lastAction: "3rd reminder sent", lastActionDaysAgo: 2, subStatus: "Unresponsive",
    stageId: "ops-intervention", contactName: "Helen Zhang",
    contactEmail: "h.zhang@deltamfg.com", contactPhone: "+1-555-0111",
    history: [
      {
        date: "2026-02-14", type: "email", summary: "Invoice sent",
        body: "Hi Helen,\n\nInvoice #INV-2026-0198 for $41,000 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-16", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-02-17", type: "call", summary: "Call attempt #2 — Voicemail" },
      {
        date: "2026-02-19", type: "email", summary: "1st reminder sent",
        body: "Hi Helen,\n\nThis is a reminder that invoice #INV-2026-0198 for $41,000 is now 5 days overdue.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-21", type: "call", summary: "Call attempt #3 — No answer" },
      { date: "2026-02-24", type: "call", summary: "Call attempt #4 — No answer" },
      {
        date: "2026-02-25", type: "email", summary: "2nd reminder sent",
        body: "Hi Helen,\n\nThis is our second reminder regarding the outstanding invoice of $41,000. Please contact us urgently.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-26", type: "call", summary: "Call attempt #5 — No answer" },
      { date: "2026-02-27", type: "call", summary: "Call attempt #6 — No answer" },
      {
        date: "2026-03-01", type: "email", summary: "3rd and final reminder sent",
        body: "Hi Helen,\n\nThis is our final reminder before we escalate this matter. Invoice #INV-2026-0198 for $41,000 is now 15 days overdue. Please respond urgently.\n\nAR Team",
      },
    ],
  },
  {
    id: "c12", name: "Ironclad Systems", invoiceAmount: 9600, daysOverdue: 16,
    lastAction: "Ops intervention requested", lastActionDaysAgo: 4, subStatus: "Awaiting Ops",
    stageId: "ops-intervention", contactName: "Neil Patel",
    contactEmail: "n.patel@ironcladsys.com", contactPhone: "+1-555-0112",
    history: [
      {
        date: "2026-02-16", type: "email", summary: "Invoice sent",
        body: "Hi Neil,\n\nInvoice #INV-2026-0203 for $9,600 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-18", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-02-20", type: "call", summary: "Call attempt #2 — No answer" },
      {
        date: "2026-02-22", type: "email", summary: "1st reminder sent",
        body: "Hi Neil,\n\nReminder: invoice #INV-2026-0203 for $9,600 is overdue. Please arrange payment.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-25", type: "call", summary: "Call attempt #3 — Spoke briefly, Neil said accounts team handles it" },
      { date: "2026-02-27", type: "note", summary: "Ops intervention formally requested — no client response after 12 days" },
    ],
  },
  {
    id: "c13", name: "Skyline Builders", invoiceAmount: 33500, daysOverdue: 20,
    lastAction: "Escalation email to Trevor", lastActionDaysAgo: 1, subStatus: "Escalated to Trevor",
    stageId: "ops-intervention", contactName: "Grace Murphy",
    contactEmail: "g.murphy@skylinebuilders.com", contactPhone: "+1-555-0113",
    history: [
      {
        date: "2026-02-12", type: "email", summary: "Invoice sent",
        body: "Hi Grace,\n\nInvoice #INV-2026-0187 for $33,500 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-14", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-02-17", type: "call", summary: "Call attempt #2 — Voicemail" },
      {
        date: "2026-02-19", type: "email", summary: "1st reminder sent",
        body: "Hi Grace,\n\nReminder: invoice #INV-2026-0187 for $33,500 is overdue. Please advise.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-21", type: "call", summary: "Call attempt #3 — No answer" },
      { date: "2026-02-24", type: "call", summary: "Call attempt #4 — No answer" },
      {
        date: "2026-02-26", type: "email", summary: "2nd reminder sent",
        body: "Hi Grace,\n\nThis is our second reminder. Invoice #INV-2026-0187 for $33,500 is now 14 days overdue. Urgent response required.\n\nAR Team",
      },
      { date: "2026-03-02", type: "note", summary: "Escalation email sent to Trevor — Ops silent for 1 week" },
    ],
  },

  // Escalated to Sales & Ops
  {
    id: "c14", name: "Pacific Traders", invoiceAmount: 67000, daysOverdue: 25,
    lastAction: "Shared with Sales team", lastActionDaysAgo: 3, subStatus: "Awaiting Ops",
    stageId: "escalated-sales-ops", contactName: "Robert Yang",
    contactEmail: "r.yang@pacifictraders.com", contactPhone: "+1-555-0114",
    history: [
      {
        date: "2026-02-07", type: "email", summary: "Invoice sent",
        body: "Hi Robert,\n\nInvoice #INV-2026-0156 for $67,000 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-10", type: "call", summary: "Call attempt #1 — Spoke, Robert said payment in process" },
      { date: "2026-02-14", type: "call", summary: "Call attempt #2 — No answer" },
      {
        date: "2026-02-17", type: "email", summary: "Follow-up after call",
        body: "Hi Robert,\n\nFollowing our call, I wanted to follow up on the payment status of invoice #INV-2026-0156 for $67,000.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-20", type: "call", summary: "Call attempt #3 — No answer" },
      { date: "2026-02-24", type: "note", summary: "Client list shared with Sales team — 25+ days overdue" },
      { date: "2026-02-28", type: "note", summary: "Discussed in weekly Ops meeting — no resolution yet" },
    ],
  },
  {
    id: "c15", name: "Zenith Corp", invoiceAmount: 18200, daysOverdue: 28,
    lastAction: "Weekly meeting discussion", lastActionDaysAgo: 1, subStatus: "Escalated to Trevor",
    stageId: "escalated-sales-ops", contactName: "Lisa Nguyen",
    contactEmail: "l.nguyen@zenithcorp.com", contactPhone: "+1-555-0115",
    history: [
      {
        date: "2026-02-04", type: "email", summary: "Invoice sent",
        body: "Hi Lisa,\n\nInvoice #INV-2026-0143 for $18,200 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-07", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-02-10", type: "call", summary: "Call attempt #2 — Spoke, Lisa said reviewing invoice" },
      {
        date: "2026-02-14", type: "email", summary: "2nd reminder sent",
        body: "Hi Lisa,\n\nFollowing up on invoice #INV-2026-0143 for $18,200 which is now 10 days overdue.\n\nAR Team",
      },
      { date: "2026-02-18", type: "call", summary: "Call attempt #3 — Voicemail" },
      { date: "2026-02-24", type: "note", summary: "Escalated to Trevor — Ops unresponsive for 1 week" },
      { date: "2026-03-02", type: "note", summary: "Discussed in weekly meeting — Trevor to follow up with Zenith account manager" },
    ],
  },
  {
    id: "c16", name: "Falcon Industries", invoiceAmount: 52300, daysOverdue: 30,
    lastAction: "Trevor escalated to Ofir", lastActionDaysAgo: 0, subStatus: "Escalated to Ofir",
    stageId: "escalated-sales-ops", contactName: "Omar Hassan",
    contactEmail: "o.hassan@falconind.com", contactPhone: "+1-555-0116",
    history: [
      {
        date: "2026-02-02", type: "email", summary: "Invoice sent",
        body: "Hi Omar,\n\nInvoice #INV-2026-0131 for $52,300 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-05", type: "call", summary: "Call attempt #1 — No answer" },
      {
        date: "2026-02-10", type: "email", summary: "1st reminder sent",
        body: "Hi Omar,\n\nReminder: invoice #INV-2026-0131 for $52,300 is now 8 days overdue.\n\nAR Team",
      },
      { date: "2026-02-14", type: "call", summary: "Call attempt #2 — Voicemail" },
      { date: "2026-02-18", type: "note", summary: "Escalated to Trevor" },
      { date: "2026-02-25", type: "note", summary: "Trevor followed up — no response from client" },
      { date: "2026-03-03", type: "note", summary: "Trevor escalated to Ofir — 30 days overdue, no engagement from client" },
    ],
  },

  // Awaiting Business Head Decision
  {
    id: "c17", name: "Legacy Partners", invoiceAmount: 89000, daysOverdue: 35,
    lastAction: "Case presented to BH", lastActionDaysAgo: 2, subStatus: "Awaiting Ops",
    stageId: "awaiting-bh-decision", contactName: "Diana Ross",
    contactEmail: "d.ross@legacypartners.com", contactPhone: "+1-555-0117",
    history: [
      {
        date: "2026-01-27", type: "email", summary: "Invoice sent",
        body: "Hi Diana,\n\nInvoice #INV-2026-0098 for $89,000 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-01-30", type: "call", summary: "Call attempt #1 — Spoke, Diana said finance team processing" },
      { date: "2026-02-05", type: "call", summary: "Call attempt #2 — No answer" },
      {
        date: "2026-02-10", type: "email", summary: "2nd reminder sent",
        body: "Hi Diana,\n\nThis is a follow-up on invoice #INV-2026-0098 for $89,000, now 14 days overdue.\n\nAR Team",
      },
      { date: "2026-02-14", type: "call", summary: "Call attempt #3 — No answer" },
      { date: "2026-02-18", type: "note", summary: "Escalated to Trevor" },
      { date: "2026-02-24", type: "note", summary: "Trevor escalated to Ofir" },
      { date: "2026-03-01", type: "note", summary: "Full case presented to Business Head for decision" },
    ],
  },
  {
    id: "c18", name: "Apex Holdings", invoiceAmount: 14500, daysOverdue: 33,
    lastAction: "Awaiting David's approval", lastActionDaysAgo: 4, subStatus: "Awaiting Ops",
    stageId: "awaiting-bh-decision", contactName: "Kevin Wu",
    contactEmail: "k.wu@apexholdings.com", contactPhone: "+1-555-0118",
    history: [
      {
        date: "2026-01-29", type: "email", summary: "Invoice sent",
        body: "Hi Kevin,\n\nInvoice #INV-2026-0107 for $14,500 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-02-03", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-02-07", type: "call", summary: "Call attempt #2 — Voicemail" },
      { date: "2026-02-12", type: "note", summary: "Escalated to Trevor after no response" },
      { date: "2026-02-20", type: "note", summary: "Trevor escalated to Ofir" },
      { date: "2026-02-28", type: "note", summary: "Awaiting David's approval to proceed to collections" },
    ],
  },

  // Collections / Write-off
  {
    id: "c19", name: "Orion Enterprises", invoiceAmount: 27600, daysOverdue: 42,
    lastAction: "Collections initiated", lastActionDaysAgo: 5, subStatus: "Unresponsive",
    stageId: "collections-writeoff", contactName: "Fiona Grant",
    contactEmail: "f.grant@orionent.com", contactPhone: "+1-555-0119",
    history: [
      {
        date: "2026-01-20", type: "email", summary: "Invoice sent",
        body: "Hi Fiona,\n\nInvoice #INV-2026-0072 for $27,600 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-01-23", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-01-27", type: "call", summary: "Call attempt #2 — Voicemail" },
      {
        date: "2026-02-01", type: "email", summary: "2nd reminder sent",
        body: "Hi Fiona,\n\nThis is our second reminder. Invoice #INV-2026-0072 for $27,600 is now 12 days overdue.\n\nAR Team",
      },
      { date: "2026-02-07", type: "note", summary: "Escalated to Trevor" },
      { date: "2026-02-14", type: "note", summary: "Trevor escalated to Ofir" },
      { date: "2026-02-21", type: "note", summary: "Business Head approved collections procedure" },
      { date: "2026-02-27", type: "note", summary: "Collections agency engaged — case ref #COL-2026-019" },
    ],
  },
  {
    id: "c20", name: "Nebula Ltd", invoiceAmount: 3200, daysOverdue: 45,
    lastAction: "Write-off approved", lastActionDaysAgo: 1, subStatus: "Unresponsive",
    stageId: "collections-writeoff", contactName: "Sam Mitchell",
    contactEmail: "s.mitchell@nebulaltd.com", contactPhone: "+1-555-0120",
    history: [
      {
        date: "2026-01-17", type: "email", summary: "Invoice sent",
        body: "Hi Sam,\n\nInvoice #INV-2026-0058 for $3,200 is attached.\n\nBest regards,\nAR Team",
      },
      { date: "2026-01-20", type: "call", summary: "Call attempt #1 — No answer" },
      { date: "2026-01-24", type: "call", summary: "Call attempt #2 — No answer" },
      {
        date: "2026-01-29", type: "email", summary: "2nd reminder sent",
        body: "Hi Sam,\n\nReminder: invoice #INV-2026-0058 for $3,200 is now overdue. Please arrange payment.\n\nAR Team",
      },
      { date: "2026-02-05", type: "note", summary: "Escalated — no response after 3 weeks" },
      { date: "2026-02-20", type: "note", summary: "Business Head decision: write off due to low value and no engagement" },
      { date: "2026-03-02", type: "note", summary: "Write-off approved by David — account to be closed" },
    ],
  },
];
