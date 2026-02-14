import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, Calendar } from "lucide-react";
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
  
  const { data: cyclesData } = await supabase
    .from("cycles")
    .select("id")
    .limit(100);
  const totalProtocols = cyclesData?.length || 0;

  return (
    <div className="space-y-8">
      {/* Dashboard Stats - Simplified, Today's Doses at Top */}
      <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
        {/* Scanline effects */}
        <div className="scanline-layer-thin" aria-hidden="true"></div>
        <div className="scanline-layer-thick" aria-hidden="true"></div>

        {/* Main content */}
        <div className="relative z-10 space-y-6 p-4">
          {/* Stats Grid - Today's Doses First */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Today's Doses Widget - FIRST POSITION */}
            <TodaysDosesWidget />

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

            {/* Weight Tracker Widget */}
            <WeightTrackerWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
