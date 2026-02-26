import EffectivenessReport from "@/components/EffectivenessReport";

export default function EffectivenessReportPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Scanlines */}
      <div className="scanline-layer-thin" aria-hidden="true"></div>
      <div className="scanline-layer-thick" aria-hidden="true"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="deck-section mb-6">
          <div className="deck-bracket-bottom-left" aria-hidden="true"></div>
          <div className="deck-bracket-bottom-right" aria-hidden="true"></div>
          
          <h1 className="deck-section-title text-2xl mb-2">
            CYCLE EFFECTIVENESS & SIDE EFFECTS REPORT
          </h1>
          <p className="text-xs text-green-500/60 font-mono">
            Comprehensive analysis of your peptide cycle performance
          </p>
        </div>

        {/* Report */}
        <EffectivenessReport />
      </div>
    </div>
  );
}
