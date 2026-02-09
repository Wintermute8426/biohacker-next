import protocolData from "@/data/protocol-templates.json";
import { ProtocolsContent } from "./protocols-content";

export type { ProtocolTemplate, ProtocolCategory, ProtocolPeptide } from "./protocols-content";

export default function ProtocolsPage() {
  const protocols = protocolData as import("./protocols-content").ProtocolTemplate[];

  return <ProtocolsContent protocols={protocols} />;
}
