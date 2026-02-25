"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

export interface DoseLoggerProps {
  scheduleId?: string;
  cycleId: string;
  peptideName: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // e.g. "08:00" or "8:00 AM"
  dosageAmount: string;
  dosageUnit: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function DoseLogger({
  scheduleId,
  cycleId,
  peptideName,
  scheduledDate,
  scheduledTime,
  dosageAmount: initialDosageAmount,
  dosageUnit: initialDosageUnit,
  onComplete,
  onClose,
}: DoseLoggerProps) {
  const [dosageAmount, setDosageAmount] = useState(initialDosageAmount);
  const [dosageUnit, setDosageUnit] = useState(initialDosageUnit);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildScheduledAt = (): string => {
    if (scheduledTime) {
      const [hours, mins] = parseTime(scheduledTime);
      const d = new Date(scheduledDate);
      d.setHours(hours, mins, 0, 0);
      return d.toISOString();
    }
    const d = new Date(scheduledDate);
    d.setHours(12, 0, 0, 0);
    return d.toISOString();
  };

  const parseTime = (t: string): [number, number] => {
    const trimmed = t.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return [h, m];
    }
    const numMatch = trimmed.match(/^(\d{1,2}):(\d{2})/);
    if (numMatch) return [parseInt(numMatch[1], 10), parseInt(numMatch[2], 10)];
    return [12, 0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const scheduledAt = buildScheduledAt();
    const takenAt = new Date().toISOString();

    const row: Record<string, unknown> = {
      user_id: user.id,
      cycle_id: cycleId,
      scheduled_at: scheduledAt,
      taken_at: takenAt,
      skipped: false,
      notes: notes.trim() || null,
      peptide_name: peptideName,
      dosage_amount: dosageAmount.trim(),
      dosage_unit: dosageUnit.trim(),
    };
    if (scheduleId) row.schedule_id = scheduleId;

    const { error: insertError } = await supabase.from("dose_logs").insert(row);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onComplete();
    onClose();
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dose-logger-title"
    >
      <div
        className="deck-card-bg deck-border-thick rounded-xl p-6 w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="dose-logger-title" className="text-xl font-bold text-[#f5f5f7] font-space-mono">
            Log Dose
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9a9aa3] hover:bg-[#00ffaa]/10 hover:text-[#00ffaa] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
              Peptide
            </label>
            <input
              type="text"
              value={peptideName}
              readOnly
              className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#e0e0e5] font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
              Dosage amount *
            </label>
            <input
              type="text"
              value={dosageAmount}
              onChange={(e) => setDosageAmount(e.target.value)}
              required
              className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa]"
              placeholder="e.g. 250"
            />
          </div>

          <div>
            <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
              Dosage unit
            </label>
            <input
              type="text"
              value={dosageUnit}
              onChange={(e) => setDosageUnit(e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa]"
              placeholder="e.g. mcg"
            />
          </div>

          <div>
            <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] resize-none"
              placeholder="Any notes..."
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#00ffaa]/30 bg-transparent px-4 py-2.5 font-mono text-xs text-[#9a9aa3] hover:bg-[#00ffaa]/5 hover:border-[#00ffaa]/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg border border-[#00ffaa] bg-[#00ffaa]/10 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Mark as taken"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
