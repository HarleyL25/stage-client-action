import { useState, useEffect } from "react";
import { Client, STAGES, ActionGroup, ActionType } from "@/data/ar-types";
import { getActionsForStageAndStatus } from "@/data/ar-actions";
import { cn } from "@/lib/utils";
import { Mail, Phone, StickyNote, AlertTriangle, Users, Calendar, Search, Scale, DollarSign, CheckCircle2, Video, ExternalLink } from "lucide-react";
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

function executeAction(type: ActionType, client: Client, label: string) {
  switch (type) {
    case "email": {
      const subject = encodeURIComponent(`Follow-up: Overdue Invoice — ${client.name}`);
      const body = encodeURIComponent(`Hi ${client.contactName},\n\nThis is a follow-up regarding the outstanding invoice of $${client.invoiceAmount.toLocaleString()} which is now ${client.daysOverdue} day(s) overdue.\n\nPlease let us know if you have any questions.\n\nBest regards`);
      window.open(`mailto:${client.contactEmail}?subject=${subject}&body=${body}`, "_blank");
      return `Email draft opened for ${client.contactName}`;
    }
    case "call": {
      window.open(`tel:${client.contactPhone}`, "_self");
      return `Calling ${client.contactName} at ${client.contactPhone}`;
    }
    case "meeting": {
      // Open Teams call
      const teamsUrl = `https://teams.microsoft.com/l/call/0/0?users=${encodeURIComponent(client.contactEmail)}`;
      window.open(teamsUrl, "_blank");
      return `Teams call initiated with ${client.contactName}`;
    }
    case "escalate": {
      const escalateTo = label.toLowerCase().includes("ofir") ? "ofir@company.com" : label.toLowerCase().includes("trevor") ? "trevor@company.com" : "manager@company.com";
      const subject = encodeURIComponent(`Escalation: ${client.name} — Day ${client.daysOverdue} Overdue`);
      const body = encodeURIComponent(`Escalation regarding ${client.name}.\n\nInvoice amount: $${client.invoiceAmount.toLocaleString()}\nDays overdue: ${client.daysOverdue}\nLast action: ${client.lastAction}\nSub-status: ${client.subStatus}\n\nPlease advise on next steps.`);
      window.open(`mailto:${escalateTo}?subject=${subject}&body=${body}`, "_blank");
      return `Escalation email opened`;
    }
    case "ops": {
      const subject = encodeURIComponent(`Ops Request: ${client.name} — ${label}`);
      const body = encodeURIComponent(`Hi Ops team,\n\nRequesting support for ${client.name}.\n\nInvoice: $${client.invoiceAmount.toLocaleString()}\nDays overdue: ${client.daysOverdue}\nClient contact: ${client.contactName} (${client.contactEmail})\n\nDetails: ${label}\n\nPlease respond at your earliest convenience.`);
      window.open(`mailto:ops-team@company.com?subject=${subject}&body=${body}`, "_blank");
      return `Ops team email opened`;
    }
    case "finance": {
      const subject = encodeURIComponent(`Finance Action: ${client.name} — ${label}`);
      const body = encodeURIComponent(`Finance team,\n\nAction needed for ${client.name}.\n\nInvoice: $${client.invoiceAmount.toLocaleString()}\nDays overdue: ${client.daysOverdue}\n\nAction: ${label}`);
      window.open(`mailto:finance@company.com?subject=${subject}&body=${body}`, "_blank");
      return `Finance email opened`;
    }
    default:
      return null; // handled by dialog
  }
}

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

  const handleAction = (action: { label: string; type: ActionType; description: string }) => {
    // Directly executable actions
    const directTypes: ActionType[] = ["email", "call", "meeting", "escalate", "ops", "finance"];
    if (directTypes.includes(action.type)) {
      const result = executeAction(action.type, client, action.label);
      if (result) {
        toast.success(result, { description: action.label });
        // Still open the note dialog so they can log what happened
        setActiveAction(action);
        setNoteText("");
        setDialogOpen(true);
      }
    } else {
      // note, research, decision, resolve — open dialog directly
      setActiveAction(action);
      setNoteText("");
      setDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    if (!activeAction || !client) return;
    toast.success(`Action logged for ${client.name}`, {
      description: activeAction.label + (noteText ? ` — "${noteText.slice(0, 60)}${noteText.length > 60 ? "..." : ""}"` : ""),
    });
    setDialogOpen(false);
    setActiveAction(null);
    setNoteText("");
  };

  const getActionHint = (type: ActionType): string | null => {
    switch (type) {
      case "email": return "Opens email client";
      case "call": return "Opens phone dialer";
      case "meeting": return "Opens Teams call";
      case "escalate": return "Opens escalation email";
      case "ops": return "Opens email to Ops";
      case "finance": return "Opens email to Finance";
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="mb-2">
          <h2 className="text-base font-semibold text-foreground">{client.name}</h2>
          <p className="text-xs text-muted-foreground">{stage?.name} · Day {client.daysOverdue} overdue</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{client.contactName}</span>
          <span className="font-mono">{client.contactEmail}</span>
          <span className="font-mono">{client.contactPhone}</span>
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                {group.condition}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              {group.actions.map((action) => {
                const Icon = actionIcons[action.type];
                const hint = getActionHint(action.type);
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3.5 py-3 text-left transition-all duration-150 border border-border hover:bg-accent cursor-pointer",
                      action.indent && "ml-5"
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium block leading-tight text-foreground">{action.label}</span>
                      <span className="text-xs text-muted-foreground leading-relaxed mt-0.5 block">{action.description}</span>
                    </div>
                    {hint && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 mt-0.5">
                        <ExternalLink className="w-3 h-3" />
                        {hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Log Note Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeAction && (() => { const Icon = actionIcons[activeAction.type]; return <Icon className="w-4 h-4" />; })()}
              Log: {activeAction?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-muted rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-foreground">{activeAction?.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activeAction?.description}</p>
            </div>
            <p className="text-xs text-muted-foreground">Client: <strong>{client.name}</strong> · Contact: {client.contactName}</p>
            <Textarea
              placeholder="Add notes, outcome, or context..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Save & Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
