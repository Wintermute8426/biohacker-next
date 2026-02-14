"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Download, Star } from "lucide-react";

interface CycleReview {
  id: string;
  cycle_id: string;
  peptide_name: string;
  effectiveness_rating: number;
  side_effects: string[];
  side_effects_notes: string | null;
  would_repeat: "yes" | "no" | "maybe";
  notes: string | null;
  completed_at: string;
}

export default function ReportingPage() {
  const [reviews, setReviews] = useState<CycleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cycle_reviews")
      .select("*")
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Peptide",
      "Effectiveness",
      "Side Effects",
      "Would Repeat",
      "Notes",
    ];

    const rows = reviews.map((review) => [
      new Date(review.completed_at).toLocaleDateString(),
      review.peptide_name,
      review.effectiveness_rating,
      review.side_effects.join("; "),
      review.would_repeat.toUpperCase(),
      review.notes || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `biohacker-reviews-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
        <div className="scanline-layer-thin" aria-hidden="true"></div>
        <div className="scanline-layer-thick" aria-hidden="true"></div>
        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-[#00ff41] font-mono text-lg animate-pulse">
            {'>'} LOADING REVIEW DATA...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      {/* Scanline effects */}
      <div className="scanline-layer-thin" aria-hidden="true"></div>
      <div className="scanline-layer-thick" aria-hidden="true"></div>

      {/* Main content */}
      <div className="relative z-10 space-y-6">
        {/* Header section with status light */}
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden="true"></div>
          <div className="deck-bracket-bottom-right" aria-hidden="true"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="font-space-mono text-2xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-3xl">
                CYCLE REVIEWS | REPORTING:
              </h1>
              {/* Large PC-style power LED */}
              <div className="relative flex items-center justify-center -translate-y-1 ml-2">
                <div className="absolute w-12 h-12 rounded-full bg-[#00ff41] opacity-30 blur-xl animate-pulse"></div>
                <div className="absolute w-9 h-9 rounded-full bg-[#00ff41] opacity-50 blur-md"></div>
                <div className="relative w-8 h-8 rounded-full bg-black border-[3px] border-gray-700 shadow-inner flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-[#00ff41] shadow-[0_0_16px_#00ff41,inset_0_1px_3px_rgba(255,255,255,0.3)] animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Export Button */}
            {reviews.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border border-[#00ff41]/40 bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 hover:border-[#00ff41]/60 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]"
              >
                <Download className="w-4 h-4" />
                EXPORT CSV
              </button>
            )}
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3e5]">
            <span>REVIEW.VER: 1.0</span>
            <span>●</span>
            <span>{reviews.length} TOTAL REVIEWS</span>
          </div>
          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden="true">
            0xRPT1
          </span>
        </div>

        {/* Stats Summary Grid */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Reviews */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
              <div className="led-card-top-right">
                <span className="led-dot led-green" aria-hidden="true"></span>
              </div>
              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xR001
              </span>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                    TOTAL REVIEWS
                  </div>
                  <div className="font-space-mono text-4xl font-bold text-[#00ff41]">
                    {reviews.length}
                  </div>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/30">
                  <FileText className="w-8 h-8 text-[#00ff41]" />
                </div>
              </div>
            </div>

            {/* Avg Effectiveness */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#22d3e5]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "100ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-blue" aria-hidden="true"></span>
              </div>
              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xR002
              </span>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                    AVG EFFECTIVENESS
                  </div>
                  <div className="font-space-mono text-4xl font-bold text-[#22d3e5]">
                    {(
                      reviews.reduce((sum, r) => sum + r.effectiveness_rating, 0) /
                      reviews.length
                    ).toFixed(1)}
                    <span className="text-2xl text-gray-400">/5</span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#22d3e5]/10 border border-[#22d3e5]/30">
                  <Star className="w-8 h-8 text-[#22d3e5] fill-[#22d3e5]" />
                </div>
              </div>
            </div>

            {/* Would Repeat */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ff41]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "200ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-green" aria-hidden="true"></span>
              </div>
              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xR003
              </span>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                    WOULD REPEAT
                  </div>
                  <div className="font-space-mono text-4xl font-bold text-[#00ff41]">
                    {Math.round(
                      (reviews.filter((r) => r.would_repeat === "yes").length /
                        reviews.length) *
                        100
                    )}
                    <span className="text-2xl text-gray-400">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#00ff41]/10 border border-[#00ff41]/30">
                  <div className="text-4xl">✓</div>
                </div>
              </div>
            </div>

            {/* Side Effects */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#ffaa00]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "300ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-orange" aria-hidden="true"></span>
              </div>
              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xR004
              </span>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">
                    SIDE EFFECTS
                  </div>
                  <div className="font-space-mono text-4xl font-bold text-[#ffaa00]">
                    {reviews.reduce((sum, r) => sum + r.side_effects.length, 0)}
                  </div>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-[#ffaa00]/10 border border-[#ffaa00]/30">
                  <div className="text-4xl">⚠</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="deck-card-bg deck-border-thick rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-50" />
            <p className="text-gray-400 font-mono text-lg">
              {'>'} No cycle reviews yet. Complete a cycle to submit your first review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                className="group deck-card-bg deck-border-thick relative rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-[#00ff41]/40 hover:shadow-lg animate-fade-in"
                style={{animationDelay: `${idx * 50}ms`}}
              >
                <div className="led-card-top-right">
                  <span className={`led-dot ${
                    review.would_repeat === "yes" ? "led-green" :
                    review.would_repeat === "maybe" ? "led-orange" :
                    "led-red"
                  }`} aria-hidden="true"></span>
                </div>
                <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                  {`0xRV${(idx + 1).toString(16).toUpperCase().padStart(2, '0')}`}
                </span>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 mt-2">
                  <div>
                    <div className="text-[#00ff41] font-mono font-bold text-xl mb-1">
                      {review.peptide_name}
                    </div>
                    <div className="text-gray-400 text-sm font-mono">
                      {new Date(review.completed_at).toLocaleDateString()} at{" "}
                      {new Date(review.completed_at).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Effectiveness Stars */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= review.effectiveness_rating
                            ? "fill-[#00ff41] text-[#00ff41]"
                            : "text-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Would Repeat */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    WOULD REPEAT:
                  </span>
                  <span
                    className={`px-3 py-1 rounded font-mono font-bold text-sm border ${
                      review.would_repeat === "yes"
                        ? "text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/30"
                        : review.would_repeat === "maybe"
                        ? "text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/30"
                        : "text-red-500 bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    {review.would_repeat.toUpperCase()}
                  </span>
                </div>

                {/* Side Effects */}
                {review.side_effects.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      SIDE EFFECTS:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {review.side_effects.map((effect) => (
                        <span
                          key={effect}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono rounded"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                    {review.side_effects_notes && (
                      <p className="text-sm text-gray-300 mt-3 font-mono leading-relaxed">
                        {review.side_effects_notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {review.notes && (
                  <div>
                    <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                      NOTES:
                    </div>
                    <p className="text-sm text-gray-300 font-mono leading-relaxed">
                      {review.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
