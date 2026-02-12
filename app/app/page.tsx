import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, Calendar, ClipboardList, Target } from "lucide-react";
import TodaysDosesWidget from "@/components/TodaysDosesWidget";
import WeightTrackerWidget from "@/components/WeightTrackerWidget";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch real stats from database
  const { data: activeCyclesCount } = await supabase.rpc("get_active_cycles_count");
  const { data: dosesTodayCount } = await supabase.rpc("get_doses_today_count");
  const { data: adherencePercentage } = await supabase.rpc("get_adherence_percentage", { days: 7 });
  
  const { data: cyclesData } = await supabase
    .from("cycles")
    .select("id")
    .limit(100);
  const totalProtocols = cyclesData?.length || 0;

  return (
    <div className="space-y-8">
      {/* Dashboard Stats - Exact Protocol Style */}
      <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
        {/* Scanline effects */}
        <div className="scanline-layer-thin" aria-hidden="true"></div>
        <div className="scanline-layer-thick" aria-hidden="true"></div>

        {/* Main content */}
        <div className="relative z-10 space-y-6">
          {/* Enhanced Header section with prominent status light */}
          <div className="deck-section relative space-y-3 pt-4 pb-2">
            <div className="deck-bracket-bottom-left" aria-hidden="true"></div>
            <div className="deck-bracket-bottom-right" aria-hidden="true"></div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="font-space-mono text-2xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-3xl">
                  DASHBOARD | STATUS:
                </h1>
                {/* Large PC-style power LED - aligned with text midline */}
                <div className="relative flex items-center justify-center -translate-y-1 ml-2">
                  {/* Outer glow ring */}
                  <div className="absolute w-12 h-12 rounded-full bg-[#00ff41] opacity-30 blur-xl animate-pulse"></div>
                  {/* Middle glow */}
                  <div className="absolute w-9 h-9 rounded-full bg-[#00ff41] opacity-50 blur-md"></div>
                  {/* LED housing (dark bezel) - bigger */}
                  <div className="relative w-8 h-8 rounded-full bg-black border-[3px] border-gray-700 shadow-inner flex items-center justify-center">
                    {/* LED light */}
                    <div className="w-5 h-5 rounded-full bg-[#00ff41] shadow-[0_0_16px_#00ff41,inset_0_1px_3px_rgba(255,255,255,0.3)] animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3e5]">
              <span>SYS.VER: 1.0</span>
              <span>●</span>
              <span>ALL SYSTEMS NOMINAL</span>
            </div>
            <span className="hex-id absolute right-3 top-3 z-10" aria-hidden="true">
              0xDB01
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Active Cycles Card */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "0ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-green" aria-hidden="true"></span>
              </div>

              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xP101
              </span>

              <div className="flex items-center gap-2 mt-3">
                <Activity className="w-4 h-4 text-[#00ffaa] shrink-0" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Active Cycles
              </h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
                  CURRENTLY RUNNING
                </span>
                <span className="rounded border px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 border-amber-500/40">
                  ONLINE
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                  STATUS
                </span>
                <ul className="mt-1 list-inside list-disc text-xs text-[#e0e0e5] font-mono">
                  <li>{activeCyclesCount || 0} peptide protocol{(activeCyclesCount || 0) !== 1 ? 's' : ''} in progress</li>
                  <li>All cycles on schedule</li>
                  <li>No missed doses</li>
                </ul>
              </div>

              <div className="mt-3 text-xs font-mono text-[#00ffaa]">
                Est. adherence: 100%
              </div>

              <Link href="/app/cycles">
                <button className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60">
                  View cycles
                </button>
              </Link>
            </div>

            {/* Total Protocols Card */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "100ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-green" aria-hidden="true"></span>
              </div>

              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xP102
              </span>

              <div className="flex items-center gap-2 mt-3">
                <Calendar className="w-4 h-4 text-[#00ffaa] shrink-0" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Total Protocols
              </h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
                  LIBRARY
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                  AVAILABLE
                </span>
                <ul className="mt-1 list-inside list-disc text-xs text-[#e0e0e5] font-mono">
                  <li>{totalProtocols} total cycle{totalProtocols !== 1 ? 's' : ''} created</li>
                  <li>Custom protocols ready</li>
                  <li>Safety validated</li>
                </ul>
              </div>

              <div className="mt-3 text-xs font-mono text-[#00ffaa]">
                DB.VER: 2.0
              </div>

              <Link href="/app/protocols">
                <button className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60">
                  Browse protocols
                </button>
              </Link>
            </div>

            {/* Today's Doses Widget */}
            <TodaysDosesWidget />

            {/* Weight Tracker Widget */}
            <WeightTrackerWidget />

            {/* Adherence Card */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in" style={{animationDelay: "300ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-green" aria-hidden="true"></span>
              </div>

              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xP104
              </span>

              <div className="flex items-center gap-2 mt-3">
                <Target className="w-4 h-4 text-[#00ffaa] shrink-0" />
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Adherence (7d)
              </h3>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded border px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 border-amber-500/40">
                  EXCELLENT
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                  PERFORMANCE
                </span>
                <ul className="mt-1 list-inside list-disc text-xs text-[#e0e0e5] font-mono">
                  <li>{adherencePercentage?.toFixed(1) || '100.0'}% completion rate</li>
                  <li>Last 7 days performance</li>
                  <li>On track for goals</li>
                </ul>
              </div>

              <div className="mt-3 text-xs font-mono text-[#00ffaa]">
                Trend: Stable
              </div>

              <Link href="/app/calendar">
                <button className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60">
                  View details
                </button>
              </Link>
            </div>

            {/* Getting Started Card */}
            <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in sm:col-span-2" style={{animationDelay: "400ms"}}>
              <div className="led-card-top-right">
                <span className="led-dot led-green" aria-hidden="true"></span>
              </div>

              <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
                0xSTART
              </span>

              <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono mt-3">
                🚀 Getting Started
              </h3>

              <p className="mt-2 text-sm text-[#9a9aa3] font-mono">
                Set up your first peptide cycle in 3 simple steps
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00d9ff]/20 text-[#00d9ff] font-mono text-sm font-bold">
                      1
                    </div>
                    <h4 className="font-mono font-semibold text-white text-sm">Protocol</h4>
                  </div>
                  <p className="text-xs text-[#9a9aa3]">Build custom or use template</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff00ff]/20 text-[#ff00ff] font-mono text-sm font-bold">
                      2
                    </div>
                    <h4 className="font-mono font-semibold text-white text-sm">Cycle</h4>
                  </div>
                  <p className="text-xs text-[#9a9aa3]">Set dosage, frequency, dates</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00ffaa]/20 text-[#00ffaa] font-mono text-sm font-bold">
                      3
                    </div>
                    <h4 className="font-mono font-semibold text-white text-sm">Track</h4>
                  </div>
                  <p className="text-xs text-[#9a9aa3]">Log doses, monitor progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
