"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X } from "lucide-react";
import {
  loadBiomarkerCategories,
  saveLabResult,
  type TestType,
  type BiomarkerCategory,
} from "@/lib/lab-database";

interface LabResultModalProps {
  onSave: () => void;
  onClose: () => void;
}

const TEST_TYPES: { value: TestType; label: string }[] = [
  { value: "bloodwork", label: "Bloodwork" },
  { value: "hormone_panel", label: "Hormone Panel" },
  { value: "metabolic", label: "Metabolic" },
  { value: "custom", label: "Custom" },
];

function groupByCategory(categories: BiomarkerCategory[]): Record<string, BiomarkerCategory[]> {
  return categories.reduce((acc, b) => {
    const cat = b.categoryName || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {} as Record<string, BiomarkerCategory[]>);
}

export default function LabResultModal({ onSave, onClose }: LabResultModalProps) {
  const [testDate, setTestDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [testType, setTestType] = useState<TestType>("bloodwork");
  const [labName, setLabName] = useState("");
  const [biomarkerName, setBiomarkerName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [refMin, setRefMin] = useState("");
  const [refMax, setRefMax] = useState("");
  const [notes, setNotes] = useState("");
  const [biomarkerCategories, setBiomarkerCategories] = useState<BiomarkerCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biomarkerDropdownOpen, setBiomarkerDropdownOpen] = useState(false);
  const biomarkerInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBiomarkerCategories().then(setBiomarkerCategories);
  }, []);

  const grouped = useMemo(
    () => groupByCategory(biomarkerCategories),
    [biomarkerCategories]
  );

  const filteredSuggestions = useMemo(() => {
    const q = biomarkerName.trim().toLowerCase();
    if (!q) return grouped;
    const out: Record<string, BiomarkerCategory[]> = {};
    for (const [cat, items] of Object.entries(grouped)) {
      const matches = items.filter((b) =>
        b.biomarkerName.toLowerCase().includes(q)
      );
      if (matches.length) out[cat] = matches;
    }
    return out;
  }, [grouped, biomarkerName]);

  const flatSuggestions = useMemo(
    () => Object.values(filteredSuggestions).flat(),
    [filteredSuggestions]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        biomarkerInputRef.current &&
        !biomarkerInputRef.current.contains(e.target as Node)
      ) {
        setBiomarkerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectBiomarker = (b: BiomarkerCategory) => {
    setBiomarkerName(b.biomarkerName);
    setUnit(b.standardUnit ?? "");
    setRefMin(b.referenceRangeMin != null ? String(b.referenceRangeMin) : "");
    setRefMax(b.referenceRangeMax != null ? String(b.referenceRangeMax) : "");
    setBiomarkerDropdownOpen(false);
    biomarkerInputRef.current?.blur();
  };

  const handleSave = async () => {
    setError(null);
    if (!testDate.trim()) {
      setError("Test date is required.");
      return;
    }
    if (!biomarkerName.trim()) {
      setError("Biomarker name is required.");
      return;
    }
    const numValue = value.trim() === "" ? NaN : parseFloat(value);
    if (value.trim() === "" || isNaN(numValue)) {
      setError("Value is required and must be a number.");
      return;
    }
    if (!unit.trim()) {
      setError("Unit is required.");
      return;
    }

    setLoading(true);
    const result = await saveLabResult({
      testDate: testDate.trim(),
      testType,
      labName: labName.trim() || undefined,
      biomarkerName: biomarkerName.trim(),
      value: numValue,
      unit: unit.trim(),
      referenceRangeMin: refMin.trim() ? parseFloat(refMin) : undefined,
      referenceRangeMax: refMax.trim() ? parseFloat(refMax) : undefined,
      notes: notes.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      onSave();
      onClose();
    } else {
      setError(result.error ?? "Failed to save lab result.");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        aria-hidden
      />

      <div className="fixed inset-4 z-50 flex items-start justify-center pt-8 pb-32 overflow-y-auto">
        <div className="deck-card-bg deck-border-thick border-[#00ffaa]/40 rounded-xl w-full max-w-md shadow-[0_0_30px_rgba(0,255,170,0.2)] my-auto">
          <div className="flex justify-between items-center p-4 border-b border-[#00ffaa]/30">
            <h2 className="font-mono text-lg font-bold text-[#00ffaa]">
              ADD LAB RESULT
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-[#00ffaa] transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4 pb-32">
            {/* 1. Test Date */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                TEST DATE *
              </label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
              />
            </div>

            {/* 2. Test Type */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                TEST TYPE *
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestType)}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
              >
                {TEST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Lab Name */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                LAB NAME
              </label>
              <input
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="Quest Diagnostics, LabCorp, etc."
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60 focus:border-[#00ffaa] focus:outline-none"
              />
            </div>

            {/* 4. Biomarker (autocomplete) */}
            <div className="relative" ref={dropdownRef}>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                BIOMARKER *
              </label>
              <input
                ref={biomarkerInputRef}
                type="text"
                value={biomarkerName}
                onChange={(e) => {
                  setBiomarkerName(e.target.value);
                  setBiomarkerDropdownOpen(true);
                }}
                onFocus={() => setBiomarkerDropdownOpen(true)}
                placeholder="Search or type biomarker name"
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60 focus:border-[#00ffaa] focus:outline-none"
              />
              {biomarkerDropdownOpen && flatSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#00ffaa]/40 bg-[#0a0e1a] shadow-lg">
                  {Object.entries(filteredSuggestions).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-3 py-1.5 font-mono text-[10px] text-[#00ffaa]/80 bg-black/30 sticky top-0">
                        {category}
                      </div>
                      {items.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => selectBiomarker(b)}
                          className="w-full px-3 py-2 text-left font-mono text-sm text-[#e0e0e5] hover:bg-[#00ffaa]/10 border-b border-[#00ffaa]/10 last:border-0"
                        >
                          {b.biomarkerName} — {b.categoryName}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Value */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                VALUE *
              </label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="100"
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60 focus:border-[#00ffaa] focus:outline-none"
              />
            </div>

            {/* 6. Unit */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                UNIT *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ng/dL, mg/L, etc."
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60 focus:border-[#00ffaa] focus:outline-none"
              />
            </div>

            {/* 7 & 8. Reference Range Min/Max */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  REFERENCE RANGE MIN
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refMin}
                  onChange={(e) => setRefMin(e.target.value)}
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                  REFERENCE RANGE MAX
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refMax}
                  onChange={(e) => setRefMax(e.target.value)}
                  className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] focus:border-[#00ffaa] focus:outline-none"
                />
              </div>
            </div>

            {/* 9. Notes */}
            <div>
              <label className="block font-mono text-[10px] text-[#9a9aa3] mb-1 uppercase">
                NOTES
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional context or observations"
                rows={3}
                className="w-full bg-black/50 border border-[#00ffaa]/40 rounded px-3 py-2 font-mono text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3]/60 focus:border-[#00ffaa] focus:outline-none resize-none"
              />
            </div>

            {error && (
              <p className="font-mono text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-500/40 bg-black/50 text-gray-400 font-mono text-sm hover:bg-gray-500/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
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
