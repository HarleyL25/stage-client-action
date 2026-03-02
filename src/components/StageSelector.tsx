import { Stage, Client } from "@/data/ar-types";
import { cn } from "@/lib/utils";

interface StageSelectorProps {
  stages: Stage[];
  selectedStageId: string | null;
  clientCounts: Record<string, number>;
  onSelectStage: (stageId: string) => void;
}

const urgencyClasses: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: { bg: "bg-urgency-1/10", border: "border-urgency-1/40", text: "text-urgency-1-foreground", badge: "bg-urgency-1 text-urgency-1-foreground" },
  2: { bg: "bg-urgency-2/10", border: "border-urgency-2/40", text: "text-urgency-2-foreground", badge: "bg-urgency-2 text-urgency-2-foreground" },
  3: { bg: "bg-urgency-3/10", border: "border-urgency-3/40", text: "text-foreground", badge: "bg-urgency-3 text-urgency-3-foreground" },
  4: { bg: "bg-urgency-4/10", border: "border-urgency-4/40", text: "text-foreground", badge: "bg-urgency-4 text-urgency-4-foreground" },
  5: { bg: "bg-urgency-5/10", border: "border-urgency-5/40", text: "text-foreground", badge: "bg-urgency-5 text-urgency-5-foreground" },
  6: { bg: "bg-urgency-6/10", border: "border-urgency-6/40", text: "text-foreground", badge: "bg-urgency-6 text-urgency-6-foreground" },
  7: { bg: "bg-urgency-7/10", border: "border-urgency-7/40", text: "text-foreground", badge: "bg-urgency-7 text-urgency-7-foreground" },
};

const urgencyIndicators: Record<number, string> = {
  1: "bg-urgency-1",
  2: "bg-urgency-2",
  3: "bg-urgency-3",
  4: "bg-urgency-4",
  5: "bg-urgency-5",
  6: "bg-urgency-6",
  7: "bg-urgency-7",
};

export function StageSelector({ stages, selectedStageId, clientCounts, onSelectStage }: StageSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        Escalation Stages
      </h2>
      {stages.map((stage) => {
        const isSelected = selectedStageId === stage.id;
        const count = clientCounts[stage.id] || 0;
        const colors = urgencyClasses[stage.urgency];

        return (
          <button
            key={stage.id}
            onClick={() => onSelectStage(stage.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-150 border",
              isSelected
                ? `${colors.bg} ${colors.border} shadow-sm`
                : "border-transparent hover:bg-surface-hover"
            )}
          >
            <div className={cn("w-1 self-stretch rounded-full shrink-0", urgencyIndicators[stage.urgency])} />
            <div className="flex-1 min-w-0">
              <span className={cn(
                "text-sm font-medium leading-tight block",
                isSelected ? "text-foreground" : "text-foreground/80"
              )}>
                {stage.name}
              </span>
            </div>
            <span className={cn(
              "text-xs font-semibold rounded-full px-2 py-0.5 shrink-0",
              count > 0 ? colors.badge : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
