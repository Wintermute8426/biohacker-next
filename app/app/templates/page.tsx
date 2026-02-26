"use client";

import TemplateLibrary from "@/components/TemplateLibrary";

export default function TemplatesPage() {
  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 space-y-6 p-4">
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
                CYCLE TEMPLATES
              </h1>
              <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
                Start a cycle from a template or save your own
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-dot led-green" aria-hidden />
              <span className="px-2 py-1 rounded bg-[#00ffaa]/10 border border-[#00ffaa]/40 font-mono text-[10px] text-[#00ffaa]">
                TEMPLATES
              </span>
            </div>
          </div>
          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>
            0xTPL1
          </span>
        </div>

        <TemplateLibrary />
      </div>
    </div>
  );
}
