"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle, Clock, Plus } from "lucide-react";
import DoseLogger from "@/components/DoseLogger";

export interface TodayDose {
  id: string;
  scheduleId: string;
  cycleId: string;
  peptideName: string;
  scheduledTime: string; // 12-hour display
  scheduledAt: string; // ISO for comparison
  dosageAmount: string;
  dosageUnit: string;
  taken: boolean;
  logId?: string;
}

function formatTimeTo12h(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DoseTrackerWidget() {
  const [todayDoses, setTodayDoses] = useState<TodayDose[]>([]);
  const [nextDose, setNextDose] = useState<{ peptide: string; timeRemaining: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingFor, setLoggingFor] = useState<TodayDose | null>(null);

  const loadDoses = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const today = todayISO();

    // Load active cycles (we need cycle_id for schedules)
    const { data: cycles } = await supabase
      .from("cycles")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active");

    const cycleIds = (cycles || []).map((c) => c.id);
    if (cycleIds.length === 0) {
      setTodayDoses([]);
      setNextDose(null);
      setLoading(false);
      return;
    }

    // Load dose_schedules that are active (assume table: id, user_id or cycle_id, peptide_name, dosage_amount, dosage_unit, scheduled_time, active)
    const { data: schedules } = await supabase
      .from("dose_schedules")
      .select("id, cycle_id, peptide_name, dosage_amount, dosage_unit, scheduled_time")
      .in("cycle_id", cycleIds)
      .eq("active", true);

    if (!schedules || schedules.length === 0) {
      setTodayDoses([]);
      setNextDose(null);
      setLoading(false);
      return;
    }

    // Build today's scheduled slots: today + scheduled_time
    const slots: TodayDose[] = schedules.map((s) => {
      const [h = 0, m = 0] = (s.scheduled_time || "12:00").toString().split(":").map(Number);
      const scheduled = new Date(today);
      scheduled.setHours(h, m, 0, 0);
      const scheduledAt = scheduled.toISOString();
      const scheduledTime = formatTimeTo12h((s.scheduled_time || "12:00").toString());
      return {
        id: `${s.id}-${today}-${s.scheduled_time}`,
        scheduleId: s.id,
        cycleId: s.cycle_id,
        peptideName: s.peptide_name || "Peptide",
        scheduledTime,
        scheduledAt,
        dosageAmount: (s.dosage_amount ?? "").toString(),
        dosageUnit: (s.dosage_unit ?? "mcg").toString(),
        taken: false,
      };
    });

    // Sort by scheduled time
    slots.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    // Load dose_logs for today (scheduled_at or taken_at on today)
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: logs } = await supabase
      .from("dose_logs")
      .select("id, schedule_id, cycle_id, scheduled_at, taken_at, skipped")
      .eq("user_id", user.id)
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString());

    const logsByKey = new Map<string, { id: string }>();
    (logs || []).forEach((log) => {
      if (log.skipped) return;
      const key = log.schedule_id
        ? log.schedule_id
        : `${log.cycle_id}-${log.scheduled_at?.slice(0, 16)}`;
      logsByKey.set(key, { id: log.id });
    });

    const withStatus = slots.map((slot) => {
      const logBySchedule = logsByKey.get(slot.scheduleId);
      const logByTime = logsByKey.get(`${slot.cycleId}-${slot.scheduledAt.slice(0, 16)}`);
      const log = logBySchedule || logByTime;
      return {
        ...slot,
        taken: !!log,
        logId: log?.id,
      };
    });

    setTodayDoses(withStatus);

    // Next dose: first future slot not taken
    const now = Date.now();
    const next = withStatus.find((d) => !d.taken && new Date(d.scheduledAt).getTime() > now);
    if (next) {
      const diffMs = new Date(next.scheduledAt).getTime() - now;
      const diffHours = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      setNextDose({
        peptide: next.peptideName,
        timeRemaining: `${diffHours}h ${diffMins}m`,
      });
    } else {
      const pastUntaken = withStatus.find((d) => !d.taken);
      if (pastUntaken) {
        setNextDose({ peptide: pastUntaken.peptideName, timeRemaining: "Overdue" });
      } else {
        setNextDose(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDoses();
    const interval = setInterval(loadDoses, 60000);
    return () => clearInterval(interval);
  }, []);

  const takenCount = todayDoses.filter((d) => d.taken).length;
  const totalCount = todayDoses.length;
  const allComplete = totalCount > 0 && takenCount === totalCount;
  const hasSchedules = totalCount > 0;

  const handleLogComplete = () => {
    setLoggingFor(null);
    loadDoses();
  };

  return (
    <>
      <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
        <div className="led-card-top-right">
          <span
            className={`led-dot ${
              !hasSchedules ? "led-gray" : allComplete ? "led-green" : "led-amber"
            }`}
            aria-hidden="true"
          />
        </div>

        <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
          0xDOSE
        </span>

        <div className="flex items-center gap-2 mt-3">
          <Bell
            className={`w-4 h-4 shrink-0 ${
              !hasSchedules ? "text-[#9a9aa3]" : allComplete ? "text-[#00ffaa]" : "text-amber-500"
            }`}
          />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
          Dose Tracker
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${
              !hasSchedules
                ? "bg-[#9a9aa3]/20 border-[#9a9aa3]/40 text-[#9a9aa3]"
                : allComplete
                  ? "bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-500"
            }`}
          >
            {hasSchedules ? `${takenCount}/${totalCount} TODAY` : "NO SCHEDULE"}
          </span>
        </div>

        <div className="mt-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
            TODAY'S SCHEDULE
          </span>
          <div className="mt-2 space-y-2">
            {loading ? (
              <p className="text-xs text-[#9a9aa3] font-mono">Loading...</p>
            ) : !hasSchedules ? (
              <p className="text-xs text-[#9a9aa3] font-mono">No doses scheduled. Add a cycle with schedules.</p>
            ) : (
              todayDoses.map((dose) => (
                <div
                  key={dose.id}
                  className="flex items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {dose.taken ? (
                      <CheckCircle className="w-3 h-3 text-[#00ffaa] shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                    <span
                      className={
                        dose.taken ? "text-[#9a9aa3] line-through truncate" : "text-[#e0e0e5] truncate"
                      }
                    >
                      {dose.peptideName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[#9a9aa3]">{dose.scheduledTime}</span>
                    {!dose.taken && (
                      <button
                        type="button"
                        onClick={() => setLoggingFor(dose)}
                        className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/10 p-1 text-[#00ffaa] hover:bg-[#00ffaa]/20"
                        aria-label={`Log dose for ${dose.peptideName}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {hasSchedules && !allComplete && nextDose && (
          <div className="mt-4 pt-3 border-t border-[#00ffaa]/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
              NEXT DOSE
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-500">
                {nextDose.timeRemaining}
              </span>
              <span className="text-xs font-mono text-[#9a9aa3]">{nextDose.peptide}</span>
            </div>
          </div>
        )}

        {hasSchedules && allComplete && (
          <div className="mt-4 pt-3 border-t border-[#00ffaa]/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#00ffaa]" />
            <span className="text-xs font-mono text-[#00ffaa]">All doses complete for today!</span>
          </div>
        )}

        {hasSchedules && (
          <button
            type="button"
            onClick={() => {
              const first = todayDoses.find((d) => !d.taken);
              if (first) setLoggingFor(first);
            }}
            className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60 disabled:opacity-50"
            disabled={allComplete}
          >
            {allComplete ? "All complete" : "Mark dose as taken"}
          </button>
        )}
      </div>

      {loggingFor && (
        <DoseLogger
          scheduleId={loggingFor.scheduleId}
          cycleId={loggingFor.cycleId}
          peptideName={loggingFor.peptideName}
          scheduledDate={todayISO()}
          scheduledTime={loggingFor.scheduledTime}
          dosageAmount={loggingFor.dosageAmount}
          dosageUnit={loggingFor.dosageUnit}
          onComplete={handleLogComplete}
          onClose={() => setLoggingFor(null)}
        />
      )}
    </>
  );
}
