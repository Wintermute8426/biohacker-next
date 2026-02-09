"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FlaskConical, List, RefreshCw, Calendar, Info } from "lucide-react";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/research", label: "Research", icon: FlaskConical },
  { href: "/app/protocols", label: "Protocols", icon: List },
  { href: "/app/cycles", label: "Cycles", icon: RefreshCw },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/about", label: "About", icon: Info },
] as const;

export function DeckNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b border-[#00ffaa]/20 bg-bg-charcoal/90 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2 px-4 py-2 sm:gap-3 sm:px-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/app"
              ? pathname === "/app" || pathname === "/app/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`deck-nav-btn flex items-center gap-2 rounded-lg border-2 px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 sm:px-4 sm:text-sm ${
                isActive
                  ? "border-[#00ffaa] bg-[#00ffaa]/30 text-[#00ffaa] shadow-[0_0_12px_rgba(0,255,170,0.4)]"
                  : "border-[#00ffaa]/25 bg-black/50 text-[#e0e0e5] hover:border-[#00ffaa]/50 hover:bg-[#00ffaa]/10 hover:text-[#00ffaa] hover:shadow-[0_0_10px_rgba(0,255,170,0.25)]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 sm:h-4" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
