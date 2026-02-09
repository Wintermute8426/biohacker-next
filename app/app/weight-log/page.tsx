"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Scale, TrendingDown, TrendingUp, Minus, Trash2 } from "lucide-react";

interface WeightLog {
  id: string;
  weight_lbs: number;
  logged_at: string;
  notes?: string;
}

export default function WeightLogPage() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .order("logged_at", { ascending: false })
      .limit(30);
    
    setLogs(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || isNaN(parseFloat(weight))) {
      setMessage("ERROR: INVALID WEIGHT");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const { error } = await supabase.from("weight_logs").insert({
  user_id: user.id,
  weight_lbs: parseFloat(weight),
  notes: notes || null,
  logged_at: new Date().toISOString(),
});

    if (!error) {
      setMessage("✓ WEIGHT LOGGED");
      setWeight("");
      setNotes("");
      loadLogs();
    } else {
      setMessage(`ERROR: ${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("weight_logs")
      .delete()
      .eq("id", id);
    
    if (!error) {
      loadLogs();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6 mb-6">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />
        
        <div className="absolute top-2 right-6 text-[#00ff41]/50 text-xs font-mono">
          [WT-0x01]
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-6 h-6 text-[#00ff41]" />
          <h1 className="text-2xl font-bold text-[#00ff41] font-mono">
            WEIGHT LOG
          </h1>
        </div>
        <p className="text-[#00d4ff] text-sm font-mono">
          {'>'} TRACK WEIGHT OVER TIME
        </p>
      </div>

      {/* Log entry form */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6 mb-6">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff41]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff41]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff41]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff41]" />

        <h2 className="text-lg font-mono font-bold text-[#00ff41] mb-4">
          NEW ENTRY
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#00ff41] font-mono text-sm mb-2">
              {'>'} WEIGHT (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
              placeholder="185.0"
            />
          </div>
          <div>
            <label className="block text-[#00ff41] font-mono text-sm mb-2">
              {'>'} NOTES (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all resize-none"
              placeholder="Morning weigh-in, post-workout, etc."
            />
          </div>
          
          {message && (
            <div className={`font-mono text-sm ${
              message.includes("ERROR") ? "text-[#ff0040]" : "text-[#00ff41]"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff41]/20 hover:bg-[#00ff41]/30 border border-[#00ff41] text-[#00ff41] font-mono py-3 px-6 rounded transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]"
          >
            {loading ? "LOGGING..." : "LOG WEIGHT ▶"}
          </button>
        </form>
      </div>

      {/* Weight history */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff41]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff41]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff41]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff41]" />

        <h2 className="text-lg font-mono font-bold text-[#00ff41] mb-4">
          HISTORY (Last 30 days)
        </h2>
        
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-mono text-sm">
            No weight logs yet. Add your first entry above.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, idx) => {
              const prevWeight = logs[idx + 1]?.weight_lbs;
              const change = prevWeight ? log.weight_lbs - prevWeight : 0;
              
              return (
                <div
                  key={log.id}
                  className="border border-gray-600/50 bg-black/30 rounded-lg p-4 hover:border-[#00ff41]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[#00ff41] font-mono font-bold text-lg">
                          {log.weight_lbs} lbs
                        </span>
                        {prevWeight && change !== 0 && (
                          <span className={`flex items-center gap-1 font-mono text-sm ${
                            change > 0 ? "text-red-400" : "text-green-400"
                          }`}>
                            {change > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(change).toFixed(1)} lbs
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm font-mono">
                        {new Date(log.logged_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {log.notes && (
                        <div className="text-gray-500 text-sm mt-1">
                          {log.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-gray-500 hover:text-[#ff0040] transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
