"use client";

import { useState, useEffect } from "react";
import InitializationModal from "@/components/dashboard/InitializationModal";
import QuickWeightWidget from "@/components/dashboard/QuickWeightWidget";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [showInitModal, setShowInitModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(data);
      
      // Show modal if not completed
      if (data && !data.onboarding_completed) {
        setShowInitModal(true);
      }
    }
  };

  return (
    <div className="p-6">
      {/* Initialization Modal */}
      {showInitModal && profile && (
        <InitializationModal
          onClose={() => setShowInitModal(false)}
          onboardingProgress={profile.onboarding_progress || {}}
          onboardingCompleted={profile.onboarding_completed || false}
        />
      )}

      {/* Dashboard content */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#00ff41] font-mono mb-2">
          DASHBOARD
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Weight Widget */}
        <div className="lg:col-span-1">
          <QuickWeightWidget
            lastWeight={profile?.weight_lbs}
            lastDate={profile?.updated_at}
            unitsPreference={profile?.units_preference || "imperial"}
          />
        </div>

        {/* Other dashboard content can go here */}
      </div>

      {/* Button to re-open modal */}
      <button
        onClick={() => setShowInitModal(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-[#00ff41]/20 border border-[#00ff41] text-[#00ff41] font-mono text-sm rounded shadow-[0_0_15px_rgba(0,255,65,0.3)] hover:bg-[#00ff41]/30 transition-all"
      >
        INIT PROTOCOL
      </button>
    </div>
  );
}
