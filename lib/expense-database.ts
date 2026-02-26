/**
 * Supabase database persistence for peptide inventory and cycle expenses.
 * Uses same client pattern as lib/cycle-database.ts.
 */

import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPES
// ============================================

export type PeptideInventoryItem = {
  id: string;
  userId: string;
  peptideName: string;
  supplier: string | null;
  vialSizeMg: number | null;
  concentrationMgPerMl: number | null;
  volumeMl: number | null;
  costPerVial: number;
  quantity: number;
  purchasedDate: string | null; // YYYY-MM-DD
  expiryDate: string | null; // YYYY-MM-DD
  batchNumber: string | null;
  notes: string | null;
  createdAt: Date;
};

export type ExpenseType =
  | "peptide"
  | "supplies"
  | "lab_work"
  | "consultation"
  | "other";

export type CycleExpense = {
  id: string;
  userId: string;
  cycleId: string | null;
  peptideName: string | null;
  expenseType: ExpenseType;
  cost: number;
  description: string | null;
  purchasedDate: string | null; // YYYY-MM-DD
  notes: string | null;
  createdAt: Date;
};

export type MonthlySpending = {
  month: string; // YYYY-MM
  total: number;
};

// ============================================
// INVENTORY
// ============================================

export async function loadInventory(): Promise<PeptideInventoryItem[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("peptide_inventory")
    .select("*")
    .eq("user_id", user.id)
    .order("purchased_date", { ascending: false });

  if (error) {
    console.error("Error loading inventory:", error);
    return [];
  }

  return (data || []).map(dbRowToInventoryItem);
}

export async function saveInventoryItem(
  item: Partial<PeptideInventoryItem> & {
    peptideName: string;
    costPerVial: number;
    quantity: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const id = item.id ?? crypto.randomUUID();
  const row = {
    id,
    user_id: user.id,
    peptide_name: item.peptideName,
    supplier: item.supplier ?? null,
    vial_size_mg: item.vialSizeMg ?? null,
    concentration_mg_per_ml: item.concentrationMgPerMl ?? null,
    volume_ml: item.volumeMl ?? null,
    cost_per_vial: item.costPerVial,
    quantity: item.quantity,
    purchased_date: item.purchasedDate ?? null,
    expiry_date: item.expiryDate ?? null,
    batch_number: item.batchNumber ?? null,
    notes: item.notes ?? null,
    created_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
  };

  const { error } = await supabase.from("peptide_inventory").upsert(row);

  if (error) {
    console.error("Error saving inventory item:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteInventoryItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("peptide_inventory")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getExpiringInventory(
  withinDays: number = 30
): Promise<PeptideInventoryItem[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const end = new Date();
  end.setDate(end.getDate() + withinDays);
  const endStr = end.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("peptide_inventory")
    .select("*")
    .eq("user_id", user.id)
    .not("expiry_date", "is", null)
    .lte("expiry_date", endStr)
    .order("expiry_date", { ascending: true });

  if (error) {
    console.error("Error loading expiring inventory:", error);
    return [];
  }

  return (data || []).map(dbRowToInventoryItem);
}

// ============================================
// EXPENSES
// ============================================

export async function loadExpenses(
  cycleId?: string | null
): Promise<CycleExpense[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("cycle_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("purchased_date", { ascending: false })
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
    console.error("Error loading expenses:", error);
    return [];
  }

  return (data || []).map(dbRowToExpense);
}

export async function saveExpense(
  expense: Partial<CycleExpense> & { expenseType: ExpenseType; cost: number }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const id = expense.id ?? crypto.randomUUID();
  const row = {
    id,
    user_id: user.id,
    cycle_id: expense.cycleId ?? null,
    peptide_name: expense.peptideName ?? null,
    expense_type: expense.expenseType,
    cost: expense.cost,
    description: expense.description ?? null,
    purchased_date: expense.purchasedDate ?? null,
    notes: expense.notes ?? null,
    created_at: expense.createdAt ? new Date(expense.createdAt).toISOString() : new Date().toISOString(),
  };

  const { error } = await supabase.from("cycle_expenses").upsert(row);

  if (error) {
    console.error("Error saving expense:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteExpense(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("cycle_expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getMonthlySpending(
  months: number = 12
): Promise<MonthlySpending[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("cycle_expenses")
    .select("cost, purchased_date, created_at")
    .eq("user_id", user.id)
    .or(`purchased_date.gte.${startStr},purchased_date.is.null`);

  if (error) {
    console.error("Error loading monthly spending:", error);
    return [];
  }

  const byMonth = new Map<string, number>();
  for (let m = 0; m < months; m++) {
    const d = new Date(start.getFullYear(), start.getMonth() + m, 1);
    byMonth.set(d.toISOString().slice(0, 7), 0);
  }

  for (const row of data || []) {
    const dateStr = (row.purchased_date as string) ?? (row.created_at as string)?.slice(0, 10);
    if (!dateStr || dateStr < startStr || dateStr > endStr) continue;
    const month = dateStr.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + Number(row.cost));
  }

  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, total]) => ({ month, total }));
}

export async function getSpendingByCategory(
  startDate?: string | null,
  endDate?: string | null
): Promise<{ expenseType: ExpenseType; total: number }[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("cycle_expenses")
    .select("expense_type, cost")
    .eq("user_id", user.id);

  if (startDate) {
    query = query.gte("purchased_date", startDate);
  }
  if (endDate) {
    query = query.lte("purchased_date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading spending by category:", error);
    return [];
  }

  const byType = new Map<ExpenseType, number>();
  for (const row of data || []) {
    const t = row.expense_type as ExpenseType;
    byType.set(t, (byType.get(t) ?? 0) + Number(row.cost));
  }

  return Array.from(byType.entries()).map(([expenseType, total]) => ({
    expenseType,
    total,
  }));
}

export async function getTotalSpending(
  startDate?: string | null,
  endDate?: string | null
): Promise<number> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  let query = supabase
    .from("cycle_expenses")
    .select("cost")
    .eq("user_id", user.id);

  if (startDate) {
    query = query.gte("purchased_date", startDate);
  }
  if (endDate) {
    query = query.lte("purchased_date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading total spending:", error);
    return 0;
  }

  return (data || []).reduce((sum, row) => sum + Number(row.cost), 0);
}

export async function getCycleCost(cycleId: string): Promise<number> {
  const expenses = await loadExpenses(cycleId);
  return expenses.reduce((sum, e) => sum + e.cost, 0);
}

// ============================================
// TYPE CONVERTERS
// ============================================

function dbRowToInventoryItem(row: Record<string, unknown>): PeptideInventoryItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    peptideName: row.peptide_name as string,
    supplier: (row.supplier as string | null) ?? null,
    vialSizeMg: row.vial_size_mg != null ? Number(row.vial_size_mg) : null,
    concentrationMgPerMl: row.concentration_mg_per_ml != null ? Number(row.concentration_mg_per_ml) : null,
    volumeMl: row.volume_ml != null ? Number(row.volume_ml) : null,
    costPerVial: Number(row.cost_per_vial),
    quantity: Number(row.quantity),
    purchasedDate: (row.purchased_date as string | null) ?? null,
    expiryDate: (row.expiry_date as string | null) ?? null,
    batchNumber: (row.batch_number as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: new Date((row.created_at as string)),
  };
}

function dbRowToExpense(row: Record<string, unknown>): CycleExpense {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    cycleId: (row.cycle_id as string | null) ?? null,
    peptideName: (row.peptide_name as string | null) ?? null,
    expenseType: row.expense_type as ExpenseType,
    cost: Number(row.cost),
    description: (row.description as string | null) ?? null,
    purchasedDate: (row.purchased_date as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: new Date((row.created_at as string)),
  };
}
