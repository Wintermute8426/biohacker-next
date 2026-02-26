"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";

const CHART_COLORS = ["#39ff14", "#00ffff", "#ff6600", "#ff00ff", "#9a9aa3"];
const GRID_STROKE = "rgba(0, 255, 0, 0.1)";
const TOOLTIP_STYLE = {
  backgroundColor: "#0a0e1a",
  border: "1px solid #00ffaa",
  borderRadius: 8,
  fontFamily: "monospace",
};

interface CycleReview {
  id: string;
  cycle_id: string;
  peptide_name: string;
  effectiveness_rating: number;
  would_repeat: string;
  notes: string | null;
  side_effects: string[];
  completed_at: string;
}

interface CycleRow {
  id: string;
  peptide_name: string;
  start_date: string;
  end_date: string;
}

interface SideEffectRow {
  id: string;
  cycle_id: string;
  peptide_name: string;
  severity: string;
  created_at: string;
  [k: string]: unknown;
}

interface GoalRow {
  id: string;
  cycle_id: string | null;
  status: string;
}

function deriveEffectNames(row: SideEffectRow): string[] {
  if (row.effect_name && String(row.effect_name).trim()) {
    return [String(row.effect_name).trim()];
  }
  const names: string[] = [];
  if (row.site_redness) names.push("Site redness");
  if (row.site_swelling) names.push("Site swelling");
  if (row.site_itching) names.push("Site itching");
  if (row.site_bruising) names.push("Site bruising");
  if (row.site_pain_level && Number(row.site_pain_level) > 0) names.push("Injection site pain");
  if (row.fatigue_level && Number(row.fatigue_level) > 0) names.push("Fatigue");
  if (row.headache_level && Number(row.headache_level) > 0) names.push("Headache");
  if (row.nausea) names.push("Nausea");
  if (row.dizziness) names.push("Dizziness");
  if (row.insomnia) names.push("Insomnia");
  if (row.water_retention) names.push("Water retention");
  if (row.joint_pain) names.push("Joint pain");
  if (row.increased_appetite) names.push("Increased appetite");
  if (row.decreased_appetite) names.push("Decreased appetite");
  if (row.mood_changes) names.push("Mood changes");
  if (names.length === 0) names.push("Other");
  return names;
}

function severityScore(s: string): number {
  return s === "mild" ? 1 : s === "moderate" ? 2 : 3;
}

export default function EffectivenessReport() {
  const [reviews, setReviews] = useState<CycleReview[]>([]);
  const [cycles, setCycles] = useState<CycleRow[]>([]);
  const [sideEffectRows, setSideEffectRows] = useState<SideEffectRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const [revRes, cycRes, seRes, goalRes] = await Promise.all([
        supabase.from("cycle_reviews").select("*").eq("user_id", user.id).order("completed_at", { ascending: true }),
        supabase.from("cycles").select("id, peptide_name, start_date, end_date").eq("user_id", user.id),
        supabase.from("side_effects").select("*").eq("user_id", user.id),
        supabase.from("cycle_goals").select("id, cycle_id, status").eq("user_id", user.id),
      ]);
      setReviews((revRes.data || []) as CycleReview[]);
      setCycles((cycRes.data || []) as CycleRow[]);
      setSideEffectRows((seRes.data || []) as SideEffectRow[]);
      setGoals((goalRes.data || []) as GoalRow[]);
      setLoading(false);
    })();
  }, []);

  const cycleById = useMemo(() => {
    const m = new Map<string, CycleRow>();
    cycles.forEach((c) => m.set(c.id, c));
    return m;
  }, [cycles]);

  const reviewsWithDate = useMemo(() => {
    return reviews
      .map((r) => {
        const cycle = cycleById.get(r.cycle_id);
        const endDate = cycle?.end_date ?? r.completed_at?.slice(0, 10) ?? r.completed_at;
        return { ...r, endDate };
      })
      .filter((r) => r.endDate)
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
  }, [reviews, cycleById]);

  const effectivenessTimelineData = useMemo(() => {
    const peptides = Array.from(new Set(reviewsWithDate.map((r) => r.peptide_name)));
    return reviewsWithDate.map((r) => {
      const row: Record<string, string | number | null> = {
        name: r.endDate.slice(0, 7),
        date: r.endDate,
        fullDate: r.endDate,
      };
      peptides.forEach((p) => {
        row[p] = p === r.peptide_name ? r.effectiveness_rating : null;
      });
      return row;
    });
  }, [reviewsWithDate]);

  const timelinePeptides = useMemo(
    () => Array.from(new Set(reviewsWithDate.map((r) => r.peptide_name))),
    [reviewsWithDate]
  );

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.effectiveness_rating, 0) / reviews.length;
  }, [reviews]);

  const trendInsight = useMemo(() => {
    if (reviewsWithDate.length < 2) return "stable";
    const mid = Math.ceil(reviewsWithDate.length / 2);
    const first = reviewsWithDate.slice(0, mid);
    const second = reviewsWithDate.slice(mid);
    const avgFirst = first.reduce((s, r) => s + r.effectiveness_rating, 0) / first.length;
    const avgSecond = second.reduce((s, r) => s + r.effectiveness_rating, 0) / second.length;
    if (avgSecond - avgFirst > 0.3) return "improving";
    if (avgFirst - avgSecond > 0.3) return "declining";
    return "stable";
  }, [reviewsWithDate]);

  const sideEffectsByPeptide = useMemo(() => {
    const byPeptide: Record<string, { count: number; severitySum: number; n: number }> = {};
    sideEffectRows.forEach((row) => {
      const p = row.peptide_name;
      if (!byPeptide[p]) byPeptide[p] = { count: 0, severitySum: 0, n: 0 };
      byPeptide[p].count += 1;
      byPeptide[p].severitySum += severityScore(row.severity);
      byPeptide[p].n += 1;
    });
    return byPeptide;
  }, [sideEffectRows]);

  const sideEffectNamesFromTable = useMemo(() => {
    const counts: Record<string, number> = {};
    sideEffectRows.forEach((row) => {
      deriveEffectNames(row).forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    reviews.forEach((r) => {
      (r.side_effects || []).forEach((name: string) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [sideEffectRows, reviews]);

  const top3SideEffects = useMemo(() => sideEffectNamesFromTable.slice(0, 3).map((x) => x.name), [sideEffectNamesFromTable]);

  const wouldRepeatYes = reviews.filter((r) => r.would_repeat === "yes").length;
  const wouldRepeatNo = reviews.filter((r) => r.would_repeat === "no").length;
  const wouldRepeatMaybe = reviews.filter((r) => r.would_repeat === "maybe").length;
  const wouldRepeatPieData = [
    { name: "Yes", value: wouldRepeatYes, color: "#39ff14" },
    { name: "No", value: wouldRepeatNo, color: "#ff3333" },
    { name: "Maybe", value: wouldRepeatMaybe, color: "#ff6600" },
  ].filter((d) => d.value > 0);

  const peptidesWouldRunAgain = useMemo(() => {
    const set = new Set<string>();
    reviews.filter((r) => r.would_repeat === "yes").forEach((r) => set.add(r.peptide_name));
    return Array.from(set).sort();
  }, [reviews]);

  const highRatedCycles = useMemo(() => reviews.filter((r) => r.effectiveness_rating >= 4).map((r) => r.cycle_id), [reviews]);
  const lowRatedCycles = useMemo(() => reviews.filter((r) => r.effectiveness_rating <= 2).map((r) => r.cycle_id), [reviews]);
  const sideEffectsHighRated = sideEffectRows.filter((r) => highRatedCycles.includes(r.cycle_id)).length;
  const sideEffectsLowRated = sideEffectRows.filter((r) => lowRatedCycles.includes(r.cycle_id)).length;
  const cyclesWithAchievedGoals = useMemo(() => {
    const set = new Set<string>();
    goals.filter((g) => g.status === "achieved" && g.cycle_id).forEach((g) => set.add(g.cycle_id!));
    return set;
  }, [goals]);
  const effectivenessWithAchieved = useMemo(() => {
    const cycleIds = Array.from(cyclesWithAchievedGoals);
    const revs = reviews.filter((r) => cycleIds.includes(r.cycle_id));
    return revs.length ? revs.reduce((s, r) => s + r.effectiveness_rating, 0) / revs.length : 0;
  }, [reviews, cyclesWithAchievedGoals]);
  const effectivenessWithoutAchieved = useMemo(() => {
    const cycleIds = new Set(goals.filter((g) => g.cycle_id).map((g) => g.cycle_id));
    const revs = reviews.filter((r) => !cycleIds.has(r.cycle_id));
    return revs.length ? revs.reduce((s, r) => s + r.effectiveness_rating, 0) / revs.length : 0;
  }, [reviews, goals]);

  const avgByPeptide = useMemo(() => {
    const m: Record<string, { sum: number; n: number }> = {};
    reviews.forEach((r) => {
      if (!m[r.peptide_name]) m[r.peptide_name] = { sum: 0, n: 0 };
      m[r.peptide_name].sum += r.effectiveness_rating;
      m[r.peptide_name].n += 1;
    });
    return Object.entries(m).map(([name, v]) => ({ peptide: name, avg: v.sum / v.n, n: v.n }));
  }, [reviews]);
  const mostEffectivePeptide = avgByPeptide.length ? avgByPeptide.reduce((a, b) => (a.avg >= b.avg ? a : b)) : null;
  const sideEffectsCountByPeptide = useMemo(() => {
    const m: Record<string, number> = {};
    sideEffectRows.forEach((r) => {
      m[r.peptide_name] = (m[r.peptide_name] || 0) + 1;
    });
    return m;
  }, [sideEffectRows]);
  const leastSideEffectPeptide = useMemo(() => {
    const peptides = Array.from(new Set(reviews.map((r) => r.peptide_name)));
    const withCounts = peptides.map((p) => ({ peptide: p, count: sideEffectsCountByPeptide[p] || 0 }));
    return withCounts.length ? withCounts.reduce((a, b) => (a.count <= b.count ? a : b)) : null;
  }, [reviews, sideEffectsCountByPeptide]);

  const decisionData = useMemo(() => {
    const byPeptide: Record<string, { lastRating: number; sideEffectCount: number; wouldRepeat: string; lastDate: string }> = {};
    reviews.forEach((r) => {
      const existing = byPeptide[r.peptide_name];
      const date = r.completed_at;
      if (!existing || date > existing.lastDate) {
        byPeptide[r.peptide_name] = {
          lastRating: r.effectiveness_rating,
          sideEffectCount: sideEffectsCountByPeptide[r.peptide_name] || 0,
          wouldRepeat: r.would_repeat,
          lastDate: date,
        };
      }
    });
    return Object.entries(byPeptide).map(([peptide, v]) => {
      const rating = v.lastRating;
      const se = v.sideEffectCount;
      const wr = v.wouldRepeat === "yes";
      let recommendation: "run" | "caution" | "avoid" = "caution";
      if (rating >= 4 && wr && se <= 2) recommendation = "run";
      else if (rating <= 2 || (!wr && se > 3)) recommendation = "avoid";
      return { peptide, ...v, recommendation };
    });
  }, [reviews, sideEffectsCountByPeptide]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center font-mono text-[#00ffaa]">
        &gt; LOADING EFFECTIVENESS REPORT...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* A) Effectiveness Timeline */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#00ffaa] mb-4">
          A) Effectiveness Timeline
        </h2>
        {effectivenessTimelineData.length === 0 ? (
          <p className="font-mono text-xs text-[#9a9aa3]">Complete cycle reviews to see the timeline.</p>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={effectivenessTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" stroke="#9a9aa3" tick={{ fontFamily: "monospace", fontSize: 10 }} />
                  <YAxis domain={[1, 5]} stroke="#9a9aa3" tick={{ fontFamily: "monospace", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number) => (value != null ? [value, "Rating"] : [])}
                    labelFormatter={(_, payload) => {
                      const p = payload?.[0]?.payload as { fullDate?: string } | undefined;
                      return p?.fullDate ?? "";
                    }}
                  />
                  <ReferenceLine y={avgRating} stroke="#00ffff" strokeDasharray="4 4" />
                  {timelinePeptides.map((peptide, i) => (
                    <Line
                      key={peptide}
                      type="monotone"
                      dataKey={peptide}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                      connectNulls={false}
                      name={peptide}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 font-mono text-xs text-[#9a9aa3]">
              Your effectiveness ratings are <span className="text-[#00ffaa]">{trendInsight}</span>.
            </p>
          </>
        )}
      </div>

      {/* B) Side Effects Summary */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#00ffaa] mb-4">
          B) Side Effects Summary
        </h2>
        {Object.keys(sideEffectsByPeptide).length > 0 && (
          <div className="overflow-x-auto mb-4">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="text-left text-[#9a9aa3] border-b border-[#00ffaa]/20">
                  <th className="pb-2 pr-4">Peptide</th>
                  <th className="pb-2 pr-4">Incidents</th>
                  <th className="pb-2">Avg severity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sideEffectsByPeptide).map(([peptide, v]) => {
                  const avg = v.n ? v.severitySum / v.n : 0;
                  const sevLabel = avg < 1.5 ? "mild" : avg < 2.5 ? "moderate" : "severe";
                  const sevClass = avg < 1.5 ? "text-[#39ff14]" : avg < 2.5 ? "text-amber-400" : "text-red-400";
                  return (
                    <tr key={peptide} className="border-b border-[#00ffaa]/10 text-[#e0e0e5]">
                      <td className="py-2 pr-4">{peptide}</td>
                      <td className="py-2 pr-4">{v.count}</td>
                      <td className={`py-2 ${sevClass}`}>{sevLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {sideEffectNamesFromTable.length > 0 ? (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sideEffectNamesFromTable.slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis type="number" stroke="#9a9aa3" tick={{ fontFamily: "monospace", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={70} stroke="#9a9aa3" tick={{ fontFamily: "monospace", fontSize: 9 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#39ff14" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {top3SideEffects.length > 0 && (
              <p className="mt-2 font-mono text-xs text-[#9a9aa3]">
                Top reported: <span className="text-amber-400">{top3SideEffects.join(", ")}</span>
              </p>
            )}
          </>
        ) : (
          <p className="font-mono text-xs text-[#9a9aa3]">No side effect data yet.</p>
        )}
      </div>

      {/* C) Would-Repeat Analysis */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#00ffaa] mb-4">
          C) Would-Repeat Analysis
        </h2>
        {reviews.length === 0 ? (
          <p className="font-mono text-xs text-[#9a9aa3]">No reviews yet.</p>
        ) : (
          <>
            <p className="font-mono text-xs text-[#9a9aa3] mb-4">
              You&apos;ve run <span className="text-[#00ffaa]">{reviews.length}</span> cycles. Would repeat:{" "}
              <span className="text-[#39ff14]">{wouldRepeatYes}</span> (
              {reviews.length ? Math.round((wouldRepeatYes / reviews.length) * 100) : 0}%)
            </p>
            {wouldRepeatPieData.length > 0 && (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={wouldRepeatPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label={(e) => `${e.name}: ${e.value}`}>
                      {wouldRepeatPieData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {peptidesWouldRunAgain.length > 0 && (
              <p className="mt-2 font-mono text-xs text-[#9a9aa3]">
                Peptides you&apos;d run again: <span className="text-[#39ff14]">{peptidesWouldRunAgain.join(", ")}</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* D) Correlation Insights */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#00ffaa] mb-4">
          D) Correlation Insights
        </h2>
        <ul className="space-y-2 font-mono text-xs text-[#e0e0e5]">
          <li>High-rated cycles (4–5): <span className="text-[#39ff14]">{sideEffectsHighRated}</span> side effect incidents. Low-rated (1–2): <span className="text-red-400">{sideEffectsLowRated}</span>.</li>
          <li>Cycles with achieved goals: avg effectiveness <span className="text-[#00ffaa]">{effectivenessWithAchieved.toFixed(1)}</span>/5. Others: <span className="text-[#9a9aa3]">{effectivenessWithoutAchieved.toFixed(1)}</span>/5.</li>
          {mostEffectivePeptide && (
            <li>Your most effective peptide: <span className="text-[#39ff14]">{mostEffectivePeptide.peptide}</span> (avg {mostEffectivePeptide.avg.toFixed(1)}/5).</li>
          )}
          {leastSideEffectPeptide && (
            <li>Least side-effect-prone: <span className="text-[#00ffff]">{leastSideEffectPeptide.peptide}</span> ({leastSideEffectPeptide.count} incidents).</li>
          )}
        </ul>
      </div>

      {/* E) Decision Helper */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#00ffaa] mb-4">
          E) Decision Helper
        </h2>
        {decisionData.length === 0 ? (
          <p className="font-mono text-xs text-[#9a9aa3]">Complete reviews to see recommendations.</p>
        ) : (
          <div className="space-y-2">
            {decisionData.map((d) => (
              <div key={d.peptide} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#00ffaa]/20 bg-black/20 px-3 py-2">
                <span className="font-mono text-sm text-[#f5f5f7]">{d.peptide}</span>
                <span className="font-mono text-[10px] text-[#9a9aa3]">
                  Last: {d.lastRating}/5 · Side effects: {d.sideEffectCount} · Repeat: {d.wouldRepeat}
                </span>
                <span className="font-mono text-sm">
                  {d.recommendation === "run" && <span className="text-[#39ff14]">✅ Run again</span>}
                  {d.recommendation === "caution" && <span className="text-amber-400">⚠️ Proceed with caution</span>}
                  {d.recommendation === "avoid" && <span className="text-red-400">❌ Avoid</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
