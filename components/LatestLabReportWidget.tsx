"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface LabReport {
  id: string;
  test_date: string;
  lab_name: string;
  marker_count: number;
  flagged_count: number;
}

export default function LatestLabReportWidget() {
  const [latestReport, setLatestReport] = useState<LabReport | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLatestReport();
  }, []);

  const loadLatestReport = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: reports } = await supabase
      .from("lab_reports")
      .select("id, test_date, lab_name")
      .eq("user_id", user.id)
      .order("test_date", { ascending: false })
      .limit(1);

    if (reports && reports.length > 0) {
      const report = reports[0];

      const { data: markers } = await supabase
        .from("lab_markers")
        .select("id, is_flagged")
        .eq("report_id", report.id);

      const markerCount = markers?.length || 0;
      const flaggedCount = markers?.filter(m => m.is_flagged).length || 0;

      setLatestReport({
        ...report,
        marker_count: markerCount,
        flagged_count: flaggedCount
      });
    }

    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const daysSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / 86400000);
  };

  const flaggedCount = latestReport?.flagged_count || 0;

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className={`led-dot ${flaggedCount > 0 ? 'led-amber' : 'led-green'}`} aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xLAB1
      </span>

      <div className="flex items-center gap-2 mt-3">
        <FileText className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Latest Lab Report
      </h3>

      {loading ? (
        <p className="mt-3 text-xs text-[#9a9aa3] font-mono">Loading...</p>
      ) : !latestReport ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded border border-[#9a9aa3]/30 bg-[#9a9aa3]/10 px-2 py-0.5 text-[10px] font-mono text-[#9a9aa3]">
              NO DATA
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-[#9a9aa3] font-mono">No lab reports uploaded yet</p>
          </div>
        </>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
              {latestReport.marker_count} MARKERS
            </span>
            {flaggedCount > 0 && (
              <span className="rounded border px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 border-amber-500/40 text-amber-500">
                {flaggedCount} FLAGGED
              </span>
            )}
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
              TEST INFO
            </span>
            <ul className="mt-1 list-inside list-disc text-xs text-[#e0e0e5] font-mono">
              <li>{latestReport.lab_name || "Lab report"}</li>
              <li>{formatDate(latestReport.test_date)}</li>
              <li>{daysSince(latestReport.test_date)}d ago</li>
            </ul>
          </div>

          {flaggedCount > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded border border-amber-500/40 bg-amber-500/10 p-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-amber-500">
                {flaggedCount} marker{flaggedCount !== 1 ? 's' : ''} outside normal range
              </p>
            </div>
          )}
        </>
      )}

      <button
        onClick={() => router.push("/app/labs")}
        className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60"
      >
        {latestReport ? "View full report" : "Upload first lab"}
      </button>
    </div>
  );
}
