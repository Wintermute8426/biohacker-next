"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Check, X } from "lucide-react";

interface SideEffectLoggerProps {
  cycleId: string;
  peptideName: string;
  doseLogId?: string;
  onClose: () => void;
}

export default function SideEffectLogger({ cycleId, peptideName, doseLogId, onClose }: SideEffectLoggerProps) {
  const [injectionSite, setInjectionSite] = useState<string>("");
  const [siteReactions, setSiteReactions] = useState({
    redness: false,
    swelling: false,
    pain: 0,
    itching: false,
    bruising: false
  });
  const [systemicEffects, setSystemicEffects] = useState({
    fatigue: 0,
    headache: 0,
    nausea: false,
    dizziness: false,
    insomnia: false,
    increasedAppetite: false,
    decreasedAppetite: false,
    moodChanges: "none",
    waterRetention: false,
    jointPain: false
  });
  const [severity, setSeverity] = useState<string>("mild");
  const [notes, setNotes] = useState("");
  const [logging, setLogging] = useState(false);

  const logSideEffect = async () => {
    setLogging(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("side_effects").insert({
      user_id: user.id,
      cycle_id: cycleId,
      dose_log_id: doseLogId || null,
      peptide_name: peptideName,
      injection_site: injectionSite || null,
      site_redness: siteReactions.redness,
      site_swelling: siteReactions.swelling,
      site_pain_level: siteReactions.pain > 0 ? siteReactions.pain : null,
      site_itching: siteReactions.itching,
      site_bruising: siteReactions.bruising,
      fatigue_level: systemicEffects.fatigue > 0 ? systemicEffects.fatigue : null,
      headache_level: systemicEffects.headache > 0 ? systemicEffects.headache : null,
      nausea: systemicEffects.nausea,
      dizziness: systemicEffects.dizziness,
      insomnia: systemicEffects.insomnia,
      increased_appetite: systemicEffects.increasedAppetite,
      decreased_appetite: systemicEffects.decreasedAppetite,
      mood_changes: systemicEffects.moodChanges !== "none" ? systemicEffects.moodChanges : null,
      water_retention: systemicEffects.waterRetention,
      joint_pain: systemicEffects.jointPain,
      severity: severity,
      notes: notes || null
    });

    if (!error) {
      onClose();
    }
    setLogging(false);
  };

  const hasSiteReactions = siteReactions.redness || siteReactions.swelling || siteReactions.pain > 0 || siteReactions.itching || siteReactions.bruising;
  const hasSystemicEffects = systemicEffects.fatigue > 0 || systemicEffects.headache > 0 || systemicEffects.nausea || systemicEffects.dizziness || systemicEffects.insomnia;

  return (
    <div className="deck-card-bg deck-border-thick rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-sm font-bold text-[#f5f5f7]">Log Side Effect</h4>
        <AlertTriangle className="w-4 h-4 text-amber-500" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono text-[#9a9aa3] uppercase">Injection Site (Optional)</label>
          <select
            value={injectionSite}
            onChange={(e) => setInjectionSite(e.target.value)}
            className="w-full bg-black/30 border border-[#00ffaa]/20 rounded px-3 py-2 text-sm font-mono text-[#e0e0e5] focus:border-[#00ffaa]/40 focus:outline-none mt-1"
          >
            <option value="">Select site...</option>
            <option value="abdomen">Abdomen</option>
            <option value="thigh">Thigh</option>
            <option value="arm">Arm</option>
            <option value="glute">Glute</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-[#9a9aa3] uppercase mb-2 block">Site Reactions</label>
          <div className="grid grid-cols-2 gap-2">
            {(['redness', 'swelling', 'itching', 'bruising'] as const).map(reaction => (
              <label key={reaction} className="flex items-center gap-2 text-xs font-mono text-[#e0e0e5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteReactions[reaction] as boolean}
                  onChange={(e) => setSiteReactions({...siteReactions, [reaction]: e.target.checked})}
                  className="w-4 h-4 rounded border-[#00ffaa]/40 bg-black/30 checked:bg-[#00ffaa] checked:border-[#00ffaa]"
                />
                <span className="capitalize">{reaction}</span>
              </label>
            ))}
          </div>

          <div className="mt-2">
            <label className="text-xs font-mono text-[#9a9aa3]">Pain Level: {siteReactions.pain}/10</label>
            <input
              type="range"
              min="0"
              max="10"
              value={siteReactions.pain}
              onChange={(e) => setSiteReactions({...siteReactions, pain: parseInt(e.target.value)})}
              className="w-full mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-[#9a9aa3] uppercase mb-2 block">Systemic Effects</label>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs font-mono text-[#9a9aa3]">Fatigue: {systemicEffects.fatigue}/10</label>
              <input
                type="range"
                min="0"
                max="10"
                value={systemicEffects.fatigue}
                onChange={(e) => setSystemicEffects({...systemicEffects, fatigue: parseInt(e.target.value)})}
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#9a9aa3]">Headache: {systemicEffects.headache}/10</label>
              <input
                type="range"
                min="0"
                max="10"
                value={systemicEffects.headache}
                onChange={(e) => setSystemicEffects({...systemicEffects, headache: parseInt(e.target.value)})}
                className="w-full mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'nausea' as const, label: 'Nausea' },
                { key: 'dizziness' as const, label: 'Dizziness' },
                { key: 'insomnia' as const, label: 'Insomnia' },
                { key: 'waterRetention' as const, label: 'Water Retention' },
                { key: 'jointPain' as const, label: 'Joint Pain' }
              ].map(effect => (
                <label key={effect.key} className="flex items-center gap-2 text-xs font-mono text-[#e0e0e5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemicEffects[effect.key] as boolean}
                    onChange={(e) => setSystemicEffects({...systemicEffects, [effect.key]: e.target.checked})}
                    className="w-4 h-4 rounded border-[#00ffaa]/40 bg-black/30 checked:bg-[#00ffaa] checked:border-[#00ffaa]"
                  />
                  <span>{effect.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-xs font-mono text-[#9a9aa3] uppercase">Appetite</label>
              <div className="flex gap-2 mt-1">
                <label className="flex items-center gap-2 text-xs font-mono text-[#e0e0e5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemicEffects.increasedAppetite}
                    onChange={(e) => setSystemicEffects({...systemicEffects, increasedAppetite: e.target.checked, decreasedAppetite: false})}
                    className="w-4 h-4"
                  />
                  Increased
                </label>
                <label className="flex items-center gap-2 text-xs font-mono text-[#e0e0e5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemicEffects.decreasedAppetite}
                    onChange={(e) => setSystemicEffects({...systemicEffects, decreasedAppetite: e.target.checked, increasedAppetite: false})}
                    className="w-4 h-4"
                  />
                  Decreased
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#9a9aa3] uppercase">Mood Changes</label>
              <select
                value={systemicEffects.moodChanges}
                onChange={(e) => setSystemicEffects({...systemicEffects, moodChanges: e.target.value})}
                className="w-full bg-black/30 border border-[#00ffaa]/20 rounded px-3 py-2 text-sm font-mono text-[#e0e0e5] focus:border-[#00ffaa]/40 focus:outline-none mt-1"
              >
                <option value="none">None</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="irritable">Irritable</option>
                <option value="euphoric">Euphoric</option>
              </select>
            </div>
          </div>
        </div>

        {(hasSiteReactions || hasSystemicEffects) && (
          <div>
            <label className="text-xs font-mono text-[#9a9aa3] uppercase">Overall Severity</label>
            <div className="flex gap-2 mt-1">
              {['mild', 'moderate', 'severe'].map(s => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 px-3 py-2 rounded border font-mono text-xs capitalize transition-colors ${
                    severity === s
                      ? s === 'severe'
                        ? 'bg-red-500/20 border-red-500/40 text-red-500'
                        : s === 'moderate'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                        : 'bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]'
                      : 'bg-black/30 border-[#00ffaa]/20 text-[#9a9aa3]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-mono text-[#9a9aa3] uppercase">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the side effect, duration, etc."
            rows={2}
            className="w-full bg-black/30 border border-[#00ffaa]/20 rounded px-3 py-2 text-sm font-mono text-[#e0e0e5] placeholder:text-[#9a9aa3]/50 focus:border-[#00ffaa]/40 focus:outline-none resize-none mt-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={logSideEffect}
          disabled={logging}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-mono text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {logging ? "Logging..." : "Log Side Effect"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg border border-[#9a9aa3]/20 bg-black/30 text-[#9a9aa3] hover:bg-[#9a9aa3]/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
