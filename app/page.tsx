"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadCycles } from "@/lib/cycle-database";
import QuickWeightWidget from "@/components/dashboard/QuickWeightWidget";
import {
  Activity,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Profile {
  weight_lbs?: number;
  updated_at?: string;
  units_preference?: string;
  onboarding_progress?: any;
  onboarding_completed?: boolean;
}

interface WeightLog {
  weight_lbs: number;
  logged_at: string;
  notes?: string;
}

interface Cycle {
  id: string;
  peptideName: string;
  status: "active" | "paused" | "completed";
  startDate: Date;
  endDate: Date;
  doseAmount: string;
  frequency: { type: string; times: number };
  dosesLogged: number;
  totalExpectedDoses: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [recentWeightLogs, setRecentWeightLogs] = useState<WeightLog[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: weightData } = await supabase
        .from("weight_logs")
        .select("*")
        .order("logged_at", { ascending: false })
        .limit(5);

      setRecentWeightLogs(weightData || []);

      const cyclesData = await loadCycles();
      setCycles(cyclesData);
    }
  };

  const activeCycles = cycles.filter((c) => c.status === "active");
  const completedCycles = cycles.filter((c) => c.status === "completed");
  const totalDosesLogged = cycles.reduce((sum, c) => sum + c.dosesLogged, 0);
  const upcomingDoses = activeCycles.slice(0, 3);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6 mb-6">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />

        <div className="absolute top-2 right-6 text-[#00ff41]/50 text-xs font-mono">
          [DASH-0x01]
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#00ff41] font-mono mb-2 flex items-center">
              <span className="inline-block w-3 h-5 bg-[#00ff41] mr-2 animate-pulse" />
              DASHBOARD
            </h1>
            <p className="text-[#00d4ff] text-sm font-mono">
              {'>'} SYSTEM STATUS OVERVIEW
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
            <span className="text-[#00ff41] text-xs font-mono">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row - BIGGER ICONS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Active Cycles */}
        <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff41]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff41]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff41]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff41]" />

          {/* BIG BUTTON-STYLE ICON */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative p-4 border-2 border-[#00ff41] bg-[#00ff41]/10 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(0,255,65,0.3)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(0,255,65,0.5)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
              <Activity className="w-10 h-10 text-[#00ff41]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00ff41] rounded-full shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs font-mono text-gray-400 mb-1">ACTIVE</div>
            <div className="text-4xl font-bold text-[#00ff41] font-mono">
              {activeCycles.length}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">
              Running cycles
            </div>
          </div>
        </div>

        {/* Total Cycles */}
        <div className="relative border border-[#00d4ff]/30 bg-[#1a1f2e] rounded-lg p-6">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00d4ff]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00d4ff]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00d4ff]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00d4ff]" />

          <div className="flex items-center justify-center mb-4">
            <div className="relative p-4 border-2 border-[#00d4ff] bg-[#00d4ff]/10 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(0,212,255,0.3)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(0,212,255,0.5)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
              <Calendar className="w-10 h-10 text-[#00d4ff]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00d4ff] rounded-full shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs font-mono text-gray-400 mb-1">TOTAL</div>
            <div className="text-4xl font-bold text-[#00d4ff] font-mono">
              {cycles.length}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">All cycles</div>
          </div>
        </div>

        {/* Doses Logged */}
        <div className="relative border border-[#ffaa00]/30 bg-[#1a1f2e] rounded-lg p-6">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ffaa00]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#ffaa00]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#ffaa00]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ffaa00]" />

          <div className="flex items-center justify-center mb-4">
            <div className="relative p-4 border-2 border-[#ffaa00] bg-[#ffaa00]/10 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,170,0,0.3)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(255,170,0,0.5)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
              <CheckCircle2 className="w-10 h-10 text-[#ffaa00]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#ffaa00] rounded-full shadow-[0_0_6px_rgba(255,170,0,0.8)]" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs font-mono text-gray-400 mb-1">DOSES</div>
            <div className="text-4xl font-bold text-[#ffaa00] font-mono">
              {totalDosesLogged}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">Logged</div>
          </div>
        </div>

        {/* Completed */}
        <div className="relative border border-gray-600/30 bg-[#1a1f2e] rounded-lg p-6">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600" />

          <div className="flex items-center justify-center mb-4">
            <div className="relative p-4 border-2 border-gray-600 bg-gray-600/10 rounded-lg shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(100,100,100,0.3)] hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),inset_-1px_-1px_2px_rgba(100,100,100,0.5)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
              <TrendingUp className="w-10 h-10 text-gray-400" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gray-500 rounded-full shadow-[0_0_6px_rgba(100,100,100,0.8)]" />
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs font-mono text-gray-400 mb-1">COMPLETE</div>
            <div className="text-4xl font-bold text-gray-300 font-mono">
              {completedCycles.length}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">Finished</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Active Cycles & Next Doses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Cycles */}
          <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff41]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff41]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff41]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff41]" />

            <h2 className="text-lg font-mono font-bold text-[#00ff41] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              ACTIVE CYCLES
            </h2>

            {activeCycles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-mono text-sm">
                No active cycles. Create one in the Cycles tab.
              </div>
            ) : (
              <div className="space-y-3">
                {activeCycles.map((cycle) => {
                  const progress =
                    (cycle.dosesLogged / cycle.totalExpectedDoses) * 100;
                  const daysLeft = Math.ceil(
                    (new Date(cycle.endDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={cycle.id}
                      className="border border-gray-600/50 bg-black/30 rounded-lg p-4 hover:border-[#00ff41]/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
                          <span className="text-[#00ff41] font-mono font-bold">
                            {cycle.peptideName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          {daysLeft}d left
                        </span>
                      </div>

                      <div className="text-sm text-gray-400 mb-3">
                        {cycle.doseAmount} • {cycle.frequency.times}x{" "}
                        {cycle.frequency.type}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-gray-400">PROGRESS</span>
                          <span className="text-[#00d4ff]">
                            {cycle.dosesLogged}/{cycle.totalExpectedDoses} doses
                          </span>
                        </div>
                        <div className="h-2 bg-black/50 border border-[#00ff41]/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#00ff41] to-[#00d4ff] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Doses */}
          <div className="relative border border-[#00d4ff]/30 bg-[#1a1f2e] rounded-lg p-6">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00d4ff]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00d4ff]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00d4ff]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00d4ff]" />

            <h2 className="text-lg font-mono font-bold text-[#00d4ff] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              UPCOMING DOSES
            </h2>

            {upcomingDoses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-mono text-sm">
                No upcoming doses scheduled.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDoses.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="flex items-center justify-between p-3 border border-gray-600/50 bg-black/30 rounded"
                  >
                    <div>
                      <div className="text-[#00d4ff] font-mono text-sm font-bold">
                        {cycle.peptideName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cycle.doseAmount}
                      </div>
                    </div>
                    <div className="text-xs text-[#ffaa00] font-mono">
                      Next: Today
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Weight Widget & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Weight Widget */}
          <QuickWeightWidget
            lastWeight={profile?.weight_lbs}
            lastDate={profile?.updated_at}
            unitsPreference={
              (profile?.units_preference as "imperial" | "metric") || "imperial"
            }
          />

          {/* Recent Activity */}
          <div className="relative border border-gray-600/30 bg-[#1a1f2e] rounded-lg p-6">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gray-600" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-gray-600" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gray-600" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gray-600" />

            <h2 className="text-lg font-mono font-bold text-gray-300 mb-4">
              RECENT ACTIVITY
            </h2>

            {recentWeightLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-mono text-sm">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-2">
                {recentWeightLogs.map((log) => (
                  <div
                    key={log.logged_at}
                    className="flex items-center justify-between p-2 border-b border-gray-700/50 last:border-0"
                  >
                    <div>
                      <div className="text-gray-300 font-mono text-sm">
                        Weight: {log.weight_lbs} lbs
                      </div>
                      {log.notes && (
                        <div className="text-xs text-gray-500">{log.notes}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </div>
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
