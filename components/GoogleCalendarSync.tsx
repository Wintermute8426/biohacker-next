"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface CalendarConnection {
  id: string;
  provider: string;
  calendar_email: string;
  calendar_name: string;
  sync_enabled: boolean;
  last_sync_at: string | null;
  sync_status: string;
  sync_error: string | null;
}

export default function GoogleCalendarSync() {
  const [connection, setConnection] = useState<CalendarConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_connections")
      .select("*")
      .eq("provider", "google")
      .maybeSingle();

    if (!error && data) {
      setConnection(data);
    }
    setLoading(false);
  };

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = "/api/calendar/google/auth";
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/calendar/google/sync", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Synced ${result.synced} events successfully!${result.errors > 0 ? ` (${result.errors} errors)` : ""}`);
        loadConnection(); // Refresh connection status
      } else {
        const error = await response.json();
        alert(`Sync failed: ${error.error}`);
      }
    } catch (err) {
      alert("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? Your doses will no longer sync.")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("calendar_connections")
      .delete()
      .eq("provider", "google");

    if (!error) {
      setConnection(null);
      alert("Google Calendar disconnected");
    } else {
      alert("Failed to disconnect");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="text-[#9a9aa3]">Gmail:</span>
        <span className="text-gray-400">...</span>
        <button disabled className="cursor-wait rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[#9a9aa3] opacity-60 text-[10px]">
          LOADING
        </button>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="text-[#9a9aa3]">Gmail:</span>
        <span className="text-red-400">OFFLINE</span>
        <button
          onClick={handleConnect}
          className="rounded border border-[#00ff88]/40 bg-[#00ff88]/10 px-1.5 py-0.5 text-[#00ff88] hover:bg-[#00ff88]/20 transition-colors text-[10px]"
        >
          CONNECT
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="text-[#9a9aa3]">Gmail:</span>
        <span className={`${connection.sync_status === "active" ? "text-[#00ff88]" : "text-amber-400"}`}>
          {connection.sync_status === "active" ? "ONLINE" : "ERROR"}
        </span>
        <button
          onClick={handleDisconnect}
          className="rounded border border-red-500/40 bg-red-500/10 px-1.5 py-0.5 text-red-400 hover:bg-red-500/20 transition-colors text-[10px]"
        >
          DISCONNECT
        </button>
      </div>
      
      {connection.calendar_email && (
        <div className="text-[9px] text-gray-400 font-mono">
          {connection.calendar_email}
        </div>
      )}
      
      {connection.last_sync_at && (
        <div className="text-[9px] text-gray-500 font-mono">
          Last sync: {new Date(connection.last_sync_at).toLocaleString()}
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full rounded border border-[#00ff88]/40 bg-[#00ff88]/10 px-2 py-1 text-[#00ff88] hover:bg-[#00ff88]/20 transition-colors text-[10px] font-mono disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {syncing ? "SYNCING..." : "SYNC NOW"}
      </button>

      {connection.sync_error && (
        <div className="text-[9px] text-red-400 font-mono mt-1">
          Error: {connection.sync_error}
        </div>
      )}
    </div>
  );
}
