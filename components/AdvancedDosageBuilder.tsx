"use client";

import { useState } from "react";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";

interface DosagePhase {
  id: string;
  duration: number;
  durationUnit: "days" | "weeks";
  dosage: number;
  dosageUnit: "mg" | "mcg" | "iu";
  frequency: string; // "daily", "MWF", "TTS", etc.
  notes?: string;
}

interface AdvancedDosageBuilderProps {
  peptideName: string;
  onSave: (phases: DosagePhase[]) => void;
  initialPhases?: DosagePhase[];
}

export function AdvancedDosageBuilder({
  peptideName,
  onSave,
  initialPhases = [],
}: AdvancedDosageBuilderProps) {
  const [phases, setPhases] = useState<DosagePhase[]>(
    initialPhases.length > 0
      ? initialPhases
      : [
          {
            id: crypto.randomUUID(),
            duration: 2,
            durationUnit: "weeks",
            dosage: 1,
            dosageUnit: "mg",
            frequency: "daily",
          },
        ]
  );

  const addPhase = () => {
    const lastPhase = phases[phases.length - 1];
    setPhases([
      ...phases,
      {
        id: crypto.randomUUID(),
        duration: lastPhase?.duration || 2,
        durationUnit: lastPhase?.durationUnit || "weeks",
        dosage: lastPhase?.dosage || 1,
        dosageUnit: lastPhase?.dosageUnit || "mg",
        frequency: lastPhase?.frequency || "daily",
      },
    ]);
  };

  const removePhase = (id: string) => {
    if (phases.length > 1) {
      setPhases(phases.filter((p) => p.id !== id));
    }
  };

  const updatePhase = (id: string, updates: Partial<DosagePhase>) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const autoTaper = (direction: "up" | "down") => {
    if (phases.length < 2) return;

    const startDose = direction === "up" ? phases[0].dosage : phases[phases.length - 1].dosage;
    const endDose = direction === "up" ? phases[phases.length - 1].dosage : phases[0].dosage;
    const step = (endDose - startDose) / (phases.length - 1);

    const newPhases = phases.map((phase, idx) => ({
      ...phase,
      dosage: parseFloat((startDose + step * idx).toFixed(2)),
    }));

    setPhases(newPhases);
  };

  const getTotalDuration = () => {
    return phases.reduce((total, phase) => {
      const days = phase.durationUnit === "weeks" ? phase.duration * 7 : phase.duration;
      return total + days;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{peptideName} Dosing Schedule</h3>
          <p className="text-sm text-muted-foreground">
            Total duration: {getTotalDuration()} days ({Math.ceil(getTotalDuration() / 7)} weeks)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => autoTaper("up")}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent"
          >
            <TrendingUp className="w-4 h-4" />
            Taper Up
          </button>
          <button
            onClick={() => autoTaper("down")}
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent"
          >
            <TrendingDown className="w-4 h-4" />
            Taper Down
          </button>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="relative p-4 border rounded-lg bg-card"
          >
            {/* Phase Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Phase {index + 1}
              </span>
              {phases.length > 1 && (
                <button
                  onClick={() => removePhase(phase.id)}
                  className="p-1 hover:bg-accent rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Phase Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Duration */}
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={phase.duration}
                    onChange={(e) =>
                      updatePhase(phase.id, { duration: parseInt(e.target.value) || 1 })
                    }
                    className="w-20 px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={phase.durationUnit}
                    onChange={(e) =>
                      updatePhase(phase.id, {
                        durationUnit: e.target.value as "days" | "weeks",
                      })
                    }
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                  </select>
                </div>
              </div>

              {/* Dosage */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dosage</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={phase.dosage}
                    onChange={(e) =>
                      updatePhase(phase.id, { dosage: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={phase.dosageUnit}
                    onChange={(e) =>
                      updatePhase(phase.id, {
                        dosageUnit: e.target.value as "mg" | "mcg" | "iu",
                      })
                    }
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="mg">mg</option>
                    <option value="mcg">mcg</option>
                    <option value="iu">IU</option>
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-sm font-medium mb-2 block">Frequency</label>
                <select
                  value={phase.frequency}
                  onChange={(e) => updatePhase(phase.id, { frequency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="MWF">Mon/Wed/Fri</option>
                  <option value="TTS">Tue/Thu/Sat</option>
                  <option value="EOD">Every Other Day</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes..."
                  value={phase.notes || ""}
                  onChange={(e) => updatePhase(phase.id, { notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Phase Button */}
      <button
        onClick={addPhase}
        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:bg-accent w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Phase
      </button>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => onSave(phases)}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Save Dosing Schedule
        </button>
      </div>

      {/* Preview Timeline */}
      <div className="p-4 border rounded-lg bg-muted">
        <h4 className="text-sm font-medium mb-3">Timeline Preview</h4>
        <div className="space-y-2">
          {phases.map((phase, idx) => {
            const days = phase.durationUnit === "weeks" ? phase.duration * 7 : phase.duration;
            return (
              <div key={phase.id} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-16">
                  Phase {idx + 1}:
                </span>
                <span className="font-medium">
                  {phase.dosage} {phase.dosageUnit}
                </span>
                <span className="text-muted-foreground">
                  {phase.frequency} for {days} days
                </span>
                {phase.notes && (
                  <span className="text-xs text-muted-foreground italic">
                    ({phase.notes})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
