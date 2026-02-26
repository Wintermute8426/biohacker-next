"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import {
  loadAllGoals,
  getGoalCompletionStats,
  type GoalWithLatestProgress,
  type GoalStats,
} from "@/lib/goal-database";

const STATUS_COLORS: Record<string, string> = {
  in_progress: "text-amber-400",
  achieved: "text-[#00ffaa]",
  not_achieved: "text-red-400",
  abandoned: "text-[#9a9aa3]",
};

export default function GoalsDashboardWidget() {
  const [goals, setGoals] = useState<GoalWithLatestProgress[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadAllGoals(), getGoalCompletionStats()]).then(
      ([g, s]) => {
        setGoals(g);
        setStats(s);
        setLoading(false);
      }
    );
  }, []);

  const activeGoals = goals.filter((g) => g.status === "in_progress");
  const top3 = activeGoals.slice(0, 3);

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span
          className={`led-dot ${
            stats && stats.inProgress > 0 ? "led-amber" : "led-green"
          }`}
          aria-hidden="true"
        />
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xGOAL
      </span>

      <div className="flex items-center gap-2 mt-3">
        <Target className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Goals
      </h3>

      {loading ? (
        <p className="mt-3 text-xs text-[#9a9aa3] font-mono">Loading...</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
              {stats?.inProgress ?? 0} ACTIVE
            </span>
            <span className="rounded border border-[#9a9aa3]/30 bg-[#9a9aa3]/10 px-2 py-0.5 text-[10px] font-mono text-[#9a9aa3]">
              {stats?.total ?? 0} TOTAL
            </span>
          </div>

          {/* Completion rate ring/bar */}
          <div className="mt-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
              Completion rate
            </span>
            <div className="mt-1.5 h-2 w-full rounded-full bg-black/50 border border-[#00ffaa]/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00ffaa]/60 transition-all duration-300"
                style={{ width: `${stats?.completionRate ?? 0}%` }}
              />
            </div>
            <p className="mt-1 font-mono text-xs text-[#00ffaa]">
              {stats?.completionRate ?? 0}% resolved
            </p>
          </div>

          {/* Top 3 active goals */}
          {top3.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                Active goals
              </span>
              <ul className="mt-1.5 space-y-1 font-mono text-xs text-[#e0e0e5]">
                {top3.map((g) => (
                  <li
                    key={g.id}
                    className={`truncate ${STATUS_COLORS[g.status] ?? "text-[#e0e0e5]"}`}
                  >
                    {g.goalDescription}
                    {g.latestProgress && (
                      <span className="text-[#9a9aa3] ml-1">
                        → {g.latestProgress.currentValue}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stats?.total === 0 && (
            <p className="mt-3 text-xs text-[#9a9aa3] font-mono">
              No goals set yet
            </p>
          )}
        </>
      )}

      <Link href="/app/goals">
        <button className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60">
          View All
        </button>
      </Link>
    </div>
  );
}
