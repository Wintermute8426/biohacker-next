"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";

export type Severity = "mild" | "moderate" | "severe";
export type Appetite = "increased" | "decreased" | "";
export type MoodChange = "none" | "positive" | "negative" | "irritable" | "euphoric" | "";
export type InjectionSite = "abdomen" | "thigh" | "arm" | "glute" | "";

export interface SideEffectLoggerProps {
  cycleId: string;
  peptideName: string;
  doseLogId?: string;
  onComplete: () => void;
  onClose: () => void;
}

const INJECTION_SITES: { value: InjectionSite; label: string }[] = [
  { value: "abdomen", label: "Abdomen" },
  { value: "thigh", label: "Thigh" },
  { value: "arm", label: "Arm" },
  { value: "glute", label: "Glute" },
];

const MOOD_OPTIONS: { value: MoodChange; label: string }[] = [
  { value: "none", label: "None" },
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
  { value: "irritable", label: "Irritable" },
  { value: "euphoric", label: "Euphoric" },
];

export default function SideEffectLogger({
  cycleId,
  peptideName,
  doseLogId,
  onComplete,
  onClose,
}: SideEffectLoggerProps) {
  const [injectionSite, setInjectionSite] = useState<InjectionSite>("");
  const [siteRedness, setSiteRedness] = useState(false);
  const [siteSwelling, setSiteSwelling] = useState(false);
  const [siteItching, setSiteItching] = useState(false);
  const [siteBruising, setSiteBruising] = useState(false);
  const [sitePainLevel, setSitePainLevel] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState(0);
  const [headacheLevel, setHeadacheLevel] = useState(0);
  const [nausea, setNausea] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [insomnia, setInsomnia] = useState(false);
  const [waterRetention, setWaterRetention] = useState(false);
  const [jointPain, setJointPain] = useState(false);
  const [appetite, setAppetite] = useState<Appetite>("");
  const [moodChanges, setMoodChanges] = useState<MoodChange>("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSiteReaction =
    siteRedness || siteSwelling || siteItching || siteBruising || sitePainLevel > 0;
  const hasSystemic =
    fatigueLevel > 0 ||
    headacheLevel > 0 ||
    nausea ||
    dizziness ||
    insomnia ||
    waterRetention ||
    jointPain ||
    appetite !== "" ||
    (moodChanges !== "" && moodChanges !== "none");
  const hasAnySymptom = hasSiteReaction || hasSystemic;
  const isValid = hasAnySymptom && severity !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError("Select at least one symptom and a severity.");
      return;
    }
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
      peptide_name: peptideName,
      dose_log_id: doseLogId || null,
      injection_site: injectionSite || null,
      site_redness: siteRedness,
      site_swelling: siteSwelling,
      site_itching: siteItching,
      site_bruising: siteBruising,
      site_pain_level: sitePainLevel,
      fatigue_level: fatigueLevel,
      headache_level: headacheLevel,
      nausea,
      dizziness,
      insomnia,
      water_retention: waterRetention,
      joint_pain: jointPain,
      appetite: appetite || null,
      mood_changes: moodChanges || null,
      severity: severity as Severity,
      notes: notes.trim() || null,
    };

    const { error: insertError } = await supabase.from("side_effects").insert(row);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onComplete();
    onClose();
    setLoading(false);
  };

  const severityStyles = {
    mild: "border-[#00ffaa]/50 bg-[#00ffaa]/10 text-[#00ffaa]",
    moderate: "border-amber-500/50 bg-amber-500/10 text-amber-500",
    severe: "border-red-500/50 bg-red-500/10 text-red-500",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="side-effect-logger-title"
    >
      <div
        className="deck-card-bg deck-border-thick rounded-xl p-6 w-full max-w-lg my-8 animate-fade-in border-amber-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="side-effect-logger-title"
            className="text-xl font-bold text-amber-500 font-space-mono"
          >
            Log Side Effect
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9a9aa3] hover:bg-amber-500/20 hover:text-amber-500 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-mono text-[#9a9aa3] mb-4">
          Peptide: <span className="text-amber-500 font-medium">{peptideName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Injection site */}
          <div>
            <label className="block text-amber-500/90 font-mono text-xs mb-2 uppercase tracking-wider">
              Injection site
            </label>
            <select
              value={injectionSite}
              onChange={(e) => setInjectionSite(e.target.value as InjectionSite)}
              className="w-full bg-black/50 border border-amber-500/40 rounded-lg px-4 py-2.5 text-[#f5f5f7] font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="">Select...</option>
              {INJECTION_SITES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Site reactions */}
          <div>
            <span className="block text-amber-500/90 font-mono text-xs mb-2 uppercase tracking-wider">
              Site reactions
            </span>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "redness", label: "Redness", value: siteRedness, set: setSiteRedness },
                { key: "swelling", label: "Swelling", value: siteSwelling, set: setSiteSwelling },
                { key: "itching", label: "Itching", value: siteItching, set: setSiteItching },
                { key: "bruising", label: "Bruising", value: siteBruising, set: setSiteBruising },
              ].map(({ key, label, value, set }) => (
                <label key={key} className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => set(e.target.checked)}
                    className="rounded border-amber-500/50 bg-black/50 text-amber-500 focus:ring-amber-500"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-2">
              <span className="text-[10px] font-mono text-[#9a9aa3]">Site pain: </span>
              <span className="font-mono text-amber-500 font-bold">{sitePainLevel}/10</span>
              <input
                type="range"
                min={0}
                max={10}
                value={sitePainLevel}
                onChange={(e) => setSitePainLevel(parseInt(e.target.value, 10))}
                className="ml-2 w-24 h-2 accent-amber-500"
              />
            </div>
          </div>

          {/* Systemic effects */}
          <div>
            <span className="block text-amber-500/90 font-mono text-xs mb-2 uppercase tracking-wider">
              Systemic effects
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-mono text-[#9a9aa3]">Fatigue</span>
                <span className="font-mono text-amber-500 font-bold">{fatigueLevel}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(parseInt(e.target.value, 10))}
                className="w-full h-2 accent-amber-500"
              />
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-mono text-[#9a9aa3]">Headache</span>
                <span className="font-mono text-amber-500 font-bold">{headacheLevel}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={headacheLevel}
                onChange={(e) => setHeadacheLevel(parseInt(e.target.value, 10))}
                className="w-full h-2 accent-amber-500"
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { key: "nausea", label: "Nausea", value: nausea, set: setNausea },
                { key: "dizziness", label: "Dizziness", value: dizziness, set: setDizziness },
                { key: "insomnia", label: "Insomnia", value: insomnia, set: setInsomnia },
                {
                  key: "water",
                  label: "Water retention",
                  value: waterRetention,
                  set: setWaterRetention,
                },
                { key: "joint", label: "Joint pain", value: jointPain, set: setJointPain },
              ].map(({ key, label, value, set }) => (
                <label key={key} className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => set(e.target.checked)}
                    className="rounded border-amber-500/50 bg-black/50 text-amber-500 focus:ring-amber-500"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-3">
              <span className="block text-[10px] font-mono text-[#9a9aa3] mb-1">Appetite</span>
              <div className="flex gap-4">
                {(["increased", "decreased"] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5] cursor-pointer">
                    <input
                      type="radio"
                      name="appetite"
                      checked={appetite === opt}
                      onChange={() => setAppetite(opt)}
                      className="border-amber-500/50 text-amber-500 focus:ring-amber-500"
                    />
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-[10px] font-mono text-[#9a9aa3] mb-1">
                Mood changes
              </label>
              <select
                value={moodChanges}
                onChange={(e) => setMoodChanges(e.target.value as MoodChange)}
                className="w-full bg-black/50 border border-amber-500/40 rounded-lg px-4 py-2.5 text-[#f5f5f7] font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="">Select...</option>
                {MOOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Severity */}
          <div>
            <span className="block text-amber-500/90 font-mono text-xs mb-2 uppercase tracking-wider">
              Severity *
            </span>
            <div className="flex gap-2">
              {(["mild", "moderate", "severe"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 rounded-lg border-2 px-3 py-2 font-mono text-xs font-medium capitalize transition-all ${
                    severity === s ? severityStyles[s] : "border-[#9a9aa3]/30 bg-black/30 text-[#9a9aa3] hover:border-amber-500/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-amber-500/90 font-mono text-xs mb-2 uppercase tracking-wider">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-black/50 border border-amber-500/40 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Any additional details..."
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-amber-500/40 bg-transparent px-4 py-2.5 font-mono text-xs text-[#9a9aa3] hover:bg-amber-500/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 rounded-lg border border-amber-500 bg-amber-500/20 px-4 py-2.5 font-mono text-xs font-medium text-amber-500 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Log side effect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
