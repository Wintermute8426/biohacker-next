"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MiniHealthTrends() {
  const [weightTrend, setWeightTrend] = useState<"up" | "down" | "stable">("stable");
  const [weightChange, setWeightChange] = useState<string>("0.0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: weights } = await supabase
      .from("weight_logs")
      .select("weight, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(2);

    if (weights && weights.length >= 2) {
      const current = weights[0].weight;
      const previous = weights[1].weight;
      const change = current - previous;

      setWeightChange(Math.abs(change).toFixed(1));
      if (change > 0.5) setWeightTrend("up");
      else if (change < -0.5) setWeightTrend("down");
      else setWeightTrend("stable");
    }

    setLoading(false);
  };

  const getTrendIcon = () => {
    if (weightTrend === "up") return <TrendingUp className="w-4 h-4 text-amber-500" />;
    if (weightTrend === "down") return <TrendingDown className="w-4 h-4 text-[#00ffaa]" />;
    return <Minus className="w-4 h-4 text-[#9a9aa3]" />;
  };

  const getTrendText = () => {
    if (weightTrend === "up") return `+${weightChange} lbs`;
    if (weightTrend === "down") return `-${weightChange} lbs`;
    return "No change";
  };

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className="led-dot led-green" aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xTRND
      </span>

      <div className="flex items-center gap-2 mt-3">
        {getTrendIcon()}
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Health Trends
      </h3>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#9a9aa3]">Weight (7d)</span>
          <span className="text-xs font-mono font-bold text-[#e0e0e5]">{getTrendText()}</span>
        </div>

        {/* Mini sparkline placeholder */}
        <div className="h-12 rounded bg-black/30 border border-[#00ffaa]/20 flex items-end justify-around p-1">
          {[40, 55, 50, 60, 45, 65, 58].map((h, i) => (
            <div key={i} className="w-1 bg-[#00ffaa]/60 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] font-mono text-[#9a9aa3]">
        Based on recent measurements
      </p>
    </div>
  );
}
