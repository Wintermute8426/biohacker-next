"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CycleJournalEntryProps {
  cycleId: string;
  cycleName: string;
  entryDate?: string; // YYYY-MM-DD
  onSave: () => void;
}

const RATINGS = [
  { key: "energy", label: "Energy Level", emoji: "⚡" },
  { key: "sleep_quality", label: "Sleep Quality", emoji: "😴" },
  { key: "recovery", label: "Recovery Feeling", emoji: "💪" },
  { key: "mood", label: "Mood", emoji: "😊" },
  { key: "focus", label: "Focus/Clarity", emoji: "🎯" },
] as const;

type RatingKey = (typeof RATINGS)[number]["key"];

function ratingLabel(value: number): "Low" | "Moderate" | "High" {
  if (value <= 3) return "Low";
  if (value <= 6) return "Moderate";
  return "High";
}

function ratingColor(value: number): string {
  if (value <= 3) return "text-red-400";
  if (value <= 6) return "text-amber-500";
  return "text-[#00ffaa]";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_RATING = 5;

export default function CycleJournalEntry({
  cycleId,
  cycleName,
  entryDate: initialEntryDate,
  onSave,
}: CycleJournalEntryProps) {
  const [entryDate, setEntryDate] = useState(initialEntryDate || todayISO());
  const [energy, setEnergy] = useState(DEFAULT_RATING);
  const [sleep_quality, setSleepQuality] = useState(DEFAULT_RATING);
  const [recovery, setRecovery] = useState(DEFAULT_RATING);
  const [mood, setMood] = useState(DEFAULT_RATING);
  const [focus, setFocus] = useState(DEFAULT_RATING);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const values = { energy, sleep_quality, recovery, mood, focus };
  const setters = {
    energy: setEnergy,
    sleep_quality: setSleepQuality,
    recovery: setRecovery,
    mood: setMood,
    focus: setFocus,
  };

  useEffect(() => {
    loadEntry();
  }, [cycleId, entryDate]);

  const loadEntry = async () => {
    setLoadingEntry(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoadingEntry(false);
      return;
    }
    const { data } = await supabase
      .from("cycle_journal")
      .select("*")
      .eq("user_id", user.id)
      .eq("cycle_id", cycleId)
      .eq("entry_date", entryDate)
      .maybeSingle();

    if (data) {
      setExistingId(data.id);
      setEnergy(data.energy ?? DEFAULT_RATING);
      setSleepQuality(data.sleep_quality ?? DEFAULT_RATING);
      setRecovery(data.recovery ?? DEFAULT_RATING);
      setMood(data.mood ?? DEFAULT_RATING);
      setFocus(data.focus ?? DEFAULT_RATING);
      setNotes(data.notes ?? "");
    } else {
      setExistingId(null);
      setEnergy(DEFAULT_RATING);
      setSleepQuality(DEFAULT_RATING);
      setRecovery(DEFAULT_RATING);
      setMood(DEFAULT_RATING);
      setFocus(DEFAULT_RATING);
      setNotes("");
    }
    setLoadingEntry(false);
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

    const row = {
      user_id: user.id,
      cycle_id: cycleId,
      entry_date: entryDate,
      energy,
      sleep_quality,
      recovery,
      mood,
      focus,
      notes: notes.trim() || null,
    };

    if (existingId) {
      const { error: updateError } = await supabase
        .from("cycle_journal")
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq("id", existingId);
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("cycle_journal").insert(row);
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    setExistingId(existingId || "");
    onSave();
    setLoading(false);
  };

  const maxDate = todayISO();

  return (
    <div className="deck-card-bg deck-border-thick rounded-xl p-6 border-[#00ffaa]/30">
      <h3 className="text-lg font-bold font-mono text-[#f5f5f7] mb-1">
        {cycleName}
      </h3>
      <p className="text-[10px] font-mono text-[#9a9aa3] mb-4">Daily journal entry</p>

      {loadingEntry ? (
        <p className="font-mono text-xs text-[#9a9aa3]">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              value={entryDate}
              max={maxDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa]"
            />
          </div>

          {RATINGS.map(({ key, label, emoji }) => {
            const value = values[key];
            const setValue = setters[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#e0e0e5]">
                    {emoji} {label}
                  </span>
                  <span className={`font-mono text-sm font-bold ${ratingColor(value)}`}>
                    {value}/10 – {ratingLabel(value)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={value}
                  onChange={(e) => setValue(parseInt(e.target.value, 10))}
                  className="w-full h-2 accent-[#00ffaa]"
                />
              </div>
            );
          })}

          <div>
            <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] resize-none"
              placeholder="How are you feeling? Any observations..."
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border-2 border-[#00ffaa] bg-[#00ffaa]/10 py-2.5 font-mono text-sm font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50"
          >
            {loading ? "Saving..." : existingId ? "Update entry" : "Save entry"}
          </button>
        </form>
      )}
    </div>
  );
}
