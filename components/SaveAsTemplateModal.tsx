"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createTemplateFromCycle } from "@/lib/template-database";
import type { TemplateCategory } from "@/lib/template-database";

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "healing", label: "Healing" },
  { value: "performance", label: "Performance" },
  { value: "longevity", label: "Longevity" },
  { value: "cognitive", label: "Cognitive" },
  { value: "sleep", label: "Sleep" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "custom", label: "Custom" },
];

interface SaveAsTemplateModalProps {
  cycleId: string;
  cycleName: string;
  onSave: () => void;
  onClose: () => void;
}

export default function SaveAsTemplateModal({
  cycleId,
  cycleName,
  onSave,
  onClose,
}: SaveAsTemplateModalProps) {
  const [name, setName] = useState(cycleName || "My Template");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("custom");
  const [tagsStr, setTagsStr] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createTemplateFromCycle(cycleId, name, description || null, {
      category,
      tags,
      notes: notes.trim() || null,
    });

    setLoading(false);
    if (result.success) {
      onSave();
      onClose();
    } else {
      setError(result.error ?? "Failed to save template");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-template-title"
    >
      <div
        className="deck-card-bg deck-border-thick rounded-xl w-full max-w-md border-[#00ffaa]/40 bg-[#0a0e1a] p-6 shadow-[0_0_24px_rgba(0,255,170,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="save-template-title"
            className="font-space-mono text-lg font-bold text-[#00ffaa]"
          >
            Save as Template
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

        <p className="font-mono text-xs text-[#9a9aa3] mb-4">
          From cycle: <span className="text-[#00ffaa]">{cycleName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
              placeholder="e.g. BPC-157 Recovery"
            />
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
              placeholder="Short description"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa]"
              placeholder="recovery, injury, 8-week"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#9a9aa3] mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-black/50 border border-[#00ffaa]/40 rounded-lg px-4 py-2.5 font-mono text-[#f5f5f7] focus:outline-none focus:border-[#00ffaa] resize-none"
              placeholder="Optional notes for this template"
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
              {loading ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
