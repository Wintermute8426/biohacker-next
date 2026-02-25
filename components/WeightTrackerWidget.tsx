"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Scale, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WeightTrackerWidget() {
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [latestBodyFat, setLatestBodyFat] = useState<number | null>(null);
  const [daysSinceUpdate, setDaysSinceUpdate] = useState<number>(0);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLatestWeight();
  }, []);

  const loadLatestWeight = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: weights } = await supabase
      .from("weight_logs")
      .select("weight, body_fat_percentage, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(2);

    if (weights && weights.length > 0) {
      setLatestWeight(weights[0].weight);
      setLatestBodyFat(weights[0].body_fat_percentage);

      const lastLog = new Date(weights[0].logged_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastLog.getTime()) / 86400000);
      setDaysSinceUpdate(diffDays);

      if (weights.length >= 2) {
        const change = weights[0].weight - weights[1].weight;
        if (change > 0.5) setTrend("up");
        else if (change < -0.5) setTrend("down");
        else setTrend("stable");
      }
    }

    setLoading(false);
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-amber-500" />;
    if (trend === "down") return <TrendingDown className="w-3 h-3 text-[#00ffaa]" />;
    return null;
  };

  const showPrompt = daysSinceUpdate >= 3;

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className={`led-dot ${showPrompt ? 'led-amber' : 'led-green'}`} aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xWT01
      </span>

      <div className="flex items-center gap-2 mt-3">
        <Scale className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Weight Tracker
      </h3>

      {showPrompt && (
        <div className="mt-3 flex items-start gap-2 rounded border border-amber-500/40 bg-amber-500/10 p-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-amber-500">
            {daysSinceUpdate} days since last update. Log your weight!
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {latestWeight ? (
          <>
            <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
              {latestWeight} LBS
            </span>
            {latestBodyFat && (
              <span className="rounded border border-[#00d9ff]/30 bg-[#00d9ff]/10 px-2 py-0.5 text-[10px] font-mono text-[#00d9ff]">
                {latestBodyFat}% BF
              </span>
            )}
            {getTrendIcon()}
          </>
        ) : (
          <span className="rounded border border-[#9a9aa3]/30 bg-[#9a9aa3]/10 px-2 py-0.5 text-[10px] font-mono text-[#9a9aa3]">
            NO DATA
          </span>
        )}
      </div>

      {/* Mini trend sparkline */}
      {latestWeight && (
        <div className="mt-3 h-8 rounded bg-black/30 border border-[#00ffaa]/20 flex items-end justify-around p-1">
          {[45, 52, 48, 60, 55, 65, 58].map((h, i) => (
            <div key={i} className="w-1 bg-[#00ffaa]/60 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      )}

      <div className="mt-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
          {latestWeight ? "LAST UPDATE" : "STATUS"}
        </span>
        <ul className="mt-1 list-inside list-disc text-xs text-[#e0e0e5] font-mono">
          {latestWeight ? (
            <>
              <li>{daysSinceUpdate === 0 ? "Today" : `${daysSinceUpdate}d ago`}</li>
              <li>Track trend weekly</li>
            </>
          ) : (
            <li>No weight logs yet</li>
          )}
        </ul>
      </div>

      <button
        onClick={() => router.push("/app/weight-log")}
        className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60"
      >
        {latestWeight ? "Update weight" : "Log first weight"}
      </button>
    </div>
  );
}
