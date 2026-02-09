"use client";

import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  FlaskConical,
  FileText,
  Repeat,
  Calendar,
  Scale,
  Info,
  LogOut,
} from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      } else {
        router.push("/auth/login");
      }
    };
    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navItems = [
    { href: "/app", label: "DASHBOARD", icon: Home },
    { href: "/app/research", label: "RESEARCH", icon: FlaskConical },
    { href: "/app/protocols", label: "PROTOCOLS", icon: FileText },
    { href: "/app/cycles", label: "CYCLES", icon: Repeat },
    { href: "/app/weight-log", label: "WEIGHT LOG", icon: Scale },
    { href: "/app/calendar", label: "CALENDAR", icon: Calendar },
    { href: "/app/about", label: "ABOUT", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Top Navigation */}
      <nav className="border-b border-[#00ff41]/30 bg-[#0a0e1a]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/app" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold font-mono text-[#00ff41]">
                BIOHACKER
              </h1>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-[#00ff41]/70 font-mono">
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-[#ff0040] font-mono transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Navigation Tabs */}
      <nav className="border-b border-[#00ff41]/20 bg-[#0a0e1a]">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-3 border-2 font-mono text-sm rounded transition-all whitespace-nowrap ${
                    isActive
                      ? "border-[#00ff41] bg-[#00ff41]/20 text-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.3)]"
                      : "border-gray-600 text-gray-300 hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen bg-[#000000]">{children}</main>
    </div>
  );
}
