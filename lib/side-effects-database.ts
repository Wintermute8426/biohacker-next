import { createClient } from "@/lib/supabase/client";

export type Severity = "mild" | "moderate" | "severe";

export interface SideEffect {
  id: string;
  userId: string;
  cycleId?: string;
  doseLogId?: string;
  peptideName: string;
  injectionSite?: string;
  siteRedness: boolean;
  siteSwelling: boolean;
  sitePainLevel: number;
  siteItching: boolean;
  siteBruising: boolean;
  fatigueLevel: number;
  headacheLevel: number;
  nausea: boolean;
  dizziness: boolean;
  insomnia: boolean;
  increasedAppetite: boolean;
  decreasedAppetite: boolean;
  moodChanges?: string;
  waterRetention: boolean;
  jointPain: boolean;
  severity?: Severity;
  notes?: string;
  loggedAt: Date;
  createdAt: Date;
}

export interface SaveSideEffectParams {
  cycleId?: string;
  doseLogId?: string;
  peptideName: string;
  injectionSite?: string;
  siteRedness?: boolean;
  siteSwelling?: boolean;
  sitePainLevel?: number;
  siteItching?: boolean;
  siteBruising?: boolean;
  fatigueLevel?: number;
  headacheLevel?: number;
  nausea?: boolean;
  dizziness?: boolean;
  insomnia?: boolean;
  increasedAppetite?: boolean;
  decreasedAppetite?: boolean;
  moodChanges?: string;
  waterRetention?: boolean;
  jointPain?: boolean;
  severity?: Severity;
  notes?: string;
}

export async function loadSideEffects(): Promise<SideEffect[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("side_effects")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false });

  if (error) {
    console.error("Error loading side effects:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    cycleId: row.cycle_id,
    doseLogId: row.dose_log_id,
    peptideName: row.peptide_name,
    injectionSite: row.injection_site,
    siteRedness: row.site_redness || false,
    siteSwelling: row.site_swelling || false,
    sitePainLevel: row.site_pain_level || 0,
    siteItching: row.site_itching || false,
    siteBruising: row.site_bruising || false,
    fatigueLevel: row.fatigue_level || 0,
    headacheLevel: row.headache_level || 0,
    nausea: row.nausea || false,
    dizziness: row.dizziness || false,
    insomnia: row.insomnia || false,
    increasedAppetite: row.increased_appetite || false,
    decreasedAppetite: row.decreased_appetite || false,
    moodChanges: row.mood_changes,
    waterRetention: row.water_retention || false,
    jointPain: row.joint_pain || false,
    severity: row.severity as Severity | undefined,
    notes: row.notes,
    loggedAt: new Date(row.logged_at),
    createdAt: new Date(row.created_at),
  }));
}

export async function saveSideEffect(params: SaveSideEffectParams): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!params.peptideName) {
    return { success: false, error: "Peptide name is required" };
  }

  try {
    const { error } = await supabase
      .from("side_effects")
      .insert({
        user_id: user.id,
        cycle_id: params.cycleId,
        dose_log_id: params.doseLogId,
        peptide_name: params.peptideName,
        injection_site: params.injectionSite,
        site_redness: params.siteRedness || false,
        site_swelling: params.siteSwelling || false,
        site_pain_level: params.sitePainLevel || 0,
        site_itching: params.siteItching || false,
        site_bruising: params.siteBruising || false,
        fatigue_level: params.fatigueLevel || 0,
        headache_level: params.headacheLevel || 0,
        nausea: params.nausea || false,
        dizziness: params.dizziness || false,
        insomnia: params.insomnia || false,
        increased_appetite: params.increasedAppetite || false,
        decreased_appetite: params.decreasedAppetite || false,
        mood_changes: params.moodChanges,
        water_retention: params.waterRetention || false,
        joint_pain: params.jointPain || false,
        severity: params.severity,
        notes: params.notes,
        logged_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error saving side effect:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in saveSideEffect:", err);
    return { success: false, error: String(err) };
  }
}

export async function deleteSideEffect(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("side_effects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting side effect:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getSideEffectsBySeverity(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("side_effects")
    .select("severity")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error getting side effects by severity:", error);
    return {};
  }

  const grouped = (data || []).reduce((acc, row) => {
    const severity = row.severity || "unknown";
    if (!acc[severity]) acc[severity] = 0;
    acc[severity]++;
    return acc;
  }, {} as Record<string, number>);

  return grouped;
}

export async function getSideEffectsByPeptide(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("side_effects")
    .select("peptide_name")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error getting side effects by peptide:", error);
    return {};
  }

  const grouped = (data || []).reduce((acc, row) => {
    const peptide = row.peptide_name;
    if (!acc[peptide]) acc[peptide] = 0;
    acc[peptide]++;
    return acc;
  }, {} as Record<string, number>);

  return grouped;
}

// Helper to calculate overall severity from symptoms
export function calculateSeverity(effect: SideEffect): Severity {
  if (effect.severity) return effect.severity;

  // Auto-calculate based on symptom levels
  const maxPain = Math.max(effect.sitePainLevel, effect.fatigueLevel, effect.headacheLevel);
  const symptomCount = [
    effect.siteRedness,
    effect.siteSwelling,
    effect.siteItching,
    effect.siteBruising,
    effect.nausea,
    effect.dizziness,
    effect.insomnia,
    effect.waterRetention,
    effect.jointPain,
  ].filter(Boolean).length;

  if (maxPain >= 7 || symptomCount >= 5) return "severe";
  if (maxPain >= 4 || symptomCount >= 3) return "moderate";
  return "mild";
}

// Helper to get active symptoms list
export function getActiveSymptoms(effect: SideEffect): string[] {
  const symptoms: string[] = [];
  
  if (effect.siteRedness) symptoms.push("Injection site redness");
  if (effect.siteSwelling) symptoms.push("Injection site swelling");
  if (effect.sitePainLevel > 0) symptoms.push(`Injection site pain (${effect.sitePainLevel}/10)`);
  if (effect.siteItching) symptoms.push("Injection site itching");
  if (effect.siteBruising) symptoms.push("Injection site bruising");
  if (effect.fatigueLevel > 0) symptoms.push(`Fatigue (${effect.fatigueLevel}/10)`);
  if (effect.headacheLevel > 0) symptoms.push(`Headache (${effect.headacheLevel}/10)`);
  if (effect.nausea) symptoms.push("Nausea");
  if (effect.dizziness) symptoms.push("Dizziness");
  if (effect.insomnia) symptoms.push("Insomnia");
  if (effect.increasedAppetite) symptoms.push("Increased appetite");
  if (effect.decreasedAppetite) symptoms.push("Decreased appetite");
  if (effect.moodChanges) symptoms.push(`Mood changes: ${effect.moodChanges}`);
  if (effect.waterRetention) symptoms.push("Water retention");
  if (effect.jointPain) symptoms.push("Joint pain");

  return symptoms;
}
