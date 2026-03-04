import { Stage } from "@/data/ar-types";
import { cn } from "@/lib/utils";

interface StageSelectorProps {
  stages: Stage[];
  selectedStageId: string | null;
  clientCounts: Record<string, number>;
  onSelectStage: (stageId: string) => void;
}

export function StageSelector({ stages, selectedStageId, clientCounts, onSelectStage }: StageSelectorProps) {
  return (
    <div className="flex flex-col gap-1 p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        Escalation Stages
      </h2>
      {stages.map((stage) => {
        const isSelected = selectedStageId === stage.id;
        const count = clientCounts[stage.id] || 0;

        return (
          <button
            key={stage.id}
            onClick={() => onSelectStage(stage.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-150 border",
              isSelected
                ? "bg-accent border-border shadow-sm"
                : "border-transparent hover:bg-muted"
            )}
          >
            <div className="flex-1 min-w-0">
              <span className={cn(
                "text-sm font-medium leading-tight block",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}>
                {stage.name}
              </span>
              <span className="text-[11px] text-muted-foreground/70 mt-0.5 block">
                {stage.dayRange}
              </span>
            </div>
            <span className={cn(
              "text-xs font-semibold rounded-full px-2 py-0.5 shrink-0",
              count > 0
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
