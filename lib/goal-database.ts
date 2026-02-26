/**
 * Supabase database persistence for cycle goals and goal progress.
 * Uses same client pattern as lib/cycle-database.ts.
 */

import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPES
// ============================================

export type GoalType =
  | "weight_loss"
  | "weight_gain"
  | "injury_healing"
  | "sleep_improvement"
  | "strength_gain"
  | "endurance"
  | "recovery"
  | "body_composition"
  | "pain_reduction"
  | "cognitive"
  | "skin_health"
  | "hair_growth"
  | "custom";

export type GoalStatus =
  | "in_progress"
  | "achieved"
  | "partially_achieved"
  | "not_achieved"
  | "abandoned";

export type CycleGoal = {
  id: string;
  userId: string;
  cycleId: string | null;
  goalType: GoalType;
  goalDescription: string;
  targetValue: string | null;
  baselineValue: string | null;
  targetDate: string | null; // YYYY-MM-DD
  status: GoalStatus;
  achievedAt: Date | null;
  priority: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
};

export type GoalProgress = {
  id: string;
  goalId: string;
  userId: string;
  currentValue: string;
  notes: string | null;
  loggedAt: Date;
};

export type GoalWithLatestProgress = CycleGoal & {
  latestProgress: GoalProgress | null;
};

export type GoalStats = {
  total: number;
  achieved: number;
  failed: number;
  inProgress: number;
  completionRate: number;
};

// ============================================
// GOALS
// ============================================

/**
 * Fetch goals for the current user, optionally filtered by cycle.
 */
export async function loadGoals(cycleId?: string | null): Promise<CycleGoal[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("cycle_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (cycleId != null) {
    if (cycleId === "") {
      query = query.is("cycle_id", null);
    } else {
      query = query.eq("cycle_id", cycleId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading goals:", error);
    return [];
  }

  return (data || []).map(dbRowToGoal);
}

/**
 * Load all user goals with their latest progress entry.
 */
export async function loadAllGoals(): Promise<GoalWithLatestProgress[]> {
  const goals = await loadGoals();
  if (goals.length === 0) return [];

  const supabase = createClient();
  const goalIds = goals.map((g) => g.id);

  // Fetch all progress for these goals, ordered by logged_at desc so we can take latest per goal
  const { data: progressRows, error } = await supabase
    .from("goal_progress")
    .select("*")
    .in("goal_id", goalIds)
    .order("logged_at", { ascending: false });

  if (error) {
    console.error("Error loading goal progress:", error);
    return goals.map((g) => ({ ...g, latestProgress: null }));
  }

  const byGoal = new Map<string, GoalProgress>();
  for (const row of progressRows || []) {
    if (!byGoal.has(row.goal_id)) {
      byGoal.set(row.goal_id, dbRowToProgress(row));
    }
  }

  return goals.map((g) => ({
    ...g,
    latestProgress: byGoal.get(g.id) ?? null,
  }));
}

/**
 * Upsert a goal. Pass existing goal with id to update, or new goal (id will be set if missing).
 */
export async function saveGoal(
  goal: Partial<CycleGoal> & { goalType: GoalType; goalDescription: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const id = goal.id ?? crypto.randomUUID();
  const now = new Date().toISOString();

  const row = {
    id,
    user_id: user.id,
    cycle_id: goal.cycleId ?? null,
    goal_type: goal.goalType,
    goal_description: goal.goalDescription,
    target_value: goal.targetValue ?? null,
    baseline_value: goal.baselineValue ?? null,
    target_date: goal.targetDate ?? null,
    status: goal.status ?? "in_progress",
    achieved_at: goal.achievedAt ? new Date(goal.achievedAt).toISOString() : null,
    priority: goal.priority ?? 1,
    created_at: goal.createdAt ? new Date(goal.createdAt).toISOString() : now,
    updated_at: now,
  };

  const { error } = await supabase.from("cycle_goals").upsert(row);

  if (error) {
    console.error("Error saving goal:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a goal and its progress entries (cascade).
 */
export async function deleteGoal(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error: progressError } = await supabase
    .from("goal_progress")
    .delete()
    .eq("goal_id", id);

  if (progressError) {
    console.error("Error deleting goal progress:", progressError);
    return { success: false, error: progressError.message };
  }

  const { error } = await supabase.from("cycle_goals").delete().eq("id", id);

  if (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update goal status. Sets achieved_at when status is 'achieved'.
 */
export async function updateGoalStatus(
  id: string,
  status: GoalStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "achieved") {
    updates.achieved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("cycle_goals")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating goal status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// PROGRESS
// ============================================

/**
 * Add a progress entry for a goal.
 */
export async function logProgress(
  goalId: string,
  currentValue: string,
  notes?: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const row = {
    id: crypto.randomUUID(),
    goal_id: goalId,
    user_id: user.id,
    current_value: currentValue,
    notes: notes ?? null,
    logged_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("goal_progress").insert(row);

  if (error) {
    console.error("Error logging progress:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all progress entries for a goal, ordered by date (newest first).
 */
export async function getGoalProgress(goalId: string): Promise<GoalProgress[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("goal_progress")
    .select("*")
    .eq("goal_id", goalId)
    .order("logged_at", { ascending: false });

  if (error) {
    console.error("Error loading goal progress:", error);
    return [];
  }

  return (data || []).map(dbRowToProgress);
}

// ============================================
// STATS
// ============================================

/**
 * Return aggregate counts and completion rate for the current user's goals.
 */
export async function getGoalCompletionStats(): Promise<GoalStats> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { total: 0, achieved: 0, failed: 0, inProgress: 0, completionRate: 0 };
  }

  const { data, error } = await supabase
    .from("cycle_goals")
    .select("status")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error loading goals for stats:", error);
    return { total: 0, achieved: 0, failed: 0, inProgress: 0, completionRate: 0 };
  }

  const rows = data || [];
  const total = rows.length;
  const achieved = rows.filter((r) => r.status === "achieved").length;
  const failed = rows.filter((r) =>
    ["not_achieved", "abandoned"].includes(r.status)
  ).length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const completed = achieved + failed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    achieved,
    failed,
    inProgress,
    completionRate,
  };
}

// ============================================
// TYPE CONVERTERS
// ============================================

function dbRowToGoal(row: any): CycleGoal {
  return {
    id: row.id,
    userId: row.user_id,
    cycleId: row.cycle_id,
    goalType: row.goal_type,
    goalDescription: row.goal_description,
    targetValue: row.target_value,
    baselineValue: row.baseline_value,
    targetDate: row.target_date,
    status: row.status,
    achievedAt: row.achieved_at ? new Date(row.achieved_at) : null,
    priority: row.priority,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function dbRowToProgress(row: any): GoalProgress {
  return {
    id: row.id,
    goalId: row.goal_id,
    userId: row.user_id,
    currentValue: row.current_value,
    notes: row.notes,
    loggedAt: new Date(row.logged_at),
  };
}
