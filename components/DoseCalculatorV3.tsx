"use client";

import { useState, useEffect } from "react";
import { Calculator, Droplet, Syringe, AlertTriangle, CheckCircle2 } from "lucide-react";

export type DoseCalculation = {
  vialSizeMg: number;
  reconstitutionMl: number; // Water to add
  desiredDoseMg: number;
  desiredDrawMl: number;
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number; // Backward compatibility
  mlToDraw: number; // Same as desiredDrawMl
  unitsPerMl: number;
  // Extra fields
  unitsToDraw: number;
};

export type DoseRecommendation = {
  peptideName: string;
  beginnerMg: number;
  intermediateMg: number;
  advancedMg: number;
  maxSafeMg: number;
  notes?: string;
};

type DoseCalculatorProps = {
  peptideName: string;
  recommendation?: DoseRecommendation;
  onCalculationComplete?: (calculation: DoseCalculation) => void;
  initialVialSize?: number;
  initialDose?: number;
};

export default function DoseCalculatorV3({
  peptideName,
  recommendation,
  onCalculationComplete,
  initialVialSize = 5,
  initialDose,
}: DoseCalculatorProps) {
  const [vialSizeMg, setVialSizeMg] = useState(initialVialSize);
  const [customVialSize, setCustomVialSize] = useState("");
  const [desiredDoseMg, setDesiredDoseMg] = useState(
    initialDose || recommendation?.intermediateMg || 1
  );
  const [desiredDrawMl, setDesiredDrawMl] = useState(0.1);

  // Calculation logic:
  // concentration = dose / draw_volume
  // water_to_add = vial_size / concentration
  const concentrationMgPerMl = desiredDrawMl > 0 ? desiredDoseMg / desiredDrawMl : 0;
  const waterToAddMl = concentrationMgPerMl > 0 ? vialSizeMg / concentrationMgPerMl : 0;
  
  const unitsPerMl = 100; // Standard insulin syringe
  const unitsToDraw = desiredDrawMl * unitsPerMl;

  // Dose level determination
  const getDoseLevel = () => {
    if (!recommendation) return "custom";
    if (desiredDoseMg <= recommendation.beginnerMg) return "beginner";
    if (desiredDoseMg <= recommendation.intermediateMg) return "intermediate";
    if (desiredDoseMg <= recommendation.advancedMg) return "advanced";
    if (desiredDoseMg > recommendation.maxSafeMg) return "unsafe";
    return "high";
  };

  const doseLevel = getDoseLevel();

  useEffect(() => {
    if (onCalculationComplete) {
      onCalculationComplete({
        vialSizeMg,
        reconstitutionMl: waterToAddMl,
        desiredDoseMg,
        desiredDrawMl,
        concentrationMgPerMl,
        concentrationMcgPerMl: concentrationMgPerMl * 1000, // Backward compatibility
        mlToDraw: desiredDrawMl,
        unitsPerMl: 100,
        unitsToDraw,
      });
    }
  }, [vialSizeMg, desiredDoseMg, desiredDrawMl, concentrationMgPerMl, waterToAddMl, unitsToDraw]);

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

      {/* Step 1: Vial Size */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-green/20 text-neon-green text-xs font-bold font-mono">1</span>
          <label className="block text-sm font-mono text-metal-chrome uppercase tracking-wider">
            Vial Size (mg)
          </label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[2, 5, 10, 20].map((size) => (
            <button
              type="button"
              key={size}
              onClick={(e) => {
                e.stopPropagation();
                setVialSizeMg(size);
              }}
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

      {/* Step 2: Desired Dose */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue text-xs font-bold font-mono">2</span>
          <label className="block text-sm font-mono text-metal-chrome uppercase tracking-wider">
            Desired Dose Per Injection (mg)
          </label>
        </div>
        
        {/* Research Recommendations */}
        {recommendation && (
          <div className="mb-4 p-5 bg-black/30 border border-neon-green/30 rounded-lg">
            <p className="text-xs text-metal-silver font-mono uppercase tracking-wider mb-4">
              Research-Based Dosing
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesiredDoseMg(recommendation.beginnerMg);
                }}
                className="px-2 py-3 bg-neon-green/10 border border-neon-green/40 rounded text-neon-green text-[10px] font-mono hover:bg-neon-green/20 transition-all min-h-[60px] flex flex-col items-center justify-center"
              >
                <div className="font-semibold whitespace-nowrap">Beginner</div>
                <div className="mt-1 text-xs">{recommendation.beginnerMg}mg</div>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesiredDoseMg(recommendation.intermediateMg);
                }}
                className="px-2 py-3 bg-neon-blue/10 border border-neon-blue/40 rounded text-neon-blue text-[10px] font-mono hover:bg-neon-blue/20 transition-all min-h-[60px] flex flex-col items-center justify-center"
              >
                <div className="font-semibold whitespace-nowrap">Intermediate</div>
                <div className="mt-1 text-xs">{recommendation.intermediateMg}mg</div>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesiredDoseMg(recommendation.advancedMg);
                }}
                className="px-2 py-3 bg-neon-orange/10 border border-neon-orange/40 rounded text-neon-orange text-[10px] font-mono hover:bg-neon-orange/20 transition-all min-h-[60px] flex flex-col items-center justify-center"
              >
                <div className="font-semibold whitespace-nowrap">Advanced</div>
                <div className="mt-1 text-xs">{recommendation.advancedMg}mg</div>
              </button>
            </div>
            {recommendation.notes && (
              <p className="text-xs text-metal-silver mt-3">{recommendation.notes}</p>
            )}
          </div>
        )}

        <input
          type="number"
          step="0.1"
          value={desiredDoseMg}
          onChange={(e) => setDesiredDoseMg(parseFloat(e.target.value) || 0)}
          className={`w-full px-4 py-3 bg-black/50 border rounded-lg font-mono text-lg font-bold focus:outline-none ${getLevelColor(
            doseLevel
          )} ${
            doseLevel === "unsafe"
              ? "border-red-500 focus:border-red-500"
              : "border-metal-silver/30 focus:border-neon-blue"
          }`}
        />
        {doseLevel === "unsafe" && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-500">Unsafe Dose Level</p>
              <p className="text-xs text-red-400">
                Exceeds max safe dose of {recommendation?.maxSafeMg}mg. Consult medical professional.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Desired Draw Volume */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-orange/20 text-neon-orange text-xs font-bold font-mono">3</span>
          <label className="block text-sm font-mono text-metal-chrome uppercase tracking-wider">
            Desired Draw Volume (ml)
          </label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0.05, 0.1, 0.2, 0.5].map((vol) => (
            <button
              type="button"
              key={vol}
              onClick={(e) => {
                e.stopPropagation();
                setDesiredDrawMl(vol);
              }}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-all border ${
                desiredDrawMl === vol
                  ? "bg-neon-orange/20 border-neon-orange text-neon-orange"
                  : "bg-black/50 border-metal-silver/30 text-metal-silver hover:border-neon-orange/50"
              }`}
            >
              {vol}ml
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.01"
          value={desiredDrawMl}
          onChange={(e) => setDesiredDrawMl(parseFloat(e.target.value) || 0.1)}
          placeholder="Custom (ml)"
          className="w-full px-4 py-2 bg-black/50 border border-metal-silver/30 rounded-lg text-metal-chrome font-mono text-sm focus:border-neon-orange focus:outline-none"
        />
        <p className="text-xs text-metal-silver">
          Smaller volume = higher concentration. Larger volume = easier to measure precisely.
        </p>
      </div>

      {/* Step 4: Results - Water to Add */}
      <div className="space-y-4 p-5 bg-gradient-to-br from-neon-blue/10 to-neon-green/10 border border-neon-blue/40 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon-blue/30 text-neon-blue text-xs font-bold font-mono">4</span>
          <Droplet className="w-5 h-5 text-neon-blue" />
          <p className="text-sm font-mono text-neon-blue uppercase tracking-wider">
            Add This Much Water
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-black/50 border border-neon-blue/30 rounded-lg">
            <p className="text-4xl font-bold text-neon-blue font-mono mb-1">
              {waterToAddMl.toFixed(2)} ml
            </p>
            <p className="text-xs text-metal-silver font-mono">
              Bacteriostatic water
            </p>
          </div>

          <div className="text-center p-4 bg-black/50 border border-neon-green/30 rounded-lg">
            <p className="text-2xl font-bold text-neon-green font-mono mb-1">
              {concentrationMgPerMl.toFixed(1)} mg/ml
            </p>
            <p className="text-xs text-metal-silver font-mono">
              Final concentration
            </p>
          </div>
        </div>
      </div>

      {/* Drawing Instructions */}
      <div className="space-y-4 p-5 bg-black/50 border border-neon-green/30 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-neon-green" />
          <p className="text-sm font-mono text-neon-green uppercase tracking-wider">
            Your Dose
          </p>
        </div>

        <div className="text-center p-4 bg-black/50 border border-neon-green/30 rounded-lg mb-4">
          <p className="text-xs text-metal-silver font-mono mb-2">Each Injection</p>
          <p className="text-4xl font-bold text-neon-green font-mono mb-1">
            {desiredDrawMl.toFixed(2)} ml
          </p>
          <p className="text-sm text-metal-chrome font-mono">
            {unitsToDraw.toFixed(0)} units = {desiredDoseMg}mg
          </p>
        </div>

        {/* Visual Dose Guide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center">
            <Syringe className="w-6 h-6 text-metal-chrome" />
            <p className="text-sm font-mono text-[#f5f5f7] uppercase font-bold tracking-wider">Visual Syringe Guide</p>
          </div>
          
          {/* Realistic syringe */}
          <div className="relative h-28 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded-lg p-5 shadow-lg">
            <div className="relative h-full bg-white/80 rounded border border-gray-300">
              {/* Scale markers */}
              <div className="absolute inset-0 flex justify-between items-end pb-2">
                {[0, 0.25, 0.5, 0.75, 1.0].map((mark) => (
                  <div key={mark} className="flex flex-col items-center">
                    <div className="h-3 w-px bg-gray-600"></div>
                    <span className="text-xs text-gray-700 font-mono mt-1 font-semibold">
                      {mark}
                    </span>
                  </div>
                ))}
              </div>

              {/* Liquid fill */}
              {desiredDrawMl <= 1.0 && (
                <div
                  className="absolute bottom-0 left-0 h-full bg-gradient-to-t from-blue-400 to-blue-300 opacity-70 border-r-2 border-blue-600"
                  style={{ width: `${(desiredDrawMl / 1.0) * 100}%` }}
                />
              )}
              
              {/* Draw line indicator */}
              {desiredDrawMl <= 1.0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
                  style={{ left: `${(desiredDrawMl / 1.0) * 100}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-600 rounded-full"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* ml label */}
            <div className="absolute -bottom-6 left-0 right-0 text-center">
              <span className="text-xs text-gray-500 font-mono">ml</span>
            </div>
          </div>

          {desiredDrawMl > 1.0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
              <p className="text-xs text-amber-400 font-mono">
                ⚠️ Dose exceeds 1ml. Reduce draw volume or increase concentration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
