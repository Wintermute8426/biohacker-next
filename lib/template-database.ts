/**
 * Supabase database persistence for cycle templates.
 * CRUD for cycle_templates table.
 */

import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPES
// ============================================

export type TemplatePeptide = {
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
  route: string;
};

export type TemplateCategory =
  | "healing"
  | "performance"
  | "longevity"
  | "cognitive"
  | "sleep"
  | "weight_loss"
  | "custom";

export type TemplateSource = "user" | "community" | "official";

export type CycleTemplate = {
  id?: string;
  user_id?: string;
  name: string;
  description: string | null;
  peptides: TemplatePeptide[];
  duration_weeks: number | null;
  category: TemplateCategory;
  tags: string[];
  notes: string | null;
  source: TemplateSource;
  source_cycle_id: string | null;
  use_count: number;
  is_public: boolean;
  created_at?: Date;
  updated_at?: Date;
};

// ============================================
// LOAD
// ============================================

export async function loadTemplates(): Promise<CycleTemplate[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cycle_templates")
    .select("*")
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order("use_count", { ascending: false });

  if (error) {
    console.error("Error loading templates:", error);
    return [];
  }
  return (data || []).map(dbRowToTemplate);
}

export async function getTemplatesByCategory(
  category: TemplateCategory
): Promise<CycleTemplate[]> {
  const all = await loadTemplates();
  return all.filter((t) => t.category === category);
}

export async function getTemplateById(
  id: string
): Promise<CycleTemplate | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("cycle_templates")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .single();

  if (error || !data) return null;
  return dbRowToTemplate(data as Record<string, unknown>);
}

// ============================================
// SAVE / DELETE
// ============================================

export async function saveTemplate(
  template: CycleTemplate
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const row = templateToDbRow(template, user.id);
  const { error } = await supabase.from("cycle_templates").upsert(row);

  if (error) {
    console.error("Error saving template:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("cycle_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ============================================
// CREATE FROM CYCLE
// ============================================

export async function createTemplateFromCycle(
  cycleId: string,
  name: string,
  description: string | null,
  options?: { category?: TemplateCategory; tags?: string[]; notes?: string | null }
): Promise<{ success: boolean; error?: string; templateId?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data: cycle, error: cycleError } = await supabase
    .from("cycles")
    .select("*")
    .eq("id", cycleId)
    .eq("user_id", user.id)
    .single();

  if (cycleError || !cycle) {
    return { success: false, error: cycleError?.message ?? "Cycle not found" };
  }

  const frequencyStr = formatFrequencyForTemplate(cycle);
  const peptide: TemplatePeptide = {
    name: cycle.peptide_name ?? "Peptide",
    dosage: cycle.dose_amount ?? "",
    unit: "mcg",
    frequency: frequencyStr,
    route: "subq",
  };

  const start = cycle.start_date ? new Date(cycle.start_date) : null;
  const end = cycle.end_date ? new Date(cycle.end_date) : null;
  const durationWeeks =
    start && end
      ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)))
      : null;

  const template: CycleTemplate = {
    name,
    description,
    peptides: [peptide],
    duration_weeks: durationWeeks,
    category: options?.category ?? "custom",
    tags: options?.tags ?? [],
    notes: options?.notes ?? cycle.notes ?? null,
    source: "user",
    source_cycle_id: cycleId,
    use_count: 0,
    is_public: false,
  };

  const row = templateToDbRow(template, user.id);
  const { data: inserted, error: insertError } = await supabase
    .from("cycle_templates")
    .insert(row)
    .select("id")
    .single();

  if (insertError) {
    console.error("Error creating template from cycle:", insertError);
    return { success: false, error: insertError.message };
  }
  return { success: true, templateId: inserted?.id };
}

function formatFrequencyForTemplate(cycle: Record<string, unknown>): string {
  const type = cycle.frequency_type as string;
  const times = (cycle.frequency_times as number) ?? 1;
  const days = cycle.frequency_days as string[] | null;
  if (type === "daily") {
    return times === 1 ? "Daily" : `${times}x daily`;
  }
  if (type === "weekly") {
    const dayStr = days?.length ? ` (${days.join(", ")})` : "";
    return `${times}x weekly${dayStr}`;
  }
  if (type === "monthly") {
    const dates = cycle.frequency_dates as number[] | null;
    const dateStr = dates?.length ? ` (${dates.join(", ")})` : "";
    return `${times}x monthly${dateStr}`;
  }
  return "Daily";
}

// ============================================
// INCREMENT USE COUNT
// ============================================

export async function incrementTemplateUseCount(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: row } = await supabase
    .from("cycle_templates")
    .select("use_count")
    .eq("id", id)
    .single();

  const current = (row?.use_count as number) ?? 0;

  const { error } = await supabase
    .from("cycle_templates")
    .update({ use_count: current + 1, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error incrementing template use count:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ============================================
// TYPE CONVERTERS
// ============================================

function dbRowToTemplate(row: Record<string, unknown>): CycleTemplate {
  const peptides = (row.peptides as TemplatePeptide[] | null) ?? [];
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: (row.name as string) ?? "",
    description: (row.description as string | null) ?? null,
    peptides: Array.isArray(peptides) ? peptides : [],
    duration_weeks: (row.duration_weeks as number | null) ?? null,
    category: (row.category as TemplateCategory) ?? "custom",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    notes: (row.notes as string | null) ?? null,
    source: (row.source as TemplateSource) ?? "user",
    source_cycle_id: (row.source_cycle_id as string | null) ?? null,
    use_count: (row.use_count as number) ?? 0,
    is_public: (row.is_public as boolean) ?? false,
    created_at: row.created_at ? new Date(row.created_at as string) : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at as string) : undefined,
  };
}

function templateToDbRow(
  template: CycleTemplate,
  userId: string
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    user_id: userId,
    name: template.name,
    description: template.description ?? null,
    peptides: template.peptides,
    duration_weeks: template.duration_weeks ?? null,
    category: template.category,
    tags: template.tags ?? [],
    notes: template.notes ?? null,
    source: template.source,
    source_cycle_id: template.source_cycle_id ?? null,
    use_count: template.use_count ?? 0,
    is_public: template.is_public ?? false,
    updated_at: new Date().toISOString(),
  };
  if (template.id) row.id = template.id;
  return row;
}
