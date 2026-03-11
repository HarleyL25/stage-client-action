import { FollowUp, PaymentRecord } from "./ar-types";

// ── Raw invoice shape (matches API flat rows) ─────────────────────

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  daysOverdue: number;
  paymentStatus: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  potentialNumber: string;
  contractNumber: string;
  service: string;
  projectName: string;
  paymentMode: string;
  billingEntity: string;
}

export const MOCK_INVOICES: MockInvoice[] = [
  // ── Meridian Logistics (3 invoices, 2 stakeholders) ──────────
  {
    id: "inv-001", invoiceNumber: "INV-2026-0312", amount: 12500,
    invoiceDate: "2026-01-15", dueDate: "2026-02-14", daysOverdue: 20,
    paymentStatus: "", companyName: "Meridian Logistics",
    contactName: "Sarah Chen", contactEmail: "s.chen@meridianlog.com", contactPhone: "+1-555-0101",
    potentialNumber: "POT-4401", contractNumber: "CON-2025-112", service: "Freight Management",
    projectName: "Q1 Distribution", paymentMode: "Net 30", billingEntity: "BH Americas",
  },
  {
    id: "inv-002", invoiceNumber: "INV-2026-0298", amount: 8000,
    invoiceDate: "2026-01-20", dueDate: "2026-02-19", daysOverdue: 15,
    paymentStatus: "", companyName: "Meridian Logistics",
    contactName: "Sarah Chen", contactEmail: "s.chen@meridianlog.com", contactPhone: "+1-555-0101",
    potentialNumber: "POT-4401", contractNumber: "CON-2025-112", service: "Freight Management",
    projectName: "Q1 Distribution Phase 2", paymentMode: "Net 30", billingEntity: "BH Americas",
  },
  {
    id: "inv-003", invoiceNumber: "INV-2026-0356", amount: 4200,
    invoiceDate: "2026-02-01", dueDate: "2026-03-03", daysOverdue: 3,
    paymentStatus: "", companyName: "Meridian Logistics",
    contactName: "James Lin", contactEmail: "j.lin@meridianlog.com", contactPhone: "+1-555-0102",
    potentialNumber: "POT-4402", contractNumber: "CON-2025-113", service: "Warehousing",
    projectName: "Storage Facility A", paymentMode: "Net 30", billingEntity: "BH Americas",
  },

  // ── Atlas Engineering (1 invoice) ────────────────────────────
  {
    id: "inv-004", invoiceNumber: "INV-2026-0287", amount: 8200,
    invoiceDate: "2026-01-25", dueDate: "2026-02-24", daysOverdue: 10,
    paymentStatus: "", companyName: "Atlas Engineering",
    contactName: "James Walker", contactEmail: "j.walker@atlaseng.com", contactPhone: "+1-555-0103",
    potentialNumber: "POT-3302", contractNumber: "CON-2025-087", service: "Structural Analysis",
    projectName: "Bridge Retrofit", paymentMode: "Net 30", billingEntity: "BH Engineering",
  },

  // ── Coastal Fabrication (2 invoices, disputed) ───────────────
  {
    id: "inv-005", invoiceNumber: "INV-2026-0271", amount: 19300,
    invoiceDate: "2026-01-10", dueDate: "2026-02-09", daysOverdue: 25,
    paymentStatus: "Disputed", companyName: "Coastal Fabrication",
    contactName: "Mike Torres", contactEmail: "m.torres@coastalfab.com", contactPhone: "+1-555-0104",
    potentialNumber: "POT-2205", contractNumber: "CON-2025-044", service: "Metal Fabrication",
    projectName: "Hull Assembly Lot 7", paymentMode: "Net 30", billingEntity: "BH Manufacturing",
  },
  {
    id: "inv-006", invoiceNumber: "INV-2026-0305", amount: 6700,
    invoiceDate: "2026-02-01", dueDate: "2026-03-03", daysOverdue: 3,
    paymentStatus: "", companyName: "Coastal Fabrication",
    contactName: "Mike Torres", contactEmail: "m.torres@coastalfab.com", contactPhone: "+1-555-0104",
    potentialNumber: "POT-2205", contractNumber: "CON-2025-044", service: "Metal Fabrication",
    projectName: "Hull Assembly Lot 8", paymentMode: "Net 30", billingEntity: "BH Manufacturing",
  },

  // ── Northern Industries (2 invoices, 2 stakeholders) ─────────
  {
    id: "inv-007", invoiceNumber: "INV-2026-0255", amount: 28000,
    invoiceDate: "2026-01-05", dueDate: "2026-02-04", daysOverdue: 30,
    paymentStatus: "", companyName: "Northern Industries",
    contactName: "Rachel Kim", contactEmail: "r.kim@northernind.com", contactPhone: "+1-555-0107",
    potentialNumber: "POT-5501", contractNumber: "CON-2025-201", service: "Industrial Supplies",
    projectName: "Mill Equipment Order", paymentMode: "Net 30", billingEntity: "BH Industrial",
  },
  {
    id: "inv-008", invoiceNumber: "INV-2026-0341", amount: 15800,
    invoiceDate: "2026-01-28", dueDate: "2026-02-27", daysOverdue: 7,
    paymentStatus: "Partially Paid", companyName: "Northern Industries",
    contactName: "David Park", contactEmail: "d.park@northernind.com", contactPhone: "+1-555-0108",
    potentialNumber: "POT-5502", contractNumber: "CON-2025-202", service: "Maintenance Services",
    projectName: "Annual Maintenance", paymentMode: "Net 30", billingEntity: "BH Industrial",
  },

  // ── Delta Manufacturing (1 invoice, high value) ──────────────
  {
    id: "inv-009", invoiceNumber: "INV-2026-0198", amount: 41000,
    invoiceDate: "2025-12-20", dueDate: "2026-01-19", daysOverdue: 46,
    paymentStatus: "", companyName: "Delta Manufacturing",
    contactName: "Helen Zhang", contactEmail: "h.zhang@deltamfg.com", contactPhone: "+1-555-0111",
    potentialNumber: "POT-6601", contractNumber: "CON-2025-310", service: "CNC Machining",
    projectName: "Precision Parts Batch 12", paymentMode: "Net 30", billingEntity: "BH Manufacturing",
  },

  // ── Pacific Traders (2 invoices) ─────────────────────────────
  {
    id: "inv-010", invoiceNumber: "INV-2026-0156", amount: 67000,
    invoiceDate: "2025-12-15", dueDate: "2026-01-14", daysOverdue: 51,
    paymentStatus: "", companyName: "Pacific Traders",
    contactName: "Robert Yang", contactEmail: "r.yang@pacifictraders.com", contactPhone: "+1-555-0114",
    potentialNumber: "POT-7701", contractNumber: "CON-2025-401", service: "Import/Export",
    projectName: "Asia Pacific Shipment", paymentMode: "Net 30", billingEntity: "BH Trading",
  },
  {
    id: "inv-011", invoiceNumber: "INV-2026-0367", amount: 23500,
    invoiceDate: "2026-02-05", dueDate: "2026-03-05", daysOverdue: 1,
    paymentStatus: "", companyName: "Pacific Traders",
    contactName: "Robert Yang", contactEmail: "r.yang@pacifictraders.com", contactPhone: "+1-555-0114",
    potentialNumber: "POT-7701", contractNumber: "CON-2025-401", service: "Import/Export",
    projectName: "Domestic Freight Q1", paymentMode: "Net 30", billingEntity: "BH Trading",
  },

  // ── Legacy Partners (1 invoice, high value) ──────────────────
  {
    id: "inv-012", invoiceNumber: "INV-2026-0098", amount: 89000,
    invoiceDate: "2025-12-01", dueDate: "2025-12-31", daysOverdue: 65,
    paymentStatus: "", companyName: "Legacy Partners",
    contactName: "Diana Ross", contactEmail: "d.ross@legacypartners.com", contactPhone: "+1-555-0117",
    potentialNumber: "POT-8801", contractNumber: "CON-2025-501", service: "Consulting",
    projectName: "Digital Transformation Phase 1", paymentMode: "Net 30", billingEntity: "BH Consulting",
  },

  // ── Granite Construction (1 invoice, billing error) ──────────
  {
    id: "inv-013", invoiceNumber: "INV-2026-0250", amount: 22100,
    invoiceDate: "2026-01-08", dueDate: "2026-02-07", daysOverdue: 27,
    paymentStatus: "Disputed", companyName: "Granite Construction",
    contactName: "Carlos Ruiz", contactEmail: "c.ruiz@granitecon.com", contactPhone: "+1-555-0110",
    potentialNumber: "POT-9901", contractNumber: "CON-2025-088", service: "Construction Materials",
    projectName: "Highway Extension Lot 3", paymentMode: "Net 30", billingEntity: "BH Construction",
  },

  // ── Zenith Corp (2 invoices, payment promised) ───────────────
  {
    id: "inv-014", invoiceNumber: "INV-2026-0143", amount: 18200,
    invoiceDate: "2026-01-02", dueDate: "2026-02-01", daysOverdue: 33,
    paymentStatus: "Payment Promised", companyName: "Zenith Corp",
    contactName: "Lisa Nguyen", contactEmail: "l.nguyen@zenithcorp.com", contactPhone: "+1-555-0115",
    potentialNumber: "POT-1102", contractNumber: "CON-2025-055", service: "IT Services",
    projectName: "Cloud Migration", paymentMode: "Net 30", billingEntity: "BH Technology",
  },
  {
    id: "inv-015", invoiceNumber: "INV-2026-0372", amount: 9400,
    invoiceDate: "2026-02-10", dueDate: "2026-03-04", daysOverdue: 2,
    paymentStatus: "", companyName: "Zenith Corp",
    contactName: "Lisa Nguyen", contactEmail: "l.nguyen@zenithcorp.com", contactPhone: "+1-555-0115",
    potentialNumber: "POT-1102", contractNumber: "CON-2025-055", service: "IT Services",
    projectName: "Cloud Migration Phase 2", paymentMode: "Net 30", billingEntity: "BH Technology",
  },

  // ── Orion Enterprises (1 invoice) ────────────────────────────
  {
    id: "inv-016", invoiceNumber: "INV-2026-0072", amount: 27600,
    invoiceDate: "2025-11-25", dueDate: "2025-12-25", daysOverdue: 71,
    paymentStatus: "", companyName: "Orion Enterprises",
    contactName: "Fiona Grant", contactEmail: "f.grant@orionent.com", contactPhone: "+1-555-0119",
    potentialNumber: "POT-3301", contractNumber: "CON-2025-022", service: "Logistics",
    projectName: "Year-End Consolidation", paymentMode: "Net 30", billingEntity: "BH Americas",
  },

  // ── Acme Corp (1 invoice, partially paid) ────────────────────
  {
    id: "inv-017", invoiceNumber: "INV-2026-0261", amount: 5400,
    invoiceDate: "2026-01-12", dueDate: "2026-02-11", daysOverdue: 23,
    paymentStatus: "Partially Paid", companyName: "Acme Corp",
    contactName: "Tom Bradley", contactEmail: "t.bradley@acmecorp.com", contactPhone: "+1-555-0109",
    potentialNumber: "POT-4403", contractNumber: "CON-2025-120", service: "Office Supplies",
    projectName: "Q1 Supply Order", paymentMode: "Net 30", billingEntity: "BH Americas",
  },
];

// ── Mock follow-ups (keyed by invoiceId) ──────────────────────────

export const MOCK_FOLLOW_UPS: Record<string, FollowUp[]> = {
  "inv-001": [
    { id: "fu-001", invoiceId: "inv-001", date: "2026-02-15", type: "email", summary: "1st reminder sent",
      details: "Dear Sarah,\n\nI hope this message finds you well. I am writing to follow up on invoice #INV-2026-0312 for $12,500 which was due on 14 February 2026.\n\nAs of today, the invoice is 1 day past due. Could you kindly confirm the status of payment or let us know if there are any issues we can assist with?\n\nPlease find below a summary of the outstanding amount:\n\nInvoice #INV-2026-0312\nAmount: $12,500.00\nDue Date: 14 February 2026\nProject: Q1 Distribution\n\nWe appreciate your prompt attention to this matter.\n\nKind regards,\nAR Team" },
    { id: "fu-002", invoiceId: "inv-001", date: "2026-02-20", type: "call", summary: "Call attempt #1 — No answer", callOutcome: "no-answer" },
    { id: "fu-003", invoiceId: "inv-001", date: "2026-02-25", type: "email", summary: "2nd reminder sent",
      details: "Dear Sarah,\n\nThis is a follow-up regarding the outstanding invoice #INV-2026-0312 for $12,500.00 which is now 11 days past due.\n\nWe have not yet received payment or a response to our previous correspondence dated 15 February. Could you please advise on the expected payment date?\n\nOutstanding Summary:\n- INV-2026-0312: $12,500.00 (11 days overdue)\n- INV-2026-0298: $8,000.00 (6 days overdue)\nTotal Outstanding: $20,500.00\n\nIf there are any queries or discrepancies, please do not hesitate to contact us so we can resolve them promptly.\n\nKind regards,\nAR Team" },
    { id: "fu-004", invoiceId: "inv-001", date: "2026-03-01", type: "call", summary: "Call attempt #2 — Voicemail, left message", callOutcome: "voicemail" },
  ],
  "inv-002": [
    { id: "fu-005", invoiceId: "inv-002", date: "2026-02-20", type: "email", summary: "1st reminder sent",
      details: "Dear Customer,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
  ],
  "inv-005": [
    { id: "fu-010", invoiceId: "inv-005", date: "2026-02-10", type: "email", summary: "1st reminder sent",
      details: "Dear Mike,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-011", invoiceId: "inv-005", date: "2026-02-14", type: "call", summary: "Spoke with Mike — dispute raised re: 20 units short on delivery", callOutcome: "spoke-dispute" },
    { id: "fu-012", invoiceId: "inv-005", date: "2026-02-15", type: "escalation", summary: "Escalated to Ops Team — delivery discrepancy", escalationTarget: "ops",
      details: "Hi Ops Team,\n\nMike Torres from Coastal Fabrication has raised a dispute on INV-2026-0271 ($19,300). He reports that 20 units were short on the delivery for Hull Assembly Lot 7.\n\nClient: Coastal Fabrication\nInvoice: INV-2026-0271\nAmount: $19,300.00\nDays Overdue: 6\nDispute Reason: Delivery shortfall — 20 units\n\nCould you please investigate and provide an update? Payment is being held pending resolution.\n\nRegards,\nAR Team" },
    { id: "fu-013", invoiceId: "inv-005", date: "2026-02-22", type: "note", summary: "Ops confirmed shortfall — credit note of $2,100 being raised" },
    { id: "fu-014", invoiceId: "inv-005", date: "2026-02-28", type: "email", summary: "Sent revised invoice after credit note CN-2026-0041 applied",
      details: "Dear Mike,\n\nPlease find attached the revised invoice following the credit note CN-2026-0041 that has been applied.\n\nThe updated amount is now reflected. We would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns.\n\nKind regards,\nAR Team" },
  ],
  "inv-007": [
    { id: "fu-020", invoiceId: "inv-007", date: "2026-02-05", type: "email", summary: "1st reminder sent",
      details: "Dear Rachel,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-021", invoiceId: "inv-007", date: "2026-02-07", type: "call", summary: "Call attempt #1 — No answer", callOutcome: "no-answer" },
    { id: "fu-022", invoiceId: "inv-007", date: "2026-02-10", type: "call", summary: "Call attempt #2 — Voicemail", callOutcome: "voicemail" },
    { id: "fu-023", invoiceId: "inv-007", date: "2026-02-14", type: "email", summary: "2nd reminder sent",
      details: "Dear Rachel,\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment at the earliest and confirm.\n\nOnce done, kindly share the payment details for our reference.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-024", invoiceId: "inv-007", date: "2026-02-18", type: "call", summary: "Call attempt #3 — No answer", callOutcome: "no-answer" },
    { id: "fu-025", invoiceId: "inv-007", date: "2026-02-21", type: "email", summary: "3rd and final reminder sent",
      details: "Dear Rachel,\n\nThis is our final reminder regarding the overdue payment for invoice #INV-2026-0255.\n\nDespite multiple attempts to reach you by phone and email, we have not received a response. The details are as follows:\n\nInvoice: INV-2026-0255\nAmount: $28,000.00\nDue Date: 4 February 2026\nDays Overdue: 17\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.\n\nRegards,\nAR Team" },
    { id: "fu-026", invoiceId: "inv-007", date: "2026-02-25", type: "escalation", summary: "Escalated to Trevor — persistent non-response", escalationTarget: "trevor" },
  ],
  "inv-009": [
    { id: "fu-030", invoiceId: "inv-009", date: "2026-01-20", type: "email", summary: "1st reminder sent",
      details: "Dear Customer,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-031", invoiceId: "inv-009", date: "2026-01-24", type: "call", summary: "Call attempt #1 — No answer", callOutcome: "no-answer" },
    { id: "fu-032", invoiceId: "inv-009", date: "2026-01-28", type: "call", summary: "Call attempt #2 — Voicemail", callOutcome: "voicemail" },
    { id: "fu-033", invoiceId: "inv-009", date: "2026-02-01", type: "email", summary: "2nd reminder sent",
      details: "Dear Customer,\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-034", invoiceId: "inv-009", date: "2026-02-05", type: "call", summary: "Call attempt #3 — No answer", callOutcome: "no-answer" },
    { id: "fu-035", invoiceId: "inv-009", date: "2026-02-10", type: "email", summary: "3rd and final reminder sent",
      details: "Dear Customer,\n\nThis is our final reminder regarding the overdue payment for the attached invoice.\n\nDespite multiple attempts to reach you, we have not received a response.\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.\n\nKind regards,\nAR Team" },
    { id: "fu-036", invoiceId: "inv-009", date: "2026-02-14", type: "escalation", summary: "Escalated to Ops Team", escalationTarget: "ops" },
    { id: "fu-037", invoiceId: "inv-009", date: "2026-02-21", type: "escalation", summary: "Escalated to Trevor — Ops silent for 1 week", escalationTarget: "trevor" },
    { id: "fu-038", invoiceId: "inv-009", date: "2026-03-01", type: "escalation", summary: "Escalated to Ofir — Trevor unable to resolve", escalationTarget: "ofir" },
  ],
  "inv-010": [
    { id: "fu-040", invoiceId: "inv-010", date: "2026-01-15", type: "email", summary: "1st reminder sent",
      details: "Dear Robert,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-041", invoiceId: "inv-010", date: "2026-01-20", type: "call", summary: "Spoke with Robert — said payment in process", callOutcome: "spoke-will-pay" },
    { id: "fu-042", invoiceId: "inv-010", date: "2026-01-28", type: "email", summary: "2nd reminder — payment not received",
      details: "Dear Robert,\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment at the earliest and confirm.\n\nOnce done, kindly share the payment details for our reference.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-043", invoiceId: "inv-010", date: "2026-02-03", type: "call", summary: "Call attempt — No answer", callOutcome: "no-answer" },
    { id: "fu-044", invoiceId: "inv-010", date: "2026-02-10", type: "email", summary: "3rd and final reminder sent",
      details: "Dear Robert,\n\nThis is our final reminder regarding the overdue payment for the attached invoice.\n\nDespite multiple attempts to reach you, we have not received a response.\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.\n\nKind regards,\nAR Team" },
    { id: "fu-045", invoiceId: "inv-010", date: "2026-02-17", type: "escalation", summary: "Escalated to Ops Team", escalationTarget: "ops" },
    { id: "fu-046", invoiceId: "inv-010", date: "2026-02-24", type: "escalation", summary: "Escalated to Trevor", escalationTarget: "trevor" },
    { id: "fu-047", invoiceId: "inv-010", date: "2026-03-03", type: "escalation", summary: "Escalated to Ofir — 51 days overdue", escalationTarget: "ofir" },
  ],
  "inv-012": [
    { id: "fu-050", invoiceId: "inv-012", date: "2026-01-02", type: "email", summary: "1st reminder sent",
      details: "Dear Diana,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-051", invoiceId: "inv-012", date: "2026-01-07", type: "call", summary: "Spoke with Diana — finance team processing", callOutcome: "spoke-will-pay" },
    { id: "fu-052", invoiceId: "inv-012", date: "2026-01-14", type: "email", summary: "2nd reminder sent",
      details: "Dear Diana,\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment at the earliest and confirm.\n\nOnce done, kindly share the payment details for our reference.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-053", invoiceId: "inv-012", date: "2026-01-21", type: "call", summary: "Call attempt — No answer", callOutcome: "no-answer" },
    { id: "fu-054", invoiceId: "inv-012", date: "2026-01-28", type: "email", summary: "3rd and final reminder",
      details: "Dear Diana,\n\nThis is our final reminder regarding the overdue payment for the attached invoice.\n\nDespite multiple attempts to reach you, we have not received a response.\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.\n\nKind regards,\nAR Team" },
    { id: "fu-055", invoiceId: "inv-012", date: "2026-02-04", type: "escalation", summary: "Escalated to Ops Team", escalationTarget: "ops" },
    { id: "fu-056", invoiceId: "inv-012", date: "2026-02-11", type: "escalation", summary: "Escalated to Trevor", escalationTarget: "trevor" },
    { id: "fu-057", invoiceId: "inv-012", date: "2026-02-18", type: "escalation", summary: "Escalated to Ofir", escalationTarget: "ofir" },
    { id: "fu-058", invoiceId: "inv-012", date: "2026-02-25", type: "note", summary: "Case presented to David for collections decision" },
  ],
  "inv-013": [
    { id: "fu-060", invoiceId: "inv-013", date: "2026-02-08", type: "email", summary: "1st reminder sent",
      details: "Dear Carlos,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-061", invoiceId: "inv-013", date: "2026-02-12", type: "call", summary: "Spoke with Carlos — billing error on cancelled order #ORD-884", callOutcome: "spoke-dispute" },
    { id: "fu-062", invoiceId: "inv-013", date: "2026-02-15", type: "note", summary: "Confirmed billing error — credit note CN-2026-0041 for $3,200 being raised" },
    { id: "fu-063", invoiceId: "inv-013", date: "2026-02-20", type: "email", summary: "Credit note sent, revised invoice issued for $18,900",
      details: "Dear Carlos,\n\nPlease find attached the credit note CN-2026-0041 for $3,200 and the revised invoice for $18,900.\n\nWe would appreciate if you could process the payment by clicking on the below link.\n\nPlease do not hesitate to contact us if there are any issues or concerns.\n\nKind regards,\nAR Team" },
  ],
  "inv-014": [
    { id: "fu-070", invoiceId: "inv-014", date: "2026-02-02", type: "email", summary: "1st reminder sent",
      details: "Dear Lisa,\n\nHope this email finds you well.\n\nWe are writing to follow up on the payment of the attached Invoice, which is now overdue, and we would appreciate if you could initiate the payment at your earliest convenience.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-071", invoiceId: "inv-014", date: "2026-02-07", type: "call", summary: "Spoke with Lisa — reviewing invoice, will pay by Feb 15", callOutcome: "spoke-will-pay" },
    { id: "fu-072", invoiceId: "inv-014", date: "2026-02-16", type: "email", summary: "Follow-up — payment not received on promised date",
      details: "Dear Lisa,\n\nWe are writing again to remind you about the pending payment for the attached invoice.\n\nI am sure you may have been swarmed with your busy schedule and would have missed our 1st reminder emails & calls, please do consider this as a gentle reminder and process the payment at the earliest and confirm.\n\nOnce done, kindly share the payment details for our reference.\n\nPlease do not hesitate to contact us if there are any issues or concerns regarding this invoice or if you require any assistance from us.\n\nKind regards,\nAR Team" },
    { id: "fu-073", invoiceId: "inv-014", date: "2026-02-20", type: "call", summary: "Spoke — Lisa confirmed payment will be made by month-end", callOutcome: "spoke-will-pay" },
    { id: "fu-074", invoiceId: "inv-014", date: "2026-03-02", type: "email", summary: "Payment still outstanding — sent 3rd reminder",
      details: "Dear Lisa,\n\nThis is our final reminder regarding the overdue payment for the attached invoice.\n\nDespite multiple attempts to reach you, we have not received a response.\n\nIf payment is not received or we do not hear from you within 48 hours, we will be required to escalate this matter internally.\n\nPlease treat this as urgent.\n\nKind regards,\nAR Team" },
  ],
  "inv-016": [
    { id: "fu-080", invoiceId: "inv-016", date: "2025-12-26", type: "email", summary: "1st reminder sent" },
    { id: "fu-081", invoiceId: "inv-016", date: "2025-12-30", type: "call", summary: "Call attempt — No answer", callOutcome: "no-answer" },
    { id: "fu-082", invoiceId: "inv-016", date: "2026-01-06", type: "email", summary: "2nd reminder sent" },
    { id: "fu-083", invoiceId: "inv-016", date: "2026-01-10", type: "call", summary: "Call attempt — Voicemail", callOutcome: "voicemail" },
    { id: "fu-084", invoiceId: "inv-016", date: "2026-01-15", type: "email", summary: "3rd and final reminder" },
    { id: "fu-085", invoiceId: "inv-016", date: "2026-01-22", type: "escalation", summary: "Escalated to Ops Team", escalationTarget: "ops" },
    { id: "fu-086", invoiceId: "inv-016", date: "2026-01-29", type: "escalation", summary: "Escalated to Trevor", escalationTarget: "trevor" },
    { id: "fu-087", invoiceId: "inv-016", date: "2026-02-05", type: "escalation", summary: "Escalated to Ofir", escalationTarget: "ofir" },
    { id: "fu-088", invoiceId: "inv-016", date: "2026-02-12", type: "note", summary: "David approved collections procedure" },
    { id: "fu-089", invoiceId: "inv-016", date: "2026-02-19", type: "note", summary: "Collections agency engaged — case ref #COL-2026-019" },
  ],
  "inv-017": [
    { id: "fu-090", invoiceId: "inv-017", date: "2026-02-12", type: "email", summary: "1st reminder sent" },
    { id: "fu-091", invoiceId: "inv-017", date: "2026-02-18", type: "call", summary: "Spoke with Tom — partial payment of $2,700 made", callOutcome: "spoke-will-pay" },
    { id: "fu-092", invoiceId: "inv-017", date: "2026-02-25", type: "note", summary: "Partial payment confirmed — $2,700 received, $2,700 remaining" },
  ],
};

// ── Mock payment history (past paid invoices for behavior scoring) ──

export const MOCK_PAYMENT_HISTORY: Record<string, PaymentRecord[]> = {
  "Meridian Logistics": [
    { invoiceNumber: "INV-2025-0891", amount: 10200, invoiceDate: "2025-09-01", dueDate: "2025-10-01", paidDate: "2025-10-08", daysToPayAfterDue: 7 },
    { invoiceNumber: "INV-2025-0756", amount: 8400, invoiceDate: "2025-07-15", dueDate: "2025-08-14", paidDate: "2025-08-28", daysToPayAfterDue: 14 },
    { invoiceNumber: "INV-2025-0612", amount: 15000, invoiceDate: "2025-05-01", dueDate: "2025-05-31", paidDate: "2025-06-10", daysToPayAfterDue: 10 },
    { invoiceNumber: "INV-2025-0489", amount: 6300, invoiceDate: "2025-03-10", dueDate: "2025-04-09", paidDate: "2025-04-05", daysToPayAfterDue: -4 },
  ],
  "Atlas Engineering": [
    { invoiceNumber: "INV-2025-0834", amount: 7500, invoiceDate: "2025-08-20", dueDate: "2025-09-19", paidDate: "2025-09-18", daysToPayAfterDue: -1 },
    { invoiceNumber: "INV-2025-0701", amount: 9100, invoiceDate: "2025-06-15", dueDate: "2025-07-15", paidDate: "2025-07-14", daysToPayAfterDue: -1 },
  ],
  "Coastal Fabrication": [
    { invoiceNumber: "INV-2025-0920", amount: 12000, invoiceDate: "2025-10-01", dueDate: "2025-10-31", paidDate: "2025-11-15", daysToPayAfterDue: 15 },
    { invoiceNumber: "INV-2025-0810", amount: 18500, invoiceDate: "2025-08-01", dueDate: "2025-08-31", paidDate: "2025-09-20", daysToPayAfterDue: 20 },
    { invoiceNumber: "INV-2025-0655", amount: 14200, invoiceDate: "2025-06-01", dueDate: "2025-06-30", paidDate: "2025-07-25", daysToPayAfterDue: 25 },
  ],
  "Northern Industries": [
    { invoiceNumber: "INV-2025-0880", amount: 22000, invoiceDate: "2025-09-10", dueDate: "2025-10-10", paidDate: "2025-10-12", daysToPayAfterDue: 2 },
    { invoiceNumber: "INV-2025-0745", amount: 19800, invoiceDate: "2025-07-01", dueDate: "2025-07-31", paidDate: "2025-08-05", daysToPayAfterDue: 5 },
  ],
  "Delta Manufacturing": [
    { invoiceNumber: "INV-2025-0930", amount: 35000, invoiceDate: "2025-10-15", dueDate: "2025-11-14", paidDate: "2025-12-10", daysToPayAfterDue: 26 },
    { invoiceNumber: "INV-2025-0799", amount: 28000, invoiceDate: "2025-08-10", dueDate: "2025-09-09", paidDate: "2025-10-01", daysToPayAfterDue: 22 },
    { invoiceNumber: "INV-2025-0650", amount: 42000, invoiceDate: "2025-06-01", dueDate: "2025-06-30", paidDate: "2025-07-28", daysToPayAfterDue: 28 },
  ],
  "Pacific Traders": [
    { invoiceNumber: "INV-2025-0905", amount: 55000, invoiceDate: "2025-09-20", dueDate: "2025-10-20", paidDate: "2025-11-18", daysToPayAfterDue: 29 },
    { invoiceNumber: "INV-2025-0770", amount: 48000, invoiceDate: "2025-07-20", dueDate: "2025-08-19", paidDate: "2025-09-15", daysToPayAfterDue: 27 },
  ],
  "Legacy Partners": [
    { invoiceNumber: "INV-2025-0845", amount: 75000, invoiceDate: "2025-08-15", dueDate: "2025-09-14", paidDate: "2025-10-20", daysToPayAfterDue: 36 },
    { invoiceNumber: "INV-2025-0710", amount: 60000, invoiceDate: "2025-06-20", dueDate: "2025-07-20", paidDate: "2025-08-28", daysToPayAfterDue: 39 },
  ],
  "Granite Construction": [
    { invoiceNumber: "INV-2025-0860", amount: 18000, invoiceDate: "2025-09-01", dueDate: "2025-10-01", paidDate: "2025-10-05", daysToPayAfterDue: 4 },
  ],
  "Zenith Corp": [
    { invoiceNumber: "INV-2025-0888", amount: 14000, invoiceDate: "2025-09-15", dueDate: "2025-10-15", paidDate: "2025-10-30", daysToPayAfterDue: 15 },
    { invoiceNumber: "INV-2025-0722", amount: 11500, invoiceDate: "2025-07-01", dueDate: "2025-07-31", paidDate: "2025-08-18", daysToPayAfterDue: 18 },
  ],
  "Orion Enterprises": [
    { invoiceNumber: "INV-2025-0815", amount: 20000, invoiceDate: "2025-08-05", dueDate: "2025-09-04", paidDate: "2025-10-02", daysToPayAfterDue: 28 },
    { invoiceNumber: "INV-2025-0680", amount: 25000, invoiceDate: "2025-06-10", dueDate: "2025-07-10", paidDate: "2025-08-15", daysToPayAfterDue: 36 },
  ],
  "Acme Corp": [
    { invoiceNumber: "INV-2025-0900", amount: 4800, invoiceDate: "2025-10-01", dueDate: "2025-10-31", paidDate: "2025-11-02", daysToPayAfterDue: 2 },
    { invoiceNumber: "INV-2025-0780", amount: 5100, invoiceDate: "2025-08-01", dueDate: "2025-08-31", paidDate: "2025-09-01", daysToPayAfterDue: 1 },
  ],
};
