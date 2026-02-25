"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Brain, Clock, Scale, FlaskConical } from "lucide-react";
import CycleLabCorrelation from "@/components/reports/CycleLabCorrelation";
import LabTrends from "@/components/reports/LabTrends";
import AIInsights from "@/components/reports/AIInsights";
import CycleTimeline from "@/components/reports/CycleTimeline";
import BodyComposition from "@/components/reports/BodyComposition";
import CycleComparison from "@/components/reports/CycleComparison";

type ReportType = "correlation" | "trends" | "ai" | "timeline" | "body" | "comparison";

interface ReportTab {
  id: ReportType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const REPORT_TABS: ReportTab[] = [
  {
    id: "correlation",
    label: "Cycle-Lab Correlation",
    icon: BarChart3,
    description: "Which cycles impacted your lab results"
  },
  {
    id: "trends",
    label: "Lab Trends",
    icon: TrendingUp,
    description: "Marker changes over time"
  },
  {
    id: "ai",
    label: "AI Insights",
    icon: Brain,
    description: "Claude analyzes your data"
  },
  {
    id: "timeline",
    label: "Cycle Timeline",
    icon: Clock,
    description: "Visual timeline of all cycles"
  },
  {
    id: "body",
    label: "Body Composition",
    icon: Scale,
    description: "Weight & body fat tracking"
  },
  {
    id: "comparison",
    label: "Cycle Comparison",
    icon: FlaskConical,
    description: "Compare protocol effectiveness"
  }
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("correlation");

  const renderReport = () => {
    switch (activeReport) {
      case "correlation":
        return <CycleLabCorrelation />;
      case "trends":
        return <LabTrends />;
      case "ai":
        return <AIInsights />;
      case "timeline":
        return <CycleTimeline />;
      case "body":
        return <BodyComposition />;
      case "comparison":
        return <CycleComparison />;
      default:
        return null;
    }
  };

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
            <div>
              <h1 className="font-space-mono text-xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-2xl">
                ANALYTICS & REPORTS
              </h1>
              <p className="mt-1 font-mono text-[10px] text-[#9a9aa3]">
                Premium insights from your cycle and lab data
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-dot led-green" aria-hidden />
              <span className="px-2 py-1 rounded bg-[#00ffaa]/10 border border-[#00ffaa]/40 font-mono text-[10px] text-[#00ffaa]">
                PREMIUM
              </span>
            </div>
          </div>

          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden>0xREP1</span>
        </div>

        {/* Tab Navigation - Mobile: Vertical stack, Desktop: Horizontal */}
        <div className="space-y-3">
          {/* Mobile: Stacked pills */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeReport === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 font-mono text-xs transition-all ${
                    isActive
                      ? "border-[#00ffaa] bg-[#00ffaa]/10 text-[#00ffaa] shadow-[0_0_12px_rgba(0,255,170,0.3)]"
                      : "border-[#00ffaa]/20 bg-black/30 text-[#9a9aa3] hover:border-[#00ffaa]/40 hover:bg-[#00ffaa]/5"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop: Horizontal tabs */}
          <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeReport === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReport(tab.id)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-mono text-xs transition-all ${
                    isActive
                      ? "border-[#00ffaa] bg-[#00ffaa]/10 text-[#00ffaa] shadow-[0_0_12px_rgba(0,255,170,0.3)]"
                      : "border-[#00ffaa]/20 bg-black/30 text-[#9a9aa3] hover:border-[#00ffaa]/40 hover:bg-[#00ffaa]/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active report description */}
          <div className="deck-panel deck-card-bg deck-border-thick rounded-lg border-[#00ffaa]/20 p-3">
            <p className="font-mono text-[10px] text-[#9a9aa3]">
              <span className="text-[#00ffaa]">&gt;</span> {REPORT_TABS.find(t => t.id === activeReport)?.description}
            </p>
          </div>
        </div>

        {/* Report Content */}
        <div className="min-h-[400px]">
          {renderReport()}
        </div>
      </div>
    </div>
  );
}
