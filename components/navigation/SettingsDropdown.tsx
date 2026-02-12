"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";

export default function SettingsDropdown() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Settings Gear Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 border border-[#00ff41]/30 bg-[#1a1f2e] rounded hover:bg-[#00ff41]/10 hover:border-[#00ff41] transition-all"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-[#00ff41]" />
      </button>

      {/* Settings Modal */}
      <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
