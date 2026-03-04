import { useMemo } from "react";
import { MOCK_CLIENTS } from "@/data/ar-mock-data";
import { STAGES, StageId } from "@/data/ar-types";
import { cn } from "@/lib/utils";
import { DollarSign, AlertTriangle, TrendingUp, Clock, ChevronRight } from "lucide-react";

interface OverviewDashboardProps {
  onDrillDown: (stageId: StageId, clientId?: string) => void;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function KpiCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
          {icon}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function OverviewDashboard({ onDrillDown }: OverviewDashboardProps) {
  const stats = useMemo(() => {
    const total = MOCK_CLIENTS.reduce((s, c) => s + c.invoiceAmount, 0);

    const atRisk = MOCK_CLIENTS.filter((c) => c.daysOverdue >= 30);
    const atRiskTotal = atRisk.reduce((s, c) => s + c.invoiceAmount, 0);

    const escalatedStages = new Set(["escalated-sales-ops", "awaiting-bh-decision", "collections-writeoff"]);
    const escalated = MOCK_CLIENTS.filter((c) => escalatedStages.has(c.stageId));
    const escalatedTotal = escalated.reduce((s, c) => s + c.invoiceAmount, 0);

    const avgDays = Math.round(
      MOCK_CLIENTS.reduce((s, c) => s + c.daysOverdue, 0) / MOCK_CLIENTS.length
    );

    const byStage = STAGES.map((stage) => {
      const clients = MOCK_CLIENTS.filter((c) => c.stageId === stage.id);
      return {
        stage,
        count: clients.length,
        total: clients.reduce((s, c) => s + c.invoiceAmount, 0),
        avgDays: clients.length
          ? Math.round(clients.reduce((s, c) => s + c.daysOverdue, 0) / clients.length)
          : 0,
      };
    });

    const topPriority = [...MOCK_CLIENTS]
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 8);

    return { total, atRisk, atRiskTotal, escalated, escalatedTotal, avgDays, byStage, topPriority };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto ar-scrollbar">
      <div className="p-6 max-w-6xl mx-auto">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Total AR Outstanding"
            value={fmt(stats.total)}
            sub={`${MOCK_CLIENTS.length} active accounts`}
            icon={<DollarSign className="w-4 h-4" />}
          />
          <KpiCard
            label="30+ Days Overdue"
            value={fmt(stats.atRiskTotal)}
            sub={`${stats.atRisk.length} accounts at risk`}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
          <KpiCard
            label="Escalated / Collections"
            value={fmt(stats.escalatedTotal)}
            sub={`${stats.escalated.length} accounts — stages 5–7`}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <KpiCard
            label="Avg Days Overdue"
            value={`${stats.avgDays} days`}
            sub="Across all accounts"
            icon={<Clock className="w-4 h-4" />}
          />
        </div>

        {/* Stage pipeline + Top priority */}
        <div className="grid grid-cols-[1fr_360px] gap-5">

          {/* Stage pipeline */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Stage Pipeline</h3>
            <p className="text-xs text-muted-foreground mb-4">Click any stage to open in Triage view</p>
            <div className="flex flex-col gap-1">
              {stats.byStage.map(({ stage, count, total, avgDays }) => (
                <button
                  key={stage.id}
                  onClick={() => onDrillDown(stage.id)}
                  disabled={count === 0}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-3 border border-transparent text-left group transition-all duration-150",
                    count > 0
                      ? "hover:bg-accent hover:border-border cursor-pointer"
                      : "opacity-40 cursor-default"
                  )}
                >
                  <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {stage.name}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground mr-2">
                      avg {avgDays}d
                    </span>
                  )}
                  <span className="text-sm font-mono font-semibold text-foreground w-24 text-right mr-3">
                    {count > 0 ? fmt(total) : "—"}
                  </span>
                  <span className={cn(
                    "text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shrink-0",
                    count > 0 ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                </button>
              ))}
            </div>

            {/* Totals row */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 mt-2 border-t border-border">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex-1">
                Total
              </span>
              <span className="text-sm font-mono font-semibold text-foreground w-24 text-right mr-3">
                {fmt(stats.total)}
              </span>
              <span className="text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center bg-foreground text-background shrink-0">
                {MOCK_CLIENTS.length}
              </span>
              <div className="w-5 ml-1" />
            </div>
          </div>

          {/* Top priority accounts */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Top Priority Accounts</h3>
            <p className="text-xs text-muted-foreground mb-4">Sorted by days overdue</p>
            <div className="flex flex-col gap-0.5">
              {stats.topPriority.map((client) => {
                const stage = STAGES.find((s) => s.id === client.stageId)!;
                return (
                  <button
                    key={client.id}
                    onClick={() => onDrillDown(client.stageId, client.id)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 border border-transparent hover:bg-accent hover:border-border transition-all text-left group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">
                        {client.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {client.contactName} · {stage.name.split("—")[0].trim()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-semibold text-foreground">
                        {fmt(client.invoiceAmount)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Day {client.daysOverdue}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
