"use client";

import { useEffect, useState } from "react";
import {
  loadExpenses,
  loadInventory,
  getMonthlySpending,
  getSpendingByCategory,
  getTotalSpending,
  saveExpense,
  saveInventoryItem,
  deleteExpense,
  deleteInventoryItem,
  getExpiringInventory,
} from "@/lib/expense-database";
import type { CycleExpense, PeptideInventoryItem } from "@/lib/expense-database";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Package, TrendingUp, AlertTriangle, Plus, X } from "lucide-react";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<"expenses" | "inventory" | "reports">("expenses");
  const [expenses, setExpenses] = useState<CycleExpense[]>([]);
  const [inventory, setInventory] = useState<PeptideInventoryItem[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<{ month: string; total: number }[]>([]);
  const [categorySpending, setCategorySpending] = useState<{ category: string; total: number }[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [expiringInventory, setExpiringInventory] = useState<PeptideInventoryItem[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [expensesData, inventoryData, monthlyData, categoryData, totalData, expiringData] = await Promise.all([
      loadExpenses(),
      loadInventory(),
      getMonthlySpending(6),
      getSpendingByCategory(),
      getTotalSpending(new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()),
      getExpiringInventory(),
    ]);

    setExpenses(expensesData);
    setInventory(inventoryData);
    setMonthlySpending(monthlyData);
    setCategorySpending(categoryData);
    setTotalSpending(totalData);
    setExpiringInventory(expiringData);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="deck-card-bg deck-border p-6 text-center">
        <div className="text-green-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  const CHART_COLORS = {
    peptide: "#39ff14",
    supplies: "#00ffff",
    lab_work: "#ff6600",
    consultation: "#ff00ff",
    other: "#ffaa00",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="deck-card-bg deck-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="deck-section-title">EXPENSES & INVENTORY</div>
            <div className="text-xs text-green-500/60 mt-1">Track peptide costs and stock</div>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded hover:bg-green-500/20 transition-all text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            LOG EXPENSE
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-green-500/20">
          {(["expenses", "inventory", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold uppercase transition-all ${
                activeTab === tab
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-green-500/50 hover:text-green-500/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Tab */}
      {activeTab === "expenses" && (
        <div className="deck-card-bg deck-border p-4">
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-green-500/40 text-sm">
                No expenses logged yet. Click "LOG EXPENSE" to start tracking.
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-3 border-l-2 border-green-500/30 bg-black/20"
                >
                  <div>
                    <div className="text-sm text-green-500 font-bold">{expense.peptide_name}</div>
                    <div className="text-xs text-green-500/60">
                      {expense.expense_type} • {new Date(expense.purchased_date).toLocaleDateString()}
                    </div>
                    {expense.description && (
                      <div className="text-xs text-green-500/40 mt-1">{expense.description}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg text-green-500 font-bold">${expense.cost.toFixed(2)}</div>
                    <button
                      onClick={() => {
                        if (confirm("Delete this expense?")) {
                          deleteExpense(expense.id).then(loadData);
                        }
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {expiringInventory.length > 0 && (
            <div className="deck-card-bg deck-border border-orange-500/30 p-4">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <div className="text-sm font-bold">EXPIRING SOON</div>
              </div>
              <div className="space-y-2">
                {expiringInventory.map((item) => (
                  <div key={item.id} className="text-xs text-orange-500/80">
                    {item.peptide_name} - Expires {new Date(item.expiry_date!).toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="deck-card-bg deck-border p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-green-500/70">CURRENT STOCK</div>
              <button
                onClick={() => setShowInventoryModal(true)}
                className="text-xs text-green-500 border border-green-500/30 px-3 py-1 rounded hover:bg-green-500/10"
              >
                + ADD ITEM
              </button>
            </div>

            <div className="space-y-3">
              {inventory.length === 0 ? (
                <div className="text-center py-8 text-green-500/40 text-sm">
                  No inventory items yet.
                </div>
              ) : (
                inventory.map((item) => {
                  const daysUntilExpiry = item.expiry_date
                    ? Math.floor((new Date(item.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const expiryColor =
                    daysUntilExpiry && daysUntilExpiry < 30
                      ? "text-red-500"
                      : daysUntilExpiry && daysUntilExpiry < 90
                      ? "text-orange-500"
                      : "text-green-500/60";

                  return (
                    <div key={item.id} className="border-l-2 border-green-500/30 pl-3 py-2 bg-black/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-green-500 font-bold">{item.peptide_name}</div>
                          <div className="text-xs text-green-500/60 mt-1">
                            {item.vial_size_mg}mg • {item.supplier || "Unknown supplier"}
                          </div>
                          <div className="text-xs text-green-500/60">
                            Qty: {item.quantity} • ${item.cost_per_vial.toFixed(2)}/vial
                          </div>
                          {item.expiry_date && (
                            <div className={`text-xs mt-1 ${expiryColor}`}>
                              Expires: {new Date(item.expiry_date).toLocaleDateString()}
                              {daysUntilExpiry !== null && ` (${daysUntilExpiry}d)`}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Delete this inventory item?")) {
                              deleteInventoryItem(item.id).then(loadData);
                            }
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="deck-card-bg deck-border p-4">
              <div className="text-xs text-green-500/60 mb-1">THIS MONTH</div>
              <div className="text-3xl text-green-500 font-bold">${totalSpending.toFixed(2)}</div>
            </div>
            <div className="deck-card-bg deck-border p-4">
              <div className="text-xs text-green-500/60 mb-1">TOTAL EXPENSES</div>
              <div className="text-3xl text-green-500 font-bold">{expenses.length}</div>
            </div>
            <div className="deck-card-bg deck-border p-4">
              <div className="text-xs text-green-500/60 mb-1">INVENTORY ITEMS</div>
              <div className="text-3xl text-green-500 font-bold">{inventory.length}</div>
            </div>
          </div>

          {/* Monthly Spending Chart */}
          <div className="deck-card-bg deck-border p-4">
            <div className="deck-section-title mb-4">MONTHLY SPENDING (LAST 6 MONTHS)</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,0,0.1)" />
                <XAxis dataKey="month" stroke="#39ff14" tick={{ fontSize: 10 }} />
                <YAxis stroke="#39ff14" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #39ff14",
                    borderRadius: "4px",
                    fontSize: "10px",
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="total" fill="#39ff14" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spending by Category */}
          {categorySpending.length > 0 && (
            <div className="deck-card-bg deck-border p-4">
              <div className="deck-section-title mb-4">SPENDING BY CATEGORY</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      label={(entry) => entry.category}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[entry.category as keyof typeof CHART_COLORS] || "#39ff14"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0a0a",
                        border: "1px solid #39ff14",
                        fontSize: "10px",
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2">
                  {categorySpending.map((cat, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[cat.category as keyof typeof CHART_COLORS] || "#39ff14",
                          }}
                        />
                        <div className="text-green-500/70">{cat.category}</div>
                      </div>
                      <div className="text-green-500 font-bold">${cat.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals would go here - simplified for now */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="deck-card-bg deck-border p-6 max-w-md w-full">
            <div className="text-sm text-green-500/60 mb-4">Expense logging modal (simplified)</div>
            <button
              onClick={() => setShowExpenseModal(false)}
              className="text-red-500 border border-red-500/30 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
