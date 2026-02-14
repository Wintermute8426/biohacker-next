import peptideData from "@/data/peptide-research-v3.json";
import { ResearchContent } from "./research-content";

export type { PeptideStudy, ResearchCategory } from "./research-content";

export default function ResearchPage() {
  const studies = peptideData as import("./research-content").PeptideStudy[];

  return <ResearchContent studies={studies} />;
}
