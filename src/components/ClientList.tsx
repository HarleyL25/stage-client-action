import { Client } from "@/data/ar-types";
import { cn } from "@/lib/utils";

interface ClientListProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
}

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
    <div className="flex flex-col gap-1 p-3">
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
                ? "bg-accent border-border shadow-sm"
                : "border-transparent hover:bg-muted"
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
              <span className="text-xs font-medium text-muted-foreground">
                Day {client.daysOverdue} overdue
              </span>
              <span className="text-[11px] font-medium rounded-full bg-muted px-2 py-0.5 text-muted-foreground border border-border shrink-0">
                {client.subStatus}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last: {client.lastAction} — {client.lastActionDaysAgo === 0 ? "today" : `${client.lastActionDaysAgo}d ago`}
            </p>
          </button>
        );
      })}
    </div>
  );
}
