"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Circle } from "lucide-react";

interface Cycle {
  id: string;
  hex_id: string;
  peptide_name: string;
  dose_amount: string;
  start_date: string;
  end_date: string;
  status: "active" | "paused" | "completed";
  doses_logged: number;
  total_expected_doses: number;
}

interface TimelineMonth {
  month: string;
  year: number;
  startDate: Date;
  endDate: Date;
}

export default function CycleTimeline() {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [timelineMonths, setTimelineMonths] = useState<TimelineMonth[]>([]);

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: true });

    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }

    setCycles(data);

    // Build timeline months
    const firstDate = new Date(data[0].start_date);
    const lastDate = new Date(data[data.length - 1].end_date);

    const months: TimelineMonth[] = [];
    let current = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

    while (current <= lastDate) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      months.push({
        month: current.toLocaleDateString("en-US", { month: "short" }),
        year: current.getFullYear(),
        startDate: new Date(current),
        endDate: monthEnd
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    setTimelineMonths(months);
    setLoading(false);
  };

  const getCycleDuration = (cycle: Cycle) => {
    const start = new Date(cycle.start_date);
    const end = new Date(cycle.end_date);
    const durationMs = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    return durationDays;
  };

  const getCyclePosition = (cycle: Cycle) => {
    if (timelineMonths.length === 0) return { left: 0, width: 0 };

    const timelineStart = timelineMonths[0].startDate.getTime();
    const timelineEnd = timelineMonths[timelineMonths.length - 1].endDate.getTime();
    const timelineWidth = timelineEnd - timelineStart;

    const cycleStart = new Date(cycle.start_date).getTime();
    const cycleEnd = new Date(cycle.end_date).getTime();

    const left = ((cycleStart - timelineStart) / timelineWidth) * 100;
    const width = ((cycleEnd - cycleStart) / timelineWidth) * 100;

    return { left, width };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#00ffaa]";
      case "paused":
        return "bg-amber-400";
      case "completed":
        return "bg-[#22d3ee]";
      default:
        return "bg-[#9a9aa3]";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neon-green font-mono">LOADING TIMELINE...</div>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#9a9aa3]/30 p-6">
        <p className="font-mono text-sm text-[#9a9aa3]">
          No cycles found. Create cycles to see timeline visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-3">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00ffaa]" />
            <span className="font-mono text-xs text-[#e0e0e5]">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="font-mono text-xs text-[#e0e0e5]">Paused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22d3ee]" />
            <span className="font-mono text-xs text-[#e0e0e5]">Completed</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-4 overflow-x-auto">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
          Cycle Timeline ({cycles.length} cycles)
        </h3>

        {/* Month headers */}
        <div className="flex border-b border-[#00ffaa]/20 pb-2 mb-4 min-w-[800px]">
          {timelineMonths.map((month, index) => (
            <div
              key={index}
              className="flex-1 text-center font-mono text-[10px] text-[#9a9aa3]"
            >
              {month.month} {month.year}
            </div>
          ))}
        </div>

        {/* Cycle bars */}
        <div className="space-y-3 min-w-[800px]">
          {cycles.map((cycle) => {
            const position = getCyclePosition(cycle);
            const duration = getCycleDuration(cycle);

            return (
              <div key={cycle.id} className="relative h-12">
                {/* Cycle name */}
                <div className="absolute left-0 top-0 z-10 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#e0e0e5]">
                      {cycle.peptide_name}
                    </span>
                    <span className="font-mono text-[10px] text-[#22d3ee]">
                      {cycle.hex_id}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[#9a9aa3]">
                    {duration} days • {cycle.dose_amount}
                  </p>
                </div>

                {/* Cycle bar */}
                <div
                  className={`absolute top-0 h-12 rounded ${getStatusColor(cycle.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  style={{
                    left: `${position.left}%`,
                    width: `${position.width}%`,
                    minWidth: "20px"
                  }}
                  title={`${cycle.peptide_name} • ${new Date(cycle.start_date).toLocaleDateString()} - ${new Date(cycle.end_date).toLocaleDateString()}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Total Cycles</h4>
          <p className="font-mono text-2xl font-bold text-[#00ffaa]">
            {cycles.length}
          </p>
        </div>
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Active Now</h4>
          <p className="font-mono text-2xl font-bold text-[#00ffaa]">
            {cycles.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-4">
          <h4 className="font-mono text-xs text-[#9a9aa3] mb-1">Completed</h4>
          <p className="font-mono text-2xl font-bold text-[#22d3ee]">
            {cycles.filter((c) => c.status === "completed").length}
          </p>
        </div>
      </div>
    </div>
  );
}
