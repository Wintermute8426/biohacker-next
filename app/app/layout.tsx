"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Home,
  DollarSign,
  FileText,
  Repeat,
  Menu,
  X,
  FlaskConical,
  FileStack,
  AlertTriangle,
  BookOpen,
  TestTube,
  TrendingUp,
  Weight,
  Calendar,
} from "lucide-react";
import SettingsDropdown from "@/components/navigation/SettingsDropdown";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const mainNavItems = [
    { href: "/app", label: "Dashboard", icon: Home },
    { href: "/app/expenses", label: "Expenses", icon: DollarSign },
    { href: "/app/protocols", label: "Protocols", icon: FileText },
    { href: "/app/cycles", label: "Cycles", icon: Repeat },
  ];

  const moreMenuItems = [
    { href: "/app/research", label: "Research", icon: FlaskConical },
    { href: "/app/templates", label: "Templates", icon: FileStack },
    { href: "/app/labs", label: "Labs", icon: TestTube },
    { href: "/app/side-effects", label: "Side Effects", icon: AlertTriangle },
    { href: "/app/journal", label: "Journal", icon: BookOpen },
    { href: "/app/reports", label: "Reports", icon: TrendingUp },
    { href: "/app/weight", label: "Weight Log", icon: Weight },
    { href: "/app/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#000000] pb-24">
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#00ff41]/30 bg-[#0a0e1a]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/app" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-mono text-[#00ff41]">
                BIOHACKER
              </h1>
            </Link>
            <SettingsDropdown />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen bg-[#000000]">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#00ff41]/40 bg-[#0a0e1a] backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,255,65,0.15)]">
        <div className="container mx-auto px-1">
          <div className="flex items-center justify-around py-3">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-w-[64px] ${
                    isActive
                      ? "text-[#00ff41] bg-[#00ff41]/15 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                      : "text-gray-400 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
                  }`}
                >
                  <div className={`relative ${isActive ? "animate-pulse" : ""}`}>
                    <Icon className={`w-7 h-7 ${isActive ? "drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]" : ""}`} />
                    {isActive && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,1)]" />
                    )}
                  </div>
                  <span className={`text-[11px] font-mono font-semibold ${
                    isActive ? "text-[#00ff41]" : "text-gray-400"
                  }`}>
                    {item.label.toUpperCase()}
                  </span>
                </Link>
              );
            })}

            {/* MORE Button */}
            <button
              onClick={() => setMoreMenuOpen(true)}
              className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all min-w-[64px] text-gray-400 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10"
            >
              <Menu className="w-7 h-7" />
              <span className="text-[11px] font-mono font-semibold text-gray-400">
                MORE
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* MORE Menu Modal */}
      {moreMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setMoreMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto">
            <div className="border-2 border-[#00ff41]/40 bg-[#0a0e1a] rounded-xl shadow-[0_0_30px_rgba(0,255,65,0.3)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#00ff41]/30">
                <h2 className="text-[#00ff41] font-mono text-lg font-bold">MORE</h2>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="text-gray-400 hover:text-[#00ff41] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                {moreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all font-mono text-sm ${
                        isActive
                          ? "bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/40"
                          : "text-gray-300 hover:bg-[#00ff41]/10 hover:text-[#00ff41]"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
