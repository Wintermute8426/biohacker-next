"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Pencil, Trash2 } from "lucide-react";
import type { CycleTemplate, TemplateCategory, TemplateSource } from "@/lib/template-database";
import { deleteTemplate } from "@/lib/template-database";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_STYLES: Record<TemplateCategory, string> = {
  healing: "bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]",
  performance: "bg-[#00d9ff]/20 border-[#00d9ff]/40 text-[#00d9ff]",
  longevity: "bg-[#a855f7]/20 border-[#a855f7]/40 text-[#a855f7]",
  cognitive: "bg-[#3b82f6]/20 border-[#3b82f6]/40 text-[#3b82f6]",
  sleep: "bg-indigo-500/20 border-indigo-500/40 text-indigo-400",
  weight_loss: "bg-amber-500/20 border-amber-500/40 text-amber-500",
  custom: "bg-[#9a9aa3]/20 border-[#9a9aa3]/40 text-[#9a9aa3]",
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  healing: "Healing",
  performance: "Performance",
  longevity: "Longevity",
  cognitive: "Cognitive",
  sleep: "Sleep",
  weight_loss: "Weight Loss",
  custom: "Custom",
};

const SOURCE_LABELS: Record<TemplateSource, string> = {
  user: "My Template",
  community: "Community",
  official: "Official",
};

interface CycleTemplateCardProps {
  template: CycleTemplate;
  currentUserId?: string | null;
  onEdit?: (template: CycleTemplate) => void;
  onDeleted?: () => void;
}

export default function CycleTemplateCard({
  template,
  currentUserId,
  onEdit,
  onDeleted,
}: CycleTemplateCardProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId && template.user_id === currentUserId;
  const canEdit = isOwner && onEdit;

  const handleStartCycle = () => {
    router.push(`/app/cycles?templateId=${template.id ?? ""}`);
  };

  const handleDelete = async () => {
    if (!template.id) return;
    setDeleting(true);
    const { success } = await deleteTemplate(template.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (success) onDeleted?.();
  };

  const categoryStyle = CATEGORY_STYLES[template.category] ?? CATEGORY_STYLES.custom;
  const categoryLabel = CATEGORY_LABELS[template.category] ?? template.category;

  return (
    <div className="deck-card-bg deck-border-thick rounded-xl border-green-500/20 p-5 transition-all hover:border-[#00ffaa]/40">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-mono text-lg font-bold text-[#00ffaa] tracking-tight drop-shadow-[0_0_8px_rgba(0,255,170,0.4)]">
          {template.name}
        </h3>
        <span className={`rounded border px-2 py-0.5 text-[10px] font-mono shrink-0 ${categoryStyle}`}>
          {categoryLabel}
        </span>
      </div>

      {template.source !== "user" && (
        <div className="mb-2">
          <span className="rounded border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-2 py-0.5 text-[10px] font-mono text-[#22d3ee]">
            {SOURCE_LABELS[template.source]}
          </span>
        </div>
      )}

      <ul className="space-y-1.5 mb-3">
        {(template.peptides || []).map((p, i) => (
          <li key={i} className="font-mono text-xs text-[#e0e0e5]">
            <span className="text-[#00ffaa]">{p.name}</span>
            {" — "}
            {p.dosage} {p.unit} · {p.frequency}
            {p.route && ` · ${p.route}`}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-[10px] text-[#9a9aa3]">
        {template.duration_weeks != null && (
          <span>{template.duration_weeks} week{template.duration_weeks !== 1 ? "s" : ""}</span>
        )}
        <span>Used {template.use_count ?? 0}x</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleStartCycle}
          className="flex items-center gap-1.5 rounded-lg border border-[#00ffaa]/50 bg-[#00ffaa]/10 px-3 py-2 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Start Cycle
        </button>
        {canEdit && (
          <button
            type="button"
            onClick={() => onEdit?.(template)}
            className="flex items-center gap-1.5 rounded-lg border border-[#22d3ee]/50 bg-[#22d3ee]/10 px-3 py-2 font-mono text-xs font-medium text-[#22d3ee] hover:bg-[#22d3ee]/20 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {isOwner && template.id && (
          confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#9a9aa3]">Delete?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-500/50 bg-red-500/20 px-2 py-1 font-mono text-[10px] text-red-400 hover:bg-red-500/30"
              >
                {deleting ? "..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-[#9a9aa3]/50 bg-[#9a9aa3]/10 px-2 py-1 font-mono text-[10px] text-[#9a9aa3]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )
        )}
      </div>
    </div>
  );
}
