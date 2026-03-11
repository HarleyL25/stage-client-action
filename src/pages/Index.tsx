import { useState, useMemo, useRef, useEffect } from "react";
import { ClientSortKey, OverdueFilter } from "@/data/ar-types";
import { useInvoices } from "@/hooks/use-invoices";
import { ClientList } from "@/components/ClientList";
import { ClientWorkspace } from "@/components/ClientWorkspace";
import { cn } from "@/lib/utils";
import { Loader2, Wifi, WifiOff, DollarSign, LogOut } from "lucide-react";

export default function TriageView() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<ClientSortKey>("mostOverdue");
  const [overdueFilter, setOverdueFilter] = useState<OverdueFilter>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { clientGroups, allClientGroups, allPaymentStatuses, isLoading, isError, dataUpdatedAt } = useInvoices();
  const isLive = !isError && dataUpdatedAt > 0;

  // Compute unique service values from full dataset
  const allServices = useMemo(() => {
    const s = new Set<string>();
    for (const g of allClientGroups)
      for (const st of g.stakeholders)
        for (const inv of st.invoices)
          if (inv.service) s.add(inv.service);
    return Array.from(s).sort();
  }, [allClientGroups]);

  // Effective data source: if a specific status is selected, use allClientGroups;
  // otherwise use default overdue-unpaid clientGroups.
  const effectiveGroups = useMemo(() => {
    let source = statusFilter !== "all" ? allClientGroups : clientGroups;

    if (serviceFilter !== "all") {
      source = source.filter(g =>
        g.stakeholders.some(s => s.invoices.some(inv => inv.service === serviceFilter))
      );
    }
    if (statusFilter !== "all") {
      source = source.filter(g =>
        g.stakeholders.some(s => s.invoices.some(inv => inv.paymentStatus === statusFilter))
      );
    }
    return source;
  }, [clientGroups, allClientGroups, serviceFilter, statusFilter]);

  const hasServiceOrStatusFilter = serviceFilter !== "all" || statusFilter !== "all";

  const selectedClient = useMemo(
    () => {
      if (!selectedClientId) return null;
      // Search effective groups first, then fall back to allClientGroups
      return effectiveGroups.find((c) => c.id === selectedClientId)
        ?? allClientGroups.find((c) => c.id === selectedClientId)
        ?? null;
    },
    [selectedClientId, effectiveGroups, allClientGroups]
  );


  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b-2 border-border bg-card flex items-center px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <DollarSignIcon className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">AR Portal</h1>
          </div>

          {/* Live/Mock indicator */}
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border",
            isLive
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          )}>
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isLive ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {isLoading ? "Loading..." : isLive ? "Live" : "Mock data"}
          </div>
        </div>

        <div className="flex-1" />

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary font-semibold text-[12px]"
          >
            U
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border bg-card shadow-lg py-1 z-50">
              <button
                onClick={() => { setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-foreground hover:bg-muted/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[380px] border-r-2 border-border bg-card overflow-hidden shrink-0">
          <ClientList
            clientGroups={effectiveGroups}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortKey={sortKey}
            onSortChange={setSortKey}
            overdueFilter={overdueFilter}
            onOverdueFilterChange={setOverdueFilter}
            serviceFilter={serviceFilter}
            onServiceFilterChange={setServiceFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            allServices={allServices}
            allPaymentStatuses={allPaymentStatuses}
          />
        </div>
        <div className="flex-1 bg-card overflow-hidden">
          <ClientWorkspace
            client={selectedClient}
          />
        </div>
      </div>

    </div>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
