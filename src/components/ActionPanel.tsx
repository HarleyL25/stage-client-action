import { useState, useEffect } from "react";
import { Client, STAGES, ActionGroup, ActionType, HistoryEntry, WorkflowAction } from "@/data/ar-types";
import { getActionsForStageAndStatus } from "@/data/ar-actions";
import { cn } from "@/lib/utils";
import { Mail, Phone, StickyNote, AlertTriangle, Users, Calendar, Search, Scale, DollarSign, CheckCircle2, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
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

const outcomeOptions: Partial<Record<ActionType, string[]>> = {
  call: [
    "No answer",
    "Went to voicemail — left message",
    "Spoke — will pay within 2 days",
    "Spoke — will pay within 5 days",
    "Spoke — disputed invoice",
    "Spoke — referred to someone else",
  ],
  finance: ["Raised / sent", "No response yet"],
  meeting: ["Meeting scheduled", "Meeting completed", "No response"],
};

function getClientEmailDraft(label: string, client: Client): { subject: string; body: string } {
  const lc = label.toLowerCase();
  if (lc.includes("2nd") || lc.includes("second")) {
    return {
      subject: `2nd Reminder: Overdue Invoice — ${client.name}`,
      body: `Hi ${client.contactName},\n\nThis is our second reminder that invoice #INV for $${client.invoiceAmount.toLocaleString()} is now ${client.daysOverdue} day(s) overdue.\n\nWe kindly ask that you arrange payment at your earliest convenience, or contact us if you have any questions or concerns.\n\nBest regards,\nAR Team`,
    };
  }
  if (lc.includes("3rd") || lc.includes("third") || lc.includes("final")) {
    return {
      subject: `Final Reminder: Overdue Invoice — ${client.name}`,
      body: `Hi ${client.contactName},\n\nThis is our final reminder regarding the outstanding invoice of $${client.invoiceAmount.toLocaleString()}, now ${client.daysOverdue} day(s) overdue.\n\nIf we do not receive payment or a response within the next 48 hours, we will be required to escalate this matter.\n\nPlease contact us urgently to resolve this.\n\nBest regards,\nAR Team`,
    };
  }
  if (lc.includes("address") || lc.includes("query")) {
    return {
      subject: `Re: Invoice Query — ${client.name}`,
      body: `Hi ${client.contactName},\n\nThank you for raising your query. I've looked into this and can confirm the following:\n\n[Insert resolution here]\n\nOnce this is resolved, we would appreciate prompt payment of the outstanding balance of $${client.invoiceAmount.toLocaleString()}.\n\nPlease let us know if you have any further questions.\n\nBest regards,\nAR Team`,
    };
  }
  return {
    subject: `Follow-up: Overdue Invoice — ${client.name}`,
    body: `Hi ${client.contactName},\n\nI hope this message finds you well. I'm following up regarding invoice #INV for $${client.invoiceAmount.toLocaleString()} which is now ${client.daysOverdue} day(s) overdue.\n\nCould you please let us know the expected payment date, or reach out if there's anything we can help with?\n\nBest regards,\nAR Team`,
  };
}

function getInternalEmailDraft(action: WorkflowAction, client: Client): { subject: string; body: string } {
  const lc = action.label.toLowerCase();
  const amount = `$${client.invoiceAmount.toLocaleString()}`;
  const clientDetails = `Client: ${client.name}\nAmount Outstanding: ${amount}\nDays Overdue: ${client.daysOverdue}\nContact: ${client.contactName} | ${client.contactEmail} | ${client.contactPhone}`;

  if (lc.includes("ofir")) {
    return {
      subject: `URGENT Escalation: ${client.name} — ${client.daysOverdue} Days Overdue`,
      body: `Hi Ofir,\n\nI am escalating ${client.name} to you as this account remains unresolved after all previous escalation steps, including Trevor's intervention.\n\n${clientDetails}\n\nYour direction is required to determine the next course of action.\n\nBest regards,\nAR Team`,
    };
  }
  if (lc.includes("trevor")) {
    return {
      subject: `Escalation: ${client.name} — ${client.daysOverdue} Days Overdue`,
      body: `Hi Trevor,\n\nI am escalating ${client.name} as Ops has been unresponsive for over a week and this matter requires your intervention.\n\n${clientDetails}\n\nWe have exhausted standard follow-up attempts. Please advise on next steps or intervene directly with the Ops team.\n\nBest regards,\nAR Team`,
    };
  }
  if (lc.includes("david")) {
    return {
      subject: `Approval Request: Collections — ${client.name}`,
      body: `Hi David,\n\nI am writing to seek your approval to proceed with collections for ${client.name}.\n\n${clientDetails}\n\nAll escalation steps have been completed without resolution. Your approval is required before we can initiate the collections procedure.\n\nBest regards,\nAR Team`,
    };
  }
  const opsContext = client.subStatus === "Has Ops Query"
    ? "The client has raised a query that requires Ops resolution before payment can be processed. Could you please provide an update on the current status and an expected resolution date?"
    : "We require your intervention on this account. Could you please follow up and provide a resolution date?";
  return {
    subject: `Follow-up: ${client.name} — Action Required`,
    body: `Hi Ops Team,\n\nI am${lc.includes("follow") ? " following up on" : " reaching out regarding"} the outstanding matter for ${client.name}.\n\n${clientDetails}\nCurrent Status: ${client.subStatus}\n\n${opsContext}\n\nBest regards,\nAR Team`,
  };
}

const historyIcons: Record<HistoryEntry["type"], React.ElementType> = {
  email: Mail,
  call: Phone,
  note: StickyNote,
};

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = historyIcons[entry.type];
  const hasBody = !!entry.body;

  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="pb-3 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-foreground leading-tight">{entry.summary}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{entry.date}</span>
        </div>
        {hasBody && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expanded ? "Hide" : "View email"}
          </button>
        )}
        {expanded && entry.body && (
          <pre className="mt-2 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed">
            {entry.body}
          </pre>
        )}
      </div>
    </div>
  );
}

export function ActionPanel({ client }: ActionPanelProps) {
  const [groups, setGroups] = useState<ActionGroup[]>([]);

  // Inline email compose
  const [inlineCompose, setInlineCompose] = useState<{ action: WorkflowAction } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Log dialog (non-email actions)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<WorkflowAction | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string>("");
  const [noteText, setNoteText] = useState("");

  const [localHistory, setLocalHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (client) {
      setGroups(getActionsForStageAndStatus(client.stageId, client.subStatus));
      setLocalHistory([]);
      setInlineCompose(null);
      setEmailSubject("");
      setEmailBody("");
    } else {
      setGroups([]);
      setInlineCompose(null);
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
  const isEmailAction = (action: WorkflowAction) =>
    action.type === "email" || !!action.externalRecipient;

  const handleAction = (action: WorkflowAction) => {
    if (isEmailAction(action)) {
      const draft = action.externalRecipient
        ? getInternalEmailDraft(action, client)
        : getClientEmailDraft(action.label, client);
      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
      setInlineCompose({ action });
    } else {
      setActiveAction(action);
      setSelectedOutcome("");
      setNoteText("");
      setDialogOpen(true);
    }
  };

  const handleSendEmail = () => {
    if (!inlineCompose || !client) return;
    const toName = inlineCompose.action.externalRecipient?.name ?? client.contactName;
    toast.success(`Email sent to ${toName}`, { description: emailSubject });
    const today = new Date().toISOString().slice(0, 10);
    setLocalHistory(prev => [{ date: today, type: "email", summary: `Email to ${toName}: ${emailSubject}`, body: emailBody }, ...prev]);
    setInlineCompose(null);
    setEmailSubject("");
    setEmailBody("");
  };

  const handleConfirm = () => {
    if (!activeAction || !client) return;
    const today = new Date().toISOString().slice(0, 10);
    const logDetail = selectedOutcome || noteText;
    toast.success(`Action logged for ${client.name}`, {
      description: activeAction.label + (logDetail ? ` — "${logDetail.slice(0, 60)}${logDetail.length > 60 ? "..." : ""}"` : ""),
    });
    const entryType: HistoryEntry["type"] = activeAction.type === "call" ? "call" : "note";
    const summary = logDetail ? `${activeAction.label} — ${logDetail}` : activeAction.label;
    setLocalHistory(prev => [{ date: today, type: entryType, summary }, ...prev]);
    setDialogOpen(false);
    setActiveAction(null);
    setSelectedOutcome("");
    setNoteText("");
  };

  const radioOptions = activeAction?.decisionOptions
    ?? (activeAction ? (outcomeOptions[activeAction.type] ?? null) : null);

  const allHistory = [...localHistory, ...[...(client.history || [])].reverse()];

  const composeRecipient = inlineCompose?.action.externalRecipient
    ? { name: inlineCompose.action.externalRecipient.name, email: inlineCompose.action.externalRecipient.email, internal: true }
    : { name: client.contactName, email: client.contactEmail, internal: false };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="mb-2">
          <h2 className="text-base font-semibold text-foreground">{client.name}</h2>
          <p className="text-xs text-muted-foreground">{stage?.name} · Day {client.daysOverdue} overdue</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{client.contactName}</span>
          <span className="font-mono">{client.contactPhone}</span>
          <button
            onClick={() => toast.success(`Calling ${client.contactName}`, { description: client.contactPhone })}
            className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Phone className="w-3 h-3" />
            Call
          </button>
        </div>
      </div>

      {/* Inline email compose */}
      {inlineCompose ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Compose top bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40 shrink-0">
            <button
              onClick={() => { setInlineCompose(null); setEmailSubject(""); setEmailBody(""); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Actions
            </button>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm font-medium text-foreground flex-1 truncate">
              {inlineCompose.action.label}
            </span>
            {composeRecipient.internal && (
              <span className="text-[10px] font-semibold rounded-full border border-border bg-muted px-2 py-0.5 text-muted-foreground uppercase tracking-wide shrink-0">
                Internal
              </span>
            )}
          </div>

          {/* To */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
            <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">To</span>
            <span className="text-sm text-foreground font-mono truncate">{composeRecipient.email}</span>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border shrink-0">
            <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">Subject</span>
            <input
              type="text"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-foreground"
              placeholder="Subject"
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <textarea
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              className="w-full h-full resize-none p-4 text-sm bg-transparent outline-none text-foreground leading-relaxed font-sans"
              placeholder="Write your email…"
            />
          </div>

          {/* Send bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
            <button
              onClick={() => { setInlineCompose(null); setEmailSubject(""); setEmailBody(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Discard
            </button>
            <Button
              onClick={handleSendEmail}
              disabled={!emailSubject.trim() || !emailBody.trim()}
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              Send Email
            </Button>
          </div>
        </div>
      ) : (
        /* Actions + history */
        <div className="flex-1 overflow-y-auto ar-scrollbar">

          {/* Available Actions */}
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
              Available Actions
            </h3>
            {groups.map((group, gi) => (
              <div key={gi} className="mb-5 animate-slide-in" style={{ animationDelay: `${gi * 60}ms` }}>
                {group.condition && (
                  <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-foreground/40 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">
                      {group.condition}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {group.actions.map((action) => {
                    const Icon = actionIcons[action.type];
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
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Activity History */}
          {allHistory.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Activity History
              </h3>
              <div>
                {allHistory.map((entry, i) => (
                  <HistoryItem key={i} entry={entry} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Log dialog — non-email actions only */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeAction && (() => { const Icon = actionIcons[activeAction.type]; return <Icon className="w-4 h-4" />; })()}
              {activeAction?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Client: <strong>{client.name}</strong> · {client.contactName}
            </p>
            {radioOptions ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {activeAction?.decisionOptions ? "Decision" : "Outcome"}
                </p>
                {radioOptions.map((opt) => (
                  <label
                    key={opt}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 cursor-pointer transition-colors",
                      selectedOutcome === opt
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <input
                      type="radio"
                      name="outcome"
                      value={opt}
                      checked={selectedOutcome === opt}
                      onChange={() => setSelectedOutcome(opt)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <Textarea
                placeholder="Add notes, outcome, or context..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirm}
              disabled={radioOptions ? !selectedOutcome : false}
            >
              Save & Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
