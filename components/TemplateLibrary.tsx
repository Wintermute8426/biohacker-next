"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Search } from "lucide-react";
import type { CycleTemplate, TemplateCategory } from "@/lib/template-database";
import { loadTemplates } from "@/lib/template-database";
import CycleTemplateCard from "@/components/CycleTemplateCard";

const CATEGORIES: { value: TemplateCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "healing", label: "Healing" },
  { value: "performance", label: "Performance" },
  { value: "longevity", label: "Longevity" },
  { value: "cognitive", label: "Cognitive" },
  { value: "sleep", label: "Sleep" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "custom", label: "Custom" },
];

type ViewFilter = "all" | "mine" | "community";

interface TemplateLibraryProps {
  onSaveAsTemplate?: (cycleId: string, cycleName: string) => void;
}

export default function TemplateLibrary({ onSaveAsTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<CycleTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<CycleTemplate | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
    const list = await loadTemplates();
    setTemplates(list);
    setLoading(false);
  };

  const filtered = templates.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (
        !t.name.toLowerCase().includes(q) &&
        !(t.description ?? "").toLowerCase().includes(q) &&
        !(t.tags ?? []).some((tag) => tag.toLowerCase().includes(q)) &&
        !(t.peptides ?? []).some((p) => p.name.toLowerCase().includes(q))
      )
        return false;
    }
    if (viewFilter === "mine" && t.user_id !== currentUserId) return false;
    if (viewFilter === "community" && (!t.is_public || t.user_id === currentUserId))
      return false;
    return true;
  });

  const hasCommunity = templates.some((t) => t.is_public && t.user_id !== currentUserId);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
              category === c.value
                ? "border-[#00ffaa] bg-[#00ffaa]/10 text-[#00ffaa]"
                : "border-[#00ffaa]/30 bg-black/30 text-[#9a9aa3] hover:border-[#00ffaa]/50 hover:text-[#e0e0e5]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search + View toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9aa3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg pl-9 pr-4 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3] focus:outline-none focus:border-[#00ffaa]"
          />
        </div>
        {hasCommunity && (
          <div className="flex rounded-lg border border-[#00ffaa]/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewFilter("all")}
              className={`px-3 py-2 font-mono text-[10px] ${
                viewFilter === "all"
                  ? "bg-[#00ffaa]/20 text-[#00ffaa]"
                  : "bg-black/30 text-[#9a9aa3] hover:text-[#e0e0e5]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setViewFilter("mine")}
              className={`px-3 py-2 font-mono text-[10px] ${
                viewFilter === "mine"
                  ? "bg-[#00ffaa]/20 text-[#00ffaa]"
                  : "bg-black/30 text-[#9a9aa3] hover:text-[#e0e0e5]"
              }`}
            >
              My Templates
            </button>
            <button
              type="button"
              onClick={() => setViewFilter("community")}
              className={`px-3 py-2 font-mono text-[10px] ${
                viewFilter === "community"
                  ? "bg-[#00ffaa]/20 text-[#00ffaa]"
                  : "bg-black/30 text-[#9a9aa3] hover:text-[#e0e0e5]"
              }`}
            >
              Community
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="font-mono text-sm text-[#9a9aa3]">Loading templates...</p>
      ) : filtered.length === 0 ? (
        <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-8 text-center">
          <FileText className="w-12 h-12 text-[#00ffaa]/50 mx-auto mb-3" />
          <p className="font-mono text-sm text-[#9a9aa3]">
            No templates yet. Complete a cycle and save it as a template!
          </p>
          {onSaveAsTemplate && (
            <p className="mt-2 font-mono text-xs text-[#00ffaa]">
              Go to Cycles → complete a cycle → &quot;Save as template&quot;
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <CycleTemplateCard
              key={template.id ?? template.name}
              template={template}
              currentUserId={currentUserId}
              onEdit={setEditingTemplate}
              onDeleted={load}
            />
          ))}
        </div>
      )}

      {/* Edit modal placeholder - could open a separate edit modal here when editingTemplate is set */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="deck-card-bg deck-border-thick rounded-xl p-6 max-w-md w-full border-[#22d3ee]/40">
            <p className="font-mono text-sm text-[#9a9aa3]">
              Edit template: <span className="text-[#22d3ee]">{editingTemplate.name}</span>
            </p>
            <p className="mt-2 font-mono text-xs text-[#9a9aa3]">
              Full edit UI can be added here (name, category, tags, etc.).
            </p>
            <button
              type="button"
              onClick={() => setEditingTemplate(null)}
              className="mt-4 rounded-lg border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-4 py-2 font-mono text-xs text-[#22d3ee]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
