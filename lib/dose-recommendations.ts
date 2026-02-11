import type { DoseRecommendation } from "@/components/DoseCalculator";
import peptideData from "@/data/peptide-research-v2.json";

/**
 * Get dose recommendation for a peptide based on research data
 */
export function getDoseRecommendation(peptideName: string): DoseRecommendation | undefined {
  const peptide = peptideData.find(
    (p) => p.peptideName.toLowerCase() === peptideName.toLowerCase()
  );

  if (!peptide) return undefined;

  // Parse dosing information from research data
  // Examples:
  // "250-500 mcg subcutaneous or oral twice daily; cycle 4-8 weeks"
  // "2.5-5 mg subcutaneous 2x/week; cycle 6-8 weeks"
  // "10-20 mcg subcutaneous daily; cycle ongoing"

  const dosing = peptide.dosing || "";
  
  // Manual mappings for common peptides (based on research)
  const manualDoses: Record<string, DoseRecommendation> = {
    "BPC-157": {
      peptideName: "BPC-157",
      beginnerMcg: 250,
      intermediateMcg: 500,
      advancedMcg: 750,
      maxSafeMcg: 1000,
      notes: "250-500mcg twice daily is most researched. Higher doses for acute injury.",
    },
    "TB-500": {
      peptideName: "TB-500",
      beginnerMcg: 2000,
      intermediateMcg: 3000,
      advancedMcg: 5000,
      maxSafeMcg: 7500,
      notes: "2-5mg per injection, 2x/week. Loading phase: 5mg/week for 4-6 weeks.",
    },
    "Epitalon": {
      peptideName: "Epitalon",
      beginnerMcg: 5,
      intermediateMcg: 10,
      advancedMcg: 20,
      maxSafeMcg: 30,
      notes: "10mcg daily for 10-20 days per cycle. 2-3 cycles per year.",
    },
    "GHK-Cu": {
      peptideName: "GHK-Cu",
      beginnerMcg: 1000,
      intermediateMcg: 1500,
      advancedMcg: 3000,
      maxSafeMcg: 5000,
      notes: "1-3mg per injection, 2-3x per week. Can be used topically or SubQ.",
    },
    "Thymosin Alpha-1": {
      peptideName: "Thymosin Alpha-1",
      beginnerMcg: 800,
      intermediateMcg: 1600,
      advancedMcg: 3200,
      maxSafeMcg: 5000,
      notes: "0.8-1.6mg per injection, 2x/week. Higher doses for immune support.",
    },
    "Semax": {
      peptideName: "Semax",
      beginnerMcg: 300,
      intermediateMcg: 600,
      advancedMcg: 1000,
      maxSafeMcg: 2000,
      notes: "300-600mcg intranasal daily. Can split into 2 doses. Cycle 4-8 weeks.",
    },
    "Selank": {
      peptideName: "Selank",
      beginnerMcg: 250,
      intermediateMcg: 500,
      advancedMcg: 1000,
      maxSafeMcg: 2000,
      notes: "250-500mcg intranasal daily. Anxiolytic effects at 250mcg.",
    },
    "Melanotan II": {
      peptideName: "Melanotan II",
      beginnerMcg: 250,
      intermediateMcg: 500,
      advancedMcg: 1000,
      maxSafeMcg: 1500,
      notes: "Start 250mcg. Increase to 500-1000mcg. Tanning effects at 250mcg+.",
    },
    "PT-141": {
      peptideName: "PT-141",
      beginnerMcg: 1000,
      intermediateMcg: 1750,
      advancedMcg: 2000,
      maxSafeMcg: 2500,
      notes: "1-2mg 45min before activity. Do not exceed 2x per week.",
    },
    "Ipamorelin": {
      peptideName: "Ipamorelin",
      beginnerMcg: 200,
      intermediateMcg: 300,
      advancedMcg: 500,
      maxSafeMcg: 1000,
      notes: "200-300mcg before bed or post-workout. Can combine with CJC-1295.",
    },
    "CJC-1295": {
      peptideName: "CJC-1295",
      beginnerMcg: 1000,
      intermediateMcg: 2000,
      advancedMcg: 3000,
      maxSafeMcg: 5000,
      notes: "1-2mg with Ipamorelin, 2-3x/week. DAC version: 2mg/week.",
    },
    "Tesamorelin": {
      peptideName: "Tesamorelin",
      beginnerMcg: 1000,
      intermediateMcg: 2000,
      advancedMcg: 2000,
      maxSafeMcg: 3000,
      notes: "2mg daily SubQ. FDA approved for visceral fat reduction.",
    },
    "AOD-9604": {
      peptideName: "AOD-9604",
      beginnerMcg: 250,
      intermediateMcg: 500,
      advancedMcg: 1000,
      maxSafeMcg: 1500,
      notes: "250-500mcg daily on empty stomach. Fat loss effects at 250mcg+.",
    },
    "MOTS-c": {
      peptideName: "MOTS-c",
      beginnerMcg: 5000,
      intermediateMcg: 10000,
      advancedMcg: 15000,
      maxSafeMcg: 20000,
      notes: "5-10mg SubQ, 2-3x/week. Metabolic and mitochondrial benefits.",
    },
    "SS-31 (Elamipretide)": {
      peptideName: "SS-31 (Elamipretide)",
      beginnerMcg: 5,
      intermediateMcg: 10,
      advancedMcg: 20,
      maxSafeMcg: 40,
      notes: "5-20mcg SubQ daily. Mitochondrial repair peptide.",
    },
    "Cerebrolysin": {
      peptideName: "Cerebrolysin",
      beginnerMcg: 5000,
      intermediateMcg: 10000,
      advancedMcg: 20000,
      maxSafeMcg: 30000,
      notes: "5-10ml IV/IM daily for 10-20 days. Nootropic and neuroprotective.",
    },
    "P21": {
      peptideName: "P21",
      beginnerMcg: 10,
      intermediateMcg: 20,
      advancedMcg: 50,
      maxSafeMcg: 100,
      notes: "10-20mcg intranasal daily. Neurogenesis and cognitive enhancement.",
    },
    "Dihexa": {
      peptideName: "Dihexa",
      beginnerMcg: 1,
      intermediateMcg: 5,
      advancedMcg: 10,
      maxSafeMcg: 20,
      notes: "1-5mcg daily oral. Extremely potent - start very low.",
    },
  };

  const recommendation = manualDoses[peptideName];
  if (recommendation) {
    return recommendation;
  }

  // Fallback: Try to parse from dosing string
  const match = dosing.match(/(\d+)-(\d+)\s*(mcg|mg)/i);
  if (match) {
    const [, low, high, unit] = match;
    const multiplier = unit.toLowerCase() === "mg" ? 1000 : 1;
    const lowMcg = parseInt(low) * multiplier;
    const highMcg = parseInt(high) * multiplier;
    
    return {
      peptideName,
      beginnerMcg: lowMcg,
      intermediateMcg: Math.round((lowMcg + highMcg) / 2),
      advancedMcg: highMcg,
      maxSafeMcg: highMcg * 1.5,
      notes: dosing,
    };
  }

  // Default conservative recommendation if no data
  return {
    peptideName,
    beginnerMcg: 250,
    intermediateMcg: 500,
    advancedMcg: 1000,
    maxSafeMcg: 2000,
    notes: "No specific dosing data available. Consult research or medical professional.",
  };
}

/**
 * Get all available peptide names that have dose recommendations
 */
export function getAvailablePeptides(): string[] {
  return peptideData.map((p) => p.peptideName);
}
