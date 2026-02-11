import type { DoseRecommendation } from "@/components/DoseCalculatorV3";
import peptideData from "@/data/peptide-research-v2.json";

/**
 * Get dose recommendation for a peptide based on research data
 * All doses in mg (milligrams)
 */
export function getDoseRecommendation(peptideName: string): DoseRecommendation | undefined {
  const peptide = peptideData.find(
    (p) => p.peptideName.toLowerCase() === peptideName.toLowerCase()
  );

  if (!peptide) return undefined;

  // Manual mappings for common peptides (based on research)
  // All doses in mg
  const manualDoses: Record<string, DoseRecommendation> = {
    "BPC-157": {
      peptideName: "BPC-157",
      beginnerMg: 0.25,
      intermediateMg: 0.5,
      advancedMg: 0.75,
      maxSafeMg: 1.0,
      notes: "0.25-0.5mg twice daily is most researched. Higher doses for acute injury.",
    },
    "TB-500": {
      peptideName: "TB-500",
      beginnerMg: 2,
      intermediateMg: 3,
      advancedMg: 5,
      maxSafeMg: 7.5,
      notes: "2-5mg per injection, 2x/week. Loading phase: 5mg/week for 4-6 weeks.",
    },
    "Epitalon": {
      peptideName: "Epitalon",
      beginnerMg: 0.005,
      intermediateMg: 0.01,
      advancedMg: 0.02,
      maxSafeMg: 0.03,
      notes: "0.01mg (10mcg) daily for 10-20 days per cycle. 2-3 cycles per year.",
    },
    "GHK-Cu": {
      peptideName: "GHK-Cu",
      beginnerMg: 1,
      intermediateMg: 1.5,
      advancedMg: 3,
      maxSafeMg: 5,
      notes: "1-3mg per injection, 2-3x per week. Can be used topically or SubQ.",
    },
    "Thymosin Alpha-1": {
      peptideName: "Thymosin Alpha-1",
      beginnerMg: 0.8,
      intermediateMg: 1.6,
      advancedMg: 3.2,
      maxSafeMg: 5,
      notes: "0.8-1.6mg per injection, 2x/week. Higher doses for immune support.",
    },
    "Semax": {
      peptideName: "Semax",
      beginnerMg: 0.3,
      intermediateMg: 0.6,
      advancedMg: 1,
      maxSafeMg: 2,
      notes: "0.3-0.6mg intranasal daily. Can split into 2 doses. Cycle 4-8 weeks.",
    },
    "Selank": {
      peptideName: "Selank",
      beginnerMg: 0.25,
      intermediateMg: 0.5,
      advancedMg: 1,
      maxSafeMg: 2,
      notes: "0.25-0.5mg intranasal daily. Anxiolytic effects at 0.25mg.",
    },
    "Melanotan II": {
      peptideName: "Melanotan II",
      beginnerMg: 0.25,
      intermediateMg: 0.5,
      advancedMg: 1,
      maxSafeMg: 1.5,
      notes: "Start 0.25mg. Increase to 0.5-1mg. Tanning effects at 0.25mg+.",
    },
    "PT-141": {
      peptideName: "PT-141",
      beginnerMg: 1,
      intermediateMg: 1.75,
      advancedMg: 2,
      maxSafeMg: 2.5,
      notes: "1-2mg 45min before activity. Do not exceed 2x per week.",
    },
    "Ipamorelin": {
      peptideName: "Ipamorelin",
      beginnerMg: 0.2,
      intermediateMg: 0.3,
      advancedMg: 0.5,
      maxSafeMg: 1,
      notes: "0.2-0.3mg before bed or post-workout. Can combine with CJC-1295.",
    },
    "CJC-1295": {
      peptideName: "CJC-1295",
      beginnerMg: 1,
      intermediateMg: 2,
      advancedMg: 3,
      maxSafeMg: 5,
      notes: "1-2mg with Ipamorelin, 2-3x/week. DAC version: 2mg/week.",
    },
    "Tesamorelin": {
      peptideName: "Tesamorelin",
      beginnerMg: 1,
      intermediateMg: 2,
      advancedMg: 2,
      maxSafeMg: 3,
      notes: "2mg daily SubQ. FDA approved for visceral fat reduction.",
    },
    "AOD-9604": {
      peptideName: "AOD-9604",
      beginnerMg: 0.25,
      intermediateMg: 0.5,
      advancedMg: 1,
      maxSafeMg: 1.5,
      notes: "0.25-0.5mg daily on empty stomach. Fat loss effects at 0.25mg+.",
    },
    "MOTS-c": {
      peptideName: "MOTS-c",
      beginnerMg: 5,
      intermediateMg: 10,
      advancedMg: 15,
      maxSafeMg: 20,
      notes: "5-10mg SubQ, 2-3x/week. Metabolic and mitochondrial benefits.",
    },
    "SS-31 (Elamipretide)": {
      peptideName: "SS-31 (Elamipretide)",
      beginnerMg: 0.005,
      intermediateMg: 0.01,
      advancedMg: 0.02,
      maxSafeMg: 0.04,
      notes: "0.005-0.02mg (5-20mcg) SubQ daily. Mitochondrial repair peptide.",
    },
    "Cerebrolysin": {
      peptideName: "Cerebrolysin",
      beginnerMg: 5,
      intermediateMg: 10,
      advancedMg: 20,
      maxSafeMg: 30,
      notes: "5-10ml IV/IM daily for 10-20 days. Nootropic and neuroprotective.",
    },
    "P21": {
      peptideName: "P21",
      beginnerMg: 0.01,
      intermediateMg: 0.02,
      advancedMg: 0.05,
      maxSafeMg: 0.1,
      notes: "0.01-0.02mg (10-20mcg) intranasal daily. Neurogenesis and cognitive enhancement.",
    },
    "Dihexa": {
      peptideName: "Dihexa",
      beginnerMg: 0.001,
      intermediateMg: 0.005,
      advancedMg: 0.01,
      maxSafeMg: 0.02,
      notes: "0.001-0.005mg (1-5mcg) daily oral. Extremely potent - start very low.",
    },
  };

  const recommendation = manualDoses[peptideName];
  if (recommendation) {
    return recommendation;
  }

  // Fallback: Try to parse from dosing string
  const dosing = peptide.dosing || "";
  const match = dosing.match(/(\d+)-(\d+)\s*(mcg|mg)/i);
  if (match) {
    const [, low, high, unit] = match;
    const multiplier = unit.toLowerCase() === "mg" ? 1 : 0.001; // Convert mcg to mg
    const lowMg = parseFloat(low) * multiplier;
    const highMg = parseFloat(high) * multiplier;
    
    return {
      peptideName,
      beginnerMg: lowMg,
      intermediateMg: Math.round((lowMg + highMg) / 2 * 100) / 100,
      advancedMg: highMg,
      maxSafeMg: highMg * 1.5,
      notes: dosing,
    };
  }

  // Default conservative recommendation if no data
  return {
    peptideName,
    beginnerMg: 0.25,
    intermediateMg: 0.5,
    advancedMg: 1,
    maxSafeMg: 2,
    notes: "No specific dosing data available. Consult research or medical professional.",
  };
}

/**
 * Get all available peptide names that have dose recommendations
 */
export function getAvailablePeptides(): string[] {
  return peptideData.map((p) => p.peptideName);
}
