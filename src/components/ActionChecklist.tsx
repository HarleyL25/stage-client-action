import { useState, useEffect } from "react";
import { Client, STAGES } from "@/data/ar-types";
import { getActionsForStageAndStatus } from "@/data/ar-actions";
import type { ActionGroup } from "@/data/ar-types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ActionChecklistProps {
  client: Client | null;
}

const urgencyBar: Record<number, string> = {
  1: "bg-urgency-1",
  2: "bg-urgency-2",
  3: "bg-urgency-3",
  4: "bg-urgency-4",
  5: "bg-urgency-5",
  6: "bg-urgency-6",
  7: "bg-urgency-7",
};

export function ActionChecklist({ client }: ActionChecklistProps) {
  const [groups, setGroups] = useState<ActionGroup[]>([]);

  useEffect(() => {
    if (client) {
      setGroups(getActionsForStageAndStatus(client.stageId, client.subStatus));
    } else {
      setGroups([]);
    }
  }, [client?.id, client?.stageId, client?.subStatus]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-sm font-medium">Select a client</p>
        <p className="text-xs mt-1">View and complete actions for the selected client</p>
      </div>
    );
  }

  const stage = STAGES.find(s => s.id === client.stageId);
  const urgency = stage?.urgency || 1;

  const toggleAction = (groupIdx: number, actionId: string) => {
    setGroups(prev => prev.map((g, gi) => {
      if (gi !== groupIdx) return g;
      return {
        ...g,
        items: g.items.map(item =>
          item.id === actionId ? { ...item, checked: !item.checked } : item
        ),
      };
    }));
  };

  const totalActions = groups.reduce((acc, g) => acc + g.items.length, 0);
  const completedActions = groups.reduce((acc, g) => acc + g.items.filter(i => i.checked).length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn("w-1 h-8 rounded-full shrink-0", urgencyBar[urgency])} />
          <div>
            <h2 className="text-base font-semibold text-foreground">{client.name}</h2>
            <p className="text-xs text-muted-foreground">{stage?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-300", urgencyBar[urgency])}
              style={{ width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {completedActions}/{totalActions}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-1 overflow-y-auto ar-scrollbar p-4">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5 animate-slide-in" style={{ animationDelay: `${gi * 60}ms` }}>
            {group.condition && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", urgencyBar[urgency])} />
                {group.condition}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {group.items.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors border",
                    item.checked
                      ? "bg-muted/50 border-border"
                      : "bg-surface border-transparent hover:bg-surface-hover",
                    item.indent && "ml-5"
                  )}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleAction(gi, item.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <span className={cn(
                    "text-sm leading-relaxed transition-colors",
                    item.checked ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
