import { useState, useCallback, useEffect } from "react";

export interface InvoiceMeta {
  nextActionDate: string | null;   // ISO date string
  quickStatus: string | null;      // one-liner tag like "1st follow up", "Client not responding"
  handledBy: string | null;        // team member name
  promiseToPayDate: string | null; // ISO date - when client promised to pay
  opsQueryStatus: "none" | "forwarded" | "resolved" | null; // OPS query lifecycle
  altContacts: string | null;      // alternative contacts found during research
}

const STORAGE_KEY = "ar-invoice-meta";

function loadFromStorage(): Record<string, InvoiceMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return {};
}

function saveToStorage(data: Record<string, InvoiceMeta>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
}

const defaultMeta: InvoiceMeta = { nextActionDate: null, quickStatus: null, handledBy: null, promiseToPayDate: null, opsQueryStatus: null, altContacts: null };

export function useInvoiceMeta() {
  const [metaMap, setMetaMap] = useState<Record<string, InvoiceMeta>>(loadFromStorage);

  useEffect(() => {
    saveToStorage(metaMap);
  }, [metaMap]);

  const getMeta = useCallback(
    (invoiceId: string): InvoiceMeta => metaMap[invoiceId] || defaultMeta,
    [metaMap]
  );

  const setMeta = useCallback(
    (invoiceId: string, updates: Partial<InvoiceMeta>) => {
      setMetaMap((prev) => ({
        ...prev,
        [invoiceId]: { ...(prev[invoiceId] || defaultMeta), ...updates },
      }));
    },
    []
  );

  const getAllMeta = useCallback(
    (): Record<string, InvoiceMeta> => metaMap,
    [metaMap]
  );

  return { getMeta, setMeta, getAllMeta };
}
