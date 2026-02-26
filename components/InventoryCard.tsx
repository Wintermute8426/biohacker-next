"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteInventoryItem } from "@/lib/expense-database";
import type { PeptideInventoryItem } from "@/lib/expense-database";

interface InventoryCardProps {
  item: PeptideInventoryItem;
  onDeleted: () => void;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export default function InventoryCard({ item, onDeleted }: InventoryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const days = daysUntil(item.expiryDate);

  const expiryClass =
    days == null
      ? "text-[#9a9aa3]"
      : days < 0
        ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
        : days <= 30
          ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          : days <= 90
            ? "text-amber-400"
            : "text-[#00ffaa]";

  const handleDelete = async () => {
    if (!confirm("Remove this item from inventory?")) return;
    setDeleting(true);
    const result = await deleteInventoryItem(item.id);
    setDeleting(false);
    if (result.success) onDeleted();
  };

  return (
    <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-5 transition-all hover:border-[#00ffaa]/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-bold text-[#f5f5f7] truncate">
            {item.peptideName}
          </h3>
          {item.supplier && (
            <p className="font-mono text-[10px] text-[#9a9aa3] mt-0.5">
              {item.supplier}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {item.vialSizeMg != null && (
              <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#00ffaa]">
                {item.vialSizeMg} mg
              </span>
            )}
            <span className="rounded border border-[#9a9aa3]/30 bg-[#9a9aa3]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#9a9aa3]">
              ${item.costPerVial.toFixed(2)}/vial
            </span>
            <span className="rounded border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#22d3ee]">
              Qty: {item.quantity}
            </span>
          </div>
          {item.expiryDate && (
            <p className={`mt-2 font-mono text-[10px] ${expiryClass}`}>
              Expires: {item.expiryDate}
              {days != null && days >= 0 && days <= 90 && (
                <span className="ml-1">
                  ({days}d)
                </span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 rounded p-1.5 text-[#9a9aa3] hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
