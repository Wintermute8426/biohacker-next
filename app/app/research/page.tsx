import peptideData from "@/data/peptide-research-v2.json";
import { ResearchContent } from "./research-content";
import { markTaskComplete } from "@/lib/onboarding-helper";

export type { PeptideStudy, ResearchCategory } from "./research-content";

export default function ResearchPage() {
  const studies = peptideData as import("./research-content").PeptideStudy[];

  return <ResearchContent studies={studies} />;
}
