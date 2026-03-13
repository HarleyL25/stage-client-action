import { useMemo } from "react";
import { ClientGroup, ClientSortKey } from "@/data/ar-types";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, Clock, Filter, X, CheckCircle2 } from "lucide-react";
import { FilterDropdown } from "./ui/filter-dropdown";

interface ClientListProps {
  clientGroups: ClientGroup[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortKey: ClientSortKey;
  onSortChange: (key: ClientSortKey) => void;
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

/** Was this client contacted in the last 3 days? */
function wasContactedRecently(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff <= 3;
}

const SORT_OPTIONS: { key: ClientSortKey; label: string }[] = [
  { key: "needsAttention", label: "Needs attention" },
  { key: "mostOverdue", label: "Most overdue" },
  { key: "totalOutstanding", label: "Highest value" },
  { key: "lastAction", label: "Least recent" },
  { key: "companyName", label: "A-Z" },
];

export function ClientList({
  clientGroups,
  selectedClientId,
  onSelectClient,
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
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

    result.sort((a, b) => {
      switch (sortKey) {
        case "needsAttention": {
          // Uncontacted first, then by most overdue
          const aRecent = wasContactedRecently(a.lastFollowUpDate) ? 1 : 0;
          const bRecent = wasContactedRecently(b.lastFollowUpDate) ? 1 : 0;
          if (aRecent !== bRecent) return aRecent - bRecent;
          return b.mostOverdueDays - a.mostOverdueDays;
        }
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
  }, [clientGroups, searchQuery, sortKey]);

  const cycleSortKey = () => {
    const keys = SORT_OPTIONS.map((o) => o.key);
    const idx = keys.indexOf(sortKey);
    onSortChange(keys[(idx + 1) % keys.length]);
  };

  const totalAR = clientGroups.reduce((s, g) => s + g.totalOutstanding, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search + Sort + Filters */}
      <div className="px-2 pt-2 pb-1.5 border-b border-border shrink-0 space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search clients, invoices..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-7 pr-2 py-1.5 text-[12px] bg-muted/50 rounded-md border border-border focus:border-primary/50 focus:bg-card outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Filters + Sort row */}
        <div className="flex items-center gap-1">
          <Filter className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0" />
          <FilterDropdown
            value={serviceFilter}
            onChange={onServiceFilterChange}
            placeholder="Service"
            maxWidth="80px"
            options={[
              { value: "all", label: "All services" },
              ...allServices.map(s => ({ value: s, label: s })),
            ]}
          />
          <FilterDropdown
            value={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Status"
            maxWidth="80px"
            options={[
              { value: "all", label: "All statuses" },
              ...allPaymentStatuses.map(s => ({ value: s, label: s })),
            ]}
          />
          {hasServiceOrStatusFilter && (
            <button
              onClick={() => { onServiceFilterChange("all"); onStatusFilterChange("all"); }}
              className="h-6 px-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center rounded-md border border-border bg-background hover:bg-muted"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
          <span className="text-[9px] font-semibold text-muted-foreground/70 tabular-nums shrink-0 ml-auto">
            {filtered.length}
          </span>
          <button
            onClick={cycleSortKey}
            className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowUpDown className="w-2.5 h-2.5" />
            {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
          </button>
        </div>
      </div>

      {/* Client cards */}
      <div className="flex-1 overflow-y-auto ar-scrollbar px-1.5 py-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <Search className="w-4 h-4 mb-1.5 opacity-40" />
            <p className="text-[12px] font-medium">No clients found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
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
                      "relative w-full text-left rounded-md px-2.5 py-2 transition-all duration-150 border",
                      isSelected
                        ? "bg-primary/5 border-primary/30 shadow-sm"
                        : "border-border/50 bg-card hover:bg-muted/60 hover:border-border"
                    )}
                  >
                  {/* Row 1: Company name + Total */}
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[12px] font-semibold text-foreground truncate leading-tight">
                      {group.companyName}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-foreground shrink-0 tabular-nums">
                      {formatCurrency(group.totalOutstanding)}
                    </span>
                  </div>

                  {/* Row 2: Contact + Overdue badge + Last activity */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground truncate">
                      {primaryStakeholder?.name}
                      {group.stakeholders.length > 1 && (
                        <span className="text-primary/70 font-medium">
                          {" "}+{group.stakeholders.length - 1}
                        </span>
                      )}
                    </span>
                    <span className={cn("text-[9px] font-semibold rounded px-1 py-px shrink-0", severity.className)}>
                      {paid ? "Paid" : `${group.mostOverdueDays}d`}
                    </span>
                    <span className={cn(
                      "flex items-center gap-0.5 text-[9px] ml-auto shrink-0",
                      wasContactedRecently(group.lastFollowUpDate)
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}>
                      {wasContactedRecently(group.lastFollowUpDate)
                        ? <CheckCircle2 className="w-2.5 h-2.5" />
                        : <Clock className="w-2 h-2" />
                      }
                      {relativeDateShort(group.lastFollowUpDate)}
                    </span>
                  </div>

                  {/* Row 3: Next step */}
                  {!paid && (
                    <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">
                      {group.nextStep}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
