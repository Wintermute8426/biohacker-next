"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Target, Clock } from "lucide-react";

interface CycleStats {
  peptide_name: string;
  total_cycles: number;
  completed_cycles: number;
  total_doses_logged: number;
  adherence_rate: number;
  avg_duration_days: number;
}

export default function CycleComparison() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CycleStats[]>([]);

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cycles } = await supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user.id);

    if (!cycles || cycles.length === 0) {
      setLoading(false);
      return;
    }

    // Group cycles by peptide
    const peptideGroups: Record<string, any[]> = {};
    cycles.forEach((cycle: any) => {
      if (!peptideGroups[cycle.peptide_name]) {
        peptideGroups[cycle.peptide_name] = [];
      }
      peptideGroups[cycle.peptide_name].push(cycle);
    });

    // Calculate stats for each peptide
    const comparisonStats: CycleStats[] = Object.keys(peptideGroups).map((peptideName) => {
      const peptideCycles = peptideGroups[peptideName];
      const completedCycles = peptideCycles.filter((c) => c.status === "completed");

      const totalDosesLogged = peptideCycles.reduce((sum, c) => sum + (c.doses_logged || 0), 0);
      const totalExpectedDoses = peptideCycles.reduce((sum, c) => sum + (c.total_expected_doses || 0), 0);
      const adherenceRate = totalExpectedDoses > 0
        ? (totalDosesLogged / totalExpectedDoses) * 100
        : 0;

      const totalDurationDays = peptideCycles.reduce((sum, c) => {
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      const avgDurationDays = totalDurationDays / peptideCycles.length;

      return {
        peptide_name: peptideName,
        total_cycles: peptideCycles.length,
        completed_cycles: completedCycles.length,
        total_doses_logged: totalDosesLogged,
        adherence_rate: adherenceRate,
        avg_duration_days: avgDurationDays
      };
    });

    // Sort by total cycles (most used first)
    comparisonStats.sort((a, b) => b.total_cycles - a.total_cycles);

    setStats(comparisonStats);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neon-green font-mono">COMPARING CYCLES...</div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#9a9aa3]/30 p-6">
        <p className="font-mono text-sm text-[#9a9aa3]">
          No cycle data found. Complete multiple cycles to see comparisons.
        </p>
      </div>
    );
  }

  // Find best performers
  const bestAdherence = [...stats].sort((a, b) => b.adherence_rate - a.adherence_rate)[0];
  const mostUsed = [...stats].sort((a, b) => b.total_cycles - a.total_cycles)[0];
  const longestAvgDuration = [...stats].sort((a, b) => b.avg_duration_days - a.avg_duration_days)[0];

  return (
    <div className="space-y-4">
      {/* Top Performers */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-[#00ffaa]" />
            <h4 className="font-mono text-xs text-[#9a9aa3]">Best Adherence</h4>
          </div>
          <p className="font-mono text-lg font-bold text-[#00ffaa]">
            {bestAdherence.peptide_name}
          </p>
          <p className="mt-1 font-mono text-sm text-[#22d3ee]">
            {bestAdherence.adherence_rate.toFixed(1)}%
          </p>
        </div>

        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-[#00ffaa]" />
            <h4 className="font-mono text-xs text-[#9a9aa3]">Most Used</h4>
          </div>
          <p className="font-mono text-lg font-bold text-[#00ffaa]">
            {mostUsed.peptide_name}
          </p>
          <p className="mt-1 font-mono text-sm text-[#22d3ee]">
            {mostUsed.total_cycles} cycles
          </p>
        </div>

        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#00ffaa]" />
            <h4 className="font-mono text-xs text-[#9a9aa3]">Longest Protocol</h4>
          </div>
          <p className="font-mono text-lg font-bold text-[#00ffaa]">
            {longestAvgDuration.peptide_name}
          </p>
          <p className="mt-1 font-mono text-sm text-[#22d3ee]">
            {longestAvgDuration.avg_duration_days.toFixed(0)} days avg
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4 overflow-x-auto">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
          Protocol Comparison
        </h3>

        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-[#00ffaa]/20">
              <th className="pb-2 text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ffaa]">
                Peptide
              </th>
              <th className="pb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ffaa]">
                Total Cycles
              </th>
              <th className="pb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ffaa]">
                Completed
              </th>
              <th className="pb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ffaa]">
                Adherence
              </th>
              <th className="pb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ffaa]">
                Avg Duration
              </th>
              <th className="pb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ffaa]">
                Total Doses
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr
                key={stat.peptide_name}
                className={`border-b border-white/5 ${
                  index % 2 === 0 ? "bg-black/20" : "bg-black/10"
                }`}
              >
                <td className="py-3 font-mono text-sm font-semibold text-[#e0e0e5]">
                  {stat.peptide_name}
                </td>
                <td className="py-3 text-center font-mono text-sm text-[#9a9aa3]">
                  {stat.total_cycles}
                </td>
                <td className="py-3 text-center font-mono text-sm text-[#9a9aa3]">
                  {stat.completed_cycles}
                </td>
                <td className="py-3 text-center">
                  <span
                    className={`font-mono text-sm font-semibold ${
                      stat.adherence_rate >= 90
                        ? "text-[#00ffaa]"
                        : stat.adherence_rate >= 70
                        ? "text-[#22d3ee]"
                        : "text-amber-400"
                    }`}
                  >
                    {stat.adherence_rate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 text-center font-mono text-sm text-[#9a9aa3]">
                  {stat.avg_duration_days.toFixed(0)} days
                </td>
                <td className="py-3 text-center font-mono text-sm text-[#9a9aa3]">
                  {stat.total_doses_logged}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#22d3ee]/30 p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#22d3ee] mb-2">
          Insights
        </h3>
        <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
          <li>
            <span className="text-[#00ffaa]">•</span> You've completed {stats.reduce((sum, s) => sum + s.completed_cycles, 0)} cycles across {stats.length} different peptides
          </li>
          <li>
            <span className="text-[#00ffaa]">•</span> Average adherence rate: {(stats.reduce((sum, s) => sum + s.adherence_rate, 0) / stats.length).toFixed(1)}%
          </li>
          <li>
            <span className="text-[#00ffaa]">•</span> Most consistent protocol: {bestAdherence.peptide_name} with {bestAdherence.adherence_rate.toFixed(1)}% adherence
          </li>
        </ul>
      </div>
    </div>
  );
}
