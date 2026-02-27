"use client";

import { useState, useEffect, useMemo } from "react";
import {
  loadLabResults,
  deleteLabResult,
  getOutOfRangeBiomarkers,
} from "@/lib/lab-database";
import type { LabResult, OutOfRangeBiomarker, TestType } from "@/lib/lab-database";
import { Trash2, Plus, Eye, AlertTriangle } from "lucide-react";
import LabResultModal from "@/components/LabResultModal";
import { BloodworkAI } from "@/components/BloodworkAI";

const TEST_TYPE_LABELS: Record<TestType, string> = {
  bloodwork: "Bloodwork",
  hormone_panel: "Hormone Panel",
  metabolic: "Metabolic",
  custom: "Custom",
};

type TabId = "all" | "out_of_range" | "recent" | "upload";

export default function LabResultsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [outOfRange, setOutOfRange] = useState<OutOfRangeBiomarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterTestType, setFilterTestType] = useState<TestType | "">("");
  const [filterBiomarker, setFilterBiomarker] = useState("");

  const refresh = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      loadLabResults(),
      getOutOfRangeBiomarkers(90),
    ])
      .then(([results, outOfRangeResults]) => {
        setLabResults(results);
        setOutOfRange(outOfRangeResults);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load lab results");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    let list: LabResult[] = [...labResults];

    if (activeTab === "out_of_range") {
      const outOfRangeBiomarkers = new Set(outOfRange.map((o) => o.biomarkerName));
      list = list.filter((r) => outOfRangeBiomarkers.has(r.biomarkerName));
    }

    if (activeTab === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      list = list.filter((r) => new Date(r.testDate) >= thirtyDaysAgo);
    }

    if (filterDateFrom) {
      list = list.filter((r) => r.testDate >= filterDateFrom);
    }
    if (filterDateTo) {
      list = list.filter((r) => r.testDate <= filterDateTo);
    }
    if (filterTestType) {
      list = list.filter((r) => r.testType === filterTestType);
    }
    if (filterBiomarker) {
      list = list.filter((r) =>
        r.biomarkerName.toLowerCase().includes(filterBiomarker.toLowerCase())
      );
    }

    return list;
  }, [
    labResults,
    outOfRange,
    activeTab,
    filterDateFrom,
    filterDateTo,
    filterTestType,
    filterBiomarker,
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
    { id: "upload", label: "Upload" },
  ];

  const isInRange = (result: LabResult): boolean => {
    if (!result.referenceRangeMin || !result.referenceRangeMax) return true;
    return result.value >= result.referenceRangeMin && result.value <= result.referenceRangeMax;
  };

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
            className={`rounded-lg border-2 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "border-[#00ffaa] bg-[#00ffaa]/20 text-[#00ffaa]"
                : "border-[#00ffaa]/25 bg-black/50 text-[#9a9aa3] hover:border-[#00ffaa]/50 hover:text-[#00ffaa]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <BloodworkAI />
      )}

      {/* Other Tabs */}
      {activeTab !== "upload" && (
        <>
          {/* Filters */}
          <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">Test type</label>
              <select
                value={filterTestType}
                onChange={(e) => setFilterTestType(e.target.value as TestType | "")}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
              >
                <option value="">All</option>
                {(Object.keys(TEST_TYPE_LABELS) as TestType[]).map((k) => (
                  <option key={k} value={k}>{TEST_TYPE_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1">Biomarker search</label>
              <input
                type="text"
                value={filterBiomarker}
                onChange={(e) => setFilterBiomarker(e.target.value)}
                placeholder="Search biomarker..."
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-1.5 font-mono text-sm text-[#f5f5f7]"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Results Table */}
          <div className="deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/20 overflow-hidden">
            {loading ? (
              <div className="py-12 text-center font-mono text-[#9a9aa3]">
                Loading lab results...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-mono text-sm">No lab results yet. Add your first result below.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#00ffaa]/20">
                      <th className="text-left p-3 font-mono text-xs text-[#9a9aa3] uppercase">Test Date</th>
                      <th className="text-left p-3 font-mono text-xs text-[#9a9aa3] uppercase">Biomarker</th>
                      <th className="text-left p-3 font-mono text-xs text-[#9a9aa3] uppercase">Value</th>
                      <th className="text-left p-3 font-mono text-xs text-[#9a9aa3] uppercase">Reference Range</th>
                      <th className="text-left p-3 font-mono text-xs text-[#9a9aa3] uppercase">Lab Name</th>
                      <th className="text-right p-3 font-mono text-xs text-[#9a9aa3] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const inRange = isInRange(row);
                      const valueColor = !row.referenceRangeMin && !row.referenceRangeMax
                        ? "text-[#9a9aa3]"
                        : inRange
                        ? "text-green-500"
                        : "text-red-500";

                      return (
                        <tr key={row.id} className="border-b border-[#00ffaa]/10 hover:bg-[#00ffaa]/5 transition-colors">
                          <td className="p-3 font-mono text-xs text-[#e0e0e5]">
                            {new Date(row.testDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-mono text-sm text-[#f5f5f7]">
                            {row.biomarkerName}
                          </td>
                          <td className={`p-3 font-mono text-sm font-bold ${valueColor}`}>
                            {row.value} {row.unit}
                          </td>
                          <td className="p-3 font-mono text-xs text-[#9a9aa3]">
                            {row.referenceRangeMin && row.referenceRangeMax
                              ? `${row.referenceRangeMin} - ${row.referenceRangeMax}`
                              : "—"}
                          </td>
                          <td className="p-3 font-mono text-xs text-[#9a9aa3]">
                            {row.labName ?? "—"}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                className="p-2 rounded text-[#9a9aa3] hover:text-[#00ffaa] transition-colors"
                                aria-label="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(row.id)}
                                className="p-2 rounded text-[#9a9aa3] hover:text-red-500 transition-colors"
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
        </>
      )}

      {/* Add Result Modal */}
      {showAddModal && (
        <LabResultModal onSave={refresh} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
