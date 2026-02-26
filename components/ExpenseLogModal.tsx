"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import PeptideAutocomplete from "@/components/PeptideAutocomplete";
import {
  saveExpense,
  saveInventoryItem,
  type ExpenseType,
} from "@/lib/expense-database";
import { loadCycles } from "@/lib/cycle-database";
import type { Cycle } from "@/lib/cycle-database";

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "peptide", label: "Peptide" },
  { value: "supplies", label: "Supplies" },
  { value: "lab_work", label: "Lab work" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

interface ExpenseLogModalProps {
  onSave: () => void;
  onClose: () => void;
  initialCycleId?: string | null;
  /** Pre-fill peptide name (e.g. when logging cost for a cycle). */
  initialPeptideName?: string | null;
}

export default function ExpenseLogModal({
  onSave,
  onClose,
  initialCycleId,
  initialPeptideName,
}: ExpenseLogModalProps) {
  const [peptideName, setPeptideName] = useState(initialPeptideName ?? "");
  const [expenseType, setExpenseType] = useState<ExpenseType>("peptide");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [purchasedDate, setPurchasedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [cycleId, setCycleId] = useState<string | null>(initialCycleId ?? null);
  const [notes, setNotes] = useState("");
  const [supplier, setSupplier] = useState("");
  const [vialSizeMg, setVialSizeMg] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [addToInventory, setAddToInventory] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCycles().then(setCycles);
  }, []);
  useEffect(() => {
    if (initialCycleId != null) setCycleId(initialCycleId);
  }, [initialCycleId]);
  useEffect(() => {
    if (initialPeptideName != null) setPeptideName(initialPeptideName);
  }, [initialPeptideName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const costNum = parseFloat(cost.replace(/[^0-9.-]/g, ""));
    if (Number.isNaN(costNum) || costNum < 0) {
      setError("Enter a valid cost");
      return;
    }
    if (expenseType === "peptide" && addToInventory && (!vialSizeMg.trim() || !quantity.trim())) {
      setError("Vial size and quantity required when adding to inventory");
      return;
    }
    setLoading(true);

    const expenseResult = await saveExpense({
      peptideName: peptideName.trim() || null,
      expenseType,
      cost: costNum,
      description: description.trim() || null,
      purchasedDate: purchasedDate.trim() || null,
      cycleId: cycleId === "" ? null : cycleId,
      notes: notes.trim() || null,
    });

    if (!expenseResult.success) {
      setLoading(false);
      setError(expenseResult.error ?? "Failed to save expense");
      return;
    }

    if (expenseType === "peptide" && addToInventory && peptideName.trim()) {
      await saveInventoryItem({
        peptideName: peptideName.trim(),
        supplier: supplier.trim() || null,
        vialSizeMg: vialSizeMg.trim() ? parseFloat(vialSizeMg) : null,
        quantity: parseInt(quantity, 10) || 1,
        costPerVial: costNum,
        purchasedDate: purchasedDate.trim() || null,
      });
    }

    setLoading(false);
    onSave();
    onClose();
  };

  const isPeptide = expenseType === "peptide";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-log-title"
    >
      <div
        className="deck-card-bg deck-border-thick rounded-xl w-full max-w-lg border-[#00ffaa]/40 bg-[#0a0e1a] p-6 shadow-[0_0_24px_rgba(0,255,170,0.15)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="expense-log-title"
            className="font-space-mono text-lg font-bold text-[#00ffaa]"
          >
            Log Expense
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#9a9aa3] hover:bg-[#00ffaa]/10 hover:text-[#00ffaa] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Peptide / item name
            </label>
            <PeptideAutocomplete
              value={peptideName}
              onChange={setPeptideName}
              placeholder="e.g. BPC-157"
              className="rounded-lg"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Type
            </label>
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            >
              {EXPENSE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Cost *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#00ffaa]">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg pl-8 pr-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
              placeholder="e.g. 5mg vial"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Purchased date
            </label>
            <input
              type="date"
              value={purchasedDate}
              onChange={(e) => setPurchasedDate(e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Linked cycle (optional)
            </label>
            <select
              value={cycleId ?? ""}
              onChange={(e) => setCycleId(e.target.value === "" ? null : e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            >
              <option value="">None</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.peptideName}
                </option>
              ))}
            </select>
          </div>

          {isPeptide && (
            <>
              <div className="border-t border-[#00ffaa]/20 pt-4 space-y-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#00ffaa]">
                  Peptide details (optional for inventory)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
                      placeholder="Vendor name"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">
                      Vial size (mg)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={vialSizeMg}
                      onChange={(e) => setVialSizeMg(e.target.value)}
                      className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 font-mono text-xs text-[#e0e0e5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addToInventory}
                    onChange={(e) => setAddToInventory(e.target.checked)}
                    className="accent-[#00ffaa]"
                  />
                  Also add to inventory
                </label>
              </div>
            </>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa] resize-none"
              placeholder="Optional notes"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#00ffaa]/40 bg-transparent py-2.5 font-mono text-xs text-[#9a9aa3] hover:bg-[#00ffaa]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg border border-[#00ffaa] bg-[#00ffaa]/10 py-2.5 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
