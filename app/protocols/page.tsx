"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProtocolsContent } from "./protocols-content";
import { markTaskComplete } from "@/lib/onboarding-helper";
import type { ProtocolTemplate } from "./protocols-content";

// Fallback JSON data (for backwards compatibility if database is empty)
import protocolData from "@/data/protocol-templates.json";

export type { ProtocolTemplate, ProtocolCategory, ProtocolPeptide } from "./protocols-content";

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<ProtocolTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markTaskComplete("review_protocol");
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("protocols")
      .select("*")
      .order("is_official_template", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading protocols:", error);
      // Fallback to JSON data if database query fails
      setProtocols(protocolData as ProtocolTemplate[]);
    } else if (!data || data.length === 0) {
      // If database is empty, use JSON data as defaults
      setProtocols(protocolData as ProtocolTemplate[]);
    } else {
      // Use database protocols
      setProtocols(data as ProtocolTemplate[]);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#00ffaa] font-mono">Loading protocols...</div>
      </div>
    );
  }

  return <ProtocolsContent protocols={protocols} onProtocolCreated={loadProtocols} />;
}
