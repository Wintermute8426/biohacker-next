"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Plus, Trash2 } from "lucide-react";
import {
  loadExpenses,
  loadInventory,
  deleteExpense,
  getMonthlySpending,
  getSpendingByCategory,
  getTotalSpending,
  getCycleCost,
  type CycleExpense,
  type ExpenseType,
} from "@/lib/expense-database";
import { loadCycles } from "@/lib/cycle-database";
import type { Cycle } from "@/lib/cycle-database";
import ExpenseLogModal from "@/components/ExpenseLogModal";
import InventoryCard from "@/components/InventoryCard";
import type { PeptideInventoryItem } from "@/lib/expense-database";

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  peptide: "Peptide",
  supplies: "Supplies",
  lab_work: "Lab work",
  consultation: "Consultation",
  other: "Other",
};

const CHART_COLORS = ["#00ffaa", "#22d3ee", "#a855f7", "#f59e0b", "#9a9aa3"];

type TabId = "expenses" | "inventory" | "reports";

export default function ExpensesPage() {
  const [tab, setTab] = useState<TabId>("expenses");
  const [expenses, setExpenses] = useState<CycleExpense[]>([]);
  const [inventory, setInventory] = useState<PeptideInventoryItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ expenseType: ExpenseType; total: number }[]>([]);
  const [ytdTotal, setYtdTotal] = useState(0);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleCosts, setCycleCosts] = useState<{ cycleId: string; name: string; cost: number }[]>([]);
  const [filterType, setFilterType] = useState<ExpenseType | "">("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    const now = new Date();
    const ytdStart = `${now.getFullYear()}-01-01`;
    const ytdEnd = now.toISOString().slice(0, 10);

    Promise.all([
      loadExpenses(),
      loadInventory(),
      getMonthlySpending(6),
      getSpendingByCategory(ytdStart, ytdEnd),
      getTotalSpending(ytdStart, ytdEnd),
      loadCycles(),
    ]).then(async ([exps, inv, monthly, byCat, ytd, cyc]) => {
      setExpenses(exps);
      setInventory(inv);
      setMonthlyData(monthly);
      setCategoryData(byCat);
      setYtdTotal(ytd);
      setCycles(cyc);

      const costs = await Promise.all(
        cyc.map(async (c) => ({
          cycleId: c.id,
          name: c.peptideName,
          cost: await getCycleCost(c.id),
        }))
      );
      setCycleCosts(costs.filter((x) => x.cost > 0));
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    if (filterType && e.expenseType !== filterType) return false;
    const d = e.purchasedDate ?? e.createdAt.toISOString().slice(0, 10);
    if (filterStart && d < filterStart) return false;
    if (filterEnd && d > filterEnd) return false;
    return true;
  });

  const tabs: { id: TabId; label: string }[] = [
    { id: "expenses", label: "Expenses" },
    { id: "inventory", label: "Inventory" },
    { id: "reports", label: "Reports" },
  ];

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const result = await deleteExpense(id);
    if (result.success) refresh();
  };

  const chartTheme = {
    grid: "#00ffaa20",
    text: "#9a9aa3",
    fill: "#00ffaa",
  };
  return
  (
    <div className="space-y-6 pb-20">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg border-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              tab === t.id
                ? "border-[#00ffaa] bg-[#00ffaa]/20 text-[#00ffaa]"
                : "border-[#00ffaa]/25 bg-black/50 text-[#9a9aa3] hover:border-[#00ffaa]/50 hover:text-[#00ffaa]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters (Expenses tab) */}
      {tab === "expenses" && (
        <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ExpenseType | "")}
              className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
            >
              <option value="">All</option>
              {(Object.keys(EXPENSE_TYPE_LABELS) as ExpenseType[]).map((k) => (
                <option key={k} value={k}>
                  {EXPENSE_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">From</label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">To</label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
            />
          </div>
        </div>
      )}

      {/* Tab content */}
      {tab === "expenses" && (
        <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 overflow-hidden">
          {loading ? (
            <p className="p-6 font-mono text-sm text-[#9a9aa3]">Loading...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="p-6 font-mono text-sm text-[#9a9aa3]">No expenses yet. Log one below.</p>
          ) : (
            <ul className="divide-y divide-[#00ffaa]/10">
              {filteredExpenses.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-[#00ffaa]/5"
                >
                  <div>
                    <span className="font-mono text-sm text-[#f5f5f7]">
                      {e.peptideName || e.description || "Expense"}
                    </span>
                    <span className="ml-2 rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#00ffaa]">
                      {EXPENSE_TYPE_LABELS[e.expenseType]}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-[#9a9aa3]">
                      {e.purchasedDate ?? e.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-[#00ffaa]">
                      ${e.cost.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onCli
                      ck={() => handleDeleteExpense(e.id)}
                      className="rounded p-1 text-[#9a9aa3] hover:bg-red-500/20 hover:text-red-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "inventory" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          {loading ? (
            <p className="font-mono text-sm text-[#9a9aa3]">Loading...</p>
          ) : inventory.length === 0 ? (
            <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-12 text-center">
              <p className="font-mono text-[#9a9aa3]">
                No inventory yet. Log a peptide expense and add to inventory.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2 font-mono text-sm text-[#00ffaa] hover:bg-[#00ffaa]/20"
              >
                Log Expense
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item) => (
                <InventoryCard key={item.id} item={item} onDeleted={refresh} />
              ))}
            </div>
          )}
        </div>
      )}
{tab === "reports" &&
(
  <div className="space-y-8">
    <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4">
      <h3 className="font-mono text-sm font-bold text-[#00ffaa] mb-2">Year-to-date total</h3>
      <p className="font-mono text-3xl font-bold text-[#00ffaa] drop-shadow-[0_0_12px_rgba(0,255,170,0.5)]">
        ${ytdTotal.toFixed(2)}
      </p>
    </div>

    <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4">
      <h3 className="font-mono text-sm font-bold text-[#00ffaa] mb-4">
        Monthly spending (last 6 months)
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData.map((m) => ({
              name: m.month.slice(0, 7),
              total: m.total,
            }))}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis
              dataKey="name"
              stroke={chartTheme.text}
              tick={{ fontFamily: "monospace", fontSize: 10 }}
            />
            <YAxis
              stroke={chartTheme.text}
              tick={{ fontFamily: "monospace", fontSize: 10 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0e1a",
                border: "1px solid rgba(0,255,170,0.4)",
                borderRadius: 8,
              }}
              labelStyle={{ color: "#9a9aa3" }}
              formatter={(value) => `$${Number(value).toFixed(2)}`}
            />
            <Bar dataKey="total" fill={chartTheme.fill} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4">
      <h3 className="font-mono text-sm font-bold text-[#00ffaa] mb-4">
        Spending by category (YTD)
      </h3>
      {categoryData.length === 0 ? (
        <p className="font-mono text-xs text-[#9a9aa3]">No data yet.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.map((c) => ({
                  name: EXPENSE_TYPE_LABELS[c.expenseType],
                  value: c.total,
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#00ffaa40" }}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0e1a",
                  border: "1px solid rgba(0,255,170,0.4)",
                  borderRadius: 8,
                }}
                formatter={(value) => `$${Number(value).toFixed(2)}`}
              />
              <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>

    <div className="deck-card-bg dec
k-border-thick rounded-xl border-[#00ffaa]/20 overflow-hidden">
            <h3 className="font-mono text-sm font-bold text-[#00ffaa] p-4">Cost per cycle</h3>
            {cycleCosts.length === 0 ? (
              <p className="font-mono text-xs text-[#9a9aa3] p-4">No cycle expenses linked yet.</p>
            ) : (
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#00ffaa]/20 text-[#9a9aa3]">
                    <th className="text-left p-3">Cycle</th>
                    <th className="text-right p-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {cycleCosts.map((row) => (
                    <tr key={row.cycleId} className="border-b border-[#00ffaa]/10 text-[#e0e0e5]">
                      <td className="p-3">{row.name}</td>
                      <td className="p-3 text-right text-[#00ffaa]">${row.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#00ffaa] bg-[#00ffaa]/20 text-[#00ffaa] shadow-[0_0_20px_rgba(0,255,170,0.4)] hover:bg-[#00ffaa]/30 transition-colors"
        aria-label="Log expense"
      >
        <Plus className="w-6 h-6" />
      </button>

      {modalOpen && <ExpenseLogModal onSave={refresh} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
