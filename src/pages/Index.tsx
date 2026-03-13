import { useState, useMemo, useRef, useEffect } from "react";
import { ArStageId, ClientSortKey, getStageForDays } from "@/data/ar-types";
import { MOCK_MONTHLY_REVENUE } from "@/data/ar-mock-data";
import { useInvoices } from "@/hooks/use-invoices";
import { useInvoiceMeta } from "@/hooks/use-invoice-meta";
import { ClientList } from "@/components/ClientList";
import { ClientWorkspace, DailySummary } from "@/components/ClientWorkspace";
import { StagePanel } from "@/components/StagePanel";
import { cn } from "@/lib/utils";
import {
  Loader2, Wifi, WifiOff, LogOut, ExternalLink,
  ArrowRight, Landmark, CreditCard, Wallet,
} from "lucide-react";

export default function TriageView() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<ArStageId | null>(null);
  const [stagePanelCollapsed, setStagePanelCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<ClientSortKey>("mostOverdue");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("ar-current-user") || "");
  const [portalsOpen, setPortalsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);
  const { getAllMeta } = useInvoiceMeta();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (portalsRef.current && !portalsRef.current.contains(e.target as Node)) {
        setPortalsOpen(false);
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

  const allMeta = getAllMeta();

  // Stage-filtered groups (applied after service/status filters)
  const stageFilteredGroups = useMemo(() => {
    if (!selectedStage) return effectiveGroups;
    return effectiveGroups.filter(g => getStageForDays(g.mostOverdueDays).id === selectedStage);
  }, [effectiveGroups, selectedStage]);

  const hasServiceOrStatusFilter = serviceFilter !== "all" || statusFilter !== "all";

  // Daily summary for workspace progress bar
  const dailySummary = useMemo((): DailySummary => {
    const today = new Date().toISOString().slice(0, 10);
    const allInvs = clientGroups.flatMap(g => g.stakeholders.flatMap(s => s.invoices));

    const contactedToday = clientGroups.filter(g =>
      g.stakeholders.some(s =>
        s.invoices.some(inv =>
          inv.followUps.some(f => f.date === today)
        )
      )
    ).length;

    const callsToday = allInvs.reduce(
      (count, inv) => count + inv.followUps.filter(f => f.type === "call" && f.date === today).length,
      0
    );

    const metaValues = Object.values(allMeta);
    const promisesExpiring = metaValues.filter(m =>
      m.promiseToPayDate && new Date(m.promiseToPayDate) <= new Date(today)
    ).length;
    const opsQueriesPending = metaValues.filter(m => m.opsQueryStatus === "forwarded").length;

    return {
      totalAccounts: clientGroups.length,
      contactedToday,
      callsToday,
      promisesExpiring,
      opsQueriesPending,
    };
  }, [clientGroups, allMeta]);

  // Next most-urgent client (excluding current selection)
  const nextClient = useMemo(() => {
    if (!selectedClientId || stageFilteredGroups.length <= 1) return null;
    const candidates = stageFilteredGroups.filter(g => g.id !== selectedClientId);
    if (candidates.length === 0) return null;
    // Already sorted by most overdue — first is most urgent
    const next = candidates[0];
    return { id: next.id, name: next.companyName, daysOverdue: next.mostOverdueDays };
  }, [selectedClientId, stageFilteredGroups]);

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
      <header className="h-14 border-b-2 border-border bg-card flex items-center px-4 shrink-0 gap-3">
        <div className="flex items-center gap-3 shrink-0">
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

        {/* Payment portals dropdown */}
        <div className="relative shrink-0" ref={portalsRef}>
          <button
            onClick={() => setPortalsOpen(v => !v)}
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-semibold rounded-lg px-3 py-1.5 border transition-colors",
              portalsOpen
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
            )}
          >
            <Landmark className="w-3.5 h-3.5" />
            Payment Portals
          </button>
          {portalsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border bg-muted/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Check Payments & Statements</span>
              </div>
              {PAYMENT_PORTALS.map(portal => (
                <a
                  key={portal.label}
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                  onClick={() => setPortalsOpen(false)}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", portal.iconBg)}>
                    <portal.icon className={cn("w-4 h-4", portal.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-foreground">{portal.label}</div>
                    <div className="text-[10px] text-muted-foreground">{portal.description}</div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative shrink-0" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors text-primary font-semibold text-[12px]"
            title={currentUser || "Set your name"}
          >
            {currentUser ? currentUser.charAt(0).toUpperCase() : "?"}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-border bg-card shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Your name</label>
                <input
                  type="text"
                  value={currentUser}
                  onChange={(e) => {
                    setCurrentUser(e.target.value);
                    localStorage.setItem("ar-current-user", e.target.value);
                  }}
                  placeholder="Enter your name..."
                  className="w-full text-[12px] font-medium bg-muted/50 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>
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

      {/* Revenue Overview Bar */}
      <RevenueBar revenue={MOCK_MONTHLY_REVENUE[0]} />

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <StagePanel
          clientGroups={effectiveGroups}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
          collapsed={stagePanelCollapsed}
          onToggleCollapse={() => setStagePanelCollapsed(v => !v)}
        />
        <div className="w-[320px] border-r-2 border-border bg-card overflow-hidden shrink-0">
          <ClientList
            clientGroups={stageFilteredGroups}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortKey={sortKey}
            onSortChange={setSortKey}
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
            dailySummary={dailySummary}
            nextClient={nextClient}
            onSelectClient={setSelectedClientId}
          />
        </div>
      </div>

    </div>
  );
}

// ── Payment Portals config ─────────────────────────────────────────

const PAYMENT_PORTALS = [
  {
    label: "Bank Portal",
    description: "Check wire & ACH statements",
    url: "#",
    icon: Landmark,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "PayPal Business",
    description: "PayPal transactions & balance",
    url: "https://www.paypal.com/businessmanage/transactions",
    icon: Wallet,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    label: "Stripe Dashboard",
    description: "Credit card payments via Stripe",
    url: "https://dashboard.stripe.com/payments",
    icon: CreditCard,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Authorize.net",
    description: "Credit card gateway",
    url: "https://account.authorize.net",
    icon: CreditCard,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

// ── Revenue Bar ────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function RevenueBar({ revenue }: { revenue: { month: string; totalBilled: number; totalCollected: number; outstanding: number } }) {
  const collectionRate = revenue.totalBilled > 0
    ? Math.round((revenue.totalCollected / revenue.totalBilled) * 100)
    : 0;

  const monthLabel = new Date(revenue.month + "-01").toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="h-10 border-b border-border bg-muted/20 flex items-center px-4 gap-6 shrink-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
        {monthLabel}
      </span>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Billed</span>
        <span className="text-[12px] font-bold tabular-nums text-foreground">{formatCurrency(revenue.totalBilled)}</span>
      </div>

      <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Collected</span>
        <span className="text-[12px] font-bold tabular-nums text-green-600">{formatCurrency(revenue.totalCollected)}</span>
      </div>

      <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground">Outstanding</span>
        <span className="text-[12px] font-bold tabular-nums text-red-600">{formatCurrency(revenue.outstanding)}</span>
      </div>

      {/* Collection rate bar */}
      <div className="flex items-center gap-2 ml-2">
        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <span className="text-[11px] font-bold tabular-nums text-foreground">{collectionRate}%</span>
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
