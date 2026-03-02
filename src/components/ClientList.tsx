import { Client, STAGES, SubStatus } from "@/data/ar-types";
import { cn } from "@/lib/utils";

interface ClientListProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
}

const subStatusColors: Record<SubStatus, string> = {
  "Unresponsive": "bg-urgency-2/15 text-urgency-2-foreground border border-urgency-2/30",
  "Has Ops Query": "bg-urgency-3/15 text-urgency-3-foreground border border-urgency-3/30",
  "Has AR Query": "bg-primary/10 text-primary border border-primary/20",
  "Billing Error": "bg-destructive/10 text-destructive border border-destructive/20",
  "Awaiting Ops": "bg-urgency-4/15 text-urgency-4-foreground border border-urgency-4/30",
  "Escalated to Trevor": "bg-urgency-5/15 text-urgency-5-foreground border border-urgency-5/30",
  "Escalated to Ofir": "bg-urgency-6/15 text-urgency-6-foreground border border-urgency-6/30",
  "Paid": "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

export function ClientList({ clients, selectedClientId, onSelectClient }: ClientListProps) {
  const sorted = [...clients].sort((a, b) => b.daysOverdue - a.daysOverdue);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm font-medium">Select a stage</p>
        <p className="text-xs mt-1">Choose an escalation stage to view clients</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Clients
        </h2>
        <span className="text-xs text-muted-foreground">{sorted.length} total</span>
      </div>
      {sorted.map((client, i) => {
        const isSelected = selectedClientId === client.id;
        return (
          <button
            key={client.id}
            onClick={() => onSelectClient(client.id)}
            className={cn(
              "text-left rounded-lg px-3.5 py-3 transition-all duration-150 border animate-fade-in",
              isSelected
                ? "bg-surface-active border-primary/20 shadow-sm"
                : "border-transparent hover:bg-surface-hover"
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-foreground truncate">{client.name}</span>
              <span className="text-sm font-mono font-semibold text-foreground shrink-0">
                {formatCurrency(client.invoiceAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-destructive">
                Day {client.daysOverdue} overdue
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Last action: {client.lastAction} — {client.lastActionDaysAgo === 0 ? "today" : `${client.lastActionDaysAgo} day${client.lastActionDaysAgo > 1 ? "s" : ""} ago`}
            </p>
            <span className={cn(
              "inline-block text-[10px] font-semibold uppercase tracking-wide rounded-md px-2 py-0.5",
              subStatusColors[client.subStatus]
            )}>
              {client.subStatus}
            </span>
          </button>
        );
      })}
    </div>
  );
}
