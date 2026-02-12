// Comprehensive peptide list for autocomplete
// Sourced from existing research database + common therapeutic peptides

export const PEPTIDE_LIST = [
  // Current database (15)
  "BPC-157",
  "TB-500",
  "Epitalon",
  "GHK-Cu",
  "Semaglutide",
  "Tirzepatide",
  "Ipamorelin",
  "CJC-1295",
  "Melanotan II",
  "Thymosin Alpha-1",
  "Semax",
  "Selank",
  "Dihexa",
  "PTN-166",
  "AOD-9604",
  
  // Growth Hormone & Secretagogues
  "GHRP-2",
  "GHRP-6",
  "Hexarelin",
  "MK-677 (Ibutamoren)",
  "Tesamorelin",
  "Sermorelin",
  "Mod GRF 1-29",
  
  // GLP-1 & Metabolic
  "Liraglutide",
  "Dulaglutide",
  "Exenatide",
  "Retatrutide",
  "HGH Fragment 176-191",
  "Tesofensine",
  
  // Recovery & Healing
  "Thymosin Beta-4 (TB-4)",
  "KPV",
  "LL-37",
  "ARA-290",
  "Cerebrolysin",
  "P21",
  
  // Cognitive & Neuroprotective
  "Noopept",
  "NSI-189",
  "Cerebrolysin",
  "Cortexin",
  "P21",
  "NA-Semax",
  "NA-Selank",
  "Adamax",
  
  // Aesthetic & Skin
  "Melanotan I",
  "PT-141 (Bremelanotide)",
  "Copper Peptide (GHK)",
  "Matrixyl",
  "Argireline",
  "Snap-8",
  
  // Immune & Longevity
  "Thymalin",
  "Pinealon",
  "Cortagen",
  "Vilon",
  "Livagen",
  "Cerluten",
  "Bronchogen",
  "Endoluten",
  "Svetinorm",
  "Taxorest",
  
  // Muscle & Performance
  "Follistatin-344",
  "ACE-031",
  "YK-11",
  "IGF-1 LR3",
  "IGF-1 DES",
  "MGF (Mechano Growth Factor)",
  "PEG-MGF",
  
  // Sexual Health
  "PT-141 (Bremelanotide)",
  "Kisspeptin",
  "Gonadorelin",
  "Triptorelin",
  
  // Joint & Connective Tissue
  "Pentosan Polysulfate",
  "Collagen Peptides",
  "UC-II",
  
  // Sleep & Circadian
  "DSIP (Delta Sleep-Inducing Peptide)",
  "Epithalon",
  
  // Research / Experimental
  "C-Max",
  "Humanin",
  "MOTS-c",
  "SS-31 (Elamipretide)",
  "FGL",
  "Adipotide",
  "5-Amino-1MQ"
].sort();

export interface PeptideInfo {
  name: string;
  category?: string;
  commonDose?: string;
}

export const PEPTIDE_CATEGORIES = {
  recovery: ["BPC-157", "TB-500", "TB-4", "KPV", "LL-37", "ARA-290"],
  metabolic: ["Semaglutide", "Tirzepatide", "Liraglutide", "Dulaglutide", "AOD-9604", "Tesofensine", "HGH Fragment 176-191"],
  growth_hormone: ["Ipamorelin", "CJC-1295", "GHRP-2", "GHRP-6", "Hexarelin", "MK-677 (Ibutamoren)", "Tesamorelin", "Sermorelin"],
  cognitive: ["Semax", "Selank", "Dihexa", "Noopept", "NSI-189", "Cerebrolysin", "P21", "NA-Semax"],
  aesthetic: ["GHK-Cu", "Melanotan II", "Melanotan I", "PT-141 (Bremelanotide)", "Matrixyl", "Argireline"],
  immune: ["Thymosin Alpha-1", "Thymalin", "LL-37"],
  longevity: ["Epitalon", "Epithalon", "Pinealon", "Humanin", "MOTS-c", "SS-31 (Elamipretide)"],
  performance: ["Follistatin-344", "IGF-1 LR3", "MGF (Mechano Growth Factor)", "YK-11"],
  sexual: ["PT-141 (Bremelanotide)", "Kisspeptin", "Gonadorelin"]
};
