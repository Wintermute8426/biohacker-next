import { createClient } from "@/lib/supabase/client";

export type ExpenseType = "peptide" | "supplies" | "lab_work" | "consultation" | "other";

export interface CycleExpense {
  id: string;
  userId: string;
  expenseType: ExpenseType;
  peptideName?: string;
  cost: number;
  description?: string;
  purchasedDate?: string;
  cycleId?: string;
  createdAt: Date;
}

export interface PeptideInventoryItem {
  id: string;
  userId: string;
  peptideName: string;
  supplier?: string;
  vialSizeMg?: number;
  quantity: number;
  costPerVial: number;
  purchasedDate?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: Date;
}

export interface SaveExpenseParams {
  expenseType: ExpenseType;
  peptideName?: string;
  cost: number;
  description?: string;
  purchasedDate?: string;
  cycleId?: string;
  supplier?: string;
  vialSizeMg?: number;
  quantity?: number;
  notes?: string;
  addToInventory?: boolean;
}

export async function loadExpenses(): Promise<CycleExpense[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cycle_expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("purchased_date", { ascending: false });

  if (error) {
    console.error("Error loading expenses:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    expenseType: row.expense_type as ExpenseType,
    peptideName: row.peptide_name,
    cost: row.cost,
    description: row.description,
    purchasedDate: row.purchased_date,
    cycleId: row.cycle_id,
    createdAt: new Date(row.created_at),
  }));
}

export async function loadInventory(): Promise<PeptideInventoryItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("peptide_inventory")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading inventory:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    peptideName: row.peptide_name,
    supplier: row.supplier,
    vialSizeMg: row.vial_size_mg,
    quantity: row.quantity,
    costPerVial: row.cost_per_vial,
    purchasedDate: row.purchased_date,
    expiryDate: row.expiry_date,
    notes: row.notes,
    createdAt: new Date(row.created_at),
  }));
}

export async function saveExpense(params: SaveExpenseParams): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // Save expense
    const { data: expenseData, error: expenseError } = await supabase
      .from("cycle_expenses")
      .insert({
        user_id: user.id,
        expense_type: params.expenseType,
        peptide_name: params.peptideName,
        cost: params.cost,
        description: params.description,
        purchased_date: params.purchasedDate,
        cycle_id: params.cycleId,
      })
      .select()
      .single();

    if (expenseError) {
      console.error("Error saving expense:", expenseError);
      return { success: false, error: expenseError.message };
    }

    // Add to inventory if requested
    if (params.addToInventory && params.peptideName) {
      const { error: inventoryError } = await supabase
        .from("peptide_inventory")
        .insert({
          user_id: user.id,
          peptide_name: params.peptideName,
          supplier: params.supplier,
          vial_size_mg: params.vialSizeMg,
          quantity: params.quantity || 1,
          cost_per_vial: params.cost / (params.quantity || 1),
          purchased_date: params.purchasedDate,
          notes: params.notes,
        });

      if (inventoryError) {
        console.error("Error adding to inventory:", inventoryError);
        // Don't fail the whole operation if inventory add fails
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Error in saveExpense:", err);
    return { success: false, error: String(err) };
  }
}

export async function deleteExpense(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("cycle_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteInventoryItem(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("peptide_inventory")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getMonthlySpending(months: number): Promise<{ month: string; total: number }[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("get_monthly_spending", {
    user_id_input: user.id,
    months_back: months,
  });

  if (error) {
    console.error("Error getting monthly spending:", error);
    return [];
  }

  return data || [];
}

export async function getSpendingByCategory(startDate?: string, endDate?: string): Promise<{ expenseType: ExpenseType; total: number }[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("cycle_expenses")
    .select("expense_type, cost")
    .eq("user_id", user.id);

  if (startDate) query = query.gte("purchased_date", startDate);
  if (endDate) query = query.lte("purchased_date", endDate);

  const { data, error } = await query;

  if (error) {
    console.error("Error getting spending by category:", error);
    return [];
  }

  const grouped = (data || []).reduce((acc, row) => {
    const type = row.expense_type as ExpenseType;
    if (!acc[type]) acc[type] = 0;
    acc[type] += row.cost;
    return acc;
  }, {} as Record<ExpenseType, number>);

  return Object.entries(grouped).map(([expenseType, total]) => ({
    expenseType: expenseType as ExpenseType,
    total,
  }));
}

export async function getTotalSpending(startDate: string, endDate: string): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from("cycle_expenses")
    .select("cost")
    .eq("user_id", user.id)
    .gte("purchased_date", startDate)
    .lte("purchased_date", endDate);

  if (error) {
    console.error("Error getting total spending:", error);
    return 0;
  }

  return (data || []).reduce((sum, row) => sum + row.cost, 0);
}

export async function getCycleCost(cycleId: string): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from("cycle_expenses")
    .select("cost")
    .eq("user_id", user.id)
    .eq("cycle_id", cycleId);

  if (error) {
    console.error("Error getting cycle cost:", error);
    return 0;
  }

  return (data || []).reduce((sum, row) => sum + row.cost, 0);
}

export async function getExpiringInventory(daysAhead: number = 90): Promise<PeptideInventoryItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from("peptide_inventory")
    .select("*")
    .eq("user_id", user.id)
    .not("expiry_date", "is", null)
    .lte("expiry_date", futureDate.toISOString().slice(0, 10))
    .order("expiry_date", { ascending: true });

  if (error) {
    console.error("Error getting expiring inventory:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    peptideName: row.peptide_name,
    supplier: row.supplier,
    vialSizeMg: row.vial_size_mg,
    quantity: row.quantity,
    costPerVial: row.cost_per_vial,
    purchasedDate: row.purchased_date,
    expiryDate: row.expiry_date,
    notes: row.notes,
    createdAt: new Date(row.created_at),
  }));
}
