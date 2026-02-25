"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, Scale, Activity } from "lucide-react";

interface WeightLog {
  weight: number;
  body_fat_percentage: number | null;
  logged_at: string;
}

interface ChartData {
  date: string;
  weight: number;
  bodyFat: number | null;
}

export default function BodyCompositionReport() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [stats, setStats] = useState({
    avgWeight: 0,
    avgBodyFat: 0,
    weightChange: 0,
    bodyFatChange: 0,
    lowestWeight: 0,
    highestWeight: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeightLogs();
  }, []);

  const loadWeightLogs = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("weight_logs")
      .select("weight, body_fat_percentage, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true });

    if (data && data.length > 0) {
      setLogs(data);

      // Prepare chart data
      const chartData = data.map(log => ({
        date: new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: log.weight,
        bodyFat: log.body_fat_percentage
      }));
      setChartData(chartData);

      // Calculate stats
      const weights = data.map(l => l.weight);
      const bodyFats = data.filter(l => l.body_fat_percentage !== null).map(l => l.body_fat_percentage!);

      setStats({
        avgWeight: weights.reduce((a, b) => a + b, 0) / weights.length,
        avgBodyFat: bodyFats.length > 0 ? bodyFats.reduce((a, b) => a + b, 0) / bodyFats.length : 0,
        weightChange: data[data.length - 1].weight - data[0].weight,
        bodyFatChange: bodyFats.length >= 2 ? bodyFats[bodyFats.length - 1] - bodyFats[0] : 0,
        lowestWeight: Math.min(...weights),
        highestWeight: Math.max(...weights)
      });
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-[#9a9aa3] font-mono text-sm">Loading body composition data...</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="deck-card-bg deck-border-thick rounded-xl p-8 text-center">
        <Scale className="w-12 h-12 text-[#9a9aa3] mx-auto mb-4" />
        <p className="font-mono text-sm text-[#9a9aa3]">No weight data yet. Start logging to see trends!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="deck-card-bg deck-border-thick rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-[#00ffaa]" />
            <h4 className="font-mono text-xs text-[#9a9aa3] uppercase">Avg Weight</h4>
          </div>
          <p className="font-mono text-2xl font-bold text-[#f5f5f7]">{stats.avgWeight.toFixed(1)}</p>
          <p className="font-mono text-xs text-[#9a9aa3]">lbs</p>
        </div>

        <div className="deck-card-bg deck-border-thick rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-[#00d9ff]" />
            <h4 className="font-mono text-xs text-[#9a9aa3] uppercase">Avg Body Fat</h4>
          </div>
          <p className="font-mono text-2xl font-bold text-[#f5f5f7]">
            {stats.avgBodyFat > 0 ? stats.avgBodyFat.toFixed(1) : "N/A"}
          </p>
          <p className="font-mono text-xs text-[#9a9aa3]">{stats.avgBodyFat > 0 ? "%" : ""}</p>
        </div>

        <div className="deck-card-bg deck-border-thick rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {stats.weightChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-amber-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#00ffaa]" />
            )}
            <h4 className="font-mono text-xs text-[#9a9aa3] uppercase">Weight Change</h4>
          </div>
          <p className={`font-mono text-2xl font-bold ${stats.weightChange > 0 ? 'text-amber-500' : 'text-[#00ffaa]'}`}>
            {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)}
          </p>
          <p className="font-mono text-xs text-[#9a9aa3]">lbs</p>
        </div>

        <div className="deck-card-bg deck-border-thick rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {stats.bodyFatChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-amber-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#00ffaa]" />
            )}
            <h4 className="font-mono text-xs text-[#9a9aa3] uppercase">BF% Change</h4>
          </div>
          <p className={`font-mono text-2xl font-bold ${stats.bodyFatChange > 0 ? 'text-amber-500' : 'text-[#00ffaa]'}`}>
            {stats.bodyFatChange !== 0 ? `${stats.bodyFatChange > 0 ? '+' : ''}${stats.bodyFatChange.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="font-mono text-xs text-[#9a9aa3]">{stats.bodyFatChange !== 0 ? 'change' : ''}</p>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="deck-card-bg deck-border-thick rounded-xl p-6">
        <h3 className="font-mono text-lg font-bold text-[#f5f5f7] mb-4">Weight Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ffaa20" />
            <XAxis dataKey="date" stroke="#9a9aa3" style={{ fontSize: "12px", fontFamily: "monospace" }} />
            <YAxis stroke="#9a9aa3" style={{ fontSize: "12px", fontFamily: "monospace" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1f2e",
                border: "1px solid #00ffaa40",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px"
              }}
            />
            <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }} />
            <Line type="monotone" dataKey="weight" stroke="#00ffaa" strokeWidth={2} name="Weight (lbs)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Body Fat Chart */}
      {stats.avgBodyFat > 0 && (
        <div className="deck-card-bg deck-border-thick rounded-xl p-6">
          <h3 className="font-mono text-lg font-bold text-[#f5f5f7] mb-4">Body Fat % Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00d9ff20" />
              <XAxis dataKey="date" stroke="#9a9aa3" style={{ fontSize: "12px", fontFamily: "monospace" }} />
              <YAxis stroke="#9a9aa3" style={{ fontSize: "12px", fontFamily: "monospace" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1f2e",
                  border: "1px solid #00d9ff40",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px"
                }}
              />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "12px" }} />
              <Line type="monotone" dataKey="bodyFat" stroke="#00d9ff" strokeWidth={2} name="Body Fat %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Range Info */}
      <div className="deck-card-bg deck-border-thick rounded-xl p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-mono text-xs text-[#9a9aa3] uppercase mb-2">Weight Range</h4>
            <p className="font-mono text-sm text-[#e0e0e5]">
              <span className="text-[#00ffaa] font-bold">{stats.lowestWeight.toFixed(1)}</span>
              {" - "}
              <span className="text-amber-500 font-bold">{stats.highestWeight.toFixed(1)}</span>
              {" lbs"}
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs text-[#9a9aa3] uppercase mb-2">Total Logs</h4>
            <p className="font-mono text-sm text-[#e0e0e5]">
              <span className="text-[#00ffaa] font-bold">{logs.length}</span> measurements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
