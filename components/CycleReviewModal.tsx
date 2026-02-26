"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SaveAsTemplateModal from "@/components/SaveAsTemplateModal";

interface CycleReviewModalProps {
  cycleId: string;
  peptideName: string;
  onClose: () => void;
  onSubmit: () => void;
}

const COMMON_SIDE_EFFECTS = [
  "Nausea",
  "Headache",
  "Injection site pain",
  "Fatigue",
  "Dizziness",
  "Flushing",
  "Insomnia",
  "Increased appetite",
  "Decreased appetite",
  "Joint pain",
  "Water retention",
  "Mood changes",
];

export default function CycleReviewModal({
  cycleId,
  peptideName,
  onClose,
  onSubmit,
}: CycleReviewModalProps) {
  const [effectiveness, setEffectiveness] = useState<number>(0);
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [sideEffectsNotes, setSideEffectsNotes] = useState("");
  const [wouldRepeat, setWouldRepeat] = useState<"yes" | "no" | "maybe" | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [showSaveAsTemplatePrompt, setShowSaveAsTemplatePrompt] = useState(false);
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false);

  const toggleSideEffect = (effect: string) => {
    if (sideEffects.includes(effect)) {
      setSideEffects(sideEffects.filter((e) => e !== effect));
    } else {
      setSideEffects([...sideEffects, effect]);
    }
  };

  const handleSubmit = async () => {
    if (effectiveness === 0 || !wouldRepeat) {
      alert("Please rate effectiveness and indicate if you'd run this again");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("cycle_reviews").insert({
      user_id: user.id,
      cycle_id: cycleId,
      peptide_name: peptideName,
      effectiveness_rating: effectiveness,
      side_effects: sideEffects,
      side_effects_notes: sideEffectsNotes || null,
      would_repeat: wouldRepeat,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    });

    setSubmitting(false);

    if (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review. Please try again.");
    } else {
      setReviewSaved(true);
      setShowSaveAsTemplatePrompt(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#00ff41]/30 bg-[#0a0e1a] rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#00ff41] font-mono">
              CYCLE REVIEW
            </h2>
            <p className="text-[#00d4ff] text-sm font-mono mt-1">
              {peptideName} - How did it go?
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#00ff41] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Effectiveness Rating */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-gray-300 mb-3">
            EFFECTIVENESS (1-5 stars) *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setEffectiveness(rating)}
                className="transition-all"
              >
                <Star
                  className={`w-10 h-10 ${
                    rating <= effectiveness
                      ? "fill-[#00ff41] text-[#00ff41]"
                      : "text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Side Effects */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-gray-300 mb-3">
            SIDE EFFECTS (select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COMMON_SIDE_EFFECTS.map((effect) => (
              <button
                key={effect}
                onClick={() => toggleSideEffect(effect)}
                className={`px-3 py-2 rounded border text-sm font-mono transition-all ${
                  sideEffects.includes(effect)
                    ? "border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]"
                    : "border-gray-600 bg-black/30 text-gray-400 hover:border-[#00ff41]/50"
                }`}
              >
                {effect}
              </button>
            ))}
          </div>
        </div>

        {/* Side Effects Notes */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-gray-300 mb-2">
            ADDITIONAL SIDE EFFECTS / DETAILS
          </label>
          <textarea
            value={sideEffectsNotes}
            onChange={(e) => setSideEffectsNotes(e.target.value)}
            className="w-full bg-black/50 border border-gray-600 rounded p-3 text-gray-300 font-mono text-sm focus:border-[#00ff41] focus:outline-none"
            rows={3}
            placeholder="Describe any other side effects or details..."
          />
        </div>

        {/* Would Repeat */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-gray-300 mb-3">
            WOULD YOU RUN THIS CYCLE AGAIN? *
          </label>
          <div className="flex gap-3">
            {[
              { value: "yes", label: "YES", color: "[#00ff41]" },
              { value: "maybe", label: "MAYBE", color: "[#ffaa00]" },
              { value: "no", label: "NO", color: "red-500" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setWouldRepeat(option.value as any)}
                className={`flex-1 px-4 py-3 rounded border font-mono transition-all ${
                  wouldRepeat === option.value
                    ? `border-${option.color} bg-${option.color}/10 text-${option.color}`
                    : "border-gray-600 bg-black/30 text-gray-400 hover:border-gray-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-mono text-gray-300 mb-2">
            OVERALL NOTES
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-black/50 border border-gray-600 rounded p-3 text-gray-300 font-mono text-sm focus:border-[#00ff41] focus:outline-none"
            rows={4}
            placeholder="Any additional thoughts, observations, or recommendations..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-600 text-gray-400 rounded font-mono hover:border-gray-500 transition-all"
          >
            SKIP FOR NOW
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || effectiveness === 0 || !wouldRepeat}
            className="flex-1 px-6 py-3 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "SAVING..." : "SUBMIT REVIEW"}
          </button>
        </div>

        {/* Save as Template prompt (after review submitted) */}
        {showSaveAsTemplatePrompt && (
          <div className="mt-6 pt-6 border-t border-[#00ff41]/20">
            <p className="text-sm font-mono text-gray-300 mb-3">
              Review saved. Save this cycle as a template?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveAsTemplatePrompt(false);
                  setShowSaveAsTemplateModal(true);
                }}
                className="px-4 py-2 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all"
              >
                YES
              </button>
              <button
                onClick={() => {
                  setShowSaveAsTemplatePrompt(false);
                  onSubmit();
                }}
                className="px-4 py-2 border border-gray-600 text-gray-400 rounded font-mono hover:border-gray-500 transition-all"
              >
                NO
              </button>
            </div>
          </div>
        )}
      </div>

      {showSaveAsTemplateModal && (
        <SaveAsTemplateModal
          cycleId={cycleId}
          cycleName={peptideName}
          onSave={() => {}}
          onClose={() => {
            setShowSaveAsTemplateModal(false);
            onSubmit();
          }}
        />
      )}
    </div>
  );
}
