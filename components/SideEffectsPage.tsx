"use client";

import { useState, useEffect, useMemo } from "react";
import { loadCycles } from "@/lib/cycle-database";
import {
  loadSideEffects,
  deleteSideEffect,
  calculateSeverity,
  getActiveSymptoms,
  type SideEffect,
  type Severity,
} from "@/lib/side-effects-database";
import { Plus, AlertTriangle, Trash2 } from "lucide-react";
import SideEffectLogModal from "@/components/SideEffectLogModal";

function severityBadgeClass(severity: Severity): string {
  switch (severity) {
    case "mild":
      return "bg-green-500/20 border-green-500/40 text-green-500";
    case "moderate":
      return "bg-orange-500/20 border-orange-500/40 text-orange-500";
    case "severe":
      return "bg-red-500/20 border-red-500/40 text-red-500";
    default:
      return "bg-[#00ffaa]/20 border-[#00ffaa]/40 text-[#00ffaa]";
  }
}

function formatLoggedAt(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SideEffectsPage() {
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [cycles, setCycles] = useState<{ id: string; peptideName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    peptideFilter: "",
    severityFilter: "" as Severity | "",
    dateFrom: "",
    dateTo: "",
  });

  const refresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([loadSideEffects(), loadCycles()])
      .then(([effects, cyclesList]) => {
        setSideEffects(effects);
        setCycles(cyclesList.map((c) => ({ id: c.id, peptideName: c.peptideName })));
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load side effects");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    let list = [...sideEffects];
    if (filters.peptideFilter) {
      list = list.filter(
        (e) => e.peptideName.toLowerCase() === filters.peptideFilter.toLowerCase()
      );
    }
    if (filters.severityFilter) {
      list = list.filter((e) => calculateSeverity(e) === filters.severityFilter);
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      list = list.filter((e) => new Date(e.loggedAt).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      const toTime = to.getTime();
      list = list.filter((e) => new Date(e.loggedAt).getTime() <= toTime);
    }
    return list;
  }, [sideEffects, filters]);

  const peptideOptions = useMemo(() => {
    const set = new Set(sideEffects.map((e) => e.peptideName));
    return Array.from(set).sort();
  }, [sideEffects]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this side effect log?")) return;
    const result = await deleteSideEffect(id);
    if (result.success) refresh();
    else setError(result.error ?? "Delete failed");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
          SIDE EFFECTS TRACKER
        </h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg border-2 border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 hover:border-[#00ffaa] transition-all"
        >
          <Plus className="h-4 w-4" />
          LOG EFFECT
        </button>
      </div>

      {/* Filters */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4 flex flex-wrap gap-4 items-end">
        <div className="min-w-[140px]">
          <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
            Peptide
          </label>
          <select
            value={filters.peptideFilter}
            onChange={(e) => setFilters((f) => ({ ...f, peptideFilter: e.target.value }))}
            className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
          >
            <option value="">All</option>
            {peptideOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
            Severity
          </label>
          <select
            value={filters.severityFilter}
            onChange={(e) =>
              setFilters((f) => ({ ...f, severityFilter: e.target.value as Severity | "" }))
            }
            className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
          >
            <option value="">All</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Timeline */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center font-mono text-[#9a9aa3]">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center font-mono text-[#9a9aa3]">
            No side effects logged.
          </div>
        ) : (
          <ul className="divide-y divide-[#00ffaa]/10">
            {filtered.map((effect) => {
              const severity = calculateSeverity(effect);
              const symptoms = getActiveSymptoms(effect);
              return (
                <li
                  key={effect.id}
                  className="p-4 hover:bg-[#00ffaa]/5 transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-[#9a9aa3]">
                        {formatLoggedAt(effect.loggedAt)}
                      </p>
                      <p className="font-mono text-sm font-bold text-[#00ffaa] uppercase mt-0.5">
                        {effect.peptideName}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded border font-mono text-[10px] capitalize ${severityBadgeClass(severity)}`}
                      >
                        {severity}
                      </span>
                      {effect.injectionSite && (
                        <p className="font-mono text-xs text-[#9a9aa3] mt-1">
                          Site: {effect.injectionSite}
                        </p>
                      )}
                      {symptoms.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {symptoms.map((s) => (
                            <li
                              key={s}
                              className="font-mono text-xs text-[#e0e0e5]"
                            >
                              • {s}
                            </li>
                          ))}
                        </ul>
                      )}
                      {effect.notes && (
                        <p className="font-mono text-xs text-[#9a9aa3] mt-2 italic">
                          {effect.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 sm:mt-0 sm:ml-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(effect.id)}
                        className="p-2 rounded text-[#9a9aa3] hover:text-red-500 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showForm && (
        <SideEffectLogModal
          onSave={refresh}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
