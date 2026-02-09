export default function AboutPage() {
  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
              ABOUT BIOHACKER | MISSION STATEMENT
            </h1>
            <div className="flex items-center gap-2">
              <span className="led-dot led-green" aria-hidden />
              <span className="led-dot led-green" aria-hidden />
            </div>
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
            <span>STATUS: ONLINE</span>
            <span>APP.VER: 1.0</span>
            <span>PepScore™ v1.0</span>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xAB01</span>
        </div>

        {/* Section 1: Why This Exists */}
        <div className="deck-panel deck-card-bg deck-screws deck-border-thick rounded-xl border-[#00ffaa]/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-3">
            Why This Exists
          </h2>
          <p className="text-sm text-[#e0e0e5] leading-relaxed font-mono mb-4">
            The peptide space is flooded with anecdotal claims, bro-science, and unverified information. Biohacker was built to bring scientific rigor to peptide research and protocol management.
          </p>
          <p className="text-sm text-[#e0e0e5] leading-relaxed font-mono mb-4">
            This is a tool for serious biohackers who want:
          </p>
          <ul className="list-none space-y-2 font-mono text-sm text-[#e0e0e5]">
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">&gt;</span>
              <span>Evidence-based protocols backed by real research</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">&gt;</span>
              <span>Transparent quality scoring (not marketing hype)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">&gt;</span>
              <span>Organized tracking of their peptide experiments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">&gt;</span>
              <span>Access to peer-reviewed sources for every claim</span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-[#00ffaa] font-mono font-medium">
            Built by biohackers, for biohackers. Open-source, transparent, scientific.
          </p>
        </div>

        {/* Section 2: PepScore™ Explained */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
            PepScore™ Explained
          </h2>
          <p className="text-xs text-[#9a9aa3] font-mono mb-5">
            Visual breakdown of each metric with examples.
          </p>

          <div className="space-y-6">
            {/* Publication Quality */}
            <div className="rounded border border-[#00ffaa]/20 bg-black/30 p-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Publication quality (Weight: 30%)
              </h3>
              <ul className="space-y-1.5 font-mono text-xs text-[#e0e0e5]">
                <li><span className="text-[#9a9aa3]">What it measures:</span> Journal reputation and impact factor</li>
                <li><span className="text-[#9a9aa3]">Why it matters:</span> Top-tier journals have rigorous peer review</li>
                <li><span className="text-[#9a9aa3]">Example:</span> NEJM (IF: 158) vs. obscure journal (IF: 0.5)</li>
                <li><span className="text-[#00ffaa]">Scoring:</span> Tier 1 (30 pts) → Tier 4 (5 pts)</li>
              </ul>
            </div>

            {/* Evidence Strength */}
            <div className="rounded border border-[#00ffaa]/20 bg-black/30 p-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#00ffaa] mb-2">
                Evidence strength (Weight: 40%)
              </h3>
              <ul className="space-y-1.5 font-mono text-xs text-[#e0e0e5]">
                <li><span className="text-[#9a9aa3]">What it measures:</span> Quality of study design</li>
                <li><span className="text-[#9a9aa3]">Why it matters:</span> RCTs &gt; observational &gt; anecdotal</li>
                <li><span className="text-[#9a9aa3]">Example:</span> Multiple RCTs (40 pts) vs. animal-only (10 pts)</li>
                <li><span className="text-[#00ffaa]">This is the MOST important factor</span></li>
              </ul>
            </div>

            {/* Sample Size */}
            <div className="rounded border border-[#00ffaa]/20 bg-black/30 p-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Sample size (Weight: 15%)
              </h3>
              <ul className="space-y-1.5 font-mono text-xs text-[#e0e0e5]">
                <li><span className="text-[#9a9aa3]">What it measures:</span> Number of participants</li>
                <li><span className="text-[#9a9aa3]">Why it matters:</span> Larger studies = more reliable results</li>
                <li><span className="text-[#9a9aa3]">Example:</span> &gt;1000 people (15 pts) vs. &lt;100 (5 pts)</li>
              </ul>
            </div>

            {/* Relevance */}
            <div className="rounded border border-[#00ffaa]/20 bg-black/30 p-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Relevance (Weight: 15%)
              </h3>
              <ul className="space-y-1.5 font-mono text-xs text-[#e0e0e5]">
                <li><span className="text-[#9a9aa3]">What it measures:</span> How recent the research is</li>
                <li><span className="text-[#9a9aa3]">Why it matters:</span> New studies reflect current understanding</li>
                <li><span className="text-[#9a9aa3]">Example:</span> 2024 study (15 pts) vs. 1998 study (5 pts)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Interpreting Scores */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-4">
            Interpreting scores
          </h2>
          <ul className="space-y-3 font-mono text-sm">
            <li className="flex flex-wrap gap-2 items-baseline border-b border-white/10 pb-2">
              <span className="text-[#00ffaa] font-bold shrink-0">90–100:</span>
              <span className="text-[#e0e0e5]">Gold standard (FDA-approved drugs like Semaglutide)</span>
            </li>
            <li className="flex flex-wrap gap-2 items-baseline border-b border-white/10 pb-2">
              <span className="text-[#00ffaa] font-bold shrink-0">75–89:</span>
              <span className="text-[#e0e0e5]">Strong evidence (well-studied, some RCTs)</span>
            </li>
            <li className="flex flex-wrap gap-2 items-baseline border-b border-white/10 pb-2">
              <span className="text-amber-400 font-bold shrink-0">60–74:</span>
              <span className="text-[#e0e0e5]">Emerging evidence (mostly preclinical)</span>
            </li>
            <li className="flex flex-wrap gap-2 items-baseline">
              <span className="text-red-400 font-bold shrink-0">&lt;60:</span>
              <span className="text-[#e0e0e5]">Limited data (early research, use caution)</span>
            </li>
          </ul>
        </div>

        {/* Section 4: Data Sources */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-[#00ffaa] mb-3">
            Data sources
          </h2>
          <p className="text-sm text-[#e0e0e5] leading-relaxed font-mono mb-4">
            All research citations link to PubMed (NIH&apos;s database of biomedical literature). We prioritize:
          </p>
          <ul className="list-none space-y-2 font-mono text-sm text-[#e0e0e5] mb-4">
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">+</span>
              <span>Peer-reviewed publications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">+</span>
              <span>Human studies over animal models</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">+</span>
              <span>Recent research (last 10 years preferred)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00ffaa] shrink-0">+</span>
              <span>Transparent conflict-of-interest disclosures</span>
            </li>
          </ul>
          <p className="text-sm text-[#00ffaa] font-mono font-medium">
            No affiliate links. No sponsored content. Just science.
          </p>
        </div>

        {/* Section 5: Disclaimer */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-amber-500/30 p-6">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-amber-400 mb-3">
            Disclaimer
          </h2>
          <p className="text-xs text-[#9a9aa3] leading-relaxed font-mono">
            This app is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any peptide or supplement protocol. Individual results may vary. We do not endorse any specific product or protocol. Use of this tool is at your own risk.
          </p>
        </div>
      </div>
    </div>
  );
}
