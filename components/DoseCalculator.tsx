"use client";

import { useState, useEffect } from "react";
import { Calculator, Syringe, AlertTriangle, CheckCircle2 } from "lucide-react";

export type DoseCalculation = {
  vialSizeMg: number;
  reconstitutionMl: number;
  desiredDoseMcg: number;
  concentrationMgPerMl: number;
  mlToDraw: number;
  unitsPerMl: number;
  concentrationMcgPerMl: number;
};

export type DoseRecommendation = {
  peptideName: string;
  beginnerMcg: number;
  intermediateMcg: number;
  advancedMcg: number;
  maxSafeMcg: number;
  notes?: string;
};

type DoseCalculatorProps = {
  peptideName: string;
  recommendation?: DoseRecommendation;
  onCalculationComplete?: (calculation: DoseCalculation) => void;
  initialVialSize?: number;
  initialReconstitution?: number;
  initialDose?: number;
};

export default function DoseCalculator({
  peptideName,
  recommendation,
  onCalculationComplete,
  initialVialSize = 5,
  initialReconstitution = 2,
  initialDose,
}: DoseCalculatorProps) {
  const [vialSizeMg, setVialSizeMg] = useState(initialVialSize);
  const [customVialSize, setCustomVialSize] = useState("");
  const [reconstitutionMl, setReconstitutionMl] = useState(initialReconstitution);
  const [customReconstitution, setCustomReconstitution] = useState("");
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(
    initialDose || recommendation?.intermediateMcg || 250
  );

  // Calculations
  const concentrationMgPerMl = vialSizeMg / reconstitutionMl;
  const concentrationMcgPerMl = concentrationMgPerMl * 1000;
  const mlToDraw = desiredDoseMcg / concentrationMcgPerMl;
  const unitsPerMl = 100; // Standard insulin syringe (1ml = 100 units)
  const unitsToDraw = mlToDraw * unitsPerMl;

  // Dose level determination
  const getDoseLevel = () => {
    if (!recommendation) return "custom";
    if (desiredDoseMcg <= recommendation.beginnerMcg) return "beginner";
    if (desiredDoseMcg <= recommendation.intermediateMcg) return "intermediate";
    if (desiredDoseMcg <= recommendation.advancedMcg) return "advanced";
    if (desiredDoseMcg > recommendation.maxSafeMcg) return "unsafe";
    return "high";
  };

  const doseLevel = getDoseLevel();

  useEffect(() => {
    if (onCalculationComplete) {
      onCalculationComplete({
        vialSizeMg,
        reconstitutionMl,
        desiredDoseMcg,
        concentrationMgPerMl,
        concentrationMcgPerMl,
        mlToDraw,
        unitsPerMl,
      });
    }
  }, [vialSizeMg, reconstitutionMl, desiredDoseMcg]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-neon-green";
      case "intermediate":
        return "text-neon-blue";
      case "advanced":
        return "text-neon-orange";
      case "high":
        return "text-neon-magenta";
      case "unsafe":
        return "text-red-500";
      default:
        return "text-metal-chrome";
    }
  };

  return (
    <div className="deck-card-bg deck-border-thick relative rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-neon-green" />
        <div>
          <h3 className="text-xl font-orbitron font-bold text-[#f5f5f7]">
            Dose Calculator
          </h3>
          <p className="text-xs text-metal-silver font-mono">{peptideName}</p>
        </div>
      </div>

      {/* Vial Size */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-mono text-metal-chrome uppercase tracking-wider">
          Vial Size (mg)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[2, 5, 10, 20].map((size) => (
            <button
              key={size}
              onClick={() => setVialSizeMg(size)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                vialSizeMg === size
                  ? "bg-neon-green/20 border-neon-green text-neon-green"
                  : "bg-black/50 border-metal-silver/30 text-metal-silver hover:border-neon-green/50"
              }`}
            >
              {size}mg
            </button>
          ))}
        </div>
        <input
          type="number"
          value={customVialSize}
          onChange={(e) => {
            setCustomVialSize(e.target.value);
            const val = parseFloat(e.target.value);
            if (val > 0) setVialSizeMg(val);
          }}
          placeholder="Custom (mg)"
          className="w-full px-4 py-2 bg-black/50 border border-metal-silver/30 rounded-lg text-metal-chrome font-mono text-sm focus:border-neon-green focus:outline-none"
        />
      </div>

      {/* Reconstitution Volume */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-mono text-metal-chrome uppercase tracking-wider">
          Reconstitution Volume (ml)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 5].map((vol) => (
            <button
              key={vol}
              onClick={() => setReconstitutionMl(vol)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                reconstitutionMl === vol
                  ? "bg-neon-blue/20 border-neon-blue text-neon-blue"
                  : "bg-black/50 border-metal-silver/30 text-metal-silver hover:border-neon-blue/50"
              }`}
            >
              {vol}ml
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.1"
          value={customReconstitution}
          onChange={(e) => {
            setCustomReconstitution(e.target.value);
            const val = parseFloat(e.target.value);
            if (val > 0) setReconstitutionMl(val);
          }}
          placeholder="Custom (ml)"
          className="w-full px-4 py-2 bg-black/50 border border-metal-silver/30 rounded-lg text-metal-chrome font-mono text-sm focus:border-neon-blue focus:outline-none"
        />
      </div>

      {/* Research Recommendations */}
      {recommendation && (
        <div className="mb-6 p-4 bg-black/30 border border-neon-green/30 rounded-lg">
          <p className="text-xs text-metal-silver font-mono uppercase tracking-wider mb-3">
            Research-Based Dosing
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => setDesiredDoseMcg(recommendation.beginnerMcg)}
              className="px-3 py-2 bg-neon-green/10 border border-neon-green/40 rounded text-neon-green text-xs font-mono hover:bg-neon-green/20"
            >
              Beginner<br />{recommendation.beginnerMcg}mcg
            </button>
            <button
              onClick={() => setDesiredDoseMcg(recommendation.intermediateMcg)}
              className="px-3 py-2 bg-neon-blue/10 border border-neon-blue/40 rounded text-neon-blue text-xs font-mono hover:bg-neon-blue/20"
            >
              Intermediate<br />{recommendation.intermediateMcg}mcg
            </button>
            <button
              onClick={() => setDesiredDoseMcg(recommendation.advancedMcg)}
              className="px-3 py-2 bg-neon-orange/10 border border-neon-orange/40 rounded text-neon-orange text-xs font-mono hover:bg-neon-orange/20"
            >
              Advanced<br />{recommendation.advancedMcg}mcg
            </button>
          </div>
          {recommendation.notes && (
            <p className="text-xs text-metal-silver mt-2">{recommendation.notes}</p>
          )}
        </div>
      )}

      {/* Desired Dose */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-mono text-metal-chrome uppercase tracking-wider">
          Desired Dose (mcg)
        </label>
        <input
          type="number"
          value={desiredDoseMcg}
          onChange={(e) => setDesiredDoseMcg(parseFloat(e.target.value) || 0)}
          className={`w-full px-4 py-3 bg-black/50 border rounded-lg font-mono text-lg font-bold focus:outline-none ${getLevelColor(
            doseLevel
          )} ${
            doseLevel === "unsafe"
              ? "border-red-500 focus:border-red-500"
              : "border-metal-silver/30 focus:border-neon-green"
          }`}
        />
        {doseLevel === "unsafe" && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-500">Unsafe Dose Level</p>
              <p className="text-xs text-red-400">
                Exceeds max safe dose of {recommendation?.maxSafeMcg}mcg. Consult medical professional.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Calculation Results */}
      <div className="space-y-4 p-4 bg-black/50 border border-neon-green/30 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-neon-green" />
          <p className="text-sm font-mono text-neon-green uppercase tracking-wider">
            Calculation Results
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-metal-silver font-mono mb-1">Concentration</p>
            <p className="text-lg font-bold text-neon-green font-mono">
              {concentrationMgPerMl.toFixed(2)} mg/ml
            </p>
            <p className="text-xs text-metal-chrome font-mono">
              {concentrationMcgPerMl.toFixed(0)} mcg/ml
            </p>
          </div>

          <div>
            <p className="text-xs text-metal-silver font-mono mb-1">Draw Volume</p>
            <p className="text-2xl font-bold text-neon-blue font-mono">
              {mlToDraw.toFixed(3)} ml
            </p>
            <p className="text-xs text-metal-chrome font-mono">
              {unitsToDraw.toFixed(1)} units
            </p>
          </div>
        </div>
      </div>

      {/* Visual Syringe Guide */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Syringe className="w-5 h-5 text-neon-blue" />
          <p className="text-sm font-mono text-neon-blue uppercase tracking-wider">
            Syringe Guide (1ml / 100 units)
          </p>
        </div>
        
        <div className="relative h-20 bg-black/50 border border-metal-silver/30 rounded-lg p-4">
          {/* Syringe barrel */}
          <div className="relative h-full">
            {/* Scale markers */}
            <div className="absolute inset-0 flex justify-between items-center">
              {[0, 0.25, 0.5, 0.75, 1.0].map((mark) => (
                <div key={mark} className="flex flex-col items-center">
                  <div className="h-2 w-px bg-metal-silver/50"></div>
                  <span className="text-[10px] text-metal-silver font-mono mt-1">
                    {mark}ml
                  </span>
                </div>
              ))}
            </div>

            {/* Draw indicator */}
            {mlToDraw <= 1.0 && (
              <div
                className="absolute h-full bg-neon-blue/30 border-r-2 border-neon-blue"
                style={{ width: `${(mlToDraw / 1.0) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-8 text-neon-blue font-mono text-xs font-bold whitespace-nowrap">
                  ← Draw to here
                </div>
              </div>
            )}
          </div>
        </div>

        {mlToDraw > 1.0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
            <p className="text-xs text-amber-400 font-mono">
              ⚠️ Draw volume exceeds 1ml syringe. Use {Math.ceil(mlToDraw)}ml syringe or multiple injections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
