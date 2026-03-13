import { useMemo } from "react";
import { ArStageId, AR_STAGES, getStageForDays, ClientGroup } from "@/data/ar-types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StagePanelProps {
  clientGroups: ClientGroup[];
  selectedStage: ArStageId | null;
  onSelectStage: (stageId: ArStageId | null) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; activeBg: string; activeBorder: string }> = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-100",    text: "text-blue-700",    dot: "bg-blue-500",    activeBg: "bg-blue-100",    activeBorder: "border-blue-300" },
  yellow:  { bg: "bg-yellow-50",  border: "border-yellow-100",  text: "text-yellow-700",  dot: "bg-yellow-500",  activeBg: "bg-yellow-100",  activeBorder: "border-yellow-300" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-100",  text: "text-orange-700",  dot: "bg-orange-500",  activeBg: "bg-orange-100",  activeBorder: "border-orange-300" },
  red:     { bg: "bg-red-50",     border: "border-red-100",     text: "text-red-700",     dot: "bg-red-500",     activeBg: "bg-red-100",     activeBorder: "border-red-300" },
  darkred: { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-800",     dot: "bg-red-700",     activeBg: "bg-red-100",     activeBorder: "border-red-400" },
};

export function StagePanel({
  clientGroups,
  selectedStage,
  onSelectStage,
  collapsed,
  onToggleCollapse,
}: StagePanelProps) {
  const stageCounts = useMemo(() => {
    const counts: Record<ArStageId, { clients: number; invoices: number; amount: number }> = {} as any;
    for (const stage of AR_STAGES) {
      counts[stage.id] = { clients: 0, invoices: 0, amount: 0 };
    }
    for (const group of clientGroups) {
      const stage = getStageForDays(group.mostOverdueDays);
      counts[stage.id].clients += 1;
      counts[stage.id].invoices += group.invoiceCount;
      counts[stage.id].amount += group.totalOutstanding;
    }
    return counts;
  }, [clientGroups]);


  if (collapsed) {
    return (
      <div className="flex flex-col h-full w-12 border-r border-border bg-muted/30 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-3 hover:bg-muted/60 transition-colors border-b border-border"
          title="Expand stages"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground mx-auto" />
        </button>
        <div className="flex-1 overflow-y-auto py-1">
          {AR_STAGES.map((stage) => {
            const count = stageCounts[stage.id].clients;
            const colors = STAGE_COLORS[stage.color];
            const isActive = selectedStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(isActive ? null : stage.id)}
                className={cn(
                  "w-full flex flex-col items-center gap-0.5 py-2 transition-colors",
                  isActive ? colors.activeBg : "hover:bg-muted/60"
                )}
                title={`${stage.label} (${count})`}
              >
                <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                <span className="text-[9px] font-bold tabular-nums text-muted-foreground">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-[220px] border-r border-border bg-muted/30 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Stages
        </span>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="Collapse stages"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Stage list */}
      <div className="flex-1 overflow-y-auto ar-scrollbar py-1">
        {/* All clients button */}
        <button
          onClick={() => onSelectStage(null)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
            selectedStage === null
              ? "bg-foreground/5 border-r-2 border-foreground/30"
              : "hover:bg-muted/60"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 shrink-0" />
          <span className="flex-1 text-[11px] font-semibold text-foreground">All</span>
          <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{clientGroups.length}</span>
        </button>

        {AR_STAGES.map((stage) => {
          const data = stageCounts[stage.id];
          const colors = STAGE_COLORS[stage.color];
          const isActive = selectedStage === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(isActive ? null : stage.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                isActive
                  ? `${colors.activeBg} border-r-2 ${colors.activeBorder}`
                  : "hover:bg-muted/60"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={cn(
                    "text-[11px] font-semibold truncate",
                    isActive ? colors.text : "text-foreground"
                  )}>
                    {stage.label}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold tabular-nums shrink-0",
                    data.clients > 0 ? (isActive ? colors.text : "text-foreground") : "text-muted-foreground/50"
                  )}>
                    {data.clients}
                  </span>
                </div>
                {data.clients > 0 && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-muted-foreground tabular-nums">
                      {data.invoices} inv
                    </span>
                    <span className="text-[9px] text-muted-foreground tabular-nums">
                      {formatCurrency(data.amount)}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
