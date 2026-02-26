"use client";

import { Trash2 } from "lucide-react";
import { deleteInventoryItem, type PeptideInventoryItem } from "@/lib/expense-database";

interface InventoryCardProps {
  item: PeptideInventoryItem;
  onDeleted: () => void;
}

export default function InventoryCard({ item, onDeleted }: InventoryCardProps) {
  const handleDelete = async () => {
    if (!confirm(`Delete ${item.peptideName} from inventory?`)) return;
    
    const result = await deleteInventoryItem(item.id);
    if (result.success) {
      onDeleted();
    } else {
      alert(result.error || "Failed to delete inventory item");
    }
  };

  const daysUntilExpiry = item.expiryDate
    ? Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const expiryColor =
    daysUntilExpiry !== null && daysUntilExpiry < 30
      ? "text-red-500"
      : daysUntilExpiry !== null && daysUntilExpiry < 90
      ? "text-orange-500"
      : "text-[#9a9aa3]";

  return (
    <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-mono text-sm font-bold text-[#00ffaa]">
          {item.peptideName}
        </h3>
        <button
          onClick={handleDelete}
          className="text-[#9a9aa3] hover:text-red-500 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {item.supplier && (
          <div className="flex justify-between">
            <span className="text-[#9a9aa3]">Supplier:</span>
            <span className="text-[#e0e0e5]">{item.supplier}</span>
          </div>
        )}

        {item.vialSizeMg && (
          <div className="flex justify-between">
            <span className="text-[#9a9aa3]">Vial size:</span>
            <span className="text-[#e0e0e5]">{item.vialSizeMg}mg</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-[#9a9aa3]">Quantity:</span>
          <span className="text-[#00ffaa] font-bold">{item.quantity}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#9a9aa3]">Cost/vial:</span>
          <span className="text-[#00ffaa]">${item.costPerVial.toFixed(2)}</span>
        </div>

        {item.purchasedDate && (
          <div className="flex justify-between">
            <span className="text-[#9a9aa3]">Purchased:</span>
            <span className="text-[#e0e0e5]">
              {new Date(item.purchasedDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {item.expiryDate && (
          <div className="flex justify-between">
            <span className="text-[#9a9aa3]">Expires:</span>
            <span className={expiryColor}>
              {new Date(item.expiryDate).toLocaleDateString()}
              {daysUntilExpiry !== null && ` (${daysUntilExpiry}d)`}
            </span>
          </div>
        )}

        {item.notes && (
          <div className="pt-2 border-t border-[#00ffaa]/10">
            <p className="text-[#9a9aa3] italic">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
