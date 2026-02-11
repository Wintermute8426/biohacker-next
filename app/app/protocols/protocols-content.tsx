"use client";

import { useState, useMemo, useEffect } from "react";
import { Layers, Syringe, X, Calculator } from "lucide-react";
import DoseCalculator from "@/components/DoseCalculatorV3";
import { getDoseRecommendation } from "@/lib/dose-recommendations-v3";

export type ProtocolCategory = "injury_recovery" | "surgical" | "aesthetic" | "cognitive" | "longevity";

export type ProtocolPeptide = {
  name: string;
  dose: string;
  timing: string;
  route: string;
  priority: string;
};

export type ProtocolTemplate = {
  id: string;
  hexId: string;
  name: string;
  duration: string;
  difficulty: string;
  category: ProtocolCategory;
  peptides: ProtocolPeptide[];
  expectedOutcomes: string[];
  costEstimate: string;
  importantNotes: string;
  outcomesTimeline: string;
};

const CATEGORY_LABELS: Record<ProtocolCategory | "all", string> = {
  all: "All",
  injury_recovery: "Injury Recovery",
  surgical: "Surgical",
  aesthetic: "Aesthetic",
  cognitive: "Cognitive",
  longevity: "Longevity",
};

const CATEGORY_COLORS: Record<ProtocolCategory, string> = {
  injury_recovery: "bg-[#00ffaa]/20 text-[#00ffaa] border-[#00ffaa]/40",
  surgical: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  aesthetic: "bg-pink-500/20 text-pink-400 border-pink-500/40",
  cognitive: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  longevity: "bg-purple-500/20 text-purple-400 border-purple-500/40",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-[#00ffaa]/20 text-[#00ffaa] border-[#00ffaa]/40",
  Intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  Advanced: "bg-red-500/20 text-red-400 border-red-500/40",
};

const CATEGORY_OPTIONS: { value: ProtocolCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "injury_recovery", label: "Injury Recovery" },
  { value: "surgical", label: "Surgical" },
  { value: "aesthetic", label: "Aesthetic" },
  { value: "cognitive", label: "Cognitive" },
  { value: "longevity", label: "Longevity" },
];

function ProtocolCard({
  protocol,
  index,
  onViewDetails,
}: {
  protocol: ProtocolTemplate;
  index: number;
  onViewDetails: (p: ProtocolTemplate) => void;
}) {
  const topOutcomes = protocol.expectedOutcomes.slice(0, 3);

  return (
    <div
      className="group deck-panel deck-card-bg deck-screws deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg hover:shadow-[#00ffaa]/15 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="led-card-top-right">
        <span className="led-dot led-green" aria-hidden />
      </div>
      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>{protocol.hexId}</span>

      <div className="glitch-on-hover relative z-10">
        <div className="flex items-center gap-2 mt-2">
          <Layers className="h-4 w-4 text-[#00ffaa] shrink-0" />
          <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
            {protocol.name}
          </h3>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]">
            {protocol.duration}
          </span>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${DIFFICULTY_COLORS[protocol.difficulty] ?? "bg-white/10 text-gray-400"}`}>
            {protocol.difficulty}
          </span>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${CATEGORY_COLORS[protocol.category]}`}>
            {CATEGORY_LABELS[protocol.category]}
          </span>
        </div>

        <div className="mt-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">Peptides</span>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {protocol.peptides.map((p) => (
              <li key={p.name} className="flex items-center gap-1 rounded border border-[#00ffaa]/20 bg-black/30 px-2 py-1 text-xs font-mono text-[#e0e0e5]">
                <Syringe className="h-3 w-3 text-[#00ffaa]/80" />
                {p.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">Expected outcomes</span>
          <ul className="mt-1 list-inside list-disc text-xs text-[#e0e0e5] font-mono">
            {topOutcomes.map((o) => (
              <li key={o} className="leading-tight">{o}</li>
            ))}
          </ul>
        </div>

        <div className="mt-3 text-xs font-mono text-[#00ffaa]">
          Est. cost: <span className="font-semibold">{protocol.costEstimate}</span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(protocol)}
          className="mt-4 flex w-full items-center justify-center rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60"
        >
          View details
        </button>
      </div>
    </div>
  );
}

function DetailsModal({ protocol, onClose }: { protocol: ProtocolTemplate; onClose: () => void }) {
  const [selectedPeptideCalc, setSelectedPeptideCalc] = useState<string | null>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="deck-panel deck-card-bg deck-border-thick relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-[#00ffaa]/40 p-6 shadow-[0_0_24px_rgba(0,255,170,0.2)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-[#9a9aa3] transition-colors hover:bg-white/10 hover:text-[#f5f5f7]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 pr-8">
          <Layers className="h-5 w-5 text-[#00ffaa]" />
          <h2 id="protocol-modal-title" className="font-space-mono text-2xl font-bold text-[#f5f5f7]">
            {protocol.name}
          </h2>
          <span className="hex-id ml-2">{protocol.hexId}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-xs font-mono text-[#00ffaa]">
            {protocol.duration}
          </span>
          <span className={`rounded border px-2 py-0.5 text-xs font-mono font-medium ${DIFFICULTY_COLORS[protocol.difficulty]}`}>
            {protocol.difficulty}
          </span>
          <span className={`rounded border px-2 py-0.5 text-xs font-mono font-medium ${CATEGORY_COLORS[protocol.category]}`}>
            {CATEGORY_LABELS[protocol.category]}
          </span>
        </div>

        <div className="mt-6">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Dosing table</h4>
          <div className="mt-2 overflow-x-auto rounded-lg border border-[#00ffaa]/20">
            <table className="w-full min-w-[400px] border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#00ffaa]/20 bg-black/40">
                  <th className="px-3 py-2 text-left font-semibold text-[#00ffaa]">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#00ffaa]">Dose</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#00ffaa]">Timing</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#00ffaa]">Route</th>
                  <th className="px-3 py-2 text-left font-semibold text-[#00ffaa]">Priority</th>
                </tr>
              </thead>
              <tbody>
                {protocol.peptides.map((p) => (
                  <tr key={p.name} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-3 py-2 text-[#e0e0e5]">{p.name}</td>
                    <td className="px-3 py-2 text-[#e0e0e5]">{p.dose}</td>
                    <td className="px-3 py-2 text-[#e0e0e5]">{p.timing}</td>
                    <td className="px-3 py-2 text-[#00ffaa]/90">{p.route}</td>
                    <td className="px-3 py-2 text-[#9a9aa3]">{p.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dose Calculators */}
        <div className="mt-6">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa] mb-3">
            Dose Calculators
          </h4>
          <div className="space-y-3">
            {protocol.peptides.map((p) => (
              <div key={p.name}>
                <button
                  type="button"
                  onClick={() => setSelectedPeptideCalc(selectedPeptideCalc === p.name ? null : p.name)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-neon-blue/30 bg-neon-blue/5 text-neon-blue font-mono text-sm hover:bg-neon-blue/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    {p.name}
                  </span>
                  <span className="text-xs text-metal-silver">{selectedPeptideCalc === p.name ? "Hide" : "Calculate"}</span>
                </button>
                {selectedPeptideCalc === p.name && (
                  <div className="mt-2">
                    <DoseCalculator
                      peptideName={p.name}
                      recommendation={getDoseRecommendation(p.name)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Expected outcomes timeline</h4>
          <p className="mt-1 text-sm text-[#e0e0e5] leading-relaxed font-mono">{protocol.outcomesTimeline}</p>
        </div>

        <div className="mt-6">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Important notes</h4>
          <p className="mt-1 text-sm text-[#e0e0e5] leading-relaxed font-mono">{protocol.importantNotes}</p>
        </div>

        <div className="mt-6 text-sm font-mono text-[#00ffaa]">
          Cost estimate: <span className="font-semibold">{protocol.costEstimate}</span>
        </div>

        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center rounded border-2 border-[#00ffaa] bg-[#00ffaa]/20 py-3 font-mono text-sm font-semibold text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/30 hover:shadow-[0_0_12px_rgba(0,255,170,0.3)]"
        >
          Start this protocol
        </button>
      </div>
    </div>
  );
}

export function ProtocolsContent({ protocols }: { protocols: ProtocolTemplate[] }) {
  const [categoryFilter, setCategoryFilter] = useState<ProtocolCategory | "all">("all");
  const [modalProtocol, setModalProtocol] = useState<ProtocolTemplate | null>(null);

  const filteredProtocols = useMemo(() => {
    if (categoryFilter === "all") return protocols;
    return protocols.filter((p) => p.category === categoryFilter);
  }, [protocols, categoryFilter]);

  const lastSync = new Date().toISOString().slice(0, 16).replace("T", " ");

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 space-y-6">
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
              PROTOCOL DATABASE | TEMPLATES: {protocols.length}
            </h1>
            <div className="flex items-center gap-2">
              <span className="led-dot led-green shrink-0" aria-hidden />
            </div>
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
            <span>LAST SYNC: {lastSync}</span>
            <span>DB.VER: 2.0</span>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xPR01</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={`rounded-lg border-2 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                categoryFilter === value
                  ? "border-[#00ffaa] bg-[#00ffaa]/30 text-[#00ffaa] shadow-[0_0_10px_rgba(0,255,170,0.3)]"
                  : "border-[#00ffaa]/25 bg-black/40 text-[#e0e0e5] hover:border-[#00ffaa]/50 hover:bg-[#00ffaa]/10 hover:text-[#00ffaa]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProtocols.map((protocol, i) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              index={i}
              onViewDetails={setModalProtocol}
            />
          ))}
        </div>

        {filteredProtocols.length === 0 && (
          <p className="font-mono text-sm text-[#9a9aa3]">No protocols in this category.</p>
        )}
      </div>

      {modalProtocol && (
        <DetailsModal protocol={modalProtocol} onClose={() => setModalProtocol(null)} />
      )}
    </div>
  );
}
