"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { saveSideEffect, type Severity } from "@/lib/side-effects-database";
import { loadCycles } from "@/lib/cycle-database";
import type { Cycle } from "@/lib/cycle-database";

interface SideEffectLogModalProps {
  onSave: () => void;
  onClose: () => void;
}

export default function SideEffectLogModal({ onSave, onClose }: SideEffectLogModalProps) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [cycleId, setCycleId] = useState("");
  const [peptideName, setPeptideName] = useState("");
  const [injectionSite, setInjectionSite] = useState("");
  const [siteRedness, setSiteRedness] = useState(false);
  const [siteSwelling, setSiteSwelling] = useState(false);
  const [sitePainLevel, setSitePainLevel] = useState(0);
  const [siteItching, setSiteItching] = useState(false);
  const [siteBruising, setSiteBruising] = useState(false);
  const [fatigueLevel, setFatigueLevel] = useState(0);
  const [headacheLevel, setHeadacheLevel] = useState(0);
  const [nausea, setNausea] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [insomnia, setInsomnia] = useState(false);
  const [increasedAppetite, setIncreasedAppetite] = useState(false);
  const [decreasedAppetite, setDecreasedAppetite] = useState(false);
  const [moodChanges, setMoodChanges] = useState("");
  const [waterRetention, setWaterRetention] = useState(false);
  const [jointPain, setJointPain] = useState(false);
  const [severity, setSeverity] = useState<Severity | "">("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadCycles().then(setCycles);
  }, []);

  const handleSubmit = async () => {
    if (!peptideName.trim()) {
      setError("Peptide name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await saveSideEffect({
      cycleId: cycleId || undefined,
      peptideName,
      injectionSite: injectionSite || undefined,
      siteRedness,
      siteSwelling,
      sitePainLevel,
      siteItching,
      siteBruising,
      fatigueLevel,
      headacheLevel,
      nausea,
      dizziness,
      insomnia,
      increasedAppetite,
      decreasedAppetite,
      moodChanges: moodChanges || undefined,
      waterRetention,
      jointPain,
      severity: severity || undefined,
      notes: notes || undefined,
    });

    setLoading(false);

    if (result.success) {
      onSave();
      onClose();
    } else {
      setError(result.error || "Failed to save side effect");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 z-50 flex items-start justify-center pt-8 pb-32 overflow-y-auto">
        <div className="deck-card-bg deck-border-thick border-[#00ffaa]/40 rounded-xl w-full max-w-2xl shadow-[0_0_30px_rgba(0,255,170,0.2)] my-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#00ffaa]/30">
            <h2 className="font-mono text-lg font-bold text-[#00ffaa]">LOG SIDE EFFECT</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-[#00ffaa] transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-6 pb-32">
            {/* Error Message */}
            {error && (
              <div className="p-3 border border-red-500/40 bg-red-500/10 rounded text-red-500 text-sm font-mono">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  Cycle (Optional)
                </label>
                <select
                  value={cycleId}
                  onChange={(e) => setCycleId(e.target.value)}
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                >
                  <option value="">None</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.peptideName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  Peptide Name *
                </label>
                <input
                  type="text"
                  value={peptideName}
                  onChange={(e) => setPeptideName(e.target.value)}
                  placeholder="e.g., BPC-157"
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  Injection Site (Optional)
                </label>
                <input
                  type="text"
                  value={injectionSite}
                  onChange={(e) => setInjectionSite(e.target.value)}
                  placeholder="e.g., Left deltoid"
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  Overall Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity | "")}
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                >
                  <option value="">Auto-calculate</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>

            {/* Injection Site Symptoms */}
            <div className="border border-[#00ffaa]/20 rounded-lg p-4">
              <h3 className="font-mono text-sm font-bold text-[#00ffaa] mb-3 uppercase">
                Injection Site
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={siteRedness}
                    onChange={(e) => setSiteRedness(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Redness
                </label>

                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={siteSwelling}
                    onChange={(e) => setSiteSwelling(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Swelling
                </label>

                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={siteItching}
                    onChange={(e) => setSiteItching(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Itching
                </label>

                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={siteBruising}
                    onChange={(e) => setSiteBruising(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Bruising
                </label>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#9a9aa3] mb-2">
                  Pain Level: <span className="text-[#00ffaa]">{sitePainLevel}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={sitePainLevel}
                  onChange={(e) => setSitePainLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Systemic Effects */}
            <div className="border border-[#00ffaa]/20 rounded-lg p-4">
              <h3 className="font-mono text-sm font-bold text-[#00ffaa] mb-3 uppercase">
                Systemic Effects
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-[#9a9aa3] mb-2">
                    Fatigue Level: <span className="text-[#00ffaa]">{fatigueLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={fatigueLevel}
                    onChange={(e) => setFatigueLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-[#9a9aa3] mb-2">
                    Headache Level: <span className="text-[#00ffaa]">{headacheLevel}/10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={headacheLevel}
                    onChange={(e) => setHeadacheLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                    <input
                      type="checkbox"
                      checked={nausea}
                      onChange={(e) => setNausea(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Nausea
                  </label>

                  <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                    <input
                      type="checkbox"
                      checked={dizziness}
                      onChange={(e) => setDizziness(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Dizziness
                  </label>

                  <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                    <input
                      type="checkbox"
                      checked={insomnia}
                      onChange={(e) => setInsomnia(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Insomnia
                  </label>
                </div>
              </div>
            </div>

            {/* Other Effects */}
            <div className="border border-[#00ffaa]/20 rounded-lg p-4">
              <h3 className="font-mono text-sm font-bold text-[#00ffaa] mb-3 uppercase">
                Other Effects
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={increasedAppetite}
                    onChange={(e) => setIncreasedAppetite(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Increased Appetite
                </label>

                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={decreasedAppetite}
                    onChange={(e) => setDecreasedAppetite(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Decreased Appetite
                </label>

                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={waterRetention}
                    onChange={(e) => setWaterRetention(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Water Retention
                </label>

                <label className="flex items-center gap-2 text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={jointPain}
                    onChange={(e) => setJointPain(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Joint Pain
                </label>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  Mood Changes
                </label>
                <input
                  type="text"
                  value={moodChanges}
                  onChange={(e) => setMoodChanges(e.target.value)}
                  placeholder="Describe any mood changes"
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional observations"
                rows={3}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-500/40 bg-black/50 text-gray-400 font-mono text-sm hover:bg-gray-500/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/20 text-[#00ffaa] font-mono text-sm font-bold hover:bg-[#00ffaa]/30 shadow-[0_0_12px_rgba(0,255,170,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Log Side Effect"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
