import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { differenceInDays, format, parseISO } from "date-fns";
import { AlertTriangle, Calendar, ChevronRight, Droplets, Syringe } from "lucide-react";

type PeptideInventoryItem = {
  id: string;
  name: string;
  concentrationMgPerMl: number;
  totalDoses: number;
  remainingDoses: number;
  expirationDate: string;
};

const MOCK_INVENTORY: PeptideInventoryItem[] = [
  {
    id: "1",
    name: "BPC-157",
    concentrationMgPerMl: 2.5,
    totalDoses: 10,
    remainingDoses: 7,
    expirationDate: "2025-06-15"
  },
  {
    id: "2",
    name: "TB-500",
    concentrationMgPerMl: 5,
    totalDoses: 8,
    remainingDoses: 2,
    expirationDate: "2025-03-01"
  },
  {
    id: "3",
    name: "Semaglutide",
    concentrationMgPerMl: 2,
    totalDoses: 4,
    remainingDoses: 4,
    expirationDate: "2025-12-20"
  },
];

function getExpirationColor(expirationDate: string): "green" | "yellow" | "red" {
  const exp = parseISO(expirationDate);
  const today = new Date();
  const days = differenceInDays(exp, today);
  
  if (days < 0) return "red";
  if (days < 30) return "red";
  if (days <= 60) return "yellow";
  return "green";
}

function getProgressBarColor(percent: number): string {
  if (percent >= 50) return "bg-[#00ffaa]";
  if (percent >= 20) return "bg-amber-400";
  return "bg-[#ff3366]";
}

const HEX_IDS = ["0x1B3D", "0x2A4F", "0x3C61", "0x4E72", "0x5F83", "0x6A94"];

function PeptideCard({ item, staggerDelayMs }: { item: PeptideInventoryItem; staggerDelayMs: number }) {
  const expColor = getExpirationColor(item.expirationDate);
  const percent = item.totalDoses > 0 ? (item.remainingDoses / item.totalDoses) * 100 : 0;
  const isLowStock = item.remainingDoses < 3;
  const progressBarColor = getProgressBarColor(percent);
  
  const expStyles = {
    green: "text-[#00ffaa]",
    yellow: "text-amber-400",
    red: "text-red-400",
  };

  const segmentCount = 10;
  const filledSegments = Math.min(segmentCount, Math.round((percent / 100) * segmentCount));

  const ledClass = isLowStock ? "led-red" : "led-green";
  const hexId = HEX_IDS[parseInt(item.id, 10) % HEX_IDS.length] ?? "0x2A4F";

  return (
    <div
      className={`group deck-panel deck-card-bg deck-screws deck-border-thick relative rounded-xl p-5 pt-6 opacity-0 transition-all duration-300 hover:scale-[1.01] hover:border-[#00ffaa]/40 hover:shadow-lg hover:shadow-[#00ffaa]/15 animate-fade-in ${isLowStock ? "animate-low-stock-pulse" : ""}`}
      style={{ animationDelay: `${staggerDelayMs}ms` }}
    >
      <div className="led-card-top-right">
        <span className={`led-dot ${ledClass}`} aria-hidden />
      </div>
      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>{hexId}</span>
      {isLowStock && (
        <span className="absolute right-10 top-3 z-10 flex items-center gap-1.5 rounded border border-red-400/50 bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
          <AlertTriangle className="h-2.5 w-2.5" />
          LOW
        </span>
      )}

      <div className="glitch-on-hover relative z-10">
      <div className={`flex items-center gap-2 ${isLowStock ? "pr-16" : ""} mt-2`}>
        <Syringe className="h-4 w-4 text-[#00ffaa]" />
        <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
          {item.name}
        </h3>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-[#e0e0e5]">
        <Droplets className="h-4 w-4 text-[#00ffaa]/80" />
        <span>{item.concentrationMgPerMl} mg/ml</span>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-[#9a9aa3] mb-2">
          <span>Remaining doses</span>
          <span className="data-readout font-semibold text-[#e0e0e5] font-mono">
            {item.remainingDoses} / {item.totalDoses}
          </span>
        </div>
        <div className="progress-segmented bg-[#1a1a1a]">
          {Array.from({ length: segmentCount }).map((_, i) => (
            <div
              key={i}
              className={`progress-segmented-fill ${i < filledSegments ? progressBarColor : "progress-segment-empty bg-white/5"}`}
            />
          ))}
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${expStyles[expColor]}`}>
        <Calendar className="h-4 w-4 opacity-90" />
        <span>Expires {format(parseISO(item.expirationDate), "MMM d, yyyy")}</span>
      </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const hexDumpText = "0x4F 0xA2 0x3B 0x7C 0xE1 0x09 0x5D 0xB8 0x2A 0xF4 0x6E 0xC3 0x11 0x90 0x38 0xD7 ".repeat(40);

  return (
    <div className="dashboard-hardware group deck-carbon glass-reflection deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      {/* Hex dump background */}
      <div className="hex-dump-bg p-4" aria-hidden>
        {hexDumpText}
      </div>
      {/* Scanlines – pause on hover */}
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      {/* System info – top-left */}
      <div className="sys-info absolute left-3 top-3 z-[110]" aria-hidden>
        SYS.VER 2.4.1 | UPTIME 48:32:17 | MEM 84%
      </div>

      {/* Mock hardware button panel – top-right */}
      <div className="absolute right-3 top-3 z-[110]" aria-hidden>
        <div className="hw-btn-panel">
          <div className="hw-btn flex flex-col items-center justify-center gap-1">
            <span className="hw-btn-led hw-btn-led-red" />
            <span>PWR</span>
          </div>
          <div className="hw-btn flex flex-col items-center justify-center gap-1">
            <span className="hw-btn-led hw-btn-led-green hw-btn-led-pulse" />
            <span>SYS</span>
          </div>
          <div className="hw-btn flex flex-col items-center justify-center gap-1">
            <span className="hw-btn-led hw-btn-led-blue" />
            <span>NET</span>
          </div>
          <div className="hw-btn flex flex-col items-center justify-center gap-1">
            <span className="hw-btn-led hw-btn-led-amber" />
            <span>LOG</span>
          </div>
        </div>
      </div>

      {/* Corner detail panels – 4 corners (TEMP blinks like data update) */}
      <div className="corner-panel corner-led-blink absolute left-3 bottom-3 z-[105]" aria-hidden>TEMP: 42°C</div>
      <div className="corner-panel absolute right-3 bottom-3 z-[105]" aria-hidden>VOLT: 5.2V</div>
      <div className="corner-panel absolute left-3 top-20 z-[105]" aria-hidden>FAN: 2400RPM</div>
      <div className="corner-panel absolute right-16 top-20 z-[105]" aria-hidden>CPU: 12%</div>

      {/* Data port indicators – bottom-left */}
      <div className="absolute left-3 bottom-8 z-[105] flex flex-col gap-1.5" aria-hidden>
        <div className="data-port">
          <span className="data-port-dot lit" />
          USB
        </div>
        <div className="data-port">
          <span className="data-port-dot lit" />
          NET
        </div>
        <div className="data-port">
          <span className="data-port-dot" />
          AUX
        </div>
      </div>

      {/* Barcode decorative – bottom-right */}
      <div className="barcode-deco absolute right-3 bottom-12 z-[105] origin-bottom-right" aria-hidden>
        |||| || | ||| || | |||| |
      </div>

      {/* Circuit traces – PCB-style lines connecting sections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[8]" aria-hidden>
        <defs>
          <filter id="trace-glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 50% 140 Q 50% 200 50% 280 L 50% 320"
          fill="none"
          stroke="rgba(0, 255, 170, 0.25)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#trace-glow)"
        />
        <path
          d="M 50% 320 Q 48% 420 50% 520 L 50% 580"
          fill="none"
          stroke="rgba(0, 255, 170, 0.2)"
          strokeWidth="1"
          strokeLinecap="round"
          filter="url(#trace-glow)"
        />
        <path
          d="M 30% 200 L 70% 200 M 30% 480 L 70% 480"
          fill="none"
          stroke="rgba(0, 255, 170, 0.12)"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      </svg>

      <div className="relative z-10 space-y-12">
        {/* Header with terminal cursor blink */}
        <div className="space-y-2 opacity-0 animate-fade-in pt-8" style={{ animationDelay: "0ms" }}>
          <h1 className="font-space-mono text-5xl font-bold tracking-wide text-[#f5f5f7]">
            Dashboard
            <span className="ml-1 inline-block h-10 w-0.5 bg-[#00ffaa] animate-cursor-blink" aria-hidden />
          </h1>
          <p className="text-base tracking-wide text-[#00ffaa]/95">Your peptide protocol at a glance</p>
        </div>

        {/* Power indicator strip – below header */}
        <div className="power-strip opacity-0 animate-fade-in" style={{ animationDelay: "20ms" }} aria-hidden>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`power-strip-segment ${i <= 6 ? "lit" : ""}`} />
          ))}
        </div>

        {/* Get Started – terminal style, chunky buttons */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <Card className="deck-panel deck-card-bg deck-screws deck-border-thick border-[#00ffaa]/40 font-mono shadow-[0_0_12px_rgba(0,255,170,0.2)] transition-all duration-300 hover:border-[#00ffaa]/55">
            <span className="hex-id absolute left-4 top-3 z-10" aria-hidden>0x0A1C</span>
            <div className="led-card-top-right">
              <span className="led-dot led-green" aria-hidden />
            </div>
            <CardHeader className="pb-2 pt-5">
              <CardTitle className="font-space-mono text-2xl font-bold tracking-wide text-[#00ffaa]">
                &gt; Initialize protocol...
                <span className="ml-1 inline-block h-6 w-0.5 bg-[#00ffaa] animate-cursor-blink" aria-hidden />
              </CardTitle>
              <CardDescription className="font-space-mono text-sm tracking-wide text-[#9a9aa3]">
                Set up your first cycle — run the steps below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-0 pt-2">
              <p className="text-sm text-[#e0e0e5]">Create a protocol, start a cycle, then track doses.</p>
              <div className="space-y-2">
                <Link href="/app/protocols">
                  <Button variant="outline" className="btn-chunky w-full justify-start font-mono text-sm border-[#00ffaa]/40 text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:border-[#00ffaa]/60">1. Browse protocols</Button>
                </Link>
                <Link href="/app/protocols">
                  <Button variant="outline" className="btn-chunky w-full justify-start font-mono text-sm border-[#00ffaa]/40 text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:border-[#00ffaa]/60">2. Create or pick a protocol</Button>
                </Link>
                <Link href="/app/cycles">
                  <Button variant="outline" className="btn-chunky w-full justify-start font-mono text-sm border-[#00ffaa]/40 text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:border-[#00ffaa]/60">3. Start a cycle</Button>
                </Link>
                <Link href="/app/calendar">
                  <Button variant="outline" className="btn-chunky w-full justify-start font-mono text-sm border-[#00ffaa]/40 text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:border-[#00ffaa]/60">4. Set dosages and dates</Button>
                </Link>
                <Link href="/app/calendar">
                  <Button variant="outline" className="btn-chunky w-full justify-start font-mono text-sm border-[#00ffaa]/40 text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:border-[#00ffaa]/60">5. Track & log</Button>
                </Link>
                <Link href="/app/calendar">
                  <Button variant="outline" className="btn-chunky w-full justify-start font-mono text-sm border-[#00ffaa]/40 text-[#e0e0e5] hover:bg-[#00ffaa]/10 hover:border-[#00ffaa]/60">6. Log doses on the calendar</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="deck-seam" aria-hidden />

        {/* Overview with empty state CTA */}
        <div className="deck-section deck-section-separator relative space-y-5 opacity-0 animate-fade-in pt-4 pb-2" style={{ animationDelay: "100ms" }}>
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />
          <h2 className="font-space-mono text-3xl font-semibold tracking-wide text-[#f5f5f7]">Overview</h2>
          <div className="grid grid-cols-2 gap-8">
            {[
              { value: "0", label: "Active Cycles", cta: true, ledClass: "led-green", hexId: "0x1B3D" },
              { value: "0", label: "Protocols", cta: false, ledClass: "led-green", hexId: "0x2A4F" },
              { value: "0", label: "Today's Doses", cta: false, ledClass: "led-yellow", hexId: "0x3C61" },
              { value: "—%", label: "Adherence", cta: false, ledClass: "led-green", hexId: "0x4E72" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="deck-panel deck-card-bg deck-screws deck-border-thick relative rounded-lg border-[#00ffaa]/25 p-6 pt-7 opacity-0 transition-all duration-300 hover:border-[#00ffaa]/45 hover:shadow-[0_0_10px_rgba(0,255,170,0.25)] hover-glitch animate-fade-in"
                style={{ animationDelay: `${150 + i * 50}ms` }}
              >
                <span className="hex-id absolute left-4 top-3 z-10" aria-hidden>{stat.hexId}</span>
                <div className="led-card-top-right">
                  <span className={`led-dot ${stat.ledClass}`} aria-hidden />
                </div>
                <span className="data-readout font-mono text-5xl font-extrabold text-[#00ffaa]">{stat.value}</span>
                <div className="text-base text-[#e0e0e5] mt-2">{stat.label}</div>
                {stat.cta && (
                  <Link href="/app/protocols" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#00ffaa] transition-colors hover:text-[#00ffaa]/90">
                    Start your first protocol <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coiled cable – decorative connection between Overview and Inventory */}
        <div className="relative h-16 w-full opacity-0 animate-fade-in" style={{ animationDelay: "140ms" }} aria-hidden>
          <svg className="absolute inset-0 h-full w-full text-[#00ffaa]/20" preserveAspectRatio="none">
            <path
              d="M 50% 0 Q 52% 40%, 48% 50% T 50% 100%"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M 50% 0 Q 48% 45%, 52% 55% T 50% 100%"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Current Inventory */}
        <div className="deck-section relative space-y-5 opacity-0 animate-fade-in pt-4 pb-2" style={{ animationDelay: "150ms" }}>
          <div className="deck-bracket-bottom-left" aria-hidden />
          <div className="deck-bracket-bottom-right" aria-hidden />
          <h2 className="font-space-mono text-3xl font-semibold tracking-wide text-[#f5f5f7]">Current Inventory</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_INVENTORY.map((item, i) => (
              <PeptideCard key={item.id} item={item} staggerDelayMs={200 + i * 50} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
