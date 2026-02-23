"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FlaskConical,
  FileText,
  Repeat,
  Calendar,
  Activity,
} from "lucide-react";
import SettingsDropdown from "@/components/navigation/SettingsDropdown";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/app", label: "Dashboard", icon: Home },
    { href: "/app/research", label: "Research", icon: FlaskConical },
    { href: "/app/protocols", label: "Protocols", icon: FileText },
    { href: "/app/cycles", label: "Cycles", icon: Repeat },
    { href: "/app/labs", label: "Labs", icon: Activity },
    { href: "/app/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      {/* Top Bar - Cyberpunk Styled */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#00ff41]/30 bg-[#0a0e1a] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo with Hardware Styling */}
            <Link href="/app" className="group relative">
              {/* Corner brackets */}
              <div className="absolute -left-2 top-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff41]/50" />
              <div className="absolute -left-2 bottom-0 w-2 h-2 border-b-2 border-l-2 border-[#00ff41]/50" />

              {/* Logo Text */}
              <h1 className="text-2xl font-bold font-mono text-[#00ff41] tracking-[0.2em] group-hover:text-[#00ffaa] transition-colors mb-1">
                BIOHACKER
              </h1>

              {/* Cyberdeck elements - Below logo */}
              <div className="flex items-center gap-2">
                {/* Version badge */}
                <span className="px-2 py-0.5 border border-[#00ff41]/30 bg-[#00ff41]/10 rounded text-[9px] font-mono text-[#00ff41]">
                  v1.0
                </span>

                {/* Hex ID */}
                <span className="text-[9px] font-mono text-[#00ff41]/50">
                  [0xBIO]
                </span>

                {/* Small LED indicators */}
                <div className="flex gap-1 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] shadow-[0_0_4px_rgba(0,255,65,0.8)] animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22d3e5] shadow-[0_0_4px_rgba(34,211,229,0.8)]"></div>
                </div>
              </div>
            </Link>

            {/* Settings Dropdown */}
            <SettingsDropdown />
          </div>
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-scanlines"></div>
      </nav>

      {/* Main Content with EXTRA padding top and bottom for modals and buttons */}
      <main className="pt-24 pb-48 min-h-screen bg-[#000000]">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#00ff41]/30 bg-[#0a0e1a] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded transition-all ${
                    isActive
                      ? "text-[#00ff41]"
                      : "text-gray-400 hover:text-[#00d4ff]"
                  }`}
                >
                  <div
                    className={`relative ${
                      isActive ? "animate-pulse" : ""
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00ff41] shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono">
                    {item.label.toUpperCase()}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-scanlines"></div>
      </nav>
    </div>
  );
}
