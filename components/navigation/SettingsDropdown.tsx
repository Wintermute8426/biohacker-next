"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, User, CreditCard, LogOut, X, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const loadUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Gear Button - Enhanced */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 border border-[#00ff41]/40 bg-[#1a1f2e] rounded hover:bg-[#00ff41]/10 hover:border-[#00ff41] transition-all duration-300 group hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]"
      >
        <Settings className="w-5 h-5 text-[#00ff41] group-hover:rotate-90 transition-transform duration-300" />
        {/* Subtle LED indicator */}
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00ff41] shadow-[0_0_4px_rgba(0,255,65,0.8)] animate-pulse"></div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-72 border border-[#00ff41]/30 bg-[#0a0e1a] rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.25)] z-50 animate-fade-in">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00ff41]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00ff41]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00ff41]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00ff41]" />

          {/* Hex ID */}
          <div className="absolute top-2 right-5 text-[#00ff41]/50 text-[10px] font-mono">
            [SET-0x7F]
          </div>

          {/* Header */}
          <div className="p-4 border-b border-[#00ff41]/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#00ff41] font-mono text-sm font-bold tracking-wider">SETTINGS</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-[#00ff41] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-400 font-mono truncate">
              {userEmail}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                router.push("/app/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-[#00ff41]/10 hover:text-[#00ff41] rounded transition-all font-mono text-sm border border-transparent hover:border-[#00ff41]/30"
            >
              <User className="w-4 h-4" />
              Profile Settings
            </button>

            <button
              onClick={() => {
                router.push("/app/settings/guide");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-[#00ff41]/10 hover:text-[#00ff41] rounded transition-all font-mono text-sm border border-transparent hover:border-[#00ff41]/30"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <div className="flex flex-col items-start min-w-0">
                <span>Peptide Guide</span>
                <span className="text-[10px] text-gray-500 font-mono">Learn peptide protocols, dosing, and safety</span>
              </div>
            </button>

            <button
              onClick={() => {
                // Future: payment settings page
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left text-gray-500 cursor-not-allowed rounded font-mono text-sm"
              disabled
            >
              <CreditCard className="w-4 h-4" />
              Payment (Coming Soon)
            </button>

            <div className="my-2 border-t border-gray-700" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 text-left text-[#ff0040] hover:bg-[#ff0040]/10 rounded transition-all font-mono text-sm border border-transparent hover:border-[#ff0040]/30"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Status LED */}
          <div className="p-3 border-t border-[#00ff41]/20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
            <span className="text-[#00ff41] text-[10px] font-mono tracking-wider">SYSTEM ONLINE</span>
          </div>

          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-scanlines rounded-lg"></div>
        </div>
      )}
    </div>
  );
}
