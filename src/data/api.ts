import { PaymentRecord } from "./ar-types";

const API_BASE = "/api";

export interface ApiInvoice {
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

export async function fetchOverdueInvoices(): Promise<ApiInvoice[]> {
  const res = await fetch(`${API_BASE}/invoices`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.invoices as ApiInvoice[];
}

export async function fetchAllInvoices(): Promise<ApiInvoice[]> {
  const res = await fetch(`${API_BASE}/invoices/all`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.invoices as ApiInvoice[];
}

export async function fetchClientHistory(companyName: string): Promise<PaymentRecord[]> {
  const res = await fetch(`${API_BASE}/clients/${encodeURIComponent(companyName)}/history`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.history as PaymentRecord[];
}

export interface ApiStats {
  total_invoices: number;
  total_ar: number;
  overdue_count: number;
  overdue_total: number;
  critical_count: number;
  critical_total: number;
}

export async function fetchStats(): Promise<ApiStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
