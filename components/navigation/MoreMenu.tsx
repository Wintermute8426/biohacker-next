"use client";

import Link from "next/link";
import { X } from "lucide-react";

export interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  currentPath: string;
}

export default function MoreMenu({
  isOpen,
  onClose,
  items,
  currentPath,
}: MoreMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        aria-hidden
      />

      {/* Menu Panel - slides up from bottom */}
      <div
        className="fixed bottom-20 left-0 right-0 z-50 mx-4 rounded-t-xl border-2 border-[#00ff41]/30 bg-[#0a0e1a] p-4 max-h-[70vh] overflow-y-auto"
        role="dialog"
        aria-label="More menu"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm font-bold text-[#00ff41]">MORE</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-[#00ff41] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded font-mono text-sm transition-all ${
                  isActive
                    ? "bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/40"
                    : "text-gray-300 hover:bg-[#00ff41]/5 hover:text-[#00ff41]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
