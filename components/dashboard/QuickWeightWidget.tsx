"use client";

import { useState } from "react";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface QuickWeightWidgetProps {
  lastWeight?: number;
  lastDate?: string;
  unitsPreference?: "imperial" | "metric";
}

export default function QuickWeightWidget({
  lastWeight,
  lastDate,
  unitsPreference = "imperial",
}: QuickWeightWidgetProps) {
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleQuickLog = async () => {
    if (!weight || isNaN(parseFloat(weight))) {
      setMessage("ERROR: INVALID WEIGHT");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.from("weight_logs").insert({
      weight_lbs: parseFloat(weight),
      logged_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(`ERROR: ${error.message}`);
      setLoading(false);
    } else {
      setMessage("✓ LOGGED");
      setWeight("");
      setLoading(false);
      // Refresh the page to update lastWeight
      router.refresh();
    }
  };

  const unitLabel = unitsPreference === "imperial" ? "lbs" : "kg";

  return (
    <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.1)]">
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-10" />

      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff41]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff41]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff41]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff41]" />

      {/* Hex ID */}
      <div className="absolute top-1 right-4 text-[#00ff41]/40 text-[10px] font-mono">
        [WT-LOG]
      </div>

      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-[#00ff41]" />
          <h3 className="text-sm font-mono font-bold text-[#00ff41]">
            WEIGHT LOG
          </h3>
          <div className="ml-auto w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
        </div>

        {/* Last weight display */}
        {lastWeight && (
          <div className="mb-3 p-2 bg-black/30 border border-[#00ff41]/20 rounded">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">LAST:</span>
              <span className="text-[#00ff41] font-mono font-bold">
                {lastWeight} {unitLabel}
              </span>
            </div>
            {lastDate && (
              <div className="text-[10px] text-gray-500 font-mono mt-1">
                {new Date(lastDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Quick log form */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={`Weight (${unitLabel})`}
              className="flex-1 bg-black/50 border border-[#00ff41]/30 rounded px-3 py-2 text-[#00ff41] font-mono text-sm placeholder-[#00ff41]/30 focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_8px_rgba(0,255,65,0.2)] transition-all"
            />
            <button
              onClick={handleQuickLog}
              disabled={loading || !weight}
              className="px-4 py-2 bg-[#00ff41]/20 hover:bg-[#00ff41]/30 border border-[#00ff41] text-[#00ff41] font-mono text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_8px_rgba(0,255,65,0.2)] hover:shadow-[0_0_12px_rgba(0,255,65,0.4)]"
            >
              {loading ? "..." : "LOG"}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`text-xs font-mono ${
                message.includes("ERROR") ? "text-[#ff0040]" : "text-[#00ff41]"
              }`}
            >
              {message}
            </div>
          )}

          {/* View full log link */}
          <a
            href="/app/weight-log"
            className="block text-center text-[#00d4ff] hover:text-[#00ff41] text-xs font-mono transition-colors"
          >
            VIEW FULL LOG →
          </a>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .bg-scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.1) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 3px
          );
        }
      `}</style>
    </div>
  );
}
