"use client";

import { useState } from "react";
import {
  logProgress,
  updateGoalStatus,
} from "@/lib/goal-database";
import type {
  GoalWithLatestProgress,
  GoalType,
  GoalStatus,
} from "@/lib/goal-database";

const GOAL_TYPE_ICONS: Record<GoalType, string> = {
  strength_gain: "🏋️",
  injury_healing: "🩹",
  sleep_improvement: "😴",
  cognitive: "🧠",
  weight_loss: "⚖️",
  weight_gain: "⚖️",
  endurance: "🏃",
  recovery: "💪",
  body_composition: "📊",
  pain_reduction: "🩹",
  skin_health: "✨",
  hair_growth: "💇",
  custom: "🎯",
};

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  strength_gain: "Strength",
  injury_healing: "Healing",
  sleep_improvement: "Sleep",
  cognitive: "Cognitive",
  weight_loss: "Weight Loss",
  weight_gain: "Weight Gain",
  endurance: "Endurance",
  recovery: "Recovery",
  body_composition: "Body Comp",
  pain_reduction: "Pain",
  skin_health: "Skin",
  hair_growth: "Hair",
  custom: "Custom",
};

const STATUS_STYLES: Record<GoalStatus, string> = {
  in_progress: "bg-amber-500/20 border-amber-500/40 text-amber-400",
  achieved: "bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]",
  partially_achieved: "bg-[#22d3ee]/20 border-[#22d3ee]/40 text-[#22d3ee]",
  not_achieved: "bg-red-500/20 border-red-500/40 text-red-400",
  abandoned: "bg-[#9a9aa3]/20 border-[#9a9aa3]/40 text-[#9a9aa3]",
};

const STATUS_LABELS: Record<GoalStatus, string> = {
  in_progress: "In progress",
  achieved: "Achieved",
  partially_achieved: "Partially",
  not_achieved: "Not achieved",
  abandoned: "Abandoned",
};

function parseNum(s: string | null | undefined): number | null {
  if (s == null || s === "") return null;
  const n = parseFloat(s.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? null : n;
}

interface GoalCardProps {
  goal: GoalWithLatestProgress;
  cycleName?: string | null;
  onUpdate: () => void;
  onEdit: (goal: GoalWithLatestProgress) => void;
}

export default function GoalCard({
  goal,
  cycleName,
  onUpdate,
  onEdit,
}: GoalCardProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");
  const [logging, setLogging] = useState(false);
  const [updating, setUpdating] = useState(false);

  const baseline = parseNum(goal.baselineValue);
  const target = parseNum(goal.targetValue);
  const current = goal.latestProgress
    ? parseNum(goal.latestProgress.currentValue)
    : baseline;
  const isNumeric = baseline != null && target != null;
  const canShowBar = isNumeric && goal.status === "in_progress";
  const minVal = Math.min(baseline ?? 0, target ?? 0);
  const maxVal = Math.max(baseline ?? 0, target ?? 0);
  const span = maxVal - minVal || 1;
  const currentNum = current ?? baseline ?? target ?? 0;
  const pct = span ? Math.min(100, Math.max(0, ((currentNum - minVal) / span) * 100)) : 0;

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentValue.trim()) return;
    setLogging(true);
    const result = await logProgress(goal.id, currentValue.trim(), notes.trim() || undefined);
    setLogging(false);
    if (result.success) {
      setCurrentValue("");
      setNotes("");
      setShowLogForm(false);
      onUpdate();
    }
  };

  const handleStatus = async (status: GoalStatus) => {
    setUpdating(true);
    const result = await updateGoalStatus(goal.id, status);
    setUpdating(false);
    if (result.success) onUpdate();
  };

  const icon = GOAL_TYPE_ICONS[goal.goalType] ?? "🎯";
  const typeLabel = GOAL_TYPE_LABELS[goal.goalType] ?? goal.goalType;
  const statusStyle = STATUS_STYLES[goal.status];
  const statusLabel = STATUS_LABELS[goal.status];

  return (
    <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5 transition-all hover:border-[#00ffaa]/40">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0" aria-hidden>{icon}</span>
          <div className="min-w-0">
            <h3 className="font-mono text-sm font-bold text-[#f5f5f7] truncate">
              {goal.goalDescription}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="rounded border border-[#9a9aa3]/30 bg-[#9a9aa3]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#9a9aa3]">
                {typeLabel}
              </span>
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-mono ${statusStyle}`}>
                {statusLabel}
              </span>
              <span className="text-[10px] font-mono text-[#9a9aa3]">
                {goal.priority === 1 && "⬆️ Primary"}
                {goal.priority === 2 && "➡️ Secondary"}
                {goal.priority === 3 && "⬇️ Nice-to-have"}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="shrink-0 rounded border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-2 py-1 font-mono text-[10px] text-[#22d3ee] hover:bg-[#22d3ee]/20"
        >
          Edit
        </button>
      </div>

      {cycleName && (
        <p className="font-mono text-[10px] text-[#9a9aa3] mb-2">
          Linked: <span className="text-[#00ffaa]">{cycleName}</span>
        </p>
      )}

      {canShowBar && (
        <div className="mb-3">
          <div className="flex justify-between font-mono text-[10px] text-[#9a9aa3] mb-1">
            <span>Baseline: {goal.baselineValue}</span>
            <span>Target: {goal.targetValue}</span>
          </div>
          <div className="h-2 rounded-full bg-black/50 border border-[#00ffaa]/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00ffaa]/60 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          {goal.latestProgress && (
            <p className="font-mono text-[10px] text-[#00ffaa] mt-1">
              Current: {goal.latestProgress.currentValue}
              {goal.latestProgress.loggedAt && (
                <span className="text-[#9a9aa3] ml-2">
                  {new Date(goal.latestProgress.loggedAt).toLocaleDateString()}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {!canShowBar && goal.latestProgress && (
        <p className="font-mono text-[10px] text-[#9a9aa3] mb-2">
          Last: {goal.latestProgress.currentValue}
          {goal.latestProgress.loggedAt && (
            <span className="ml-2">
              {new Date(goal.latestProgress.loggedAt).toLocaleDateString()}
            </span>
          )}
        </p>
      )}

      {goal.status === "in_progress" && (
        <>
          {!showLogForm ? (
            <button
              type="button"
              onClick={() => setShowLogForm(true)}
              className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-3 py-1.5 font-mono text-[10px] text-[#00ffaa] hover:bg-[#00ffaa]/20 mb-2"
            >
              Log Progress
            </button>
          ) : (
            <form onSubmit={handleLogProgress} className="mb-3 space-y-2">
              <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Current value"
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-xs text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-xs text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={logging || !currentValue.trim()}
                  className="rounded border border-[#00ffaa] bg-[#00ffaa]/10 px-3 py-1 font-mono text-[10px] text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50"
                >
                  {logging ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLogForm(false); setCurrentValue(""); setNotes(""); }}
                  className="rounded border border-[#9a9aa3]/40 px-3 py-1 font-mono text-[10px] text-[#9a9aa3] hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleStatus("achieved")}
              disabled={updating}
              className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-2 py-1 font-mono text-[10px] text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50"
            >
              Mark Achieved
            </button>
            <button
              type="button"
              onClick={() => handleStatus("not_achieved")}
              disabled={updating}
              className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 font-mono text-[10px] text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              Mark Failed
            </button>
          </div>
        </>
      )}
    </div>
  );
}
