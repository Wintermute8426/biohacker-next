"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, User, CreditCard, LogOut, X, FileText } from "lucide-react";
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
      {/* Settings Gear Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-[#00ff41]/30 bg-[#1a1f2e] rounded hover:bg-[#00ff41]/10 hover:border-[#00ff41] transition-all"
      >
        <Settings className="w-5 h-5 text-[#00ff41]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-72 border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg shadow-[0_0_20px_rgba(0,255,65,0.2)] z-50">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff41]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff41]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff41]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff41]" />

          {/* Hex ID */}
          <div className="absolute top-1 right-4 text-[#00ff41]/50 text-[10px] font-mono">
            [SET-0x7F]
          </div>

          {/* Header */}
          <div className="p-4 border-b border-[#00ff41]/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#00ff41] font-mono text-sm font-bold">SETTINGS</h3>
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
              className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-[#00ff41]/10 hover:text-[#00ff41] rounded transition-all font-mono text-sm"
            >
              <User className="w-4 h-4" />
              Profile Settings
            </button>

            <button
              onClick={() => {
                router.push("/app/settings/reporting");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left text-gray-300 hover:bg-[#00ff41]/10 hover:text-[#00ff41] rounded transition-all font-mono text-sm"
            >
              <FileText className="w-4 h-4" />
              Cycle Reviews & Reporting
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
              className="w-full flex items-center gap-3 p-3 text-left text-[#ff0040] hover:bg-[#ff0040]/10 rounded transition-all font-mono text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Status LED */}
          <div className="p-3 border-t border-[#00ff41]/20 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_6px_rgba(0,255,65,0.8)]" />
            <span className="text-[#00ff41] text-[10px] font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      )}
    </div>
  );
}
