import protocolData from "@/data/protocol-templates.json";
import peptideData from "@/data/peptide-research-v2.json";
import { CyclesContent } from "./cycles-content";

export type { Cycle, CycleFrequency, ProtocolTemplate, ProtocolPeptide } from "./cycles-content";

type PageProps = { searchParams?: Promise<{ templateId?: string }> | { templateId?: string } };

export default async function CyclesPage({ searchParams }: PageProps) {
  const raw = searchParams ?? {};
  const params = raw && typeof (raw as Promise<unknown>).then === "function"
    ? await (raw as Promise<{ templateId?: string }>)
    : (raw as { templateId?: string });
  const templateId = params?.templateId;

  const protocols = protocolData as import("./cycles-content").ProtocolTemplate[];
  const peptides = peptideData as { peptideName: string }[];
  const peptideNames = peptides.map((p) => p.peptideName);

  return (
    <CyclesContent
      protocols={protocols}
      peptideNames={peptideNames}
      initialTemplateId={templateId}
    />
  );
}
