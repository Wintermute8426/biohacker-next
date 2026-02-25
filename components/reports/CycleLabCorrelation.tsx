"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface LabReport {
  id: string;
  test_date: string;
  lab_name: string;
  notes?: string;
  markers: LabMarker[];
}

interface LabMarker {
  marker_name: string;
  value: number;
  unit: string;
  category: string;
  is_flagged: boolean;
}

interface Cycle {
  id: string;
  hex_id: string;
  peptide_name: string;
  dose_amount: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface CorrelationData {
  labReport: LabReport;
  activeCycles: Cycle[];
  keyMarkerChanges: MarkerChange[];
}

interface MarkerChange {
  marker_name: string;
  current_value: number;
  previous_value?: number;
  change_percent?: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

export default function CycleLabCorrelation() {
  const [loading, setLoading] = useState(true);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);

  useEffect(() => {
    loadCorrelationData();
  }, []);

  const loadCorrelationData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load all lab reports with markers
    const { data: labReports } = await supabase
      .from("lab_reports")
      .select(`
        *,
        lab_markers (*)
      `)
      .eq("user_id", user.id)
      .order("test_date", { ascending: true });

    if (!labReports || labReports.length === 0) {
      setLoading(false);
      return;
    }

    // Load all cycles
    const { data: cycles } = await supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true });

    if (!cycles) {
      setLoading(false);
      return;
    }

    // Build correlations
const correlationData: CorrelationData[] = labReports.map((report, index) => {
      const reportDate = new Date(report.test_date);
      const threeMonthsBefore = new Date(reportDate);
      threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);

      // Find cycles active in the 3 months before this lab
      const activeCycles = cycles.filter((cycle: any) => {
        const cycleStart = new Date(cycle.start_date);
        const cycleEnd = new Date(cycle.end_date);
        
        // Cycle overlaps with 3-month window before lab
        return (
          (cycleStart <= reportDate && cycleEnd >= threeMonthsBefore) ||
          (cycleStart >= threeMonthsBefore && cycleStart <= reportDate)
        );
      });

      // Calculate key marker changes (compare to previous lab)
      const keyMarkerChanges: MarkerChange[] = [];
      if (index > 0 && report.lab_markers) {
        const previousReport = labReports[index - 1];
        const keyMarkers = ["Testosterone Total", "IGF-1", "CRP (High Sensitivity)", "HDL Cholesterol"];
        
        keyMarkers.forEach((markerName) => {
          const current = report.lab_markers.find((m: any) => m.marker_name === markerName);
          const previous = previousReport.lab_markers?.find((m: any) => m.marker_name === markerName);
          
          if (current && previous) {
            const changePercent = ((current.value - previous.value) / previous.value) * 100;
            const trend = Math.abs(changePercent) < 5 ? "stable" : 
                         changePercent > 0 ? "up" : "down";
            
            keyMarkerChanges.push({
              marker_name: current.marker_name,
              current_value: current.value,
              previous_value: previous.value,
              change_percent: changePercent,
              unit: current.unit,
              trend
            });
          }
        });
      }

      return {
        labReport: {
          ...report,
          markers: report.lab_markers || []
        },
        activeCycles: activeCycles.map((c: any) => ({
          id: c.id,
          hex_id: c.hex_id,
          peptide_name: c.peptide_name,
          dose_amount: c.dose_amount,
          start_date: c.start_date,
          end_date: c.end_date,
          status: c.status
        })),
        keyMarkerChanges
      };
    });

    setCorrelations(correlationData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neon-green font-mono">ANALYZING CORRELATIONS...</div>
      </div>
    );
  }

  if (correlations.length === 0) {
    return (
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#9a9aa3]/30 p-6">
        <p className="font-mono text-sm text-[#9a9aa3]">
          No lab reports found. Upload lab results to see cycle correlations.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {correlations.map((correlation) => (
        <div
          key={correlation.labReport.id}
          className="deck-panel deck-card-bg deck-border-thick relative rounded-xl border-[#00ffaa]/30 p-5"
        >
          {/* Lab Report Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#00ffaa]" />
                <h3 className="font-space-mono text-lg font-bold text-[#f5f5f7]">
                  {new Date(correlation.labReport.test_date).toLocaleDateString()}
                </h3>
              </div>
              <p className="mt-1 font-mono text-xs text-[#9a9aa3]">
                {correlation.labReport.lab_name || "Lab Report"} • {correlation.labReport.markers.length} markers
              </p>
            </div>
            <span className="led-dot led-green" aria-hidden />
          </div>

          {/* Active Cycles */}
          <div className="mb-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-2">
              Active Cycles (3 months prior)
            </h4>
            {correlation.activeCycles.length === 0 ? (
              <p className="font-mono text-xs text-[#9a9aa3]">No cycles active</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {correlation.activeCycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#00ffaa]">
                        {cycle.peptide_name}
                      </span>
                      <span className="font-mono text-[10px] text-[#22d3ee]">
                        {cycle.hex_id}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
                      {cycle.dose_amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Marker Changes */}
          {correlation.keyMarkerChanges.length > 0 && (
            <div>
              <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-2">
                Key Changes vs Previous Lab
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {correlation.keyMarkerChanges.map((change) => {
                  const Icon = change.trend === "up" ? TrendingUp : 
                              change.trend === "down" ? TrendingDown : Activity;
                  const trendColor = change.trend === "up" ? "text-[#00ffaa]" :
                                    change.trend === "down" ? "text-amber-400" : "text-[#9a9aa3]";
                  
                  return (
                    <div
                      key={change.marker_name}
                      className="rounded border border-white/10 bg-black/30 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#e0e0e5]">
                          {change.marker_name}
                        </span>
                        <Icon className={`h-4 w-4 ${trendColor}`} />
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-mono text-sm font-bold text-[#00ffaa]">
                          {change.current_value} {change.unit}
                        </span>
                        {change.change_percent !== undefined && (
                          <span className={`font-mono text-[10px] ${trendColor}`}>
                            {change.change_percent > 0 ? "+" : ""}
                            {change.change_percent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {change.previous_value !== undefined && (
                        <p className="mt-0.5 font-mono text-[10px] text-[#9a9aa3]">
                          Previous: {change.previous_value} {change.unit}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
