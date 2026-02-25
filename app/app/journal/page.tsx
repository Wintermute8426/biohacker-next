"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BookOpen, Plus, ChevronDown, ChevronUp } from "lucide-react";
import CycleJournalEntry from "@/components/CycleJournalEntry";

interface CycleOption {
  id: string;
  label: string;
  status: string;
}

interface JournalEntry {
  id: string;
  entry_date: string;
  energy: number;
  sleep_quality: number;
  recovery: number;
  mood: number;
  focus: number;
  notes: string | null;
}

function ratingColor(value: number): string {
  if (value <= 3) return "text-red-400";
  if (value <= 6) return "text-amber-500";
  return "text-[#00ffaa]";
}

export default function JournalPage() {
  const [cycles, setCycles] = useState<CycleOption[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedCycleName, setSelectedCycleName] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadCycles = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("cycles")
      .select("id, peptide_name, status")
      .eq("user_id", user.id)
      .in("status", ["active", "completed"])
      .order("start_date", { ascending: false });

    const options: CycleOption[] = (data || []).map((c) => ({
      id: c.id,
      label: (c as { peptide_name?: string }).peptide_name || "Cycle",
      status: (c as { status?: string }).status || "active",
    }));
    setCycles(options);
    if (options.length > 0 && !selectedCycleId) {
      setSelectedCycleId(options[0].id);
      setSelectedCycleName(options[0].label);
    }
  };

  const loadEntries = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const cycleId = selectedCycleId || (cycles[0]?.id);
    if (!cycleId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("cycle_journal")
      .select("id, entry_date, energy, sleep_quality, recovery, mood, focus, notes")
      .eq("user_id", user.id)
      .eq("cycle_id", cycleId)
      .order("entry_date", { ascending: false });

    setEntries((data as JournalEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    setLoading(true);
    loadEntries();
  }, [selectedCycleId]);

  const chartData =
    entries.length >= 3
      ? [...entries]
          .reverse()
          .map((e) => ({
            date: new Date(e.entry_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            energy: e.energy,
            sleep: e.sleep_quality,
            recovery: e.recovery,
            mood: e.mood,
            focus: e.focus,
          }))
      : [];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
                Cycle Journal
              </h1>
              <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
                Daily subjective tracking and trends
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-dot led-green" aria-hidden />
              <span className="px-2 py-1 rounded bg-[#00ffaa]/10 border border-[#00ffaa]/40 font-mono text-[10px] text-[#00ffaa]">
                JOURNAL
              </span>
            </div>
          </div>
          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>
            0xJRNL
          </span>
        </div>

        {/* Cycle selector + New Entry */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3] mb-1">
                Cycle
              </label>
              <select
                value={selectedCycleId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedCycleId(id);
                  const c = cycles.find((x) => x.id === id);
                  if (c) setSelectedCycleName(c.label);
                }}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa]"
              >
                {cycles.length === 0 ? (
                  <option value="">No cycles</option>
                ) : (
                  cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.status})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowNewEntry(!showNewEntry)}
                className="flex items-center gap-2 rounded-lg border-2 border-[#00ffaa] bg-[#00ffaa]/10 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {showNewEntry ? "Hide" : "New entry"}
              </button>
            </div>
          </div>
        </div>

        {showNewEntry && selectedCycleId && (
          <CycleJournalEntry
            cycleId={selectedCycleId}
            cycleName={selectedCycleName || "Cycle"}
            onSave={() => {
              loadEntries();
            }}
          />
        )}

        {/* Trend chart */}
        {chartData.length >= 3 && (
          <div className="deck-card-bg deck-border-thick rounded-xl p-6 border-[#00ffaa]/20">
            <h2 className="font-mono text-sm font-bold text-[#e0e0e5] mb-4">
              Trends
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00ffaa20" />
                <XAxis
                  dataKey="date"
                  stroke="#9a9aa3"
                  style={{ fontSize: "12px", fontFamily: "monospace" }}
                />
                <YAxis
                  domain={[1, 10]}
                  stroke="#9a9aa3"
                  style={{ fontSize: "12px", fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f2e",
                    border: "1px solid #00ffaa40",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: "monospace", fontSize: "11px" }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#00ffaa"
                  name="Energy"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#00d9ff"
                  name="Sleep"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="recovery"
                  stroke="#ff00ff"
                  name="Recovery"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#ffaa00"
                  name="Mood"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="focus"
                  stroke="#aa00ff"
                  name="Focus"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Entry history */}
        <div>
          <h2 className="font-mono text-sm font-bold text-[#e0e0e5] mb-3">
            Entry history
          </h2>
          {loading ? (
            <p className="font-mono text-xs text-[#9a9aa3]">Loading...</p>
          ) : entries.length === 0 ? (
            <div className="deck-card-bg deck-border-thick rounded-xl p-8 text-center border-[#00ffaa]/20">
              <BookOpen className="w-12 h-12 text-[#00ffaa]/50 mx-auto mb-3" />
              <p className="font-mono text-sm text-[#9a9aa3]">
                No journal entries yet. Use &quot;New entry&quot; to add one.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                return (
                  <li
                    key={entry.id}
                    className="deck-card-bg deck-border-thick rounded-xl overflow-hidden border-[#00ffaa]/20 hover:border-[#00ffaa]/40 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-sm font-bold text-[#00ffaa]">
                          {formatDate(entry.entry_date)}
                        </span>
                        {entry.notes ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : entry.id)
                            }
                            className="text-[#9a9aa3] hover:text-[#00ffaa] p-1"
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-5 gap-2 font-mono text-[10px]">
                        <div className="text-center">
                          <div className="text-[#9a9aa3]">Energy</div>
                          <div className={ratingColor(entry.energy)}>
                            {entry.energy}/10
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#9a9aa3]">Sleep</div>
                          <div className={ratingColor(entry.sleep_quality)}>
                            {entry.sleep_quality}/10
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#9a9aa3]">Recovery</div>
                          <div className={ratingColor(entry.recovery)}>
                            {entry.recovery}/10
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#9a9aa3]">Mood</div>
                          <div className={ratingColor(entry.mood)}>
                            {entry.mood}/10
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#9a9aa3]">Focus</div>
                          <div className={ratingColor(entry.focus)}>
                            {entry.focus}/10
                          </div>
                        </div>
                      </div>
                      {entry.notes && (
                        <div
                          className={`mt-3 overflow-hidden transition-all ${
                            isExpanded ? "max-h-96" : "max-h-0 opacity-0"
                          }`}
                        >
                          <p className="font-mono text-xs text-[#e0e0e5] whitespace-pre-wrap border-t border-[#00ffaa]/20 pt-3 mt-3">
                            {entry.notes}
                          </p>
                        </div>
                      )}
                      {entry.notes && !isExpanded && (
                        <p className="mt-2 font-mono text-[10px] text-[#9a9aa3]">
                          Tap to expand notes
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
