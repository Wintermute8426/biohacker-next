"use client";

import { useState, useMemo, useEffect } from "react";
import { Syringe, X, ChevronDown, ChevronUp, Play, Plus, Trash2 } from "lucide-react";
import { loadCycles, saveCycles } from "@/lib/cycle-storage";

export type CycleFrequency = {
  type: "daily" | "weekly" | "monthly";
  times: number;
  days?: string[];
  dates?: number[];
};

export type Cycle = {
  id: string;
  hexId: string;
  peptideName: string;
  doseAmount: string;
  frequency: CycleFrequency;
  startDate: Date;
  endDate: Date;
  status: "active" | "paused" | "completed";
  protocolId?: string;
  dosesLogged: number;
  totalExpectedDoses: number;
  notes?: string;
  completedAt?: Date;
};

export type ProtocolPeptide = {
  name: string;
  dose: string;
  timing: string;
  route: string;
  priority: string;
};

export type ProtocolTemplate = {
  id: string;
  hexId: string;
  name: string;
  duration: string;
  peptides: ProtocolPeptide[];
};

function generateHexId(existingCycles: Cycle[]): string {
  const n = existingCycles.length + 1;
  const hex = (0xc100 + n).toString(16).toUpperCase().padStart(4, "0");
  return `0x${hex}`;
}

function parseDurationWeeks(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (match) return Math.min(52, parseInt(match[1], 10));
  if (duration.toLowerCase().includes("ongoing")) return 12;
  return 8;
}

function dosesPerWeekFromTiming(timing: string): number {
  const t = timing.toLowerCase();
  if (t.includes("twice daily") || t.includes("2x daily")) return 14;
  if (t.includes("daily") && !t.includes("2x")) return 7;
  if (t.includes("2x per week") || t.includes("2x per week")) return 2;
  if (t.includes("3x") || t.includes("2-3x")) return 3;
  if (t.includes("1-2x")) return 2;
  if (t.includes("1x") || t.includes("1x per week")) return 1;
  return 7;
}

function dosesPerWeekFromFrequency(freq: CycleFrequency): number {
  if (freq.type === "daily") return freq.times * 7;
  if (freq.type === "weekly") return freq.days?.length ?? freq.times;
  if (freq.type === "monthly") return (freq.dates?.length ?? freq.times) * (52 / 12);
  return 7;
}

function formatFrequencyDisplay(freq: CycleFrequency): string {
  if (freq.type === "daily") {
    if (freq.times === 1) return "Daily";
    return `${freq.times}x daily`;
  }
  if (freq.type === "weekly") {
    const days = (freq.days ?? []).length ? ` (${(freq.days ?? []).join(", ")})` : "";
    return `${freq.times}x weekly${days}`;
  }
  if (freq.type === "monthly") {
    const dates = (freq.dates ?? []).length ? ` (${(freq.dates ?? []).join(", ")})` : "";
    return `${freq.times}x monthly${dates}`;
  }
  return "—";
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function timingToFrequency(timing: string): CycleFrequency {
  const t = timing.toLowerCase();
  if (t.includes("twice daily") || t.includes("2x daily")) return { type: "daily", times: 2 };
  if (t.includes("daily") && !t.includes("2x")) return { type: "daily", times: 1 };
  if (t.includes("2x per week") || t.includes("2x weekly")) return { type: "weekly", times: 2, days: ["MON", "THU"] };
  if (t.includes("3x") || t.includes("2-3x")) return { type: "weekly", times: 3, days: ["MON", "WED", "FRI"] };
  if (t.includes("1-2x")) return { type: "weekly", times: 2, days: ["MON", "THU"] };
  if (t.includes("1x") || t.includes("1x per week")) return { type: "weekly", times: 1, days: ["MON"] };
  return { type: "daily", times: 7 };
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}


function ActiveCycleCard({
  cycle,
  onLogDose,
  onPause,
  onComplete,
}: {
  cycle: Cycle;
  onLogDose: (c: Cycle) => void;
  onPause: (c: Cycle) => void;
  onComplete: (c: Cycle) => void;
}) {
  const totalWeeks = Math.ceil((cycle.endDate.getTime() - cycle.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const elapsedMs = Date.now() - cycle.startDate.getTime();
  const elapsedWeeks = Math.floor(elapsedMs / (7 * 24 * 60 * 60 * 1000));
  const currentWeek = Math.min(elapsedWeeks + 1, totalWeeks);
  const progressPct = totalWeeks > 0 ? (currentWeek / totalWeeks) * 100 : 0;
  const segmentCount = 10;
  const filledSegments = Math.min(segmentCount, Math.round((progressPct / 100) * segmentCount));

  return (
    <div className="deck-panel deck-card-bg deck-screws deck-border-thick relative rounded-xl p-5 pt-6 border-[#00ffaa]/30 transition-all hover:border-[#00ffaa]/50">
      <div className="led-card-top-right">
        <span className={`led-dot ${cycle.status === "paused" ? "led-amber" : "led-green"}`} aria-hidden />
      </div>
      <span className="hex-id absolute left-6 top-3 z-10 font-mono text-[10px] text-[#22d3ee]" aria-hidden>{cycle.hexId}</span>

      <div className="flex items-center gap-2 mt-2">
        <Syringe className="h-4 w-4 text-[#00ffaa] shrink-0" />
        <h3 className="text-lg font-bold tracking-tight text-[#f5f5f7] font-space-mono">{cycle.peptideName}</h3>
      </div>

      <div className="mt-3 font-mono text-xs text-[#9a9aa3]">
        <span className="text-[#00ffaa]">Duration:</span> Week {currentWeek}/{totalWeeks}
      </div>
      <div className="mt-1 progress-segmented bg-[#1a1a1a]">
        {Array.from({ length: segmentCount }).map((_, i) => (
          <div
            key={i}
            className={`progress-segmented-fill ${i < filledSegments ? "bg-[#00ffaa]" : "progress-segment-empty bg-white/5"}`}
          />
        ))}
      </div>

      <div className="mt-3 font-mono text-xs text-[#e0e0e5]">
        <span className="text-[#9a9aa3]">Dosing:</span> {cycle.doseAmount} {formatFrequencyDisplay(cycle.frequency)}
      </div>
      <div className="mt-1 font-mono text-[10px] text-[#22d3ee]">
        Next dose in 6h 23m
      </div>
      <div className="mt-2 font-mono text-[10px] text-[#9a9aa3]">
        Logged {cycle.dosesLogged}/{cycle.totalExpectedDoses} doses
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onLogDose(cycle)}
          className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-3 py-1.5 font-mono text-[10px] text-[#00ffaa] hover:bg-[#00ffaa]/20"
        >
          Log dose
        </button>
        {cycle.status === "active" && (
          <button
            type="button"
            onClick={() => onPause(cycle)}
            className="rounded border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] text-amber-400 hover:bg-amber-500/20"
          >
            Pause
          </button>
        )}
        {cycle.status === "paused" && (
          <button
            type="button"
            onClick={() => onPause(cycle)}
            className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-3 py-1.5 font-mono text-[10px] text-[#00ffaa] hover:bg-[#00ffaa]/20"
          >
            Resume
          </button>
        )}
        <button
          type="button"
          onClick={() => onComplete(cycle)}
          className="rounded border border-[#9a9aa3]/40 bg-white/5 px-3 py-1.5 font-mono text-[10px] text-[#9a9aa3] hover:bg-white/10"
        >
          Complete
        </button>
      </div>
    </div>
  );
}

export function CyclesContent({
  protocols,
  peptideNames,
}: {
  protocols: ProtocolTemplate[];
  peptideNames: string[];
}) {
  const [cycles, setCycles] = useState<Cycle[]>(() => (loadCycles() as Cycle[]));
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveCycles(cycles);
  }, [cycles]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeCycles = useMemo(() => cycles.filter((c) => c.status === "active" || c.status === "paused"), [cycles]);
  const completedCycles = useMemo(() => cycles.filter((c) => c.status === "completed"), [cycles]);

  const startFromProtocol = (protocol: ProtocolTemplate) => {
    const durationWeeks = parseDurationWeeks(protocol.duration);
    const start = new Date();
    const end = addDays(start, durationWeeks * 7);
    const newCycles: Cycle[] = protocol.peptides.map((p, i) => {
      const frequency = timingToFrequency(p.timing);
      const dosesPerWeek = dosesPerWeekFromFrequency(frequency);
      const totalExpectedDoses = durationWeeks * dosesPerWeek;
      const hexId = `0x${(0xc100 + cycles.length + i + 1).toString(16).toUpperCase().padStart(4, "0")}`;
      return {
        id: `cycle-${Date.now()}-${i}`,
        hexId,
        peptideName: p.name,
        doseAmount: p.dose,
        frequency,
        startDate: new Date(start),
        endDate: new Date(end),
        status: "active" as const,
        protocolId: protocol.id,
        dosesLogged: 0,
        totalExpectedDoses,
        notes: undefined,
      };
    });
    setCycles((prev) => [...prev, ...newCycles]);
    setProtocolModalOpen(false);
    setToast("✅ Cycle created - check Calendar to see schedule");
  };

  const createIndividualCycle = (form: {
    peptideName: string;
    durationWeeks: number;
    doseAmount: string;
    frequency: CycleFrequency;
    startDate: string;
    notes: string;
  }) => {
    const start = new Date(form.startDate);
    const end = addDays(start, form.durationWeeks * 7);
    const dosesPerWeek = dosesPerWeekFromFrequency(form.frequency);
    const totalExpectedDoses = form.durationWeeks * dosesPerWeek;
    const hexId = generateHexId(cycles);
    const cycle: Cycle = {
      id: `cycle-${Date.now()}`,
      hexId,
      peptideName: form.peptideName,
      doseAmount: form.doseAmount,
      frequency: form.frequency,
      startDate: start,
      endDate: end,
      status: "active",
      dosesLogged: 0,
      totalExpectedDoses,
      notes: form.notes || undefined,
    };
    setCycles((prev) => [...prev, cycle]);
    setCreateModalOpen(false);
    setToast("✅ Cycle created - check Calendar to see schedule");
  };

  const clearAllCycles = () => {
    if (typeof window !== "undefined" && window.confirm("Clear all cycles? This cannot be undone.")) {
      setCycles([]);
    }
  };

  const logDose = (cycle: Cycle) => {
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycle.id ? { ...c, dosesLogged: Math.min(c.dosesLogged + 1, c.totalExpectedDoses) } : c
      )
    );
  };

  const togglePause = (cycle: Cycle) => {
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycle.id
          ? { ...c, status: c.status === "paused" ? "active" : "paused" }
          : c
      )
    );
  };

  const completeCycle = (cycle: Cycle) => {
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycle.id ? { ...c, status: "completed" as const, completedAt: new Date() } : c
      )
    );
  };

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
              CYCLE MANAGER | ACTIVE: {activeCycles.length} | COMPLETED: {completedCycles.length}
            </h1>
            <div className="flex items-center gap-2">
              {cycles.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllCycles}
                  className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 font-mono text-[10px] text-amber-400 hover:bg-amber-500/20"
                  title="Clear all cycles (for testing)"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </button>
              )}
              <span className="led-dot led-green" aria-hidden />
              <span className="led-dot led-green" aria-hidden />
            </div>
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
            <span>STATUS: ONLINE</span>
            <span>CYCLES: {cycles.length}</span>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xCY01</span>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 rounded-lg border border-[#00ffaa]/40 bg-black/95 px-4 py-3 font-mono text-sm text-[#00ffaa] shadow-[0_0_20px_rgba(0,255,170,0.3)]">
            {toast}
          </div>
        )}

        {/* Active cycles */}
        {activeCycles.length > 0 && (
          <div>
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-3">
              Active cycles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCycles.map((cycle) => (
                <ActiveCycleCard
                  key={cycle.id}
                  cycle={cycle}
                  onLogDose={logDose}
                  onPause={togglePause}
                  onComplete={completeCycle}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick start or empty state */}
        {activeCycles.length === 0 && cycles.length === 0 && (
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6 font-mono text-sm text-[#9a9aa3]">
            <p className="text-[#e0e0e5]">&gt; No active cycles detected</p>
            <p className="mt-1">&gt; Initialize protocol or create cycle to begin</p>
            <p className="mt-2 flex flex-wrap gap-2">
              <span className="text-[#00ffaa]">&gt;</span>
              <button
                type="button"
                onClick={() => setProtocolModalOpen(true)}
                className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-3 py-2 text-[#00ffaa] hover:bg-[#00ffaa]/20"
              >
                [START PROTOCOL]
              </button>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-3 py-2 text-[#00ffaa] hover:bg-[#00ffaa]/20"
              >
                [CREATE CYCLE]
              </button>
            </p>
          </div>
        )}

        {/* Quick start options (when we have cycles or always show below empty state) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-2">
              START PROTOCOL
            </h3>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-3">
              Initialize from template — creates all cycles at once (e.g. BPC-157, TB-500, GHK-Cu).
            </p>
            <button
              type="button"
              onClick={() => setProtocolModalOpen(true)}
              className="flex items-center gap-2 rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 px-3 py-2 font-mono text-xs text-[#00ffaa] hover:bg-[#00ffaa]/15"
            >
              <Play className="h-4 w-4" />
              &gt; Initialize protocol from template
            </button>
          </div>
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-2">
              CREATE CYCLE
            </h3>
            <p className="font-mono text-[10px] text-[#9a9aa3] mb-3">
              Add a single peptide cycle with custom dose, duration, and start date.
            </p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 px-3 py-2 font-mono text-xs text-[#00ffaa] hover:bg-[#00ffaa]/15"
            >
              <Plus className="h-4 w-4" />
              &gt; Create individual cycle
            </button>
          </div>
        </div>

        {/* Completed cycles */}
        {completedCycles.length > 0 && (
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#9a9aa3]/30 p-5">
            <button
              type="button"
              onClick={() => setCompletedExpanded(!completedExpanded)}
              className="flex w-full items-center justify-between font-mono text-sm font-semibold uppercase tracking-wider text-[#9a9aa3] hover:text-[#e0e0e5]"
            >
              <span>Completed cycles ({completedCycles.length})</span>
              {completedExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {completedExpanded && (
              <ul className="mt-3 space-y-2 font-mono text-xs">
                {completedCycles.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/10 bg-black/30 px-3 py-2 text-[#e0e0e5]"
                  >
                    <span className="font-medium text-[#00ffaa]">{c.peptideName}</span>
                    <span className="text-[#9a9aa3]">
                      {Math.ceil((c.endDate.getTime() - c.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))} weeks
                    </span>
                    <span className="text-[#9a9aa3]">
                      Completed {c.completedAt ? new Date(c.completedAt).toLocaleDateString() : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Protocol picker modal */}
      {protocolModalOpen && (
        <ProtocolModal
          protocols={protocols}
          onSelect={startFromProtocol}
          onClose={() => setProtocolModalOpen(false)}
        />
      )}

      {/* Create cycle form modal */}
      {createModalOpen && (
        <CreateCycleModal
          peptideNames={peptideNames}
          onSubmit={createIndividualCycle}
          onClose={() => setCreateModalOpen(false)}
        />
      )}
    </div>
  );
}

function ProtocolModal({
  protocols,
  onSelect,
  onClose,
}: {
  protocols: ProtocolTemplate[];
  onSelect: (p: ProtocolTemplate) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="protocol-modal-title">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="deck-panel deck-card-bg deck-border-thick relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border-[#00ffaa]/40 p-6 shadow-[0_0_24px_rgba(0,255,170,0.2)]">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded p-1 text-[#9a9aa3] hover:bg-white/10 hover:text-[#f5f5f7]" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 id="protocol-modal-title" className="font-space-mono text-lg font-bold text-[#f5f5f7] pr-8">
          Initialize protocol from template
        </h2>
        <p className="mt-2 font-mono text-xs text-[#9a9aa3]">
          This will create one cycle per peptide. Example: &quot;Knee Recovery&quot; creates 3 cycles (BPC-157, TB-500, GHK-Cu).
        </p>
        <ul className="mt-4 space-y-2">
          {protocols.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="w-full rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 px-4 py-3 text-left font-mono text-sm text-[#e0e0e5] hover:border-[#00ffaa]/50 hover:bg-[#00ffaa]/15"
              >
                <span className="font-semibold text-[#00ffaa]">{p.name}</span>
                <span className="ml-2 text-[#9a9aa3]">({p.duration})</span>
                <div className="mt-1 text-[10px] text-[#9a9aa3]">
                  This will create {p.peptides.length} cycle{p.peptides.length !== 1 ? "s" : ""}: {p.peptides.map((x) => x.name).join(", ")}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const FREQUENCY_TYPE_OPTIONS: { value: CycleFrequency["type"]; label: string }[] = [
  { value: "daily", label: "Daily (1x, 2x, 3x)" },
  { value: "weekly", label: "Weekly (1x–4x)" },
  { value: "monthly", label: "Monthly (1x, 2x)" },
];

function CreateCycleModal({
  peptideNames,
  onSubmit,
  onClose,
}: {
  peptideNames: string[];
  onSubmit: (form: {
    peptideName: string;
    durationWeeks: number;
    doseAmount: string;
    frequency: CycleFrequency;
    startDate: string;
    notes: string;
  }) => void;
  onClose: () => void;
}) {
  const [peptideName, setPeptideName] = useState(peptideNames[0] ?? "");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [doseAmount, setDoseAmount] = useState("");
  const [frequencyType, setFrequencyType] = useState<CycleFrequency["type"]>("daily");
  const [frequencyTimes, setFrequencyTimes] = useState(2);
  const [frequencyDays, setFrequencyDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const timesOptions = frequencyType === "daily" ? [1, 2, 3] : frequencyType === "weekly" ? [1, 2, 3, 4] : [1, 2];
  const showDayPicker = frequencyType === "weekly";
  const requiredDays = frequencyTimes;
  const daysValid = !showDayPicker || frequencyDays.length === requiredDays;

  const toggleDay = (day: string) => {
    setFrequencyDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      if (prev.length >= requiredDays) return prev;
      return [...prev, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showDayPicker && !daysValid) return;
    const frequency: CycleFrequency =
      frequencyType === "daily"
        ? { type: "daily", times: frequencyTimes }
        : frequencyType === "weekly"
          ? { type: "weekly", times: frequencyTimes, days: frequencyDays.length === requiredDays ? [...frequencyDays] : WEEKDAYS.slice(0, requiredDays) }
          : { type: "monthly", times: frequencyTimes, dates: [1, 15].slice(0, frequencyTimes) };
    onSubmit({
      peptideName,
      durationWeeks,
      doseAmount: doseAmount.trim() || "—",
      frequency,
      startDate,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="deck-panel deck-card-bg deck-border-thick relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border-[#00ffaa]/40 p-6 shadow-[0_0_24px_rgba(0,255,170,0.2)]">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded p-1 text-[#9a9aa3] hover:bg-white/10 hover:text-[#f5f5f7]" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 id="create-modal-title" className="font-space-mono text-lg font-bold text-[#f5f5f7] pr-8">
          Create individual cycle
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cycle-peptide" className="block font-mono text-xs font-medium text-[#00ffaa] mb-1">Peptide</label>
            <select
              id="cycle-peptide"
              value={peptideName}
              onChange={(e) => setPeptideName(e.target.value)}
              className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa]/60 focus:outline-none"
            >
              {peptideNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cycle-duration" className="block font-mono text-xs font-medium text-[#00ffaa] mb-1">Duration (weeks)</label>
            <input
              id="cycle-duration"
              type="number"
              min={1}
              max={52}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10) || 1)}
              className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa]/60 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="cycle-dose" className="block font-mono text-xs font-medium text-[#00ffaa] mb-1">Dose amount</label>
            <input
              id="cycle-dose"
              type="text"
              placeholder="e.g. 250 mcg"
              value={doseAmount}
              onChange={(e) => setDoseAmount(e.target.value)}
              className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3] focus:border-[#00ffaa]/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-medium text-[#00ffaa] mb-1">Frequency</label>
            <div className="space-y-2">
              <select
                value={frequencyType}
                onChange={(e) => {
                  const v = e.target.value as CycleFrequency["type"];
                  setFrequencyType(v);
                  if (v !== "weekly") setFrequencyDays([]);
                  if (v === "daily") setFrequencyTimes(Math.min(frequencyTimes, 3));
                  if (v === "weekly") setFrequencyTimes(Math.min(frequencyTimes, 4));
                  if (v === "monthly") setFrequencyTimes(Math.min(frequencyTimes, 2));
                }}
                className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa]/60 focus:outline-none"
              >
                {FREQUENCY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={frequencyTimes}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setFrequencyTimes(n);
                  if (frequencyType === "weekly" && frequencyDays.length > n) setFrequencyDays((d) => d.slice(0, n));
                }}
                className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa]/60 focus:outline-none"
              >
                {timesOptions.map((n) => (
                  <option key={n} value={n}>{n}x {frequencyType === "daily" ? "per day" : frequencyType === "weekly" ? "per week" : "per month"}</option>
                ))}
              </select>
            </div>
          </div>

          {showDayPicker && (
            <div>
              <p className="font-mono text-[10px] text-[#00ffaa] mb-2">&gt; DAY SELECTOR</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const selected = frequencyDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`rounded border-2 px-3 py-2 font-mono text-xs font-semibold uppercase transition-all ${
                        selected
                          ? "border-[#00ff88] bg-[#00ff88] text-black shadow-[0_0_12px_rgba(0,255,136,0.6)]"
                          : "border-[#00ffaa]/40 bg-black/50 text-[#e0e0e5] hover:border-[#00ffaa]/60 hover:bg-[#00ffaa]/10"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {!daysValid && frequencyDays.length > 0 && (
                <p className="mt-2 font-mono text-[10px] text-amber-400">
                  Select {requiredDays} days for {requiredDays}x weekly dosing
                </p>
              )}
              {frequencyDays.length === 0 && (
                <p className="mt-2 font-mono text-[10px] text-[#9a9aa3]">
                  Select {requiredDays} day{requiredDays !== 1 ? "s" : ""} for {requiredDays}x weekly dosing
                </p>
              )}
            </div>
          )}

          {frequencyType === "monthly" && (
            <p className="font-mono text-[10px] text-[#9a9aa3]">Date picker for monthly dosing (coming soon). Using default dates for now.</p>
          )}

          <div>
            <label htmlFor="cycle-start" className="block font-mono text-xs font-medium text-[#00ffaa] mb-1">Start date</label>
            <input
              id="cycle-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa]/60 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="cycle-notes" className="block font-mono text-xs font-medium text-[#00ffaa] mb-1">Notes (optional)</label>
            <textarea
              id="cycle-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Post-knee scope"
              className="w-full rounded border border-[#00ffaa]/30 bg-black/50 px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3] focus:border-[#00ffaa]/60 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={showDayPicker && !daysValid}
              className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2 font-mono text-sm font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start cycle
            </button>
            <button type="button" onClick={onClose} className="rounded border border-[#9a9aa3]/40 bg-white/5 px-4 py-2 font-mono text-sm text-[#9a9aa3] hover:bg-white/10">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
