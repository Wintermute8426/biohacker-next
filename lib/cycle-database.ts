/**
 * Supabase database persistence for cycles and doses.
 * Replaces cycle-storage.ts localStorage implementation.
 */

import { createClient } from "@/lib/supabase/client";

export type CycleFrequency = {
  type: "daily" | "weekly" | "monthly";
  times: number;
  days?: string[];
  dates?: number[];
};

export type Cycle = {
  id: string;
  hexId: string;
  peptideName: string;
  doseAmount: string;
  frequency: CycleFrequency;
  startDate: Date;
  endDate: Date;
  status: "active" | "paused" | "completed";
  protocolId?: string;
  dosesLogged: number;
  totalExpectedDoses: number;
  notes?: string;
  completedAt?: Date;
};

export type DoseStatus = "scheduled" | "logged" | "missed";

export type Dose = {
  id: string;
  cycleId: string;
  peptideName: string;
  doseAmount: string;
  route: string;
  timeLabel: string;
  scheduledDate: string; // YYYY-MM-DD format
  status: DoseStatus;
  loggedAt?: Date;
  notes?: string;
};

// ============================================
// CYCLES
// ============================================

export async function loadCycles(): Promise<Cycle[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("cycles")
    .select("*")
    .order("start_date", { ascending: false });
  
  if (error) {
    console.error("Error loading cycles:", error);
    return [];
  }
  
  return (data || []).map(dbCycleToCycle);
}

export async function saveCycle(cycle: Cycle): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }
  
  const dbCycle = cycleToDbCycle(cycle, user.id);
  
  const { error } = await supabase
    .from("cycles")
    .upsert(dbCycle);
  
  if (error) {
    console.error("Error saving cycle:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function deleteCycle(cycleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // Cascade delete will handle doses automatically
  const { error } = await supabase
    .from("cycles")
    .delete()
    .eq("id", cycleId);
  
  if (error) {
    console.error("Error deleting cycle:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function getActiveCyclesCount(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc("get_active_cycles_count");
  
  if (error) {
    console.error("Error getting active cycles count:", error);
    return 0;
  }
  
  return data || 0;
}

// ============================================
// DOSES
// ============================================

export async function loadDoses(startDate: Date, endDate: Date): Promise<Dose[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("doses")
    .select("*")
    .gte("scheduled_date", startDate.toISOString().slice(0, 10))
    .lte("scheduled_date", endDate.toISOString().slice(0, 10))
    .order("scheduled_date", { ascending: true });
  
  if (error) {
    console.error("Error loading doses:", error);
    return [];
  }
  
  return (data || []).map(dbDoseToDose);
}

export async function saveDose(dose: Dose): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }
  
  const dbDose = doseToDbDose(dose, user.id);
  
  const { error } = await supabase
    .from("doses")
    .upsert(dbDose);
  
  if (error) {
    console.error("Error saving dose:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function updateDoseStatus(
  doseId: string,
  status: DoseStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  
  if (status === "logged") {
    updates.logged_at = new Date().toISOString();
  }
  
  if (notes !== undefined) {
    updates.notes = notes;
  }
  
  const { error } = await supabase
    .from("doses")
    .update(updates)
    .eq("id", doseId);
  
  if (error) {
    console.error("Error updating dose status:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function getDosesTodayCount(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc("get_doses_today_count");
  
  if (error) {
    console.error("Error getting doses today count:", error);
    return 0;
  }
  
  return data || 0;
}

export async function getAdherencePercentage(days: number = 7): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc("get_adherence_percentage", { days });
  
  if (error) {
    console.error("Error getting adherence percentage:", error);
    return 100.0;
  }
  
  return data || 100.0;
}

// ============================================
// TYPE CONVERTERS
// ============================================

function dbCycleToCycle(dbCycle: any): Cycle {
  return {
    id: dbCycle.id,
    hexId: dbCycle.hex_id,
    peptideName: dbCycle.peptide_name,
    doseAmount: dbCycle.dose_amount,
    frequency: {
      type: dbCycle.frequency_type,
      times: dbCycle.frequency_times,
      days: dbCycle.frequency_days,
      dates: dbCycle.frequency_dates,
    },
    startDate: new Date(dbCycle.start_date),
    endDate: new Date(dbCycle.end_date),
    status: dbCycle.status,
    protocolId: dbCycle.protocol_id,
    dosesLogged: dbCycle.doses_logged,
    totalExpectedDoses: dbCycle.total_expected_doses,
    notes: dbCycle.notes,
    completedAt: dbCycle.completed_at ? new Date(dbCycle.completed_at) : undefined,
  };
}

function cycleToDbCycle(cycle: Cycle, userId: string): any {
  return {
    id: cycle.id,
    user_id: userId,
    hex_id: cycle.hexId,
    peptide_name: cycle.peptideName,
    dose_amount: cycle.doseAmount,
    frequency_type: cycle.frequency.type,
    frequency_times: cycle.frequency.times,
    frequency_days: cycle.frequency.days || null,
    frequency_dates: cycle.frequency.dates || null,
    start_date: cycle.startDate.toISOString().slice(0, 10),
    end_date: cycle.endDate.toISOString().slice(0, 10),
    status: cycle.status,
    protocol_id: cycle.protocolId || null,
    doses_logged: cycle.dosesLogged,
    total_expected_doses: cycle.totalExpectedDoses,
    notes: cycle.notes || null,
    completed_at: cycle.completedAt ? cycle.completedAt.toISOString() : null,
  };
}

function dbDoseToDose(dbDose: any): Dose {
  return {
    id: dbDose.id,
    cycleId: dbDose.cycle_id,
    peptideName: dbDose.peptide_name,
    doseAmount: dbDose.dose_amount,
    route: dbDose.route,
    timeLabel: dbDose.time_label,
    scheduledDate: dbDose.scheduled_date,
    status: dbDose.status,
    loggedAt: dbDose.logged_at ? new Date(dbDose.logged_at) : undefined,
    notes: dbDose.notes,
  };
}

function doseToDbDose(dose: Dose, userId: string): any {
  return {
    id: dose.id,
    user_id: userId,
    cycle_id: dose.cycleId,
    peptide_name: dose.peptideName,
    dose_amount: dose.doseAmount,
    route: dose.route,
    time_label: dose.timeLabel,
    scheduled_date: dose.scheduledDate,
    status: dose.status,
    logged_at: dose.loggedAt ? dose.loggedAt.toISOString() : null,
    notes: dose.notes || null,
  };
}
