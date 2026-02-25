"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp } from "lucide-react";

interface Cycle {
  id: string;
  protocol_id: string;
  start_date: string;
  end_date: string;
  progress: number;
}

export default function ActiveCycleProgress() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveCycles();
  }, []);

  const loadActiveCycles = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("cycles")
      .select("id, protocol_id, start_date, end_date, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(3);

    const cyclesWithProgress = data?.map(cycle => {
      const start = new Date(cycle.start_date).getTime();
      const end = new Date(cycle.end_date).getTime();
      const now = Date.now();
      const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

      return {
        ...cycle,
        progress: Math.round(progress)
      };
    }) || [];

    setCycles(cyclesWithProgress);
    setLoading(false);
  };

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className="led-dot led-green" aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xPROG
      </span>

      <div className="flex items-center gap-2 mt-3">
        <TrendingUp className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Cycle Progress
      </h3>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-xs text-[#9a9aa3] font-mono">Loading...</p>
        ) : cycles.length === 0 ? (
          <p className="text-xs text-[#9a9aa3] font-mono">No active cycles</p>
        ) : (
          cycles.map(cycle => (
            <div key={cycle.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#e0e0e5] truncate">{cycle.protocol_id}</span>
                <span className="text-xs font-mono font-bold text-[#00ffaa]">{cycle.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/50 border border-[#00ffaa]/20 overflow-hidden">
                <div
                  className="h-full bg-[#00ffaa] transition-all duration-500"
                  style={{ width: `${cycle.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
