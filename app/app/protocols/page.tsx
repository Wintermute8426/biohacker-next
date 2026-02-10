"use client";

import { useEffect } from "react";
import protocolData from "@/data/protocol-templates.json";
import { ProtocolsContent } from "./protocols-content";
import { markTaskComplete } from "@/lib/onboarding-helper";

export type { ProtocolTemplate, ProtocolCategory, ProtocolPeptide } from "./protocols-content";

export default function ProtocolsPage() {
  useEffect(() => {
    markTaskComplete("review_protocol");
  }, []);

  const protocols = protocolData as import("./protocols-content").ProtocolTemplate[];

  return <ProtocolsContent protocols={protocols} />;
}
