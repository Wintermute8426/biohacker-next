"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Syringe, X, Info } from "lucide-react";
import { format, parseISO } from "date-fns";

export type ResearchCategory = "longevity" | "recovery" | "cognitive" | "metabolic" | "aesthetic";

export type ScoreBreakdown = {
  publication: number;
  evidence: number;
  methodology: number;
  relevance: number;
};

export type ResearchSource = {
  title: string;
  year: string;
  type: string;
  pmid: string;
  url: string;
};

export type PeptideStudy = {
  id: string;
  hexId: string;
  peptideName: string;
  studyTitle: string;
  abstract: string;
  publicationDate: string;
  source: string;
  qualityScore: number;
  scoreBreakdown?: ScoreBreakdown;
  category: ResearchCategory;
  dosing?: string;
  halfLife?: string;
  benefits?: string[];
  sources?: ResearchSource[];
};

const SCORE_MAX = { publication: 25, evidence: 35, methodology: 25, relevance: 15 } as const;
const SCORE_FACTORS: { key: keyof ScoreBreakdown; label: string; max: number; color: string }[] = [
  { key: "publication", label: "Publication", max: 25, color: "bg-cyan-500" },
  { key: "evidence", label: "Evidence", max: 35, color: "bg-[#00ffaa]" },
  { key: "methodology", label: "Methodology", max: 25, color: "bg-amber-400" },
  { key: "relevance", label: "Relevance", max: 15, color: "bg-purple-400" },
];

const INTERPRETATION = [
  { range: "90–100", label: "Excellent", desc: "Strong evidence, high-quality sources, well-designed studies." },
  { range: "80–89", label: "Good", desc: "Reliable evidence with minor limitations." },
  { range: "70–79", label: "Moderate", desc: "Adequate evidence; consider study design and applicability." },
  { range: "60–69", label: "Fair", desc: "Limited evidence; interpret with caution." },
  { range: "0–59", label: "Limited", desc: "Insufficient or low-quality evidence." },
];

const CATEGORY_LABELS: Record<ResearchCategory, string> = {
  longevity: "Longevity",
  recovery: "Recovery",
  cognitive: "Cognitive",
  metabolic: "Metabolic",
  aesthetic: "Aesthetic",
};

const CATEGORY_COLORS: Record<ResearchCategory, string> = {
  longevity: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  recovery: "bg-[#00ffaa]/20 text-[#00ffaa] border-[#00ffaa]/40",
  cognitive: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  metabolic: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  aesthetic: "bg-pink-500/20 text-pink-400 border-pink-500/40",
};

function getQualityBarColor(score: number): string {
  if (score >= 80) return "bg-[#00ffaa]";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

function PepScoreModal({ onClose }: { onClose: () => void }) {
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
      aria-labelledby="pepscore-title"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="deck-panel deck-card-bg deck-border-thick relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border-[#00ffaa]/40 p-6 shadow-[0_0_24px_rgba(0,255,170,0.2)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-[#9a9aa3] transition-colors hover:bg-white/10 hover:text-[#f5f5f7]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="pepscore-title" className="font-space-mono text-xl font-bold text-[#f5f5f7] pr-8">
          PepScore™ methodology
        </h2>
        <p className="mt-2 text-xs text-[#9a9aa3] font-mono">
          Quality scores are derived from four weighted factors (total 100 points).
        </p>
        <div className="mt-4 space-y-2">
          {SCORE_FACTORS.map(({ key, label, max, color }) => (
            <div key={key} className="flex items-center gap-3 text-xs font-mono">
              <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} aria-hidden />
              <span className="text-[#e0e0e5] w-28">{label}</span>
              <span className="text-[#00ffaa]">max {max} pts</span>
            </div>
          ))}
        </div>
        <h3 className="mt-5 font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">
          Interpretation guide
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs font-mono text-[#9a9aa3]">
          {INTERPRETATION.map(({ range, label, desc }) => (
            <li key={range}>
              <span className="text-[#00ffaa]">{range}</span> — <span className="text-[#e0e0e5] font-medium">{label}</span>. {desc}
            </li>
          ))}
        </ul>
        <Link
          href="/app/research/methodology"
          className="mt-4 inline-block rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 px-3 py-2 font-mono text-xs text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15"
        >
          Full methodology →
        </Link>
      </div>
    </div>
  );
}

function ResearchCard({
  study,
  index,
  onViewDetails,
  onOpenMethodology,
}: {
  study: PeptideStudy;
  index: number;
  onViewDetails: (study: PeptideStudy) => void;
  onOpenMethodology: () => void;
}) {
  const barColor = getQualityBarColor(study.qualityScore);
  const segmentCount = 10;
  const filledSegments = Math.min(segmentCount, Math.round((study.qualityScore / 100) * segmentCount));
  const topBenefits = (study.benefits ?? []).slice(0, 3);
  const sourceCount = study.sources?.length ?? 0;
  const breakdown = study.scoreBreakdown;

  return (
    <div
      className="group deck-panel deck-card-bg deck-screws deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg hover:shadow-[#00ffaa]/15 animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="led-card-top-right">
        <span className="led-dot led-green" aria-hidden />
      </div>
      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>{study.hexId}</span>

      <div className="glitch-on-hover relative z-10">
        <div className="flex items-center gap-2 mt-2">
          <Syringe className="h-4 w-4 text-[#00ffaa] shrink-0" />
          <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
            {study.peptideName}
          </h3>
        </div>

        <h4 className="mt-3 font-mono text-sm font-medium text-[#e0e0e5] line-clamp-2 leading-snug">
          {study.studyTitle}
        </h4>

        <div className="mt-2 flex items-center gap-2 text-xs text-[#9a9aa3] font-mono">
          <span>{format(parseISO(study.publicationDate), "MMM d, yyyy")}</span>
          <span>|</span>
          <span className="truncate max-w-[140px]" title={study.source}>{study.source}</span>
        </div>

        {study.halfLife && (
          <div className="mt-2 text-[10px] font-mono text-[#00ffaa]/80">
            t½ {study.halfLife}
          </div>
        )}

        <p className="mt-3 text-xs text-[#9a9aa3] leading-relaxed line-clamp-3 font-mono">
          {study.abstract}
        </p>

        {topBenefits.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topBenefits.map((b) => (
              <span
                key={b}
                className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-0.5 text-[10px] font-mono text-[#00ffaa]"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {study.dosing && (
          <div
            className="mt-2 cursor-help rounded border border-[#00ffaa]/20 bg-black/30 px-2 py-1.5 text-[10px] font-mono text-[#9a9aa3] transition-colors hover:border-[#00ffaa]/40 hover:text-[#e0e0e5]"
            title={study.dosing}
          >
            <span className="text-[#00ffaa]/80">Dosing:</span> {study.dosing.length > 50 ? `${study.dosing.slice(0, 50)}…` : study.dosing}
          </div>
        )}

        <div className="mt-4 relative">
          <div className="flex justify-between items-center text-xs text-[#9a9aa3] mb-1.5">
            <span className="flex items-center gap-1.5">
              Quality score
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenMethodology(); }}
                className="rounded p-0.5 text-[#00ffaa]/80 transition-colors hover:bg-[#00ffaa]/20 hover:text-[#00ffaa]"
                title="PepScore™ methodology"
                aria-label="Explain quality score methodology"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </span>
            <span className="data-readout font-mono text-[#00ffaa]">{study.qualityScore}%</span>
          </div>
          <div
            className="progress-segmented bg-[#1a1a1a]"
            title={breakdown ? `Publication ${breakdown.publication}/${SCORE_MAX.publication}, Evidence ${breakdown.evidence}/${SCORE_MAX.evidence}, Methodology ${breakdown.methodology}/${SCORE_MAX.methodology}, Relevance ${breakdown.relevance}/${SCORE_MAX.relevance}` : undefined}
          >
            {Array.from({ length: segmentCount }).map((_, i) => (
              <div
                key={i}
                className={`progress-segmented-fill ${i < filledSegments ? barColor : "progress-segment-empty bg-white/5"}`}
              />
            ))}
          </div>
          {breakdown && (
            <div className="absolute left-0 right-0 top-full mt-1 hidden rounded border border-[#00ffaa]/30 bg-black/95 px-2 py-1.5 font-mono text-[10px] text-[#9a9aa3] shadow-lg group-hover:block z-20">
              Publication {breakdown.publication}/{SCORE_MAX.publication} · Evidence {breakdown.evidence}/{SCORE_MAX.evidence} · Methodology {breakdown.methodology}/{SCORE_MAX.methodology} · Relevance {breakdown.relevance}/{SCORE_MAX.relevance}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${CATEGORY_COLORS[study.category]}`}>
            {CATEGORY_LABELS[study.category]}
          </span>
          {sourceCount > 0 && (
            <span className="rounded border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-2 py-0.5 text-[10px] font-mono text-[#22d3ee]">
              {sourceCount} source{sourceCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(study)}
          className="mt-4 flex w-full items-center justify-center rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60"
        >
          View details
        </button>
      </div>
    </div>
  );
}

function ScoreBreakdownChart({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="mt-2 space-y-2">
      {SCORE_FACTORS.map(({ key, label, max, color }) => {
        const value = breakdown[key];
        const pct = Math.min(100, (value / max) * 100);
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#9a9aa3] w-20 shrink-0">{label}</span>
            <div className="flex-1 h-2 rounded bg-[#1a1a1a] overflow-hidden">
              <div
                className={`h-full rounded ${color} transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#00ffaa] w-12 shrink-0 text-right" title={`${value} / ${max} points`}>
              {value}/{max}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DetailsModal({
  study,
  onClose,
}: {
  study: PeptideStudy;
  onClose: () => void;
}) {
  const barColor = getQualityBarColor(study.qualityScore);
  const segmentCount = 10;
  const filledSegments = Math.min(segmentCount, Math.round((study.qualityScore / 100) * segmentCount));
  const breakdown = study.scoreBreakdown;
  const sources = study.sources ?? [];

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
      aria-labelledby="modal-title"
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
          <Syringe className="h-5 w-5 text-[#00ffaa]" />
          <h2 id="modal-title" className="font-space-mono text-2xl font-bold text-[#f5f5f7]">
            {study.peptideName}
          </h2>
          <span className="hex-id ml-2">{study.hexId}</span>
        </div>

        <h3 className="mt-3 font-mono text-sm font-medium text-[#e0e0e5]">
          {study.studyTitle}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#9a9aa3] font-mono">
          <span>{format(parseISO(study.publicationDate), "MMM d, yyyy")}</span>
          <span>|</span>
          <span>{study.source}</span>
        </div>

        <div className="mt-4">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Abstract</h4>
          <p className="mt-1 text-sm text-[#e0e0e5] leading-relaxed font-mono">{study.abstract}</p>
        </div>

        {study.dosing && (
          <div className="mt-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Dosing protocol</h4>
            <p className="mt-1 text-sm text-[#e0e0e5] font-mono">{study.dosing}</p>
          </div>
        )}

        {study.halfLife && (
          <div className="mt-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Half-life</h4>
            <p className="mt-1 text-sm text-[#e0e0e5] font-mono">{study.halfLife}</p>
          </div>
        )}

        {(study.benefits?.length ?? 0) > 0 && (
          <div className="mt-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Benefits</h4>
            <ul className="mt-2 flex flex-wrap gap-2">
              {study.benefits!.map((b) => (
                <li
                  key={b}
                  className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/10 px-2 py-1 text-xs font-mono text-[#00ffaa]"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Quality score (PepScore™)</h4>
          <div className="mt-2 flex items-center gap-3">
            <div className="progress-segmented flex-1 bg-[#1a1a1a]">
              {Array.from({ length: segmentCount }).map((_, i) => (
                <div
                  key={i}
                  className={`progress-segmented-fill ${i < filledSegments ? barColor : "progress-segment-empty bg-white/5"}`}
                />
              ))}
            </div>
            <span className="data-readout font-mono text-lg font-bold text-[#00ffaa]">{study.qualityScore}%</span>
          </div>
          {breakdown && <ScoreBreakdownChart breakdown={breakdown} />}
        </div>

        {sources.length > 0 && (
          <div className="mt-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00ffaa]">Research sources</h4>
            <ul className="mt-2 space-y-2">
              {sources.map((src) => (
                <li key={src.pmid} className="rounded border border-[#00ffaa]/20 bg-black/30 px-3 py-2">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-[#00ffaa] hover:underline block"
                  >
                    {src.title}
                  </a>
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono text-[#9a9aa3]">
                    <span>{src.year}</span>
                    <span>·</span>
                    <span className="text-[#22d3ee]">{src.type}</span>
                    <span>·</span>
                    <span>PMID {src.pmid}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-medium ${CATEGORY_COLORS[study.category]}`}>
            {CATEGORY_LABELS[study.category]}
          </span>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_OPTIONS: { value: ResearchCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "recovery", label: "Recovery" },
  { value: "longevity", label: "Longevity" },
  { value: "cognitive", label: "Cognitive" },
  { value: "metabolic", label: "Metabolic" },
  { value: "aesthetic", label: "Aesthetic" },
];

export function ResearchContent({ studies }: { studies: PeptideStudy[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ResearchCategory | "all">("all");
  const [modalStudy, setModalStudy] = useState<PeptideStudy | null>(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const filteredStudies = useMemo(() => {
    let list = studies;
    if (categoryFilter !== "all") {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.peptideName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.benefits ?? []).some((b) => b.toLowerCase().includes(q)) ||
          s.studyTitle.toLowerCase().includes(q)
      );
    }
    return list;
  }, [studies, categoryFilter, searchQuery]);

  const lastSync = format(new Date(), "yyyy-MM-dd HH:mm");

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
              RESEARCH DATABASE | STATUS: ONLINE | ENTRIES: {studies.length}
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/app/research/methodology"
                className="rounded border border-[#00ffaa]/30 bg-[#00ffaa]/5 px-2 py-1 font-mono text-[10px] text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/50"
              >
                How scores work
              </Link>
              <span className="led-dot led-green shrink-0" aria-hidden />
            </div>
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
            <span>LAST SYNC: {lastSync}</span>
            <span>DB.VER: 3.2.1</span>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xDB01</span>
        </div>

        {/* Category filter buttons */}
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

        {/* Search bar */}
        <div className="relative">
          <label htmlFor="research-search" className="sr-only">
            Search peptides
          </label>
          <div className="flex items-center rounded-lg border-2 border-[#00ffaa]/25 bg-black/40 px-4 py-3 font-mono transition-colors focus-within:border-[#00ffaa]/60 focus-within:shadow-[0_0_12px_rgba(0,255,170,0.2)]">
            <span className="text-[#00ffaa] select-none">&gt;</span>
            <input
              id="research-search"
              type="text"
              placeholder=" SEARCH PEPTIDES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-0 text-sm text-[#f5f5f7] placeholder:text-[#9a9aa3] focus:outline-none focus:ring-0"
            />
            <span className="inline-block h-4 w-0.5 bg-[#00ffaa] animate-cursor-blink" aria-hidden />
          </div>
        </div>

        {/* Research cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudies.map((study, i) => (
            <ResearchCard
              key={study.id}
              study={study}
              index={i}
              onViewDetails={setModalStudy}
              onOpenMethodology={() => setMethodologyOpen(true)}
            />
          ))}
        </div>

        {filteredStudies.length === 0 && (
          <p className="font-mono text-sm text-[#9a9aa3]">
            No studies match your search or filter.
          </p>
        )}
      </div>

      {modalStudy && (
        <DetailsModal study={modalStudy} onClose={() => setModalStudy(null)} />
      )}
      {methodologyOpen && (
        <PepScoreModal onClose={() => setMethodologyOpen(false)} />
      )}
    </div>
  );
}
