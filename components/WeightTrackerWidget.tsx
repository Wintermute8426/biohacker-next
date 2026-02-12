"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Scale, TrendingUp, TrendingDown, Plus } from "lucide-react";

interface WeightLog {
  id: string;
  weight_lbs: number;
  body_fat_pct?: number;
  logged_at: string;
}

export default function WeightTrackerWidget() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(7);
    
    setLogs(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!weight || isNaN(parseFloat(weight))) {
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("weight_logs").insert({
      user_id: user.id,
      weight_lbs: parseFloat(weight),
      body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
      logged_at: new Date().toISOString(),
    });

    if (!error) {
      setWeight("");
      setBodyFat("");
      setShowModal(false);
      loadLogs();
    }
    setLoading(false);
  };

  const latestLog = logs[0];
  const previousLog = logs[1];
  const weightChange = latestLog && previousLog 
    ? latestLog.weight_lbs - previousLog.weight_lbs 
    : 0;
  const bodyFatChange = latestLog?.body_fat_pct && previousLog?.body_fat_pct
    ? latestLog.body_fat_pct - previousLog.body_fat_pct
    : 0;

  return (
    <>
      <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "200ms"}}>
        <div className="led-card-top-right">
          <span className="led-dot led-green" aria-hidden="true"></span>
        </div>

        <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
          0xWT01
        </span>

        <div className="flex items-center gap-2 mt-3">
          <Scale className="w-4 h-4 text-[#00ffaa] shrink-0" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
          Weight Tracker
        </h3>

        {logs.length === 0 ? (
          <div className="mt-3">
            <div className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-3 py-2 text-center">
              <p className="text-sm font-mono text-[#9a9aa3]">
                Track your weight/fat%
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
                CURRENT
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                  WEIGHT
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-[#f5f5f7]">
                    {latestLog.weight_lbs} lbs
                  </span>
                  {previousLog && weightChange !== 0 && (
                    <span className={`flex items-center gap-1 font-mono text-xs ${
                      weightChange > 0 ? "text-red-400" : "text-[#00ffaa]"
                    }`}>
                      {weightChange > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(weightChange).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {latestLog.body_fat_pct && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                    BODY FAT
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-[#f5f5f7]">
                      {latestLog.body_fat_pct}%
                    </span>
                    {previousLog?.body_fat_pct && bodyFatChange !== 0 && (
                      <span className={`flex items-center gap-1 font-mono text-xs ${
                        bodyFatChange > 0 ? "text-red-400" : "text-[#00ffaa]"
                      }`}>
                        {bodyFatChange > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(bodyFatChange).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs font-mono text-[#9a9aa3]">
                Last: {new Date(latestLog.logged_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60"
        >
          <Plus className="w-4 h-4" />
          Log weight
        </button>
      </div>

      {/* Add Weight Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="deck-card-bg deck-border-thick rounded-xl p-6 max-w-md w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#f5f5f7] font-space-mono">
                LOG WEIGHT
              </h2>
              <span className="hex-id" aria-hidden="true">
                0xWT-LOG
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                  placeholder="185.0"
                />
              </div>

              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Body Fat % (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                  placeholder="15.0"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(false);
                  }}
                  className="flex-1 border border-gray-600 text-gray-400 font-mono py-2.5 px-4 rounded-lg transition-colors hover:bg-gray-600/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#00ffaa]/20 hover:bg-[#00ffaa]/30 border border-[#00ffaa] text-[#00ffaa] font-mono py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,170,0.2)] hover:shadow-[0_0_15px_rgba(0,255,170,0.4)]"
                >
                  {loading ? "SAVING..." : "SAVE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
