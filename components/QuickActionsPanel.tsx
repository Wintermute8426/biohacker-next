"use client";

import { useRouter } from "next/navigation";
import { Plus, Upload, Calendar, TrendingUp } from "lucide-react";

export default function QuickActionsPanel() {
  const router = useRouter();

  const actions = [
    { label: "Start Cycle", icon: Plus, onClick: () => router.push("/app/cycles"), color: "green" },
    { label: "Upload Lab", icon: Upload, onClick: () => router.push("/app/labs"), color: "blue" },
    { label: "View Calendar", icon: Calendar, onClick: () => router.push("/app/calendar"), color: "purple" },
    { label: "Log Weight", icon: TrendingUp, onClick: () => router.push("/app/weight-log"), color: "amber" }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: "border-[#00ffaa]/40 bg-[#00ffaa]/5 text-[#00ffaa] hover:bg-[#00ffaa]/15",
      blue: "border-[#00d9ff]/40 bg-[#00d9ff]/5 text-[#00d9ff] hover:bg-[#00d9ff]/15",
      purple: "border-[#ff00ff]/40 bg-[#ff00ff]/5 text-[#ff00ff] hover:bg-[#ff00ff]/15",
      amber: "border-amber-500/40 bg-amber-500/5 text-amber-500 hover:bg-amber-500/15"
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in sm:col-span-2">
      <div className="led-card-top-right">
        <span className="led-dot led-green" aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xQACT
      </span>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono mt-3">
        ⚡ Quick Actions
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 font-mono text-xs font-medium transition-all ${getColorClasses(action.color)}`}
            >
              <Icon className="w-5 h-5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
