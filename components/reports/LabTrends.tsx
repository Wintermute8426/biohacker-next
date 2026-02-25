"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface MarkerTrend {
  marker_name: string;
  unit: string;
  data: {
    date: string;
    value: number;
  }[];
}

const KEY_MARKERS = [
  "Testosterone Total",
  "IGF-1",
  "CRP (High Sensitivity)",
  "HDL Cholesterol",
  "Glucose",
  "HbA1c"
];

const MARKER_COLORS: Record<string, string> = {
  "Testosterone Total": "#00ffaa",
  "IGF-1": "#22d3ee",
  "CRP (High Sensitivity)": "#f59e0b",
  "HDL Cholesterol": "#10b981",
  "Glucose": "#8b5cf6",
  "HbA1c": "#ec4899"
};

export default function LabTrends() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<MarkerTrend[]>([]);
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>(["Testosterone Total", "IGF-1"]);

  useEffect(() => {
    loadTrendData();
  }, []);

  const loadTrendData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load all lab reports with markers
    const { data: labReports } = await supabase
      .from("lab_reports")
      .select(`
        test_date,
        lab_markers (marker_name, value, unit)
      `)
      .eq("user_id", user.id)
      .order("test_date", { ascending: true });

    if (!labReports) {
      setLoading(false);
      return;
    }

    // Build trend data for each key marker
    const trendData: MarkerTrend[] = KEY_MARKERS.map((markerName) => {
      const dataPoints = labReports
        .map((report: any) => {
          const marker = report.lab_markers?.find((m: any) => m.marker_name === markerName);
          if (!marker) return null;
          return {
            date: new Date(report.test_date).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric"
            }),
            value: marker.value
          };
        })
        .filter((d): d is { date: string; value: number } => d !== null);

      const unit = dataPoints.length > 0
        ? labReports
            .flatMap((r: any) => r.lab_markers || [])
            .find((m: any) => m.marker_name === markerName)?.unit || ""
        : "";

      return {
        marker_name: markerName,
        unit,
        data: dataPoints
      };
    }).filter((trend) => trend.data.length > 0);

    setTrends(trendData);
    setLoading(false);
  };

  const toggleMarker = (markerName: string) => {
    setSelectedMarkers((prev) =>
      prev.includes(markerName)
        ? prev.filter((m) => m !== markerName)
        : [...prev, markerName]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neon-green font-mono">LOADING TRENDS...</div>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#9a9aa3]/30 p-6">
        <p className="font-mono text-sm text-[#9a9aa3]">
          No lab data found. Upload multiple lab reports to see trends.
        </p>
      </div>
    );
  }

  // Combine data for multi-line chart
  const chartData = trends[0]?.data.map((_, index) => {
    const point: any = { date: trends[0].data[index].date };
    trends.forEach((trend) => {
      if (trend.data[index]) {
        point[trend.marker_name] = trend.data[index].value;
      }
    });
    return point;
  }) || [];

  return (
    <div className="space-y-4">
      {/* Marker Selection */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-3">
          Select Markers to Display
        </h3>
        <div className="flex flex-wrap gap-2">
          {trends.map((trend) => {
            const isSelected = selectedMarkers.includes(trend.marker_name);
            return (
              <button
                key={trend.marker_name}
                onClick={() => toggleMarker(trend.marker_name)}
                className={`rounded-lg border-2 px-3 py-1.5 font-mono text-xs transition-all ${
                  isSelected
                    ? "border-[#00ffaa] bg-[#00ffaa]/10 text-[#00ffaa]"
                    : "border-[#00ffaa]/20 bg-black/30 text-[#9a9aa3] hover:border-[#00ffaa]/40"
                }`}
              >
                {trend.marker_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
          Marker Trends Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#9a9aa3"
              style={{ fontSize: "10px", fontFamily: "monospace" }}
            />
            <YAxis
              stroke="#9a9aa3"
              style={{ fontSize: "10px", fontFamily: "monospace" }}
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
            {selectedMarkers.map((markerName) => (
              <Line
                key={markerName}
                type="monotone"
                dataKey={markerName}
                stroke={MARKER_COLORS[markerName] || "#00ffaa"}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {trends.filter((t) => selectedMarkers.includes(t.marker_name)).map((trend) => {
          const firstValue = trend.data[0]?.value;
          const lastValue = trend.data[trend.data.length - 1]?.value;
          const change = firstValue && lastValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;
          const isPositive = change > 0;

          return (
            <div
              key={trend.marker_name}
              className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4"
            >
              <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">{trend.marker_name}</h4>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#00ffaa]">
                  {lastValue?.toFixed(1)}
                </span>
                <span className="font-mono text-xs text-[#9a9aa3]">{trend.unit}</span>
              </div>
              <p className={`mt-1 font-mono text-xs ${isPositive ? "text-[#00ffaa]" : "text-amber-400"}`}>
                {isPositive ? "↗️" : "↘️"} {change.toFixed(1)}% vs baseline
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
