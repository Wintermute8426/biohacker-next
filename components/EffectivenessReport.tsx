"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type CycleReview = {
  id: string;
  cycle_id: string;
  effectiveness_rating: number;
  would_repeat: boolean;
  notes: string;
  side_effects: any;
  created_at: string;
};

type SideEffect = {
  cycle_id: string;
  peptide_name: string;
  effect_name: string;
  severity: string;
  logged_at: string;
};

type Cycle = {
  id: string;
  peptide_name: string;
  end_date: string;
};

type CycleGoal = {
  cycle_id: string;
  status: string;
};

type EffectivenessData = {
  date: string;
  rating: number;
  peptide: string;
};

type SideEffectSummary = {
  peptide: string;
  incidents: number;
  avgSeverity: string;
  severityScore: number;
};

type SideEffectFrequency = {
  effect: string;
  count: number;
};

export default function EffectivenessReport() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<CycleReview[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [goals, setGoals] = useState<CycleGoal[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    const [reviewsRes, sideEffectsRes, cyclesRes, goalsRes] = await Promise.all([
      supabase.from("cycle_reviews").select("*").order("created_at", { ascending: true }),
      supabase.from("side_effects").select("*"),
      supabase.from("cycles").select("id, peptide_name, end_date"),
      supabase.from("cycle_goals").select("cycle_id, status"),
    ]);

    setReviews(reviewsRes.data || []);
    setSideEffects(sideEffectsRes.data || []);
    setCycles(cyclesRes.data || []);
    setGoals(goalsRes.data || []);
    setLoading(false);
  }

  // A) Effectiveness Timeline Data
  const effectivenessData: EffectivenessData[] = reviews.map((r) => {
    const cycle = cycles.find((c) => c.id === r.cycle_id);
    return {
      date: cycle?.end_date || r.created_at.split("T")[0],
      rating: r.effectiveness_rating,
      peptide: cycle?.peptide_name || "Unknown",
    };
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.effectiveness_rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const trend =
    reviews.length >= 3
      ? reviews[reviews.length - 1].effectiveness_rating > reviews[0].effectiveness_rating
        ? "improving"
        : reviews[reviews.length - 1].effectiveness_rating < reviews[0].effectiveness_rating
        ? "declining"
        : "stable"
      : "insufficient data";

  // B) Side Effects Summary
  const sideEffectsByPeptide: Record<string, { incidents: number; severities: string[] }> = {};
  sideEffects.forEach((se) => {
    if (!sideEffectsByPeptide[se.peptide_name]) {
      sideEffectsByPeptide[se.peptide_name] = { incidents: 0, severities: [] };
    }
    sideEffectsByPeptide[se.peptide_name].incidents += 1;
    sideEffectsByPeptide[se.peptide_name].severities.push(se.severity);
  });

  const sideEffectSummary: SideEffectSummary[] = Object.entries(sideEffectsByPeptide).map(
    ([peptide, data]) => {
      const severityMap: Record<string, number> = { mild: 1, moderate: 2, severe: 3 };
      const avgScore =
        data.severities.reduce((sum, s) => sum + (severityMap[s.toLowerCase()] || 0), 0) /
        data.severities.length;
      const avgSeverity =
        avgScore < 1.5 ? "mild" : avgScore < 2.5 ? "moderate" : "severe";
      return { peptide, incidents: data.incidents, avgSeverity, severityScore: avgScore };
    }
  );

  // Side effect frequency
  const effectCounts: Record<string, number> = {};
  sideEffects.forEach((se) => {
    effectCounts[se.effect_name] = (effectCounts[se.effect_name] || 0) + 1;
  });
  const sideEffectFrequency: SideEffectFrequency[] = Object.entries(effectCounts)
    .map(([effect, count]) => ({ effect, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // C) Would-Repeat Analysis
  const wouldRepeatYes = reviews.filter((r) => r.would_repeat).length;
  const wouldRepeatNo = reviews.filter((r) => !r.would_repeat).length;
  const wouldRepeatData = [
    { name: "Would Repeat", value: wouldRepeatYes, color: "#39ff14" },
    { name: "Would Not Repeat", value: wouldRepeatNo, color: "#ff0040" },
  ];

  const peptidesYouWouldRepeat = Array.from(
    new Set(
      reviews
        .filter((r) => r.would_repeat)
        .map((r) => cycles.find((c) => c.id === r.cycle_id)?.peptide_name)
        .filter(Boolean)
    )
  );

  // D) Correlation Insights
  const highRatedCycles = reviews.filter((r) => r.effectiveness_rating >= 4);
  const lowRatedCycles = reviews.filter((r) => r.effectiveness_rating <= 2);

  const highRatedSideEffects =
    highRatedCycles.length > 0
      ? sideEffects.filter((se) => highRatedCycles.some((r) => r.cycle_id === se.cycle_id)).length /
        highRatedCycles.length
      : 0;
  const lowRatedSideEffects =
    lowRatedCycles.length > 0
      ? sideEffects.filter((se) => lowRatedCycles.some((r) => r.cycle_id === se.cycle_id)).length /
        lowRatedCycles.length
      : 0;

  const sideEffectDifference =
    lowRatedSideEffects > 0
      ? (((lowRatedSideEffects - highRatedSideEffects) / lowRatedSideEffects) * 100).toFixed(0)
      : "0";

  const achievedGoalCycles = goals.filter((g) => g.status === "achieved").map((g) => g.cycle_id);
  const achievedCycleRatings = reviews
    .filter((r) => achievedGoalCycles.includes(r.cycle_id))
    .map((r) => r.effectiveness_rating);
  const avgAchievedRating =
    achievedCycleRatings.length > 0
      ? (achievedCycleRatings.reduce((a, b) => a + b, 0) / achievedCycleRatings.length).toFixed(1)
      : "N/A";

  const peptideRatings: Record<string, number[]> = {};
  reviews.forEach((r) => {
    const cycle = cycles.find((c) => c.id === r.cycle_id);
    if (cycle) {
      if (!peptideRatings[cycle.peptide_name]) peptideRatings[cycle.peptide_name] = [];
      peptideRatings[cycle.peptide_name].push(r.effectiveness_rating);
    }
  });

  const peptideAvgRatings = Object.entries(peptideRatings)
    .map(([peptide, ratings]) => ({
      peptide,
      avg: (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
    }))
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

  const mostEffective = peptideAvgRatings[0];
  const leastSideEffectProne = sideEffectSummary.sort((a, b) => a.incidents - b.incidents)[0];

  // E) Decision Helper
  const peptideDecisions = Array.from(
    new Set(reviews.map((r) => cycles.find((c) => c.id === r.cycle_id)?.peptide_name).filter(Boolean))
  ).map((peptide) => {
    const peptideReviews = reviews.filter(
      (r) => cycles.find((c) => c.id === r.cycle_id)?.peptide_name === peptide
    );
    const lastReview = peptideReviews[peptideReviews.length - 1];
    const lastEffectiveness = lastReview?.effectiveness_rating || 0;
    const wouldRepeat = lastReview?.would_repeat || false;
    const totalSideEffects = sideEffects.filter((se) => se.peptide_name === peptide).length;

    let recommendation = "⚠️ Proceed with caution";
    if (lastEffectiveness >= 4 && wouldRepeat && totalSideEffects < 3) {
      recommendation = "✅ Run again";
    } else if (lastEffectiveness <= 2 || !wouldRepeat || totalSideEffects >= 5) {
      recommendation = "❌ Avoid";
    }

    return {
      peptide: peptide as string,
      lastEffectiveness,
      wouldRepeat,
      totalSideEffects,
      recommendation,
    };
  });

  if (loading) {
    return (
      <div className="deck-card-bg deck-border p-6 text-center">
        <div className="text-green-500 animate-pulse">Loading report...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="deck-card-bg deck-border p-6 text-center">
        <div className="text-green-500/60 mb-2">NO CYCLE REVIEWS YET</div>
        <div className="text-xs text-green-500/40">
          Complete some cycles and submit reviews to see your effectiveness report.
        </div>
      </div>
    );
  }

  const COLORS = {
    cyan: "#00ffff",
    green: "#39ff14",
    orange: "#ff6600",
    magenta: "#ff00ff",
    red: "#ff0040",
  };

  return (
    <div className="space-y-6">
      {/* A) Effectiveness Timeline */}
      <div className="deck-card-bg deck-border p-4">
        <div className="deck-section-title mb-4">A) EFFECTIVENESS TIMELINE</div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={effectivenessData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,0,0.1)" />
            <XAxis
              dataKey="date"
              stroke="#39ff14"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => val.split("-")[2] || val}
            />
            <YAxis stroke="#39ff14" domain={[0, 5]} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                border: "1px solid #39ff14",
                borderRadius: "4px",
                fontSize: "10px",
              }}
              labelStyle={{ color: "#39ff14" }}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke={COLORS.cyan}
              strokeWidth={2}
              dot={{ fill: COLORS.cyan, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 text-xs text-green-500/70">
          Average effectiveness: <span className="text-green-500 font-bold">{avgRating}/5</span> •
          Trend: <span className="text-green-500 font-bold">{trend}</span>
        </div>
      </div>

      {/* B) Side Effects Summary */}
      <div className="deck-card-bg deck-border p-4">
        <div className="deck-section-title mb-4">B) SIDE EFFECTS SUMMARY</div>

        {/* Table */}
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-green-500/20">
                <th className="text-left py-2 text-green-500">PEPTIDE</th>
                <th className="text-center py-2 text-green-500">INCIDENTS</th>
                <th className="text-right py-2 text-green-500">AVG SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {sideEffectSummary.map((s, i) => {
                const color =
                  s.avgSeverity === "mild"
                    ? COLORS.green
                    : s.avgSeverity === "moderate"
                    ? "#ffaa00"
                    : COLORS.red;
                return (
                  <tr key={i} className="border-b border-green-500/10">
                    <td className="py-2 text-green-500/70">{s.peptide}</td>
                    <td className="text-center py-2 text-green-500">{s.incidents}</td>
                    <td className="text-right py-2" style={{ color }}>
                      {s.avgSeverity.toUpperCase()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        {sideEffectFrequency.length > 0 && (
          <>
            <div className="text-xs text-green-500/70 mb-2">Most Common Side Effects:</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sideEffectFrequency.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,0,0.1)" />
                <XAxis dataKey="effect" stroke="#39ff14" tick={{ fontSize: 9 }} />
                <YAxis stroke="#39ff14" tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(0,0,0,0.9)",
                    border: "1px solid #39ff14",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="count" fill={COLORS.orange} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* C) Would-Repeat Analysis */}
      <div className="deck-card-bg deck-border p-4">
        <div className="deck-section-title mb-4">C) WOULD-REPEAT ANALYSIS</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={wouldRepeatData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {wouldRepeatData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.9)",
                border: "1px solid #39ff14",
                fontSize: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 text-xs text-green-500/70">
          You've run <span className="text-green-500 font-bold">{reviews.length}</span> cycles.
          Would repeat:{" "}
          <span className="text-green-500 font-bold">
            {wouldRepeatYes} ({((wouldRepeatYes / reviews.length) * 100).toFixed(0)}%)
          </span>
        </div>
        {peptidesYouWouldRepeat.length > 0 && (
          <div className="mt-2 text-xs text-green-500/70">
            Peptides you'd run again:{" "}
            <span className="text-green-500 font-bold">{peptidesYouWouldRepeat.join(", ")}</span>
          </div>
        )}
      </div>

      {/* D) Correlation Insights */}
      <div className="deck-card-bg deck-border p-4">
        <div className="deck-section-title mb-4">D) CORRELATION INSIGHTS</div>
        <div className="space-y-2 text-xs text-green-500/70">
          {highRatedCycles.length > 0 && lowRatedCycles.length > 0 && (
            <div>
              High-rated cycles (4-5★) had{" "}
              <span className="text-green-500 font-bold">{sideEffectDifference}% fewer</span> side
              effects than low-rated cycles (1-2★).
            </div>
          )}
          {achievedCycleRatings.length > 0 && (
            <div>
              Cycles with achieved goals averaged{" "}
              <span className="text-green-500 font-bold">{avgAchievedRating}/5</span>{" "}
              effectiveness.
            </div>
          )}
          {mostEffective && (
            <div>
              Your most effective peptide:{" "}
              <span className="text-green-500 font-bold">
                {mostEffective.peptide} (avg {mostEffective.avg}/5)
              </span>
            </div>
          )}
          {leastSideEffectProne && (
            <div>
              Least side-effect-prone peptide:{" "}
              <span className="text-green-500 font-bold">
                {leastSideEffectProne.peptide} ({leastSideEffectProne.incidents} incidents)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* E) Decision Helper */}
      <div className="deck-card-bg deck-border p-4">
        <div className="deck-section-title mb-4">E) DECISION HELPER</div>
        <div className="space-y-3">
          {peptideDecisions.map((p, i) => (
            <div key={i} className="border-l-2 border-green-500/30 pl-3 py-2">
              <div className="flex justify-between items-start mb-1">
                <div className="text-sm text-green-500 font-bold">{p.peptide}</div>
                <div className="text-xs">{p.recommendation}</div>
              </div>
              <div className="text-xs text-green-500/60 space-y-0.5">
                <div>Last effectiveness: {p.lastEffectiveness}/5</div>
                <div>Would repeat: {p.wouldRepeat ? "Yes" : "No"}</div>
                <div>Total side effects: {p.totalSideEffects}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
