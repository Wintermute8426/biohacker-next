"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { saveGoal } from "@/lib/goal-database";
import type { CycleGoal, GoalType } from "@/lib/goal-database";
import { loadCycles } from "@/lib/cycle-database";
import type { Cycle } from "@/lib/cycle-database";

const GOAL_TYPES: { value: GoalType; label: string; icon: string }[] = [
  { value: "strength_gain", label: "Strength", icon: "🏋️" },
  { value: "injury_healing", label: "Healing", icon: "🩹" },
  { value: "sleep_improvement", label: "Sleep", icon: "😴" },
  { value: "cognitive", label: "Cognitive", icon: "🧠" },
  { value: "weight_loss", label: "Weight Loss", icon: "⚖️" },
  { value: "weight_gain", label: "Weight Gain", icon: "⚖️" },
  { value: "endurance", label: "Endurance", icon: "🏃" },
  { value: "recovery", label: "Recovery", icon: "💪" },
  { value: "body_composition", label: "Body Composition", icon: "📊" },
  { value: "pain_reduction", label: "Pain Reduction", icon: "🩹" },
  { value: "skin_health", label: "Skin Health", icon: "✨" },
  { value: "hair_growth", label: "Hair Growth", icon: "💇" },
  { value: "custom", label: "Custom", icon: "🎯" },
];

interface GoalSetterModalProps {
  goal?: CycleGoal | null;
  /** When set, pre-link the new goal to this cycle (e.g. after starting a cycle). */
  initialCycleId?: string | null;
  onSave: () => void;
  onClose: () => void;
}

export default function GoalSetterModal({
  goal,
  initialCycleId,
  onSave,
  onClose,
}: GoalSetterModalProps) {
  const [goalType, setGoalType] = useState<GoalType>(goal?.goalType ?? "custom");
  const [goalDescription, setGoalDescription] = useState(goal?.goalDescription ?? "");
  const [targetValue, setTargetValue] = useState(goal?.targetValue ?? "");
  const [baselineValue, setBaselineValue] = useState(goal?.baselineValue ?? "");
  const [targetDate, setTargetDate] = useState(
    goal?.targetDate ? goal.targetDate.slice(0, 10) : ""
  );
  const [priority, setPriority] = useState<1 | 2 | 3>(goal?.priority ?? 1);
  const [cycleId, setCycleId] = useState<string | null>(
    goal?.cycleId ?? initialCycleId ?? null
  );
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal?.cycleId != null) setCycleId(goal.cycleId);
    else if (initialCycleId != null) setCycleId(initialCycleId);
  }, [goal?.cycleId, initialCycleId]);

  useEffect(() => {
    loadCycles().then((list) => {
      const active = list.filter((c) => c.status === "active");
      setCycles(active);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await saveGoal({
      ...(goal?.id && { id: goal.id }),
      goalType,
      goalDescription: goalDescription.trim(),
      targetValue: targetValue.trim() || null,
      baselineValue: baselineValue.trim() || null,
      targetDate: targetDate.trim() || null,
      priority,
      cycleId: cycleId === "" ? null : cycleId,
      status: goal?.status ?? "in_progress",
    });

    setLoading(false);
    if (result.success) {
      onSave();
      onClose();
    } else {
      setError(result.error ?? "Failed to save goal");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-setter-title"
    >
      <div
        className="deck-card-bg deck-border-thick rounded-xl w-full max-w-lg border-[#00ffaa]/40 bg-[#0a0e1a] p-6 shadow-[0_0_24px_rgba(0,255,170,0.15)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="goal-setter-title"
            className="font-space-mono text-lg font-bold text-[#00ffaa]"
          >
            {goal ? "Edit Goal" : "New Goal"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9a9aa3] hover:bg-[#00ffaa]/10 hover:text-[#00ffaa] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Goal type
            </label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            >
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Description *
            </label>
            <input
              type="text"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              required
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
              placeholder="e.g. Lose 10 lbs, run 5K under 25 min"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
                Baseline value
              </label>
              <input
                type="text"
                value={baselineValue}
                onChange={(e) => setBaselineValue(e.target.value)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
                placeholder="e.g. 180 lbs"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
                Target value
              </label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
                placeholder="e.g. 170 lbs"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Target date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-2">
              Priority
            </label>
            <div className="flex gap-4">
              {([1, 2, 3] as const).map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-2 cursor-pointer font-mono text-sm text-[#e0e0e5]"
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="accent-[#00ffaa]"
                  />
                  {p === 1 && "⬆️ Primary"}
                  {p === 2 && "➡️ Secondary"}
                  {p === 3 && "⬇️ Nice-to-have"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Linked cycle (optional)
            </label>
            <select
              value={cycleId ?? ""}
              onChange={(e) => setCycleId(e.target.value === "" ? null : e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            >
              <option value="">None</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.peptideName}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#00ffaa]/40 bg-transparent py-2.5 font-mono text-xs text-[#9a9aa3] hover:bg-[#00ffaa]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg border border-[#00ffaa] bg-[#00ffaa]/10 py-2.5 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
