"use client";

import { useState, useEffect } from "react";
import { Syringe, CheckCircle2, Clock } from "lucide-react";
import { loadDoses, updateDoseStatus } from "@/lib/cycle-database";
import type { Dose, DoseStatus } from "@/lib/cycle-database";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function TodaysDosesWidget() {
  const [doses, setDoses] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const todayKey = toDateKey(today);
    
    loadDoses(today, today).then((allDoses) => {
      const todaysDoses = allDoses.filter(d => d.scheduledDate === todayKey);
      setDoses(todaysDoses);
      setLoading(false);
    });
  }, []);

  const toggleDoseStatus = async (dose: Dose) => {
    const newStatus: DoseStatus = dose.status === "logged" ? "scheduled" : "logged";
    
    // Optimistic update
    setDoses(prev => prev.map(d => 
      d.id === dose.id ? { ...d, status: newStatus } : d
    ));
    
    // Persist to database
    const result = await updateDoseStatus(dose.id, newStatus);
    if (!result.success) {
      // Revert on error
      setDoses(prev => prev.map(d => 
        d.id === dose.id ? { ...d, status: dose.status } : d
      ));
    }
  };

  const scheduledCount = doses.filter(d => d.status === "scheduled").length;
  const loggedCount = doses.filter(d => d.status === "logged").length;
  const totalCount = doses.length;

  if (loading) {
    return (
      <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 border-[#00ffaa]/30">
        <div className="led-card-top-right">
          <span className="led-dot led-amber animate-pulse" aria-hidden />
        </div>
        <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xD001</span>
        <p className="font-mono text-sm text-[#9a9aa3] mt-8">Loading doses...</p>
      </div>
    );
  }

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg">
      <div className="led-card-top-right">
        <span className={`led-dot ${scheduledCount > 0 ? "led-green" : "led-blue"}`} aria-hidden />
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xD001</span>

      <div className="flex items-center gap-2 mt-3">
        <Syringe className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Today's Doses
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
          {loggedCount}/{totalCount} LOGGED
        </span>
        {scheduledCount > 0 && (
          <span className="rounded border px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 border-amber-500/40 text-amber-400">
            {scheduledCount} PENDING
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
        {totalCount === 0 ? (
          <p className="font-mono text-xs text-[#9a9aa3]">No doses scheduled for today</p>
        ) : (
          doses.map((dose) => (
            <button
              key={dose.id}
              type="button"
              onClick={() => toggleDoseStatus(dose)}
              className={`w-full text-left rounded border p-3 font-mono text-xs transition-all ${
                dose.status === "logged"
                  ? "border-[#00ffaa]/40 bg-[#00ffaa]/10 text-[#00ffaa]"
                  : "border-[#9a9aa3]/30 bg-black/40 text-[#e0e0e5] hover:border-[#00ffaa]/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {dose.status === "logged" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00ffaa] shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#9a9aa3] shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold">{dose.timeLabel}</div>
                    <div className="text-[10px] text-[#9a9aa3]">
                      {dose.peptideName} - {dose.doseAmount}
                    </div>
                  </div>
                </div>
                <span className={`led-dot w-2 h-2 ${dose.status === "logged" ? "led-blue" : "led-green"}`} aria-hidden />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
