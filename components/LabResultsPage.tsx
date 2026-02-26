"use client";

import { useState, useEffect, useMemo } from "react";
import {
  loadLabResults,
  deleteLabResult,
  getOutOfRangeBiomarkers,
} from "@/lib/lab-database";
import type { LabResult, OutOfRangeBiomarker } from "@/lib/lab-database";
import type { TestType } from "@/lib/lab-database";
import { Trash2, Plus, AlertTriangle, Eye, TestTube } from "lucide-react";
import LabResultModal from "@/components/LabResultModal";

const TEST_TYPE_LABELS: Record<TestType, string> = {
  bloodwork: "Bloodwork",
  hormone_panel: "Hormone Panel",
  metabolic: "Metabolic",
  custom: "Custom",
};

type TabId = "all" | "out_of_range" | "recent";

function isInRange(
  value: number,
  min?: number | null,
  max?: number | null
): boolean | null {
  if (min == null && max == null) return null;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function formatReferenceRange(
  min?: number | null,
  max?: number | null
): string {
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `≥ ${min}`;
  if (max != null) return `≤ ${max}`;
  return "—";
}

export default function LabResultsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [outOfRange, setOutOfRange] = useState<OutOfRangeBiomarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    testType: "" as TestType | "",
    biomarkerSearch: "",
  });
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const refresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      loadLabResults(),
      getOutOfRangeBiomarkers(90),
    ])
      .then(([results, outOfRangeList]) => {
        setLabResults(results);
        setOutOfRange(outOfRangeList);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load lab results");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredAndSortedResults = useMemo(() => {
    let list: LabResult[] = [...labResults];

    if (activeTab === "out_of_range") {
      const outOfRangeSet = new Set(
        outOfRange.map((o) => `${o.biomarkerName}|${o.testDate}`)
      );
      list = list.filter(
        (r) =>
          outOfRangeSet.has(`${r.biomarkerName}|${r.testDate}`) ||
          isInRange(r.value, r.referenceRangeMin, r.referenceRangeMax) === false
      );
    } else if (activeTab === "recent") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      list = list.filter((r) => r.testDate >= cutoffStr);
    }

    if (filters.dateFrom) {
      list = list.filter((r) => r.testDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      list = list.filter((r) => r.testDate <= filters.dateTo);
    }
    if (filters.testType) {
      list = list.filter((r) => r.testType === filters.testType);
    }
    if (filters.biomarkerSearch.trim()) {
      const q = filters.biomarkerSearch.trim().toLowerCase();
      list = list.filter((r) =>
        r.biomarkerName.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const cmp = a.testDate.localeCompare(b.testDate);
      return sortNewestFirst ? -cmp : cmp;
    });

    return list;
  }, [
    labResults,
    outOfRange,
    activeTab,
    filters,
    sortNewestFirst,
  ]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lab result?")) return;
    const result = await deleteLabResult(id);
    if (result.success) refresh();
    else setError(result.error ?? "Delete failed");
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "All Results" },
    { id: "out_of_range", label: "Out of Range" },
    { id: "recent", label: "Recent" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
          LAB RESULTS
        </h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg border-2 border-[#00ffaa]/40 bg-[#00ffaa]/10 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] hover:bg-[#00ffaa]/20 hover:border-[#00ffaa] transition-all"
        >
          <Plus className="h-4 w-4" />
          ADD RESULT
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg border-2 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "border-[#00ffaa] bg-[#00ffaa]/20 text-[#00ffaa]"
                : "border-[#00ffaa]/25 bg-black/50 text-[#9a9aa3] hover:border-[#00ffaa]/50 hover:text-[#00ffaa]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4 flex flex-wrap gap-4 items-end">
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
        <div>
          <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">Test type</label>
          <select
            value={filters.testType}
            onChange={(e) => setFilters((f) => ({ ...f, testType: e.target.value as TestType | "" }))}
            className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
          >
            <option value="">All</option>
            {(Object.keys(TEST_TYPE_LABELS) as TestType[]).map((k) => (
              <option key={k} value={k}>{TEST_TYPE_LABELS[k]}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">Biomarker search</label>
          <input
            type="text"
            value={filters.biomarkerSearch}
            onChange={(e) => setFilters((f) => ({ ...f, biomarkerSearch: e.target.value }))}
            placeholder="Search..."
            className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center font-mono text-[#9a9aa3]">
            Loading lab results...
          </div>
        ) : filteredAndSortedResults.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#9a9aa3]">
            <TestTube className="h-10 w-10 opacity-50" />
            <p className="font-mono text-sm">No lab results yet. Add your first result below.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-[#00ffaa]/20 text-[#9a9aa3] bg-black/20">
                  <th className="text-left p-3">
                    <button
                      type="button"
                      onClick={() => setSortNewestFirst((v) => !v)}
                      className="hover:text-[#00ffaa] transition-colors"
                    >
                      Test Date {sortNewestFirst ? "↓" : "↑"}
                    </button>
                  </th>
                  <th className="text-left p-3">Biomarker Name</th>
                  <th className="text-left p-3">Value</th>
                  <th className="text-left p-3">Reference Range</th>
                  <th className="text-left p-3">Lab Name</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedResults.map((row) => {
                  const inRange = isInRange(
                    row.value,
                    row.referenceRangeMin,
                    row.referenceRangeMax
                  );
                  const valueClass =
                    inRange === true
                      ? "text-[#39ff14]"
                      : inRange === false
                        ? "text-red-400"
                        : "text-[#9a9aa3]";
                  const rangeClass =
                    inRange === true
                      ? "text-[#39ff14]"
                      : inRange === false
                        ? "text-red-400"
                        : "text-[#9a9aa3]";
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[#00ffaa]/10 text-[#e0e0e5] hover:bg-[#00ffaa]/5 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap">{row.testDate}</td>
                      <td className="p-3">{row.biomarkerName}</td>
                      <td className={`p-3 font-bold ${valueClass}`}>
                        {row.value} {row.unit}
                      </td>
                      <td className={`p-3 ${rangeClass}`}>
                        {formatReferenceRange(
                          row.referenceRangeMin,
                          row.referenceRangeMax
                        )}
                      </td>
                      <td className="p-3 text-[#9a9aa3]">
                        {row.labName ?? "—"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {}}
                            className="p-1.5 rounded text-[#9a9aa3] hover:text-[#00ffaa] transition-colors"
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 rounded text-[#9a9aa3] hover:text-red-500 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <LabResultModal onSave={refresh} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
