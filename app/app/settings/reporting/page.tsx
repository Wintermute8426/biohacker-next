"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Download, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

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
      <div className="p-6">
        <div className="text-center text-gray-400 font-mono">
          Loading reviews...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#00ff41] font-mono mb-2">
              CYCLE REVIEWS & REPORTING
            </h1>
            <p className="text-[#00d4ff] text-sm font-mono">
              {"> "}View and export your cycle feedback
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/app/reports/effectiveness"
              className="flex items-center gap-2 px-4 py-2 border border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff] rounded font-mono hover:bg-[#00d4ff]/20 transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              EFFECTIVENESS REPORT
            </Link>
            {reviews.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all"
              >
                <Download className="w-4 h-4" />
                EXPORT CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">
              TOTAL REVIEWS
            </div>
            <div className="text-3xl font-bold text-[#00ff41] font-mono">
              {reviews.length}
            </div>
          </div>

          <div className="border border-[#00d4ff]/30 bg-[#1a1f2e] rounded-lg p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">
              AVG EFFECTIVENESS
            </div>
            <div className="text-3xl font-bold text-[#00d4ff] font-mono">
              {(
                reviews.reduce((sum, r) => sum + r.effectiveness_rating, 0) /
                reviews.length
              ).toFixed(1)}
              /5
            </div>
          </div>

          <div className="border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">
              WOULD REPEAT
            </div>
            <div className="text-3xl font-bold text-[#00ff41] font-mono">
              {Math.round(
                (reviews.filter((r) => r.would_repeat === "yes").length /
                  reviews.length) *
                  100
              )}
              %
            </div>
          </div>

          <div className="border border-[#ffaa00]/30 bg-[#1a1f2e] rounded-lg p-4">
            <div className="text-xs font-mono text-gray-400 mb-1">
              REPORTED SIDE EFFECTS
            </div>
            <div className="text-3xl font-bold text-[#ffaa00] font-mono">
              {reviews.reduce((sum, r) => sum + r.side_effects.length, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 border border-gray-600/30 bg-[#1a1f2e] rounded-lg">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-mono">
            No cycle reviews yet. Complete a cycle to submit your first review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-600/30 bg-[#1a1f2e] rounded-lg p-6 hover:border-[#00ff41]/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[#00ff41] font-mono font-bold text-lg">
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
                      className={`w-5 h-5 ${
                        star <= review.effectiveness_rating
                          ? "fill-[#00ff41] text-[#00ff41]"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Would Repeat */}
              <div className="mb-3">
                <span className="text-xs font-mono text-gray-400 mr-2">
                  WOULD REPEAT:
                </span>
                <span
                  className={`font-mono font-bold ${
                    review.would_repeat === "yes"
                      ? "text-[#00ff41]"
                      : review.would_repeat === "maybe"
                      ? "text-[#ffaa00]"
                      : "text-red-500"
                  }`}
                >
                  {review.would_repeat.toUpperCase()}
                </span>
              </div>

              {/* Side Effects */}
              {review.side_effects.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-mono text-gray-400 mb-2">
                    SIDE EFFECTS:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {review.side_effects.map((effect) => (
                      <span
                        key={effect}
                        className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                  {review.side_effects_notes && (
                    <p className="text-sm text-gray-300 mt-2 font-mono">
                      {review.side_effects_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {review.notes && (
                <div>
                  <div className="text-xs font-mono text-gray-400 mb-1">
                    NOTES:
                  </div>
                  <p className="text-sm text-gray-300 font-mono">
                    {review.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
