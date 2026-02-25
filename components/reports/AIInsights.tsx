"use client";

import { useState } from "react";
import { Brain, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface AIInsight {
  type: "positive" | "neutral" | "caution";
  title: string;
  insight: string;
  recommendation?: string;
}

export default function AIInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-insights", {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-[#00ffaa]" />;
      case "caution":
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-[#22d3ee]" />;
    }
  };

  const getInsightBorderColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "positive":
        return "border-[#00ffaa]/40";
      case "caution":
        return "border-amber-400/40";
      default:
        return "border-[#22d3ee]/40";
    }
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      {insights.length === 0 && !loading && (
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-8 text-center">
          <Brain className="h-16 w-16 text-[#00ffaa] mx-auto mb-4" />
          <h3 className="font-space-mono text-xl font-bold text-[#f5f5f7] mb-2">
            AI-Powered Insights
          </h3>
          <p className="font-mono text-sm text-[#9a9aa3] mb-6 max-w-md mx-auto">
            Claude will analyze your cycles and lab data to identify patterns, correlations, and provide personalized recommendations.
          </p>
          <button
            onClick={generateInsights}
            className="rounded-lg border-2 border-[#00ffaa] bg-[#00ffaa]/10 px-6 py-3 font-mono text-sm font-semibold text-[#00ffaa] hover:bg-[#00ffaa]/20 transition-all shadow-[0_0_12px_rgba(0,255,170,0.3)]"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Insights
            </span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Brain className="h-12 w-12 text-[#00ffaa] animate-pulse" />
            <p className="font-mono text-sm text-[#00ffaa]">
              Analyzing your data with Claude...
            </p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[#00ffaa] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-amber-400/40 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-sm text-amber-400 font-semibold mb-1">
                Analysis Failed
              </p>
              <p className="font-mono text-xs text-[#9a9aa3]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa]">
              AI Analysis Results
            </h3>
            <button
              onClick={generateInsights}
              disabled={loading}
              className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 px-3 py-1.5 font-mono text-xs text-[#00ffaa] hover:bg-[#00ffaa]/10 disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`deck-panel deck-card-bg deck-border-thick rounded-xl p-4 border-2 ${getInsightBorderColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-mono text-sm font-semibold text-[#f5f5f7] mb-2">
                      {insight.title}
                    </h4>
                    <p className="font-mono text-xs text-[#e0e0e5] leading-relaxed mb-3">
                      {insight.insight}
                    </p>
                    {insight.recommendation && (
                      <div className="rounded border border-[#00ffaa]/20 bg-[#00ffaa]/5 px-3 py-2">
                        <p className="font-mono text-[10px] text-[#00ffaa]">
                          <span className="font-semibold">RECOMMENDATION:</span> {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
