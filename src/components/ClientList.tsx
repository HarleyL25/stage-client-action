import { useMemo } from "react";
import { ClientGroup, ClientSortKey, OverdueFilter } from "@/data/ar-types";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, FileText, AlertTriangle, Clock, Filter, X } from "lucide-react";
import { FilterDropdown } from "./ui/filter-dropdown";

interface ClientListProps {
  clientGroups: ClientGroup[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortKey: ClientSortKey;
  onSortChange: (key: ClientSortKey) => void;
  overdueFilter: OverdueFilter;
  onOverdueFilterChange: (filter: OverdueFilter) => void;
  serviceFilter: string;
  onServiceFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  allServices: string[];
  allPaymentStatuses: string[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function overdueSeverity(days: number): { label: string; className: string } {
  if (days >= 45) return { label: "Escalate", className: "severity-critical" };
  if (days >= 15) return { label: "Follow-up", className: "severity-medium" };
  return { label: "New", className: "severity-low" };
}

function isGroupPaid(group: ClientGroup): boolean {
  return group.stakeholders.every(s =>
    s.invoices.every(inv => {
      const ps = inv.paymentStatus?.toLowerCase() ?? "";
      return ps.includes("paid") && !ps.includes("partial");
    })
  );
}

function relativeDateShort(dateStr: string | null): string {
  if (!dateStr) return "No activity";
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

const SORT_OPTIONS: { key: ClientSortKey; label: string }[] = [
  { key: "mostOverdue", label: "Most overdue" },
  { key: "totalOutstanding", label: "Highest value" },
  { key: "lastAction", label: "Least recent" },
  { key: "companyName", label: "A-Z" },
];

const FILTER_OPTIONS: { key: OverdueFilter; label: string; dotClass: string; btnActive: string; range: string }[] = [
  { key: "all",      label: "All",        dotClass: "",              btnActive: "bg-foreground/10 border-foreground/30 text-foreground",  range: "" },
  { key: "low",      label: "New",        dotClass: "bg-blue-500",   btnActive: "bg-blue-500/10 border-blue-500/40 text-blue-700",       range: "<15" },
  { key: "medium",   label: "Follow-up",  dotClass: "bg-yellow-500", btnActive: "bg-yellow-500/10 border-yellow-500/40 text-yellow-700", range: "15-44" },
  { key: "critical", label: "Escalate",   dotClass: "bg-red-500",    btnActive: "bg-red-500/10 border-red-500/40 text-red-700",          range: "45+" },
];

function matchesOverdueFilter(days: number, filter: OverdueFilter): boolean {
  switch (filter) {
    case "all":      return true;
    case "critical": return days >= 45;
    case "medium":   return days >= 15 && days < 45;
    case "low":      return days < 15;
  }
}

export function ClientList({
  clientGroups,
  selectedClientId,
  onSelectClient,
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
  overdueFilter,
  onOverdueFilterChange,
  serviceFilter,
  onServiceFilterChange,
  statusFilter,
  onStatusFilterChange,
  allServices,
  allPaymentStatuses,
}: ClientListProps) {

  const hasServiceOrStatusFilter = serviceFilter !== "all" || statusFilter !== "all";

  const filtered = useMemo(() => {
    let result = [...clientGroups];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => {
        if (g.companyName.toLowerCase().includes(q)) return true;
        for (const s of g.stakeholders) {
          if (s.name.toLowerCase().includes(q)) return true;
          if (s.email.toLowerCase().includes(q)) return true;
          for (const inv of s.invoices) {
            if (inv.invoiceNumber.toLowerCase().includes(q)) return true;
          }
        }
        return false;
      });
    }

    if (overdueFilter !== "all") {
      result = result.filter((g) => matchesOverdueFilter(g.mostOverdueDays, overdueFilter));
    }

    result.sort((a, b) => {
      switch (sortKey) {
        case "totalOutstanding": return b.totalOutstanding - a.totalOutstanding;
        case "mostOverdue": return b.mostOverdueDays - a.mostOverdueDays;
        case "companyName": return a.companyName.localeCompare(b.companyName);
        case "lastAction": {
          const aTime = a.lastFollowUpDate ? new Date(a.lastFollowUpDate).getTime() : 0;
          const bTime = b.lastFollowUpDate ? new Date(b.lastFollowUpDate).getTime() : 0;
          return aTime - bTime;
        }
        default: return 0;
      }
    });

    return result;
  }, [clientGroups, searchQuery, sortKey, overdueFilter]);

  const cycleSortKey = () => {
    const keys = SORT_OPTIONS.map((o) => o.key);
    const idx = keys.indexOf(sortKey);
    onSortChange(keys[(idx + 1) % keys.length]);
  };

  const totalAR = clientGroups.reduce((s, g) => s + g.totalOutstanding, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search + Sort + Filters */}
      <div className="px-3 pt-3 pb-2 border-b border-border shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search clients, invoices..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-muted/50 rounded-lg border border-border focus:border-primary/50 focus:bg-card outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Service + Status filter dropdowns */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-muted-foreground/50 shrink-0" />
          <FilterDropdown
            value={serviceFilter}
            onChange={onServiceFilterChange}
            placeholder="Service"
            maxWidth="90px"
            options={[
              { value: "all", label: "All services" },
              ...allServices.map(s => ({ value: s, label: s })),
            ]}
          />
          <FilterDropdown
            value={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Status"
            maxWidth="90px"
            options={[
              { value: "all", label: "All statuses" },
              ...allPaymentStatuses.map(s => ({ value: s, label: s })),
            ]}
          />
          {hasServiceOrStatusFilter && (
            <button
              onClick={() => { onServiceFilterChange("all"); onStatusFilterChange("all"); }}
              className="h-7 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 rounded-md border border-border bg-background hover:bg-muted"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={cycleSortKey}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" />
            {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
          </button>
        </div>

        {/* Overdue filter buttons */}
        <div className="grid grid-cols-4 gap-1">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = overdueFilter === opt.key;
            const count = opt.key === "all"
              ? clientGroups.length
              : clientGroups.filter((g) => matchesOverdueFilter(g.mostOverdueDays, opt.key)).length;
            return (
              <button
                key={opt.key}
                onClick={() => onOverdueFilterChange(isActive && opt.key !== "all" ? "all" : opt.key)}
                className={cn(
                  "flex items-center justify-center gap-1 text-[10px] font-semibold rounded-lg px-1 py-1.5 border transition-all",
                  isActive
                    ? opt.btnActive
                    : "border-border/60 text-muted-foreground hover:bg-muted/60 hover:border-border"
                )}
              >
                {opt.dotClass && (
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", opt.dotClass)} />
                )}
                {opt.label}
                <span className="text-[9px] opacity-70 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Client cards */}
      <div className="flex-1 overflow-y-auto ar-scrollbar p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <Search className="w-5 h-5 mb-2 opacity-40" />
            <p className="text-sm font-medium">No clients found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-1">
            {filtered.map((group) => {
              const isSelected = selectedClientId === group.id;
              const paid = isGroupPaid(group);
              const severity = paid
                ? { label: "Paid", className: "bg-green-100 text-green-700 border-green-200" }
                : overdueSeverity(group.mostOverdueDays);
              const primaryStakeholder = group.stakeholders[0];

              return (
                  <button
                    key={group.id}
                    onClick={() => onSelectClient(group.id)}
                    className={cn(
                      "relative w-full text-left rounded-lg px-3.5 py-3 transition-all duration-150 border",
                      isSelected
                        ? "bg-primary/5 border-primary/30 shadow-sm"
                        : "border-border/50 bg-card hover:bg-muted/60 hover:border-border shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    )}
                  >
                  {/* Row 1: Company name + Total */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[13px] font-semibold text-foreground truncate leading-tight">
                      {group.companyName}
                    </span>
                    <span className="text-[13px] font-mono font-bold text-foreground shrink-0 tabular-nums">
                      {formatCurrency(group.totalOutstanding)}
                    </span>
                  </div>

                  {/* Row 2: Contact + Invoice count */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-muted-foreground truncate">
                      {primaryStakeholder?.name}
                      {group.stakeholders.length > 1 && (
                        <span className="text-primary/70 font-medium">
                          {" "}+{group.stakeholders.length - 1} more
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 shrink-0">
                      <FileText className="w-2.5 h-2.5" />
                      {group.invoiceCount}
                    </span>
                  </div>

                  {/* Row 3: Severity + Days + Last activity */}
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-semibold rounded-md px-1.5 py-0.5", severity.className)}>
                      {paid ? "Paid" : `${group.mostOverdueDays}d overdue`}
                    </span>

                    {group.paymentScore !== null && group.paymentScore <= 3 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-destructive/80">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Chronic late
                      </span>
                    )}

                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground ml-auto shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {relativeDateShort(group.lastFollowUpDate)}
                    </span>
                  </div>

                  {/* Row 4: Next step */}
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-[10px] font-medium text-primary/80 truncate">
                      {paid ? "Resolved — all invoices paid" : `Next: ${group.nextStep}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
