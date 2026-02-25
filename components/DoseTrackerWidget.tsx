"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle, Clock } from "lucide-react";

interface Dose {
  peptide: string;
  time: string;
  taken: boolean;
}

export default function DoseTrackerWidget() {
  const [todayDoses, setTodayDoses] = useState<Dose[]>([]);
  const [nextDose, setNextDose] = useState<{peptide: string; timeRemaining: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoses();
    const interval = setInterval(loadDoses, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadDoses = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Placeholder data - replace with actual dose scheduling logic
    const mockDoses = [
      { peptide: "BPC-157", time: "8:00 AM", taken: true },
      { peptide: "BPC-157", time: "8:00 PM", taken: false }
    ];

    setTodayDoses(mockDoses);

    // Calculate next dose
    const now = new Date();
    const nextDoseTime = new Date(now.getTime() + 6 * 3600000); // 6 hours from now
    const diffMs = nextDoseTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    setNextDose({
      peptide: "BPC-157",
      timeRemaining: `${diffHours}h ${diffMins}m`
    });

    setLoading(false);
  };

  const takenCount = todayDoses.filter(d => d.taken).length;
  const totalCount = todayDoses.length;
  const allComplete = takenCount === totalCount;

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className={`led-dot ${allComplete ? 'led-green' : 'led-amber'}`} aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xDOSE
      </span>

      <div className="flex items-center gap-2 mt-3">
        <Bell className={`w-4 h-4 ${allComplete ? 'text-[#00ffaa]' : 'text-amber-500'} shrink-0`} />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Dose Tracker
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${
          allComplete 
            ? 'bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]'
            : 'bg-amber-500/20 border-amber-500/40 text-amber-500'
        }`}>
          {takenCount}/{totalCount} TODAY
        </span>
      </div>

      {/* Today's Doses */}
      <div className="mt-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
          TODAY'S SCHEDULE
        </span>
        <div className="mt-2 space-y-2">
          {loading ? (
            <p className="text-xs text-[#9a9aa3] font-mono">Loading...</p>
          ) : todayDoses.length === 0 ? (
            <p className="text-xs text-[#9a9aa3] font-mono">No doses scheduled</p>
          ) : (
            todayDoses.map((dose, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  {dose.taken ? (
                    <CheckCircle className="w-3 h-3 text-[#00ffaa]" />
                  ) : (
                    <Clock className="w-3 h-3 text-amber-500" />
                  )}
                  <span className={dose.taken ? 'text-[#9a9aa3] line-through' : 'text-[#e0e0e5]'}>
                    {dose.peptide}
                  </span>
                </div>
                <span className="text-[#9a9aa3]">{dose.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Next Dose Countdown */}
      {!allComplete && nextDose && (
        <div className="mt-4 pt-3 border-t border-[#00ffaa]/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
            NEXT DOSE
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-500">{nextDose.timeRemaining}</span>
            <span className="text-xs font-mono text-[#9a9aa3]">{nextDose.peptide}</span>
          </div>
        </div>
      )}

      {allComplete && (
        <div className="mt-4 pt-3 border-t border-[#00ffaa]/20 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00ffaa]" />
          <span className="text-xs font-mono text-[#00ffaa]">All doses complete for today!</span>
        </div>
      )}

      <button className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60">
        Mark dose as taken
      </button>
    </div>
  );
}
