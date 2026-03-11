import { useEffect } from "react";
import { Command } from "cmdk";
import { ClientGroup } from "@/data/ar-types";
import { Search } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientGroups: ClientGroup[];
  onSelectClient: (clientId: string) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

export function CommandPalette({ open, onOpenChange, clientGroups, onSelectClient }: CommandPaletteProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  // Build searchable items: each invoice is a separate entry
  const items = clientGroups.flatMap((group) =>
    group.stakeholders.flatMap((s) =>
      s.invoices.map((inv) => ({
        clientId: group.id,
        companyName: group.companyName,
        contactName: s.name,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        daysOverdue: inv.daysOverdue,
        searchValue: `${group.companyName} ${s.name} ${inv.invoiceNumber} ${inv.projectName}`,
      }))
    )
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg mx-4 bg-card rounded-xl border-2 border-border shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Search clients and invoices" shouldFilter={true}>
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Command.Input
              placeholder="Search clients, contacts, invoices..."
              className="w-full py-3.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-1.5">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found
            </Command.Empty>

            <Command.Group heading="Clients & Invoices">
              {items.map((item, i) => (
                <Command.Item
                  key={`${item.clientId}-${item.invoiceNumber}-${i}`}
                  value={item.searchValue}
                  onSelect={() => {
                    onSelectClient(item.clientId);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.companyName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.contactName} &middot; {item.invoiceNumber} &middot; {item.daysOverdue}d overdue
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-foreground tabular-nums shrink-0">
                    {formatCurrency(item.amount)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
