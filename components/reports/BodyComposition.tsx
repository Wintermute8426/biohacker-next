"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface WeightLog {
  date: string;
  weight: number;
  body_fat_percent?: number;
}

export default function BodyComposition() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<WeightLog[]>([]);

  useEffect(() => {
    loadBodyData();
  }, []);

  const loadBodyData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (data) {
      setLogs(data.map((log: any) => ({
        date: new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: log.weight,
        body_fat_percent: log.body_fat_percent
      })));
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neon-green font-mono">LOADING BODY DATA...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#9a9aa3]/30 p-6">
        <p className="font-mono text-sm text-[#9a9aa3]">
          No weight logs found. Use the dashboard weight tracker to start logging.
        </p>
      </div>
    );
  }

  const firstWeight = logs[0]?.weight;
  const lastWeight = logs[logs.length - 1]?.weight;
  const weightChange = lastWeight - firstWeight;
  const weightChangePercent = ((weightChange / firstWeight) * 100).toFixed(1);

  const firstBodyFat = logs.find((l) => l.body_fat_percent)?.body_fat_percent;
  const lastBodyFat = logs[logs.length - 1]?.body_fat_percent;
  const bodyFatChange = lastBodyFat && firstBodyFat ? lastBodyFat - firstBodyFat : null;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Current Weight</h4>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#00ffaa]">
              {lastWeight.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#9a9aa3]">lbs</span>
          </div>
        </div>

        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Weight Change</h4>
          <div className="flex items-center gap-2">
            {weightChange < 0 ? (
              <TrendingDown className="h-5 w-5 text-[#00ffaa]" />
            ) : (
              <TrendingUp className="h-5 w-5 text-amber-400" />
            )}
            <span className={`font-mono text-xl font-bold ${weightChange < 0 ? "text-[#00ffaa]" : "text-amber-400"}`}>
              {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} lbs
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
            {weightChangePercent}% change
          </p>
        </div>

        {lastBodyFat && (
          <>
            <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
              <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Body Fat %</h4>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#00ffaa]">
                  {lastBodyFat.toFixed(1)}
                </span>
                <span className="font-mono text-xs text-[#9a9aa3]">%</span>
              </div>
            </div>

            {bodyFatChange !== null && (
              <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
                <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Body Fat Change</h4>
                <div className="flex items-center gap-2">
                  {bodyFatChange < 0 ? (
                    <TrendingDown className="h-5 w-5 text-[#00ffaa]" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                  )}
                  <span className={`font-mono text-xl font-bold ${bodyFatChange < 0 ? "text-[#00ffaa]" : "text-amber-400"}`}>
                    {bodyFatChange > 0 ? "+" : ""}{bodyFatChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Weight Chart */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
          Weight Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#9a9aa3"
              style={{ fontSize: "10px", fontFamily: "monospace" }}
            />
            <YAxis
              stroke="#9a9aa3"
              style={{ fontSize: "10px", fontFamily: "monospace" }}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                border: "1px solid #00ffaa",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px"
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "monospace",
                fontSize: "10px"
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              name="Weight (lbs)"
              stroke="#00ffaa"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Body Fat Chart */}
      {logs.some((l) => l.body_fat_percent) && (
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
            Body Fat % Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs.filter((l) => l.body_fat_percent)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                stroke="#9a9aa3"
                style={{ fontSize: "10px", fontFamily: "monospace" }}
              />
              <YAxis
                stroke="#9a9aa3"
                style={{ fontSize: "10px", fontFamily: "monospace" }}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #00ffaa",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px"
                }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "monospace",
                  fontSize: "10px"
                }}
              />
              <Line
                type="monotone"
                dataKey="body_fat_percent"
                name="Body Fat %"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
