"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FlaskConical,
  FileText,
  Repeat,
  Calendar,
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
    { href: "/app/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#000000] pb-20">
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-[#00ff41]/30 bg-[#0a0e1a]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/app" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-mono text-[#00ff41]">
                BIOHACKER
              </h1>
            </Link>

            {/* Settings Dropdown */}
            <SettingsDropdown />
          </div>
        </div>
      </nav>

      {/* Main Content with top padding */}
      <main className="pt-16 min-h-screen bg-[#000000]">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#00ff41]/30 bg-[#0a0e1a]/95 backdrop-blur-sm">
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
      </nav>
    </div>
  );
}
