"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  loadAllGoals,
  getGoalCompletionStats,
  type GoalWithLatestProgress,
  type GoalStats,
} from "@/lib/goal-database";
import { loadCycles } from "@/lib/cycle-database";
import GoalCard from "@/components/GoalCard";
import GoalSetterModal from "@/components/GoalSetterModal";
import type { CycleGoal } from "@/lib/goal-database";

type Tab = "all" | "in_progress" | "achieved" | "failed";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalWithLatestProgress[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithLatestProgress | null>(null);
  const [cycleNames, setCycleNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    Promise.all([loadAllGoals(), getGoalCompletionStats(), loadCycles()]).then(
      ([g, s, cycles]) => {
        setGoals(g);
        setStats(s);
        const map: Record<string, string> = {};
        cycles.forEach((c) => {
          map[c.id] = c.peptideName;
        });
        setCycleNames(map);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered =
    tab === "all"
      ? goals
      : tab === "in_progress"
        ? goals.filter((g) => g.status === "in_progress")
        : tab === "achieved"
          ? goals.filter((g) => g.status === "achieved" || g.status === "partially_achieved")
          : goals.filter((g) =>
              ["not_achieved", "abandoned"].includes(g.status)
            );

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "in_progress", label: "In Progress" },
    { id: "achieved", label: "Achieved" },
    { id: "failed", label: "Failed" },
  ];

  const handleEdit = (goal: GoalWithLatestProgress) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 font-mono text-sm">
            <span>
              <span className="text-[#9a9aa3]">Total goals:</span>{" "}
              <span className="text-[#00ffaa]">{stats?.total ?? 0}</span>
            </span>
            <span>
              <span className="text-[#9a9aa3]">Completion rate:</span>{" "}
              <span className="text-[#00ffaa]">{stats?.completionRate ?? 0}%</span>
            </span>
            <span>
              <span className="text-[#9a9aa3]">Active:</span>{" "}
              <span className="text-amber-400">{stats?.inProgress ?? 0}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg border-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              tab === t.id
                ? "border-[#00ffaa] bg-[#00ffaa]/20 text-[#00ffaa]"
                : "border-[#00ffaa]/25 bg-black/50 text-[#9a9aa3] hover:border-[#00ffaa]/50 hover:text-[#00ffaa]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p className="font-mono text-sm text-[#9a9aa3]">Loading goals...</p>
      ) : filtered.length === 0 ? (
        <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-12 text-center">
          <p className="font-mono text-[#9a9aa3]">
            {goals.length === 0
              ? "Set your first goal to track what your peptides are doing for you."
              : `No goals in this filter.`}
          </p>
          {goals.length === 0 && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2 font-mono text-sm text-[#00ffaa] hover:bg-[#00ffaa]/20"
            >
              Add Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              cycleName={goal.cycleId ? cycleNames[goal.cycleId] : null}
              onUpdate={refresh}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <GoalSetterModal
          goal={editingGoal as CycleGoal | null}
          onSave={handleSaveGoal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
