"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Plus } from "lucide-react";
import SideEffectLogger from "@/components/SideEffectLogger";

interface SideEffect {
  id: string;
  peptide_name: string;
  severity: string;
  logged_at: string;
  notes: string;
  site_pain_level: number | null;
  fatigue_level: number | null;
  headache_level: number | null;
}

export default function SideEffectsPage() {
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [showLogger, setShowLogger] = useState(false);
  const [activeCycles, setActiveCycles] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: effects } = await supabase
      .from("side_effects")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(50);

    setSideEffects(effects || []);

    const { data: cycles } = await supabase
      .from("cycles")
      .select("id, protocol_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    setActiveCycles(cycles || []);
    if (cycles && cycles.length > 0) {
      setSelectedCycle(cycles[0].id);
    }

    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'severe') return 'text-red-500 border-red-500/40 bg-red-500/10';
    if (severity === 'moderate') return 'text-amber-500 border-amber-500/40 bg-amber-500/10';
    return 'text-[#00ffaa] border-[#00ffaa]/40 bg-[#00ffaa]/10';
  };

  return (
    <div className="space-y-6">
      <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
        <div className="scanline-layer-thin" aria-hidden="true"></div>
        <div className="scanline-layer-thick" aria-hidden="true"></div>

        <div className="relative z-10 space-y-6">
          <div className="deck-section relative space-y-3 pt-4 pb-2">
            <h1 className="font-space-mono text-2xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-3xl">
              SIDE EFFECTS TRACKER
            </h1>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowLogger(!showLogger)}
              className="flex items-center gap-2 rounded-lg border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-mono text-xs font-medium text-amber-500 transition-colors hover:bg-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Log Side Effect
            </button>
          </div>

          {showLogger && activeCycles.length > 0 && (
            <div>
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="w-full mb-4 bg-black/30 border border-[#00ffaa]/20 rounded px-3 py-2 text-sm font-mono text-[#e0e0e5] focus:border-[#00ffaa]/40 focus:outline-none"
              >
                {activeCycles.map(cycle => (
                  <option key={cycle.id} value={cycle.id}>{cycle.protocol_id}</option>
                ))}
              </select>
              <SideEffectLogger
                cycleId={selectedCycle}
                peptideName={activeCycles.find(c => c.id === selectedCycle)?.protocol_id || ""}
                onComplete={() => {
                  setShowLogger(false);
                  loadData();
                }}
              />
            </div>
          )}

          <div className="deck-card-bg deck-border-thick rounded-xl p-6">
            <h3 className="font-mono text-lg font-bold text-[#f5f5f7] mb-4">Side Effect History</h3>

            {loading ? (
              <p className="text-xs text-[#9a9aa3] font-mono">Loading...</p>
            ) : sideEffects.length === 0 ? (
              <p className="text-xs text-[#9a9aa3] font-mono">No side effects logged yet</p>
            ) : (
              <div className="space-y-3">
                {sideEffects.map(effect => (
                  <div key={effect.id} className="deck-card-bg deck-border-thick rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-mono text-sm font-bold text-[#f5f5f7]">{effect.peptide_name}</h4>
                        <p className="text-xs text-[#9a9aa3] font-mono">{formatDate(effect.logged_at)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded border font-mono text-xs capitalize ${getSeverityColor(effect.severity)}`}>
                        {effect.severity}
                      </span>
                    </div>

                    {(effect.site_pain_level || effect.fatigue_level || effect.headache_level) && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {effect.site_pain_level && (
                          <span className="text-xs font-mono text-[#e0e0e5]">Pain: {effect.site_pain_level}/10</span>
                        )}
                        {effect.fatigue_level && (
                          <span className="text-xs font-mono text-[#e0e0e5]">Fatigue: {effect.fatigue_level}/10</span>
                        )}
                        {effect.headache_level && (
                          <span className="text-xs font-mono text-[#e0e0e5]">Headache: {effect.headache_level}/10</span>
                        )}
                      </div>
                    )}

                    {effect.notes && (
                      <p className="text-xs text-[#9a9aa3] font-mono">{effect.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
