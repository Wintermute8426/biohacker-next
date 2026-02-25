"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, Activity, Upload, Play } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "dose" | "cycle" | "lab" | "weight";
  description: string;
  timestamp: string;
  icon: any;
}

export default function RecentActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const activities: ActivityItem[] = [];

    // Get recent cycles
    const { data: cycles } = await supabase
      .from("cycles")
      .select("id, protocol_id, start_date")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(3);

    cycles?.forEach(cycle => {
      activities.push({
        id: cycle.id,
        type: "cycle",
        description: `Started cycle: ${cycle.protocol_id}`,
        timestamp: cycle.start_date,
        icon: Play
      });
    });

    // Get recent weight logs
    const { data: weights } = await supabase
      .from("weight_logs")
      .select("id, weight, body_fat_percentage, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(2);

    weights?.forEach(w => {
      activities.push({
        id: w.id,
        type: "weight",
        description: `Logged weight: ${w.weight}lbs${w.body_fat_percentage ? ` (${w.body_fat_percentage}% BF)` : ''}`,
        timestamp: w.logged_at,
        icon: Activity
      });
    });

    // Sort by timestamp and take top 5
    const sorted = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    setActivities(sorted);
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span className="led-dot led-green" aria-hidden="true"></span>
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xACT1
      </span>

      <div className="flex items-center gap-2 mt-3">
        <Clock className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Recent Activity
      </h3>

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="text-xs text-[#9a9aa3] font-mono">Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-[#9a9aa3] font-mono">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-2 border-l-2 border-[#00ffaa]/30 pl-3 py-1">
                <Icon className="w-3 h-3 text-[#00ffaa] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e0e0e5] font-mono truncate">{activity.description}</p>
                  <p className="text-[10px] text-[#9a9aa3] font-mono">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
