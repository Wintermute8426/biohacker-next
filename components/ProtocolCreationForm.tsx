"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Syringe, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import PeptideAutocomplete from "./PeptideAutocomplete";
import { AdvancedDosageBuilder } from "./AdvancedDosageBuilder";

export type ProtocolCategory = "injury_recovery" | "surgical" | "aesthetic" | "cognitive" | "longevity";

interface Peptide {
  name: string;
  dose: string;
  timing: string;
  route: string;
  priority: string;
}

const CATEGORIES: { value: ProtocolCategory; label: string }[] = [
  { value: "injury_recovery", label: "Injury Recovery" },
  { value: "surgical", label: "Surgical" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "cognitive", label: "Cognitive" },
  { value: "longevity", label: "Longevity" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function ProtocolCreationForm({ onSuccess, onCancel }: { 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState<string>("Beginner");
  const [category, setCategory] = useState<ProtocolCategory>("injury_recovery");
  const [peptides, setPeptides] = useState<Peptide[]>([
    { name: "", dose: "", timing: "", route: "SubQ", priority: "Core" }
  ]);
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [costEstimate, setCostEstimate] = useState("");
  const [importantNotes, setImportantNotes] = useState("");
  const [outcomesTimeline, setOutcomesTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Advanced dosage builder state
  const [dosagePhases, setDosagePhases] = useState<any[]>([]);
  const [showDosageBuilder, setShowDosageBuilder] = useState(false);

  const addPeptide = () => {
    setPeptides([...peptides, { name: "", dose: "", timing: "", route: "SubQ", priority: "Core" }]);
  };

  const removePeptide = (index: number) => {
    if (peptides.length > 1) {
      setPeptides(peptides.filter((_, i) => i !== index));
    }
  };

  const updatePeptide = (index: number, field: keyof Peptide, value: string) => {
    const updated = [...peptides];
    updated[index][field] = value;
    setPeptides(updated);
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, ""]);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 1) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const updateOutcome = (index: number, value: string) => {
    const updated = [...outcomes];
    updated[index] = value;
    setOutcomes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Protocol name is required");
      return;
    }
    if (!duration.trim()) {
      setError("Duration is required");
      return;
    }
    if (peptides.length === 0 || !peptides[0].name.trim()) {
      setError("At least one peptide is required");
      return;
    }
    if (outcomes.length === 0 || !outcomes[0].trim()) {
      setError("At least one expected outcome is required");
      return;
    }

    // Filter out empty peptides and outcomes
    const validPeptides = peptides.filter(p => p.name.trim());
    const validOutcomes = outcomes.filter(o => o.trim());

    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to create a protocol");
      setLoading(false);
      return;
    }

    // Get user's display name from email
    const displayName = user.email ? user.email.split('@')[0] : 'Anonymous';

    // Insert protocol
    const { data: protocol, error: dbError } = await supabase
      .from("protocols")
      .insert({
        name: name.trim(),
        duration: duration.trim(),
        difficulty,
        category,
        peptides: validPeptides,
        expected_outcomes: validOutcomes,
        cost_estimate: costEstimate.trim() || null,
        important_notes: importantNotes.trim() || null,
        outcomes_timeline: outcomesTimeline.trim() || null,
        is_official_template: false,
        created_by: user.id,
        creator_display_name: displayName,
      })
      .select()
      .single();

    if (dbError) {
      setError(`Failed to create protocol: ${dbError.message}`);
      setLoading(false);
      return;
    }

    // If dosage phases exist, save them
    if (dosagePhases.length > 0 && protocol) {
      const phasesWithProtocolId = dosagePhases.map((phase, idx) => ({
        protocol_id: protocol.id,
        peptide_name: peptides[0].name, // Use first peptide
        phase_order: idx + 1,
        duration: phase.duration,
        duration_unit: phase.durationUnit,
        dosage: phase.dosage,
        dosage_unit: phase.dosageUnit,
        frequency: phase.frequency,
        notes: phase.notes || null,
      }));

      const { error: phasesError } = await supabase
        .from('dosage_phases')
        .insert(phasesWithProtocolId);

      if (phasesError) {
        console.error('Failed to save dosage phases:', phasesError);
        // Don't fail the whole operation if phases fail
      }
    }

    // Success
    setLoading(false);
    onSuccess();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <div 
        className="deck-card-bg deck-border-thick rounded-xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#f5f5f7] font-space-mono">
            BUILD A PROTOCOL
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="p-2 text-gray-400 hover:text-[#f5f5f7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#00ffaa] font-semibold">
              Basic Information
            </h3>

            <div>
              <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                Protocol Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                placeholder="e.g., Advanced Recovery Stack"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Duration *
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                  placeholder="e.g., 4-6 weeks"
                />
              </div>

              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Difficulty *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProtocolCategory)}
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Peptides */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#00ffaa] font-semibold">
                Peptides *
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addPeptide();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/5 text-[#00ffaa] font-mono text-xs hover:bg-[#00ffaa]/15 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Peptide
              </button>
            </div>

            {peptides.map((peptide, index) => (
              <div key={index} className="border border-[#00ffaa]/20 rounded-lg p-4 bg-black/30 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-[#00ffaa]" />
                    <span className="text-xs font-mono text-[#9a9aa3]">Peptide {index + 1}</span>
                  </div>
                  {peptides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePeptide(index);
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#9a9aa3] font-mono text-xs mb-1">Name *</label>
                    <PeptideAutocomplete
                      value={peptide.name}
                      onChange={(value) => updatePeptide(index, 'name', value)}
                      placeholder="e.g., BPC-157"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[#9a9aa3] font-mono text-xs mb-1">Dose *</label>
                    <input
                      type="text"
                      value={peptide.dose}
                      onChange={(e) => updatePeptide(index, 'dose', e.target.value)}
                      required
                      className="w-full bg-black/50 border border-[#00ffaa]/30 rounded px-3 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                      placeholder="e.g., 500mcg"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9a9aa3] font-mono text-xs mb-1">Timing *</label>
                    <input
                      type="text"
                      value={peptide.timing}
                      onChange={(e) => updatePeptide(index, 'timing', e.target.value)}
                      required
                      className="w-full bg-black/50 border border-[#00ffaa]/30 rounded px-3 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                      placeholder="e.g., Daily AM"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9a9aa3] font-mono text-xs mb-1">Route *</label>
                    <input
                      type="text"
                      value={peptide.route}
                      onChange={(e) => updatePeptide(index, 'route', e.target.value)}
                      required
                      className="w-full bg-black/50 border border-[#00ffaa]/30 rounded px-3 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                      placeholder="e.g., SubQ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-1">Priority</label>
                  <input
                    type="text"
                    value={peptide.priority}
                    onChange={(e) => updatePeptide(index, 'priority', e.target.value)}
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded px-3 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                    placeholder="e.g., Core, Optional, Advanced"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Advanced Dosage Builder */}
          {peptides[0]?.name && (
            <div className="border border-[#00ffaa]/20 rounded-lg p-4 bg-black/20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDosageBuilder(!showDosageBuilder);
                }}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <span className="text-sm font-mono uppercase tracking-wider text-[#00d4ff] font-semibold">
                  ⚡ Advanced Dosage Scheduling (Optional)
                </span>
                {showDosageBuilder ? (
                  <ChevronUp className="w-5 h-5 text-[#00d4ff]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#00d4ff]" />
                )}
              </button>
              
              {showDosageBuilder && (
                <div className="mt-4">
                  <p className="text-xs text-[#9a9aa3] mb-4 font-mono">
                    Create multi-phase dosing schedules (e.g., 2 weeks @ 250mcg, then 4 weeks @ 500mcg, then taper)
                  </p>
                  <AdvancedDosageBuilder
                    peptideName={peptides[0].name}
                    onSave={(phases) => setDosagePhases(phases)}
                    initialPhases={dosagePhases}
                  />
                </div>
              )}
            </div>
          )}

          {/* Expected Outcomes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#00ffaa] font-semibold">
                Expected Outcomes *
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addOutcome();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00ffaa]/40 bg-[#00ffaa]/5 text-[#00ffaa] font-mono text-xs hover:bg-[#00ffaa]/15 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Outcome
              </button>
            </div>

            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateOutcome(index, e.target.value)}
                  required
                  className="flex-1 bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                  placeholder="e.g., Reduced inflammation and pain"
                />
                {outcomes.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOutcome(index);
                    }}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#00ffaa] font-semibold">
              Additional Details
            </h3>

            <div>
              <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                Cost Estimate
              </label>
              <input
                type="text"
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                placeholder="e.g., $200-300/month"
              />
            </div>

            <div>
              <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                Outcomes Timeline
              </label>
              <textarea
                value={outcomesTimeline}
                onChange={(e) => setOutcomesTimeline(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all resize-none"
                placeholder="e.g., Week 1-2: Initial pain reduction. Week 3-4: Significant improvement..."
              />
            </div>

            <div>
              <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                Important Notes
              </label>
              <textarea
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                rows={4}
                className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all resize-none"
                placeholder="Safety considerations, contraindications, tips, etc."
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="flex-1 border border-gray-600 text-gray-400 font-mono py-3 px-4 rounded-lg transition-colors hover:bg-gray-600/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#00ffaa]/20 hover:bg-[#00ffaa]/30 border border-[#00ffaa] text-[#00ffaa] font-mono py-3 px-4 rounded-lg transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,170,0.2)] hover:shadow-[0_0_15px_rgba(0,255,170,0.4)]"
            >
              {loading ? "CREATING..." : "CREATE PROTOCOL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
