import { useState, useMemo } from "react";
import { STAGES, StageId } from "@/data/ar-types";
import { MOCK_CLIENTS } from "@/data/ar-mock-data";
import { StageSelector } from "@/components/StageSelector";
import { ClientList } from "@/components/ClientList";
import { ActionChecklist } from "@/components/ActionChecklist";
import { Link } from "react-router-dom";

export default function TriageView() {
  const [selectedStageId, setSelectedStageId] = useState<StageId | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const clientCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGES.forEach(s => { counts[s.id] = 0; });
    MOCK_CLIENTS.forEach(c => { counts[c.stageId] = (counts[c.stageId] || 0) + 1; });
    return counts;
  }, []);

  const filteredClients = useMemo(() =>
    selectedStageId ? MOCK_CLIENTS.filter(c => c.stageId === selectedStageId) : [],
    [selectedStageId]
  );

  const selectedClient = useMemo(() =>
    selectedClientId ? MOCK_CLIENTS.find(c => c.id === selectedClientId) || null : null,
    [selectedClientId]
  );

  const handleSelectStage = (stageId: string) => {
    setSelectedStageId(stageId as StageId);
    setSelectedClientId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-base font-bold text-foreground tracking-tight">AR Portal</h1>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-surface-hover"
            >
              Overview
            </Link>
            <span className="text-sm font-medium text-foreground bg-surface-active px-3 py-1.5 rounded-md">
              All Clients
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {MOCK_CLIENTS.length} accounts
          </span>
        </div>
      </header>

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1 — Stages */}
        <div className="w-[280px] border-r border-border bg-card overflow-y-auto ar-scrollbar shrink-0">
          <StageSelector
            stages={STAGES}
            selectedStageId={selectedStageId}
            clientCounts={clientCounts}
            onSelectStage={handleSelectStage}
          />
        </div>

        {/* Column 2 — Clients */}
        <div className="w-[340px] border-r border-border bg-card overflow-y-auto ar-scrollbar shrink-0">
          <ClientList
            clients={filteredClients}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
          />
        </div>

        {/* Column 3 — Actions */}
        <div className="flex-1 bg-card overflow-hidden">
          <ActionChecklist client={selectedClient} />
        </div>
      </div>
    </div>
  );
}
