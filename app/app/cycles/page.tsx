import protocolData from "@/data/protocol-templates.json";
import peptideData from "@/data/peptide-research-v2.json";
import { CyclesContent } from "./cycles-content";

export type { Cycle, CycleFrequency, ProtocolTemplate, ProtocolPeptide } from "./cycles-content";

export default function CyclesPage() {
  const protocols = protocolData as import("./cycles-content").ProtocolTemplate[];
  const peptides = peptideData as { peptideName: string }[];
  const peptideNames = peptides.map((p) => p.peptideName);

  return <CyclesContent protocols={protocols} peptideNames={peptideNames} />;
}
