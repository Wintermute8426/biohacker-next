"use client";

import { useState, useEffect, useMemo } from "react";
import {
  loadLabResults,
  deleteLabResult,
  getOutOfRangeBiomarkers,
} from "@/lib/lab-database";
import type { LabResult, OutOfRangeBiomarker, TestType } from "@/lib/lab-database";
import { Trash2, Plus, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import LabResultModal from "@/components/LabResultModal";
import { BloodworkAI } from "@/components/BloodworkAI";

const TEST_TYPE_LABELS: Record<TestType, string> = {
  bloodwork: "Bloodwork",
  hormone_panel: "Hormone Panel",
  metabolic: "Metabolic",
  custom: "Custom",
};

type TabId = "all" | "out_of_range" | "recent" | "upload";

// Group results by test date
interface LabSnapshot {
  testDate: string;
  labName: string | null;
  markers: LabResult[];
}

export default function LabResultsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [outOfRange, setOutOfRange] = useState<OutOfRangeBiomarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  // Group filtered results by test date
  const snapshots = useMemo<LabSnapshot[]>(() => {
    const grouped = new Map<string, LabResult[]>();
    
    filtered.forEach(result => {
      const existing = grouped.get(result.testDate) || [];
      existing.push(result);
      grouped.set(result.testDate, existing);
    });

    return Array.from(grouped.entries())
      .map(([testDate, markers]) => ({
        testDate,
        labName: markers[0]?.labName || null,
        markers: markers.sort((a, b) => a.biomarkerName.localeCompare(b.biomarkerName))
      }))
      .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
  }, [filtered]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lab result?")) return;
    const result = await deleteLabResult(id);
    if (result.success) {
      refresh();
    } else {
      alert(result.error || "Failed to delete lab result");
    }
  };

  const toggleCard = (testDate: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(testDate)) {
      newExpanded.delete(testDate);
    } else {
      newExpanded.add(testDate);
    }
    setExpandedCards(newExpanded);
  };

  const renderValueWithStatus = (result: LabResult) => {
    const val = typeof result.value === 'string' ? parseFloat(result.value) : result.value;
    const min = result.referenceRangeMin;
    const max = result.referenceRangeMax;

    let statusColor = "text-gray-400";
    let statusLabel = "NORMAL";

    if (min !== null && max !== null) {
      if (val < min) {
        statusColor = "text-yellow-500";
        statusLabel = "LOW";
      } else if (val > max) {
        statusColor = "text-red-500";
        statusLabel = "HIGH";
      } else {
        statusColor = "text-green-500";
        statusLabel = "NORMAL";
      }
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-cyan-400 font-mono">{result.value}</span>
        {result.unit && (
          <span className="text-gray-500 text-xs">{result.unit}</span>
        )}
        <span className={`${statusColor} text-xs font-bold`}>[{statusLabel}]</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-1">LAB RESULTS</h1>
          <div className="text-xs text-gray-500">
            {snapshots.length} test dates • {labResults.length} total markers • {outOfRange.length} out of range
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          <Plus size={16} />
          ADD RESULT
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          ALL RESULTS
        </button>
        <button
          onClick={() => setActiveTab("out_of_range")}
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "out_of_range"
              ? "text-red-400 border-b-2 border-red-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <AlertTriangle size={14} />
          OUT OF RANGE ({outOfRange.length})
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "recent"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          RECENT (30 DAYS)
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          UPLOAD
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <BloodworkAI />
      )}

      {/* Results Tabs */}
      {activeTab !== "upload" && (
        <>
          {/* Filters */}
          <div className="mb-4 p-4 bg-black/40 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">FROM DATE</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-gray-700 text-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TO DATE</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-gray-700 text-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TEST TYPE</label>
                <select
                  value={filterTestType}
                  onChange={(e) => setFilterTestType(e.target.value as TestType | "")}
                  className="w-full px-3 py-2 bg-black/60 border border-gray-700 text-gray-300 text-sm"
                >
                  <option value="">All Types</option>
                  {Object.entries(TEST_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">BIOMARKER</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filterBiomarker}
                  onChange={(e) => setFilterBiomarker(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-gray-700 text-gray-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-12 text-gray-500">Loading lab results...</div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              {error}
            </div>
          )}

          {/* Lab Snapshot Cards */}
          {!loading && !error && (
            <div className="space-y-4">
              {snapshots.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-black/40 border border-gray-800">
                  No lab results found. Add your first result to get started.
                </div>
              ) : (
                snapshots.map((snapshot) => {
                  const isExpanded = expandedCards.has(snapshot.testDate);
                  const outOfRangeCount = snapshot.markers.filter(m => {
                    const val = typeof m.value === 'string' ? parseFloat(m.value) : m.value;
                    const min = m.referenceRangeMin;
                    const max = m.referenceRangeMax;
                    return min !== null && max !== null && (val < min || val > max);
                  }).length;

                  return (
                    <div
                      key={snapshot.testDate}
                      className="bg-black/40 border border-gray-800 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/60 transition-colors"
                        onClick={() => toggleCard(snapshot.testDate)}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-lg font-bold text-cyan-400">
                              {new Date(snapshot.testDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            {snapshot.labName && (
                              <div className="text-xs text-gray-500">{snapshot.labName}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-400">{snapshot.markers.length} markers</span>
                            {outOfRangeCount > 0 && (
                              <span className="flex items-center gap-1 text-red-400">
                                <AlertTriangle size={14} />
                                {outOfRangeCount} flagged
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>

                      {/* Card Content (expanded) */}
                      {isExpanded && (
                        <div className="border-t border-gray-800 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {snapshot.markers.map((marker) => (
                              <div
                                key={marker.id}
                                className="p-3 bg-black/40 border border-gray-700 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-cyan-400 text-sm mb-1">
                                    {marker.biomarkerName}
                                  </div>
                                  <div className="text-xs">
                                    {renderValueWithStatus(marker)}
                                  </div>
                                  {marker.referenceRangeMin !== null && marker.referenceRangeMax !== null && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      Ref: {marker.referenceRangeMin} - {marker.referenceRangeMax}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(marker.id);
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors ml-2"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <LabResultModal onClose={() => setShowAddModal(false)} onSaved={refresh} />
      )}
    </div>
  );
}
