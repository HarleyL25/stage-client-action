import { useState, useEffect } from "react";
import { Client, STAGES, ActionGroup, ActionType } from "@/data/ar-types";
import { getActionsForStageAndStatus } from "@/data/ar-actions";
import { cn } from "@/lib/utils";
import { Mail, Phone, StickyNote, AlertTriangle, Users, Calendar, Search, Scale, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ActionPanelProps {
  client: Client | null;
}

const actionIcons: Record<ActionType, React.ElementType> = {
  email: Mail,
  call: Phone,
  note: StickyNote,
  escalate: AlertTriangle,
  ops: Users,
  meeting: Calendar,
  research: Search,
  decision: Scale,
  finance: DollarSign,
  resolve: CheckCircle2,
};

const actionColors: Record<ActionType, string> = {
  email: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
  call: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15",
  note: "bg-muted text-muted-foreground border-border hover:bg-accent",
  escalate: "bg-urgency-5/10 text-urgency-5 border-urgency-5/20 hover:bg-urgency-5/15",
  ops: "bg-urgency-3/10 text-urgency-3-foreground border-urgency-3/20 hover:bg-urgency-3/15",
  meeting: "bg-violet-500/10 text-violet-700 border-violet-500/20 hover:bg-violet-500/15",
  research: "bg-sky-500/10 text-sky-700 border-sky-500/20 hover:bg-sky-500/15",
  decision: "bg-urgency-6/10 text-urgency-6 border-urgency-6/20 hover:bg-urgency-6/15",
  finance: "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/15",
  resolve: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15",
};

const urgencyBar: Record<number, string> = {
  1: "bg-urgency-1", 2: "bg-urgency-2", 3: "bg-urgency-3",
  4: "bg-urgency-4", 5: "bg-urgency-5", 6: "bg-urgency-6", 7: "bg-urgency-7",
};

export function ActionPanel({ client }: ActionPanelProps) {
  const [groups, setGroups] = useState<ActionGroup[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<{ label: string; type: ActionType; description: string } | null>(null);
  const [noteText, setNoteText] = useState("");

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
        <div className="text-4xl mb-3">⚡</div>
        <p className="text-sm font-medium">Select a client</p>
        <p className="text-xs mt-1">View available actions for the selected client</p>
      </div>
    );
  }

  const stage = STAGES.find(s => s.id === client.stageId);
  const urgency = stage?.urgency || 1;

  const handleAction = (action: { label: string; type: ActionType; description: string }) => {
    setActiveAction(action);
    setNoteText("");
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!activeAction || !client) return;

    const actionVerbs: Record<ActionType, string> = {
      email: "Email drafted for",
      call: "Call logged for",
      note: "Note saved for",
      escalate: "Escalation initiated for",
      ops: "Ops notification sent for",
      meeting: "Meeting action logged for",
      research: "Research task logged for",
      decision: "Decision recorded for",
      finance: "Finance action logged for",
      resolve: "Resolution recorded for",
    };

    toast.success(`${actionVerbs[activeAction.type]} ${client.name}`, {
      description: activeAction.label + (noteText ? ` — "${noteText.slice(0, 60)}..."` : ""),
    });

    setDialogOpen(false);
    setActiveAction(null);
    setNoteText("");
  };

  const dialogTitles: Record<ActionType, string> = {
    email: "Compose Email",
    call: "Log Call",
    note: "Add Note",
    escalate: "Confirm Escalation",
    ops: "Notify Ops Team",
    meeting: "Schedule / Log Meeting",
    research: "Log Research Task",
    decision: "Record Decision",
    finance: "Finance Action",
    resolve: "Confirm Resolution",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className={cn("w-1 h-8 rounded-full shrink-0", urgencyBar[urgency])} />
          <div>
            <h2 className="text-base font-semibold text-foreground">{client.name}</h2>
            <p className="text-xs text-muted-foreground">{stage?.name} · Day {client.daysOverdue} overdue</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-1 overflow-y-auto ar-scrollbar p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Available Actions
        </h3>
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5 animate-slide-in" style={{ animationDelay: `${gi * 60}ms` }}>
            {group.condition && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2 px-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", urgencyBar[urgency])} />
                {group.condition}
              </p>
            )}
            <div className="flex flex-col gap-2">
              {group.actions.map((action) => {
                const Icon = actionIcons[action.type];
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3.5 py-3 text-left transition-all duration-150 border cursor-pointer",
                      actionColors[action.type],
                      action.indent && "ml-5"
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium block leading-tight">{action.label}</span>
                      <span className="text-xs opacity-70 leading-relaxed mt-0.5 block">{action.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeAction && (() => { const Icon = actionIcons[activeAction.type]; return <Icon className="w-4 h-4" />; })()}
              {activeAction ? dialogTitles[activeAction.type] : "Action"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-foreground">{activeAction?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activeAction?.description}</p>
            </div>
            <p className="text-xs text-muted-foreground">Client: <strong>{client.name}</strong></p>
            <Textarea
              placeholder="Add notes, details, or context..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>
              {activeAction ? `Confirm ${activeAction.type === "email" ? "& Send" : activeAction.type === "call" ? "& Log" : ""}` : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
