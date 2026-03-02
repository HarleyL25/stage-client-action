import { Link } from "react-router-dom";
import { MOCK_CLIENTS } from "@/data/ar-mock-data";
import { STAGES } from "@/data/ar-types";
import { cn } from "@/lib/utils";

const urgencyBar: Record<number, string> = {
  1: "bg-urgency-1", 2: "bg-urgency-2", 3: "bg-urgency-3",
  4: "bg-urgency-4", 5: "bg-urgency-5", 6: "bg-urgency-6", 7: "bg-urgency-7",
};

const Index = () => {
  const totalOutstanding = MOCK_CLIENTS.reduce((acc, c) => acc + c.invoiceAmount, 0);
  const totalClients = MOCK_CLIENTS.length;
  const avgDaysOverdue = Math.round(MOCK_CLIENTS.reduce((acc, c) => acc + c.daysOverdue, 0) / totalClients);

  const stageCounts = STAGES.map(s => ({
    ...s,
    count: MOCK_CLIENTS.filter(c => c.stageId === s.id).length,
    amount: MOCK_CLIENTS.filter(c => c.stageId === s.id).reduce((acc, c) => acc + c.invoiceAmount, 0),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <h1 className="text-base font-bold text-foreground tracking-tight">AR Portal</h1>
          <nav className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground bg-surface-active px-3 py-1.5 rounded-md">
              Overview
            </span>
            <Link
              to="/triage"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-surface-hover"
            >
              All Clients
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Accounts Receivable Overview</h2>
          <p className="text-sm text-muted-foreground">Summary of outstanding accounts and escalation stages</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Outstanding", value: `$${(totalOutstanding / 1000).toFixed(0)}k` },
            { label: "Active Accounts", value: totalClients.toString() },
            { label: "Avg Days Overdue", value: avgDaysOverdue.toString() },
          ].map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-foreground font-mono">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Stage breakdown */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Escalation Pipeline</h3>
            <Link
              to="/triage"
              className="text-xs font-medium text-primary hover:underline"
            >
              Open Triage View →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stageCounts.map((stage) => (
              <Link
                key={stage.id}
                to="/triage"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-hover transition-colors"
              >
                <div className={cn("w-1.5 h-8 rounded-full shrink-0", urgencyBar[stage.urgency])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{stage.name}</p>
                </div>
                <span className="text-sm font-mono text-muted-foreground w-20 text-right">
                  ${(stage.amount / 1000).toFixed(0)}k
                </span>
                <span className={cn(
                  "text-xs font-semibold rounded-full px-2.5 py-0.5",
                  stage.count > 0 ? `${urgencyBar[stage.urgency].replace("bg-", "bg-")}/15 text-foreground` : "bg-muted text-muted-foreground"
                )}>
                  {stage.count} {stage.count === 1 ? "client" : "clients"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
