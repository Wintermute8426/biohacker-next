"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Plus } from "lucide-react";
import SideEffectLogger from "@/components/SideEffectLogger";

interface CycleOption {
  id: string;
  label: string;
}

interface SideEffectEntry {
  id: string;
  peptide_name: string;
  created_at: string;
  severity: "mild" | "moderate" | "severe";
  site_pain_level: number | null;
  fatigue_level: number | null;
  headache_level: number | null;
  notes: string | null;
}

const SEVERITY_STYLES = {
  mild: "bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]",
  moderate: "bg-amber-500/20 border-amber-500/40 text-amber-500",
  severe: "bg-red-500/20 border-red-500/40 text-red-500",
};

export default function SideEffectsPage() {
  const [cycles, setCycles] = useState<CycleOption[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [entries, setEntries] = useState<SideEffectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [loggerCycleId, setLoggerCycleId] = useState("");
  const [loggerPeptideName, setLoggerPeptideName] = useState("");

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadCycles = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("cycles")
      .select("id, peptide_name")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("start_date", { ascending: false });

    const options: CycleOption[] = (data || []).map((c) => ({
      id: c.id,
      label: (c as { peptide_name?: string }).peptide_name || "Cycle",
    }));
    setCycles(options);
    if (options.length > 0 && !selectedCycleId) {
      setSelectedCycleId(options[0].id);
      setLoggerCycleId(options[0].id);
      setLoggerPeptideName(options[0].label);
    }
  };

  const loadHistory = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("side_effects")
      .select("id, peptide_name, created_at, severity, site_pain_level, fatigue_level, headache_level, notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setEntries((data as SideEffectEntry[]) || []);
    setLoading(false);
  };

  const openLogger = () => {
    const cycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0];
    if (cycle) {
      setLoggerCycleId(cycle.id);
      setLoggerPeptideName(cycle.label);
      setShowLogger(true);
    } else {
      setLoggerCycleId("");
      setLoggerPeptideName("Peptide");
      setShowLogger(true);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const excerpt = (text: string | null, maxLen: number) => {
    if (!text) return "";
    return text.length <= maxLen ? text : text.slice(0, maxLen) + "…";
  };

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 space-y-6 p-4">
        {/* Header */}
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
                Side Effects Tracker
              </h1>
              <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
                Monitor injection site and systemic reactions for safety
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-dot led-amber" aria-hidden />
              <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/40 font-mono text-[10px] text-amber-500">
                SAFETY
              </span>
            </div>
          </div>
          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>
            0xSE1
          </span>
        </div>

        {/* Actions */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-amber-500/20 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3] mb-1">
                Cycle (for new log)
              </label>
              <select
                value={selectedCycleId}
                onChange={(e) => {
                  setSelectedCycleId(e.target.value);
                  const c = cycles.find((x) => x.id === e.target.value);
                  if (c) {
                    setLoggerCycleId(c.id);
                    setLoggerPeptideName(c.label);
                  }
                }}
                className="w-full bg-black/50 border border-amber-500/40 rounded-lg px-4 py-2.5 text-[#f5f5f7] font-mono focus:outline-none focus:border-amber-500"
              >
                {cycles.length === 0 ? (
                  <option value="">No active cycles</option>
                ) : (
                  cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={openLogger}
                className="flex items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-500/10 px-4 py-2.5 font-mono text-xs font-medium text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Log side effect
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="font-mono text-sm font-bold text-[#e0e0e5] mb-3">
            Recent entries (last 50)
          </h2>
          {loading ? (
            <p className="font-mono text-xs text-[#9a9aa3]">Loading...</p>
          ) : entries.length === 0 ? (
            <div className="deck-card-bg deck-border-thick rounded-xl p-8 text-center border-amber-500/20">
              <AlertTriangle className="w-12 h-12 text-amber-500/60 mx-auto mb-3" />
              <p className="font-mono text-sm text-[#9a9aa3]">
                No side effects logged yet. Use &quot;Log side effect&quot; to record any reactions.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="deck-card-bg deck-border-thick rounded-xl p-4 border-amber-500/20 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-amber-500">
                        {entry.peptide_name}
                      </span>
                      <span className="font-mono text-[10px] text-[#9a9aa3] ml-2">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-[10px] font-medium capitalize ${SEVERITY_STYLES[entry.severity]}`}
                    >
                      {entry.severity}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] text-[#9a9aa3]">
                    {entry.site_pain_level != null && entry.site_pain_level > 0 && (
                      <span>Site pain: {entry.site_pain_level}/10</span>
                    )}
                    {entry.fatigue_level != null && entry.fatigue_level > 0 && (
                      <span>Fatigue: {entry.fatigue_level}/10</span>
                    )}
                    {entry.headache_level != null && entry.headache_level > 0 && (
                      <span>Headache: {entry.headache_level}/10</span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="mt-2 font-mono text-xs text-[#e0e0e5]">
                      {excerpt(entry.notes, 120)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showLogger && (
        <SideEffectLogger
          cycleId={loggerCycleId}
          peptideName={loggerPeptideName}
          onComplete={loadHistory}
          onClose={() => setShowLogger(false)}
        />
      )}
    </div>
  );
}
