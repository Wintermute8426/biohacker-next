"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { loadCycles } from "@/lib/cycle-database";
import type { Cycle } from "@/lib/cycle-database";
import {
  saveSideEffect,
  calculateSeverity,
  type SaveSideEffectParams,
  type SideEffect,
  type Severity,
} from "@/lib/side-effects-database";

interface SideEffectLogModalProps {
  onSave: () => void;
  onClose: () => void;
}

const SEVERITY_OPTIONS: { value: Severity | ""; label: string }[] = [
  { value: "", label: "Auto (from symptoms)" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

function formToPseudoEffect(form: FormState): SideEffect {
  return {
    id: "",
    userId: "",
    cycleId: form.cycleId,
    doseLogId: form.doseLogId,
    peptideName: form.peptideName,
    injectionSite: form.injectionSite,
    siteRedness: form.siteRedness,
    siteSwelling: form.siteSwelling,
    sitePainLevel: form.sitePainLevel,
    siteItching: form.siteItching,
    siteBruising: form.siteBruising,
    fatigueLevel: form.fatigueLevel,
    headacheLevel: form.headacheLevel,
    nausea: form.nausea,
    dizziness: form.dizziness,
    insomnia: form.insomnia,
    increasedAppetite: form.increasedAppetite,
    decreasedAppetite: form.decreasedAppetite,
    moodChanges: form.moodChanges,
    waterRetention: form.waterRetention,
    jointPain: form.jointPain,
    severity: form.severity || undefined,
    notes: form.notes,
    loggedAt: new Date(),
    createdAt: new Date(),
  };
}

interface FormState {
  cycleId: string;
  peptideName: string;
  injectionSite: string;
  siteRedness: boolean;
  siteSwelling: boolean;
  sitePainLevel: number;
  siteItching: boolean;
  siteBruising: boolean;
  fatigueLevel: number;
  headacheLevel: number;
  nausea: boolean;
  dizziness: boolean;
  insomnia: boolean;
  increasedAppetite: boolean;
  decreasedAppetite: boolean;
  moodChanges: string;
  waterRetention: boolean;
  jointPain: boolean;
  severity: Severity | "";
  notes: string;
}

const initialForm: FormState = {
  cycleId: "",
  peptideName: "",
  injectionSite: "",
  siteRedness: false,
  siteSwelling: false,
  sitePainLevel: 0,
  siteItching: false,
  siteBruising: false,
  fatigueLevel: 0,
  headacheLevel: 0,
  nausea: false,
  dizziness: false,
  insomnia: false,
  increasedAppetite: false,
  decreasedAppetite: false,
  moodChanges: "",
  waterRetention: false,
  jointPain: false,
  severity: "",
  notes: "",
};

export default function SideEffectLogModal({ onSave, onClose }: SideEffectLogModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCycles().then(setCycles);
  }, []);

  const update = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.peptideName.trim()) {
      setError("Peptide name is required.");
      return;
    }

    setLoading(true);
    const params: SaveSideEffectParams = {
      cycleId: form.cycleId || undefined,
      peptideName: form.peptideName.trim(),
      injectionSite: form.injectionSite.trim() || undefined,
      siteRedness: form.siteRedness,
      siteSwelling: form.siteSwelling,
      sitePainLevel: form.sitePainLevel,
      siteItching: form.siteItching,
      siteBruising: form.siteBruising,
      fatigueLevel: form.fatigueLevel,
      headacheLevel: form.headacheLevel,
      nausea: form.nausea,
      dizziness: form.dizziness,
      insomnia: form.insomnia,
      increasedAppetite: form.increasedAppetite,
      decreasedAppetite: form.decreasedAppetite,
      moodChanges: form.moodChanges.trim() || undefined,
      waterRetention: form.waterRetention,
      jointPain: form.jointPain,
      notes: form.notes.trim() || undefined,
    };
    if (form.severity) {
      params.severity = form.severity;
    } else {
      const pseudo = formToPseudoEffect(form);
      params.severity = calculateSeverity(pseudo);
    }

    const result = await saveSideEffect(params);
    setLoading(false);

    if (result.success) {
      onSave();
      onClose();
    } else {
      setError(result.error ?? "Failed to save.");
    }
  };

  const inputClass =
    "w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60 focus:border-[#00ffaa] focus:outline-none";
  const labelClass = "block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase";

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50" onClick={onClose} aria-hidden />
      <div className="fixed inset-4 z-50 flex items-start justify-center pt-8 pb-32 overflow-y-auto">
        <div className="deck-card-bg deck-border-thick border-[#00ffaa]/40 rounded-xl w-full max-w-md shadow-[0_0_30px_rgba(0,255,170,0.2)] my-auto">
          <div className="flex justify-between items-center p-4 border-b border-[#00ffaa]/30">
            <h2 className="font-mono text-lg font-bold text-[#00ffaa]">LOG EFFECT</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-[#00ffaa] transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4 pb-32">
            {/* Cycle selector */}
            <div>
              <label className={labelClass}>Cycle (optional)</label>
              <select
                value={form.cycleId}
                onChange={(e) => update({ cycleId: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.peptideName}
                  </option>
                ))}
              </select>
            </div>

            {/* Peptide name */}
            <div>
              <label className={labelClass}>Peptide name *</label>
              <input
                type="text"
                value={form.peptideName}
                onChange={(e) => update({ peptideName: e.target.value })}
                placeholder="e.g. BPC-157"
                className={inputClass}
              />
            </div>

            {/* Injection site */}
            <div>
              <label className={labelClass}>Injection site (optional)</label>
              <input
                type="text"
                value={form.injectionSite}
                onChange={(e) => update({ injectionSite: e.target.value })}
                placeholder="e.g. Belly, thigh"
                className={inputClass}
              />
            </div>

            {/* INJECTION SITE */}
            <div className="pt-2 border-t border-[#00ffaa]/20">
              <h3 className="font-mono text-xs font-bold text-[#00ffaa] uppercase mb-2">
                Injection site
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.siteRedness}
                    onChange={(e) => update({ siteRedness: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Redness
                </label>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.siteSwelling}
                    onChange={(e) => update({ siteSwelling: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Swelling
                </label>
                <div>
                  <span className="font-mono text-sm text-[#e0e0e5]">Pain level </span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={form.sitePainLevel}
                      onChange={(e) => update({ sitePainLevel: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="font-mono text-sm text-[#00ffaa] w-8">{form.sitePainLevel}/10</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.siteItching}
                    onChange={(e) => update({ siteItching: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Itching
                </label>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.siteBruising}
                    onChange={(e) => update({ siteBruising: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Bruising
                </label>
              </div>
            </div>

            {/* SYSTEMIC */}
            <div className="pt-2 border-t border-[#00ffaa]/20">
              <h3 className="font-mono text-xs font-bold text-[#00ffaa] uppercase mb-2">
                Systemic effects
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-mono text-sm text-[#e0e0e5]">Fatigue level </span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={form.fatigueLevel}
                      onChange={(e) => update({ fatigueLevel: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="font-mono text-sm text-[#00ffaa] w-8">{form.fatigueLevel}/10</span>
                  </div>
                </div>
                <div>
                  <span className="font-mono text-sm text-[#e0e0e5]">Headache level </span>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={form.headacheLevel}
                      onChange={(e) => update({ headacheLevel: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="font-mono text-sm text-[#00ffaa] w-8">{form.headacheLevel}/10</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.nausea}
                    onChange={(e) => update({ nausea: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Nausea
                </label>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.dizziness}
                    onChange={(e) => update({ dizziness: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Dizziness
                </label>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.insomnia}
                    onChange={(e) => update({ insomnia: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Insomnia
                </label>
              </div>
            </div>

            {/* OTHER */}
            <div className="pt-2 border-t border-[#00ffaa]/20">
              <h3 className="font-mono text-xs font-bold text-[#00ffaa] uppercase mb-2">
                Other effects
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.increasedAppetite}
                    onChange={(e) => update({ increasedAppetite: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Increased appetite
                </label>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.decreasedAppetite}
                    onChange={(e) => update({ decreasedAppetite: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Decreased appetite
                </label>
                <div>
                  <label className={labelClass}>Mood changes (optional)</label>
                  <input
                    type="text"
                    value={form.moodChanges}
                    onChange={(e) => update({ moodChanges: e.target.value })}
                    placeholder="Describe"
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.waterRetention}
                    onChange={(e) => update({ waterRetention: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Water retention
                </label>
                <label className="flex items-center gap-2 font-mono text-sm text-[#e0e0e5]">
                  <input
                    type="checkbox"
                    checked={form.jointPain}
                    onChange={(e) => update({ jointPain: e.target.checked })}
                    className="rounded border-[#00ffaa]/40 bg-black/50 text-[#00ffaa] focus:ring-[#00ffaa]"
                  />
                  Joint pain
                </label>
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className={labelClass}>Overall severity (optional)</label>
              <select
                value={form.severity}
                onChange={(e) => update({ severity: e.target.value as Severity | "" })}
                className={inputClass}
              >
                {SEVERITY_OPTIONS.map((o) => (
                  <option key={o.value || "auto"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder="Additional context"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && (
              <p className="font-mono text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-500/40 bg-black/50 text-gray-400 font-mono text-sm hover:bg-gray-500/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/20 text-[#00ffaa] font-mono text-sm font-bold hover:bg-[#00ffaa]/30 shadow-[0_0_12px_rgba(0,255,170,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
