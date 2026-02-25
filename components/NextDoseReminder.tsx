"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle } from "lucide-react";

export default function NextDoseReminder() {
  const [nextDose, setNextDose] = useState<{protocol: string; timeRemaining: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNextDose();
    const interval = setInterval(loadNextDose, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadNextDose = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // For now, show a placeholder - you can enhance this with actual dose scheduling
    const now = new Date();
    const nextDoseTime = new Date(now.getTime() + 6 * 3600000); // 6 hours from now
    const diffMs = nextDoseTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    setNextDose({
      protocol: "BPC-157",
      timeRemaining: `${diffHours}h ${diffMins}m`
    });
    setLoading(false);
  };

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className="led-dot led-amber" aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xDOSE
      </span>

      <div className="flex items-center gap-2 mt-3">
        <Bell className="w-4 h-4 text-amber-500 shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Next Dose
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded border px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 border-amber-500/40">
          UPCOMING
        </span>
      </div>

      {loading ? (
        <p className="mt-3 text-xs text-[#9a9aa3] font-mono">Loading...</p>
      ) : nextDose ? (
        <div className="mt-3">
          <p className="text-sm font-mono text-[#e0e0e5]">{nextDose.protocol}</p>
          <p className="text-2xl font-bold font-mono text-amber-500 mt-1">{nextDose.timeRemaining}</p>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00ffaa]" />
          <p className="text-xs text-[#00ffaa] font-mono">All doses complete</p>
        </div>
      )}

      <button className="mt-4 flex w-full items-center justify-center rounded-lg border-amber-500/40 bg-amber-500/5 px-4 py-2.5 font-mono text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/15 hover:border-amber-500/60">
        Mark as taken
      </button>
    </div>
  );
}
