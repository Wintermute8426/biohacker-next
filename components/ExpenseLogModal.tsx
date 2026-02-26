"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { saveExpense, type ExpenseType } from "@/lib/expense-database";
import { loadCycles } from "@/lib/cycle-database";
import type { Cycle } from "@/lib/cycle-database";

interface ExpenseLogModalProps {
  onSave: () => void;
  onClose: () => void;
}

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "peptide", label: "Peptide" },
  { value: "supplies", label: "Supplies" },
  { value: "lab_work", label: "Lab Work" },
  { value: "consultation", label: "Consultation" },
  { value: "other", label: "Other" },
];

export default function ExpenseLogModal({ onSave, onClose }: ExpenseLogModalProps) {
  const [expenseType, setExpenseType] = useState<ExpenseType>("peptide");
  const [peptideName, setPeptideName] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [purchasedDate, setPurchasedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [linkedCycleId, setLinkedCycleId] = useState("");
  const [addToInventory, setAddToInventory] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [vialSizeMg, setVialSizeMg] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCycles().then(setCycles);
  }, []);

  const handleSave = async () => {
    if (!cost || parseFloat(cost) <= 0) {
      alert("Please enter a valid cost");
      return;
    }

    if (expenseType === "peptide" && !peptideName) {
      alert("Please enter peptide name");
      return;
    }

    setLoading(true);

    const result = await saveExpense({
      expenseType,
      peptideName: expenseType === "peptide" ? peptideName : undefined,
      cost: parseFloat(cost),
      description,
      purchasedDate,
      cycleId: linkedCycleId || undefined,
      supplier: addToInventory ? supplier : undefined,
      vialSizeMg: addToInventory && vialSizeMg ? parseFloat(vialSizeMg) : undefined,
      quantity: addToInventory ? parseInt(quantity) : undefined,
      notes: notes || undefined,
      addToInventory,
    });

    setLoading(false);

    if (result.success) {
      onSave();
      onClose();
    } else {
      alert(result.error || "Failed to save expense");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />

      {/* Modal - Fixed positioning with scroll */}
      <div className="fixed inset-4 z-50 flex items-start justify-center pt-8 pb-32 overflow-y-auto">
        <div className="deck-card-bg deck-border-thick border-[#00ffaa]/40 rounded-xl w-full max-w-md shadow-[0_0_30px_rgba(0,255,170,0.2)] my-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#00ffaa]/30">
            <h2 className="font-mono text-lg font-bold text-[#00ffaa]">LOG EXPENSE</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#00ffaa] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form - Extra bottom padding to clear nav */}
          <div className="p-4 space-y-4 pb-32">
            {/* Expense Type */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Type *
              </label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
              >
                {EXPENSE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Peptide Name (if type is peptide) */}
            {expenseType === "peptide" && (
              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  Peptide *
                </label>
                <input
                  type="text"
                  value={peptideName}
                  onChange={(e) => setPeptideName(e.target.value)}
                  placeholder="e.g. BPC-157"
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>
            )}

            {/* Cost */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Cost *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ffaa] font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="39"
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 pl-7 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="10mg vial"
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
              />
            </div>

            {/* Purchased Date */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Purchased Date
              </label>
              <input
                type="date"
                value={purchasedDate}
                onChange={(e) => setPurchasedDate(e.target.value)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
              />
            </div>

            {/* Linked Cycle */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Linked Cycle (Optional)
              </label>
              <select
                value={linkedCycleId}
                onChange={(e) => setLinkedCycleId(e.target.value)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
              >
                <option value="">None</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.peptideName}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Section */}
            {expenseType === "peptide" && (
              <>
                <div className="pt-2 border-t border-[#00ffaa]/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addToInventory}
                      onChange={(e) => setAddToInventory(e.target.checked)}
                      className="w-4 h-4 rounded border-[#00ffaa]/40 bg-black/50 checked:bg-[#00ffaa] focus:ring-[#00ffaa]"
                    />
                    <span className="font-mono text-xs text-[#00ffaa]">
                      Also add to inventory
                    </span>
                  </label>
                </div>

                {addToInventory && (
                  <>
                    <div className="font-mono text-[10px] text-[#00ffaa] uppercase mb-2">
                      Peptide Details (Optional for Inventory)
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">
                          Supplier
                        </label>
                        <input
                          type="text"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          placeholder="Vendor name"
                          className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">
                          Vial size (mg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={vialSizeMg}
                          onChange={(e) => setVialSizeMg(e.target.value)}
                          placeholder="5"
                          className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                        className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                rows={3}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-500/40 bg-black/50 text-gray-400 font-mono text-sm hover:bg-gray-500/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/20 text-[#00ffaa] font-mono text-sm font-bold hover:bg-[#00ffaa]/30 shadow-[0_0_12px_rgba(0,255,170,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
