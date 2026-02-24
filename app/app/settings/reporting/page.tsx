"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Activity,
  Calendar,
  Filter,
  Syringe,
  TrendingUp,
  ChevronDown,
  X,
} from "lucide-react";
import { subDays, parseISO, format, isWithinInterval } from "date-fns";

interface LabMarker {
  id?: string;
  marker_name: string;
  value: number;
  unit: string;
  reference_min?: number;
  reference_max?: number;
  category: string;
  is_flagged: boolean;
}

interface LabReport {
  id: string;
  test_date: string;
  lab_name?: string;
  file_url?: string;
  markers: LabMarker[];
}

interface Cycle {
  id: string;
  peptide_name: string;
  start_date: string;
  end_date: string;
  dose_amount?: string;
  frequency_type?: string;
  status: string;
}

interface ReportWithCycles extends LabReport {
  overlappingCycles: Cycle[];
}

const KEY_MARKERS = [
  "Testosterone",
  "Free Testosterone",
  "Estradiol",
  "Cortisol",
  "IGF-1",
  "Growth Hormone",
  "TSH",
  "Free T4",
  "Hemoglobin A1c",
  "Glucose",
  "LDL",
  "HDL",
  "Total Cholesterol",
];

function normalizeMarkerName(name: string): string {
  return name.toLowerCase().trim();
}

function markerMatchesFilter(markerName: string, filterNames: string[]): boolean {
  if (filterNames.length === 0) return true;
  const n = normalizeMarkerName(markerName);
  return filterNames.some((f) => normalizeMarkerName(f) === n);
}

export default function CycleToLabCorrelationPage() {
  const [reports, setReports] = useState<ReportWithCycles[]>([]);
  const [allCycles, setAllCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>([]);
  const [selectedPeptides, setSelectedPeptides] = useState<string[]>([]);
  const [showMarkerFilter, setShowMarkerFilter] = useState(false);
  const [showPeptideFilter, setShowPeptideFilter] = useState(false);

  const fetchData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: reportsData, error: reportsErr } = await supabase
        .from("lab_reports")
        .select(
          `
          *,
          lab_markers (*)
        `
        )
        .eq("user_id", user.id)
        .order("test_date", { ascending: false });

      if (reportsErr) throw reportsErr;

      const { data: cyclesData, error: cyclesErr } = await supabase
        .from("cycles")
        .select("id, peptide_name, start_date, end_date, dose_amount, frequency_type, status")
        .eq("user_id", user.id);

      if (cyclesErr) throw cyclesErr;

      const labReports: LabReport[] = (reportsData || []).map((r: any) => ({
        id: r.id,
        test_date: r.test_date,
        lab_name: r.lab_name,
        file_url: r.file_url,
        markers: r.lab_markers || [],
      }));

      setAllCycles(cyclesData || []);

      const windowDays = 90;
      const reportsWithCycles: ReportWithCycles[] = labReports.map((report) => {
        const testDate = parseISO(report.test_date);
        const windowStart = subDays(testDate, windowDays);
        const windowEnd = testDate;

        const overlapping = (cyclesData || []).filter((c: Cycle) => {
          const cycleStart = parseISO(c.start_date);
          const cycleEnd = parseISO(c.end_date);
          return (
            cycleEnd >= windowStart &&
            cycleStart <= windowEnd
          );
        });

        return {
          ...report,
          overlappingCycles: overlapping,
        };
      });

      setReports(reportsWithCycles);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allMarkerNames = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => r.markers.forEach((m) => set.add(m.marker_name)));
    return Array.from(set).sort();
  }, [reports]);

  const allPeptideNames = useMemo(() => {
    const set = new Set<string>();
    allCycles.forEach((c) => set.add(c.peptide_name));
    return Array.from(set).sort();
  }, [allCycles]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const testDate = parseISO(report.test_date);
      if (dateFrom && testDate < parseISO(dateFrom)) return false;
      if (dateTo && testDate > parseISO(dateTo)) return false;
      if (selectedPeptides.length > 0) {
        const reportPeptides = new Set(report.overlappingCycles.map((c) => c.peptide_name));
        const hasSelected = selectedPeptides.some((p) => reportPeptides.has(p));
        if (!hasSelected) return false;
      }
      return true;
    });
  }, [reports, dateFrom, dateTo, selectedPeptides]);

  const timelineRange = useMemo(() => {
    if (filteredReports.length === 0) return { min: new Date(), max: new Date() };
    const dates = filteredReports.map((r) => parseISO(r.test_date));
    return {
      min: new Date(Math.min(...dates.map((d) => d.getTime()))),
      max: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }, [filteredReports]);

  const getTimelineX = (d: Date) => {
    const total = timelineRange.max.getTime() - timelineRange.min.getTime();
    if (total <= 0) return 0;
    const pct = (d.getTime() - timelineRange.min.getTime()) / total;
    return Math.max(0, Math.min(100, pct * 100));
  };

  const toggleMarker = (name: string) => {
    setSelectedMarkers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const togglePeptide = (name: string) => {
    setSelectedPeptides((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center font-mono text-green-400 text-lg animate-pulse">
          {'>'} LOADING CYCLE–LAB CORRELATION...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <p className="font-mono text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold font-mono text-gray-300 uppercase tracking-wider">
            Cycle-to-Lab Correlation Report
          </h1>
        </div>
        <p className="text-sm font-mono text-gray-300/80">
          Lab reports with cycles active in the 90-day window before each test. Use filters to narrow by date, markers, or peptides.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-black/30 border border-green-500/20 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 font-mono text-green-400 text-sm">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded text-gray-100 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-300 mb-1">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded text-gray-100 font-mono text-sm"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-mono text-gray-300 mb-1">Markers</label>
            <button
              type="button"
              onClick={() => setShowMarkerFilter(!showMarkerFilter)}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded text-left text-gray-300 font-mono text-sm flex items-center justify-between"
            >
              <span>
                {selectedMarkers.length === 0
                  ? "All markers"
                  : `${selectedMarkers.length} selected`}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showMarkerFilter && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-black/90 border border-green-500/20 rounded z-10 p-2 space-y-1">
                {allMarkerNames.map((name) => (
                  <label
                    key={name}
                    className="flex items-center gap-2 cursor-pointer text-sm font-mono text-gray-300 hover:text-green-400"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMarkers.includes(name)}
                      onChange={() => toggleMarker(name)}
                      className="rounded border-green-500/50"
                    />
                    {name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs font-mono text-gray-300 mb-1">Peptides</label>
            <button
              type="button"
              onClick={() => setShowPeptideFilter(!showPeptideFilter)}
              className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded text-left text-gray-300 font-mono text-sm flex items-center justify-between"
            >
              <span>
                {selectedPeptides.length === 0
                  ? "All peptides"
                  : `${selectedPeptides.length} selected`}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showPeptideFilter && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-black/90 border border-green-500/20 rounded z-10 p-2 space-y-1">
                {allPeptideNames.map((name) => (
                  <label
                    key={name}
                    className="flex items-center gap-2 cursor-pointer text-sm font-mono text-gray-300 hover:text-green-400"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPeptides.includes(name)}
                      onChange={() => togglePeptide(name)}
                      className="rounded border-green-500/50"
                    />
                    {name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold font-mono text-gray-300 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" />
          Timeline ({filteredReports.length} reports)
        </h2>

        {/* Horizontal timeline strip */}
        {filteredReports.length > 0 && (
          <div className="bg-black/30 border border-green-500/20 rounded-lg p-4">
            <div className="text-[10px] font-mono text-gray-300 mb-2 flex justify-between">
              <span>{format(timelineRange.min, "MMM d, yyyy")}</span>
              <span>{format(timelineRange.max, "MMM d, yyyy")}</span>
            </div>
            <div className="relative h-8 rounded bg-black/50 border border-green-500/20">
              {filteredReports.map((report) => {
                const x = getTimelineX(parseISO(report.test_date));
                return (
                  <div
                    key={report.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-green-500 border border-green-400/50"
                    style={{ left: `${x}%`, transform: "translate(-50%, -50%)" }}
                    title={`${format(parseISO(report.test_date), "MMM d, yyyy")} · ${report.markers.length} markers`}
                  />
                );
              })}
            </div>
            <div className="mt-1 text-[10px] font-mono text-gray-300">
              Lab report dates (green ticks)
            </div>
          </div>
        )}

        {filteredReports.length === 0 ? (
          <div className="bg-black/30 border border-green-500/20 rounded-lg p-8 text-center font-mono text-gray-300">
            No lab reports in this range. Upload reports on the Labs page or adjust filters.
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-green-500/30" />

            <div className="space-y-6">
              {filteredReports.map((report) => {
                const displayMarkers =
                  selectedMarkers.length > 0
                    ? report.markers.filter((m) => markerMatchesFilter(m.marker_name, selectedMarkers))
                    : report.markers.filter((m) =>
                        KEY_MARKERS.some(
                          (k) => normalizeMarkerName(k) === normalizeMarkerName(m.marker_name)
                        )
                      );
                const fallbackMarkers =
                  displayMarkers.length > 0 ? displayMarkers : report.markers.slice(0, 6);

                return (
                  <div key={report.id} className="relative flex gap-4 pl-0">
                    {/* Date marker on line */}
                    <div className="flex-shrink-0 w-8 flex flex-col items-center pt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black/50" />
                      <span className="text-[10px] font-mono text-green-400 mt-1 whitespace-nowrap">
                        {format(parseISO(report.test_date), "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Report card */}
                    <div className="flex-1 min-w-0 bg-black/30 border border-green-500/20 rounded-lg p-4 hover:border-green-500/40 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-400" />
                          <span className="font-mono font-medium text-green-400">
                            {format(parseISO(report.test_date), "MMMM d, yyyy")}
                          </span>
                          {report.lab_name && (
                            <span className="text-xs font-mono text-gray-300/80">
                              · {report.lab_name}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-300">
                          {report.markers.length} markers
                        </span>
                      </div>

                      {/* Key markers */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                        {fallbackMarkers.map((marker) => (
                          <div
                            key={marker.marker_name}
                            className="border border-green-500/20 rounded px-2 py-1.5 bg-black/30"
                          >
                            <div className="text-[10px] font-mono text-gray-300 truncate">
                              {marker.marker_name}
                            </div>
                            <div
                              className={`text-sm font-mono font-medium ${
                                marker.is_flagged ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {marker.value} {marker.unit}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Overlapping cycles */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-300 mb-2">
                          <Syringe className="w-3.5 h-3.5" />
                          Cycles in 90-day window before test
                        </div>
                        {report.overlappingCycles.length === 0 ? (
                          <p className="text-xs font-mono text-gray-300/80">
                            No cycles in this window
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {report.overlappingCycles.map((cycle) => (
                              <div
                                key={cycle.id}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs"
                              >
                                <Syringe className="w-3 h-3" />
                                <span>{cycle.peptide_name}</span>
                                <span className="text-gray-300/80">
                                  {format(parseISO(cycle.start_date), "MMM d")} –{" "}
                                  {format(parseISO(cycle.end_date), "MMM d")}
                                </span>
                                {cycle.dose_amount && (
                                  <span className="text-gray-300/80">
                                    · {cycle.dose_amount}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
