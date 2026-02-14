import Link from "next/link";

const SCORE_FACTORS = [
  { key: "publication", label: "Publication quality", max: 25, criteria: "Journal impact, peer review status, indexing (PubMed, etc.)." },
  { key: "evidence", label: "Evidence strength", max: 35, criteria: "Study design (RCT vs observational), sample size, replication." },
  { key: "methodology", label: "Methodology", max: 25, criteria: "Blinding, endpoints, statistical rigor, protocol adherence." },
  { key: "relevance", label: "Relevance", max: 15, criteria: "Applicability to peptide use case, population, outcomes." },
];

const INTERPRETATION = [
  { range: "90–100", label: "Excellent", desc: "Strong evidence, high-quality sources, well-designed studies." },
  { range: "80–89", label: "Good", desc: "Reliable evidence with minor limitations." },
  { range: "70–79", label: "Moderate", desc: "Adequate evidence; consider study design and applicability." },
  { range: "60–69", label: "Fair", desc: "Limited evidence; interpret with caution." },
  { range: "0–59", label: "Limited", desc: "Insufficient or low-quality evidence." },
];

export default function MethodologyPage() {
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
              PepScore™ — Scoring methodology
            </h1>
            <Link
              href="/app/research"
              className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 px-3 py-2 font-mono text-xs text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15"
            >
              ← Research
            </Link>
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
            <span>DB.VER: 3.2.1</span>
            <span>METHODOLOGY: v1.0</span>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xSC01</span>
        </div>

        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa]">
            Overview
          </h2>
          <p className="mt-2 text-sm text-[#e0e0e5] leading-relaxed font-mono">
            PepScore™ is a 100-point quality score for peptide research entries. Each study is evaluated on four weighted factors. Scores are derived from publication quality, strength of evidence, methodological rigor, and relevance to the peptide use case. All cited sources are linked to PubMed where available.
          </p>
        </div>

        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6 overflow-x-auto">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
            Scoring factors
          </h2>
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#00ffaa]/30">
                <th className="text-left py-2 pr-4 text-[#00ffaa]">Factor</th>
                <th className="text-left py-2 pr-4 text-[#00ffaa]">Max points</th>
                <th className="text-left py-2 text-[#00ffaa]">Criteria</th>
              </tr>
            </thead>
            <tbody className="text-[#e0e0e5]">
              {SCORE_FACTORS.map(({ label, max, criteria }) => (
                <tr key={label} className="border-b border-white/10">
                  <td className="py-3 pr-4">{label}</td>
                  <td className="py-3 pr-4 text-[#00ffaa]">{max}</td>
                  <td className="py-3 text-[#9a9aa3]">{criteria}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-[#9a9aa3] font-mono">
            Total: 100 points. Score breakdown is shown on each study card (hover) and in the detail modal.
          </p>
        </div>

        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
            Interpretation guide
          </h2>
          <ul className="space-y-3 font-mono text-sm">
            {INTERPRETATION.map(({ range, label, desc }) => (
              <li key={range} className="flex flex-wrap gap-2 items-baseline">
                <span className="text-[#00ffaa] shrink-0">{range}</span>
                <span className="text-[#e0e0e5] font-medium shrink-0">{label}</span>
                <span className="text-[#9a9aa3]">— {desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Link
            href="/app/research"
            className="rounded border border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2 font-mono text-xs text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15"
          >
            Back to Research
          </Link>
        </div>
      </div>
    </div>
  );
}
