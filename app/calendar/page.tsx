"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { loadCycles, updateDoseStatus, loadDoses, deleteDose, deleteAllCycles } from "@/lib/cycle-database";
import type { Cycle, Dose, DoseStatus as DbDoseStatus } from "@/lib/cycle-database";
import GoogleCalendarSync from "@/components/GoogleCalendarSync";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const WEEKDAY_BY_DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type DoseStatus = "scheduled" | "logged" | "missed";

type ScheduledDose = {
  id: string;
  cycleId: string;
  peptideName: string;
  doseAmount: string;
  route: string;
  timeLabel: string;
  date: string;
  status: DoseStatus;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  return Math.ceil((diff + start.getDay() * 86400000) / 604800000);
}

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

const ROUTE_DEFAULT = "SubQ";

function getTimesForDaily(times: number): string[] {
  if (times <= 1) return ["08:00"];
  if (times === 2) return ["08:00", "20:00"];
  return ["06:00", "12:00", "20:00"];
}

function generateDosesFromCycles(
  cycles: Cycle[],
  startRange: Date,
  endRange: Date,
  existingDoses: Map<string, ScheduledDose[]>
): ScheduledDose[] {
  const doses: ScheduledDose[] = [];
  const todayKey = toDateKey(new Date());

  cycles.forEach((cycle) => {
    const start = cycle.startDate.getTime() > startRange.getTime() ? cycle.startDate : startRange;
    const end = cycle.endDate.getTime() < endRange.getTime() ? cycle.endDate : endRange;
    if (start.getTime() > end.getTime()) return;

    const freq = cycle.frequency;
    let d = new Date(start);
    d.setHours(0, 0, 0, 0);

    while (d.getTime() <= end.getTime()) {
      const key = toDateKey(d);
      const dayName = WEEKDAY_BY_DOW[d.getDay()];

      if (freq.type === "daily") {
        const times = getTimesForDaily(freq.times);
        times.forEach((time) => {
          const id = `${cycle.id}-${key}-${time}`;
          const existing = existingDoses.get(key)?.find((x) => x.id === id);
          const status: DoseStatus =
            existing?.status ??
            (key < todayKey ? (Math.random() > 0.2 ? "logged" : "missed") : key === todayKey && time === "08:00" && Math.random() > 0.5 ? "logged" : "scheduled");
          doses.push({
            id,
            cycleId: cycle.id,
            peptideName: cycle.peptideName,
            doseAmount: cycle.doseAmount,
            route: ROUTE_DEFAULT,
            timeLabel: time,
            date: key,
            status,
          });
        });
      } else if (freq.type === "weekly" && freq.days?.length) {
        if (freq.days.includes(dayName)) {
          const time = "08:00";
          const id = `${cycle.id}-${key}-${time}`;
          const existing = existingDoses.get(key)?.find((x) => x.id === id);
          const status: DoseStatus =
            existing?.status ?? (key < todayKey ? (Math.random() > 0.2 ? "logged" : "missed") : "scheduled");
          doses.push({
            id,
            cycleId: cycle.id,
            peptideName: cycle.peptideName,
            doseAmount: cycle.doseAmount,
            route: ROUTE_DEFAULT,
            timeLabel: time,
            date: key,
            status,
          });
        }
      } else if (freq.type === "monthly" && freq.dates?.length) {
        const dom = d.getDate();
        if (freq.dates.includes(dom)) {
          const time = "08:00";
          const id = `${cycle.id}-${key}-${time}`;
          const existing = existingDoses.get(key)?.find((x) => x.id === id);
          const status: DoseStatus =
            existing?.status ?? (key < todayKey ? (Math.random() > 0.2 ? "logged" : "missed") : "scheduled");
          doses.push({
            id,
            cycleId: cycle.id,
            peptideName: cycle.peptideName,
            doseAmount: cycle.doseAmount,
            route: ROUTE_DEFAULT,
            timeLabel: time,
            date: key,
            status,
          });
        }
      }

      d = addDays(d, 1);
    }
  });

  return doses;
}

function getCalendarGrid(year: number, month: number): { date: Date; day: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean }[] {
  const first = new Date(year, month, 1);
  const todayKey = toDateKey(new Date());
  const grid: { date: Date; day: number; isCurrentMonth: boolean; isToday: boolean; isPast: boolean }[] = [];
  const startDow = first.getDay();
  const startOffset = startDow === 0 ? 6 : startDow - 1;
  const totalCells = 42;
  for (let i = 0; i < totalCells; i++) {
    const d = addDays(new Date(year, month, 1), i - startOffset);
    const key = toDateKey(d);
    grid.push({
      date: d,
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
      isToday: key === todayKey,
      isPast: key < todayKey,
    });
  }
  return grid;
}

function cellHexId(date: Date): string {
  const y = date.getFullYear().toString(16).toUpperCase().slice(-2);
  const m = (date.getMonth() + 1).toString(16).toUpperCase().padStart(2, "0");
  const d = date.getDate().toString(16).toUpperCase().padStart(2, "0");
  return `0x${y}${m}${d}`;
}

export default function CalendarPage() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [doses, setDoses] = useState<ScheduledDose[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);

  const activeCycles = useMemo(
    () => cycles.filter((c) => c.status === "active" || c.status === "paused"),
    [cycles]
  );

  const rangeStart = useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);
  const rangeEnd = useMemo(() => new Date(viewYear, viewMonth + 2, 0), [viewYear, viewMonth]);

  useEffect(() => {
    loadCycles().then(setCycles);
  }, []);

  useEffect(() => {
    const onFocus = () => loadCycles().then(setCycles);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDoses(rangeStart, rangeEnd).then((dbDoses) => {
      const scheduledDoses: ScheduledDose[] = dbDoses.map((d) => ({
        id: d.id,
        cycleId: d.cycleId,
        peptideName: d.peptideName,
        doseAmount: d.doseAmount,
        route: d.route,
        timeLabel: d.timeLabel,
        date: d.scheduledDate,
        status: d.status as DoseStatus,
      }));
      setDoses(scheduledDoses);
      setLoading(false);
    });
  }, [viewYear, viewMonth, rangeStart, rangeEnd]);

  const dosesByDate = useMemo(() => {
    const m = new Map<string, ScheduledDose[]>();
    doses.forEach((d) => {
      if (!m.has(d.date)) m.set(d.date, []);
      m.get(d.date)!.push(d);
    });
    m.forEach((arr) => arr.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel)));
    return m;
  }, [doses]);

  const pendingCount = useMemo(() => doses.filter((d) => d.status === "scheduled" && d.date >= toDateKey(new Date())).length, [doses]);

  const grid = useMemo(() => getCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const currentDate = new Date();
  const weekNum = getWeekNumber(currentDate);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "PST";

  const setDoseStatus = async (doseId: string, status: DoseStatus) => {
    setDoses((prev) => prev.map((d) => (d.id === doseId ? { ...d, status } : d)));
    const result = await updateDoseStatus(doseId, status as DbDoseStatus);
    if (!result.success) {
      console.error("Failed to update dose status:", result.error);
      loadDoses(rangeStart, rangeEnd).then((dbDoses) => {
        const scheduledDoses: ScheduledDose[] = dbDoses.map((d) => ({
          id: d.id,
          cycleId: d.cycleId,
          peptideName: d.peptideName,
          doseAmount: d.doseAmount,
          route: d.route,
          timeLabel: d.timeLabel,
          date: d.scheduledDate,
          status: d.status as DoseStatus,
        }));
        setDoses(scheduledDoses);
      });
    }
  };

  const handleDeleteDose = async (doseId: string) => {
    if (!confirm("Delete this dose?")) return;
    setDoses((prev) => prev.filter((d) => d.id !== doseId));
    const result = await deleteDose(doseId);
    if (!result.success) {
      console.error("Failed to delete dose:", result.error);
      loadDoses(rangeStart, rangeEnd).then((dbDoses) => {
        const scheduledDoses: ScheduledDose[] = dbDoses.map((d) => ({
          id: d.id,
          cycleId: d.cycleId,
          peptideName: d.peptideName,
          doseAmount: d.doseAmount,
          route: d.route,
          timeLabel: d.timeLabel,
          date: d.scheduledDate,
          status: d.status as DoseStatus,
        }));
        setDoses(scheduledDoses);
      });
    }
  };

  const handleClearAllData = async () => {
    if (!confirm("⚠️ DELETE ALL cycles and doses? This cannot be undone!")) return;
    if (!confirm("Are you ABSOLUTELY sure? All your data will be permanently deleted.")) return;
    setLoading(true);
    const result = await deleteAllCycles();
    if (result.success) {
      setCycles([]);
      setDoses([]);
      setLoading(false);
    } else {
      console.error("Failed to clear data:", result.error);
      alert("Error clearing data. Check console.");
      setLoading(false);
    }
  };

  const selectedDoses = selectedDate ? dosesByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg overflow-hidden">
      <div className="scanline-layer-thin opacity-[0.05]" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" aria-hidden />

      <div className="relative z-10 p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="deck-section relative space-y-2 pt-4 pb-3">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
                DOSE CALENDAR | SYNC: OFFLINE | SCHEDULE: {pendingCount} PENDING
              </h1>
              <div className="sys-info mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
                <span>CURRENT: {currentDate.toISOString().slice(0, 10)}</span>
                <span>WEEK: {String(weekNum).padStart(2, "0")}</span>
                <span>TIMEZONE: {tz}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-dot led-red" aria-hidden title="Sync offline" />
              <span className="led-dot led-red" aria-hidden />
            </div>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10 font-mono text-sm" aria-hidden>0xCL01</span>
        </div>

        {/* Month selector - FULL WIDTH */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ff88]/40 p-4">
          <p className="font-mono text-[10px] text-[#00ff88] mb-2">&gt; SELECT TIMEFRAME</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else setViewMonth((m) => m - 1);
              }}
              className="rounded border border-[#00ff88]/40 bg-[#00ff88]/5 px-3 py-2 font-mono text-xs text-[#00ff88] hover:bg-[#00ff88]/15"
            >
              &lt; PREV
            </button>
            <span className="font-mono text-sm font-bold text-[#f5f5f7] px-2">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else setViewMonth((m) => m + 1);
              }}
              className="rounded border border-[#00ff88]/40 bg-[#00ff88]/5 px-3 py-2 font-mono text-xs text-[#00ff88] hover:bg-[#00ff88]/15"
            >
              NEXT &gt;
            </button>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="ml-2 rounded border border-[#00ff88]/30 bg-black/60 px-2 py-2 font-mono text-xs text-[#f5f5f7] focus:border-[#00ff88]/60 focus:outline-none"
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 1 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty state when no active cycles */}
        {!loading && activeCycles.length === 0 && (
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ff88]/30 p-8 text-center font-mono">
            <p className="text-[#9a9aa3]">&gt; No active cycles</p>
            <p className="mt-2 text-[#e0e0e5]">Create a cycle on the Cycles page to see your dose schedule here.</p>
            <Link
              href="/app/cycles"
              className="mt-4 inline-block rounded border border-[#00ff88]/40 bg-[#00ff88]/10 px-4 py-2 font-mono text-sm text-[#00ff88] hover:bg-[#00ff88]/20"
            >
              Go to Cycles
            </Link>
          </div>
        )}

        {/* Calendar grid */}
        {loading ? (
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ff88]/30 p-12 text-center font-mono text-sm text-[#00ff88]">
            SYNCING CALENDAR<span className="animate-pulse">...</span>
          </div>
        ) : activeCycles.length > 0 ? (
          <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ff88]/40 p-4 relative">
            <div className="deck-bracket-bottom-left" aria-hidden />
            <div className="deck-bracket-bottom-right" aria-hidden />

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00ff88]/80">
                  {day}
                </div>
              ))}
              {grid.map((cell, i) => {
                const key = toDateKey(cell.date);
                const dayDoses = dosesByDate.get(key) ?? [];
                const isCurrentMonth = cell.isCurrentMonth;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => isCurrentMonth && setSelectedDate(key)}
                    className={`
                      relative min-h-[80px] sm:min-h-[100px] rounded border font-mono text-left p-2 transition-all duration-200
                      ${isCurrentMonth ? "border-[#00ff88] bg-black/40 text-[#e0e0e5] hover:scale-[1.02] hover:border-[#00ff88] hover:shadow-[0_0_16px_rgba(0,255,136,0.25)]" : "border-[#00ff88]/20 bg-black/20 text-[#9a9aa3]"}
                      ${cell.isToday ? "ring-2 ring-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.35)] border-2 border-[#00ff88]" : ""}
                      ${cell.isPast && isCurrentMonth ? "opacity-60" : ""}
                    `}
                  >
                    <span className="absolute left-1 top-1 text-lg font-bold tabular-nums text-[#f5f5f7]">{cell.day}</span>
                    <span className="absolute right-1 top-1 font-mono text-[8px] text-[#00ff88]/60">{cellHexId(cell.date)}</span>
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-0.5 justify-center items-center">
                      {dayDoses.slice(0, 5).map((d) => (
                        <span
                          key={d.id}
                          className={`led-dot w-2 h-2 ${
                            d.status === "logged" ? "led-blue" : d.status === "missed" ? "led-red" : "led-green"
                          }`}
                          aria-hidden
                        />
                      ))}
                      {dayDoses.length > 1 && (
                        <span className="ml-1 font-mono text-[9px] text-[#9a9aa3]">{dayDoses.length} doses</span>
                      )}
                    </div>
                    <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-[#00ff88]/30 bg-[#0a0a0a]" aria-hidden />
                    <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-[#00ff88]/30 bg-[#0a0a0a]" aria-hidden />
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 deck-panel rounded-lg border border-[#00ff88]/30 bg-black/60 px-3 py-2">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[#00ff88]/80 mb-1.5">KEY</p>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] text-[#9a9aa3]">
                <span className="flex items-center gap-1.5">
                  <span className="led-dot led-green w-2 h-2" aria-hidden /> Scheduled
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="led-dot led-blue w-2 h-2" aria-hidden /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="led-dot led-red w-2 h-2" aria-hidden /> Missed
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom row: Sync Status (left) and Danger Zone (right) */}
        <div className="flex flex-wrap gap-4 items-stretch">
          {/* Sync status panel - BOTTOM LEFT */}
          <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#9a9aa3]/30 p-3 flex-1 min-w-[200px]">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9a9aa3] mb-2">SYNC STATUS</p>
            <div className="space-y-3 font-mono text-[10px]">
              {/* Google Calendar Sync Component */}
              <GoogleCalendarSync />
              
              {/* iCloud - Coming Soon */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#9a9aa3]">iCloud:</span>
                <span className="text-amber-400">SOON</span>
                <button 
                  type="button" 
                  onClick={() => alert('iCloud sync coming in future update')}
                  className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-amber-400 hover:bg-amber-500/20 transition-colors text-[10px]"
                >
                  SOON
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone - BOTTOM RIGHT */}
          <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-red-500/30 p-3 flex-1 min-w-[200px] flex flex-col">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-2">DANGER ZONE</p>
            <div className="flex-1 flex items-center">
              <button
                type="button"
                onClick={handleClearAllData}
                className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400 hover:bg-red-500/20 transition-colors"
              >
                CLEAR ALL DATA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="day-modal-title"
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedDate(null)} aria-hidden />
          <div className="deck-panel deck-card-bg deck-border-thick relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border-[#00ff88]/50 p-6 shadow-[0_0_32px_rgba(0,255,136,0.2)]">
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="absolute right-4 top-4 rounded p-1 text-[#9a9aa3] hover:bg-white/10 hover:text-[#f5f5f7]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id="day-modal-title" className="font-space-mono text-lg font-bold text-[#f5f5f7] pr-8">
              DOSE SCHEDULE | {selectedDate} | DAY {String(getDayOfYear(new Date(selectedDate))).padStart(3, "0")}
            </h2>

            <ul className="mt-4 space-y-3">
              {selectedDoses.length === 0 ? (
                <li className="font-mono text-sm text-[#9a9aa3]">No doses scheduled for this day.</li>
              ) : (
                selectedDoses.map((dose) => (
                  <li
                    key={dose.id}
                    className="rounded border border-[#00ff88]/25 bg-black/40 p-3 font-mono text-sm"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[#00ff88] font-semibold">{dose.timeLabel}</span>
                      <span className={`led-dot w-2 h-2 ${dose.status === "logged" ? "led-blue" : dose.status === "missed" ? "led-red" : "led-green"}`} aria-hidden />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[#e0e0e5] text-xs">
                      <span><span className="text-[#9a9aa3]">Peptide:</span> {dose.peptideName}</span>
                      <span><span className="text-[#9a9aa3]">Amount:</span> {dose.doseAmount}</span>
                      <span><span className="text-[#9a9aa3]">Route:</span> {dose.route}</span>
                      <span><span className="text-[#9a9aa3]">Status:</span> {dose.status.toUpperCase()}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {dose.status === "scheduled" && (
                        <button
                          type="button"
                          onClick={() => setDoseStatus(dose.id, "logged")}
                          className="rounded border border-[#00ff88]/40 bg-[#00ff88]/10 px-2 py-1 font-mono text-[10px] text-[#00ff88] hover:bg-[#00ff88]/20"
                        >
                          LOG NOW
                        </button>
                      )}
                      {dose.status === "scheduled" && (
                        <button
                          type="button"
                          onClick={() => setDoseStatus(dose.id, "missed")}
                          className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-[10px] text-amber-400 hover:bg-amber-500/20"
                        >
                          SKIP
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDose(dose.id)}
                        className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 font-mono text-[10px] text-red-400 hover:bg-red-500/20"
                      >
                        DELETE
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            <button
              type="button"
              className="mt-4 rounded border border-[#00ff88]/40 bg-[#00ff88]/5 px-4 py-2 font-mono text-xs text-[#00ff88] hover:bg-[#00ff88]/15"
            >
              ADD DOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
