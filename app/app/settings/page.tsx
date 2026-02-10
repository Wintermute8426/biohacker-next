"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Scale, Ruler, Activity, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    gender: "",
    weight_lbs: "",
    height_inches: "",
    body_fat_pct: "",
    units_preference: "imperial",
  });

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
      
      if (data) {
        setProfile({
          gender: data.gender || "",
          weight_lbs: data.weight_lbs?.toString() || "",
          height_inches: data.height_inches?.toString() || "",
          body_fat_pct: data.body_fat_pct?.toString() || "",
          units_preference: data.units_preference || "imperial",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        gender: profile.gender || null,
        weight_lbs: profile.weight_lbs ? parseFloat(profile.weight_lbs) : null,
        height_inches: profile.height_inches ? parseFloat(profile.height_inches) : null,
        body_fat_pct: profile.body_fat_pct ? parseFloat(profile.body_fat_pct) : null,
        units_preference: profile.units_preference,
      })
      .eq("id", user.id);

    if (!error) {
      // Mark profile_setup task complete
      const { data: profileData } = await supabase
        .from("profiles")
        .select("onboarding_progress")
        .eq("id", user.id)
        .single();

      const progress = profileData?.onboarding_progress || {};
      progress.profile_setup = true;

      await supabase
        .from("profiles")
        .update({ onboarding_progress: progress })
        .eq("id", user.id);

      setMessage("✓ PROFILE UPDATED");
    } else {
      setMessage(`ERROR: ${error.message}`);
    }
    setLoading(false);
  };

  const heightFeet = profile.height_inches ? Math.floor(parseFloat(profile.height_inches) / 12) : "";
  const heightInches = profile.height_inches ? Math.floor(parseFloat(profile.height_inches) % 12) : "";

  const handleHeightChange = (feet: string, inches: string) => {
    const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
    setProfile({ ...profile, height_inches: totalInches > 0 ? totalInches.toString() : "" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6 mb-6">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />
        
        <div className="absolute top-2 right-6 text-[#00ff41]/50 text-xs font-mono">
          [SET-0x01]
        </div>

        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-[#00ff41]" />
          <h1 className="text-2xl font-bold text-[#00ff41] font-mono">
            PROFILE SETTINGS
          </h1>
        </div>
        <p className="text-[#00d4ff] text-sm font-mono">
          {'>'} CONFIGURE BIOMETRIC DATA
        </p>
      </div>

      {/* Profile Form */}
      <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e] rounded-lg p-6">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ff41]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ff41]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ff41]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ff41]" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gender */}
          <div>
            <label className="flex items-center gap-2 text-[#00ff41] font-mono text-sm mb-2">
              <User className="w-4 h-4" />
              {'>'} GENDER
            </label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="flex items-center gap-2 text-[#00ff41] font-mono text-sm mb-2">
              <Scale className="w-4 h-4" />
              {'>'} WEIGHT (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.weight_lbs}
              onChange={(e) => setProfile({ ...profile, weight_lbs: e.target.value })}
              className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
              placeholder="185.0"
            />
          </div>

          {/* Height */}
          <div>
            <label className="flex items-center gap-2 text-[#00ff41] font-mono text-sm mb-2">
              <Ruler className="w-4 h-4" />
              {'>'} HEIGHT
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={heightFeet}
                  onChange={(e) => handleHeightChange(e.target.value, heightInches.toString())}
                  className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
                  placeholder="Feet"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={heightInches}
                  onChange={(e) => handleHeightChange(heightFeet.toString(), e.target.value)}
                  className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
                  placeholder="Inches"
                  min="0"
                  max="11"
                />
              </div>
            </div>
          </div>

          {/* Body Fat % */}
          <div>
            <label className="flex items-center gap-2 text-[#00ff41] font-mono text-sm mb-2">
              <Activity className="w-4 h-4" />
              {'>'} BODY FAT % (optional)
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.body_fat_pct}
              onChange={(e) => setProfile({ ...profile, body_fat_pct: e.target.value })}
              className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
              placeholder="15.0"
              min="0"
              max="50"
            />
          </div>

          {/* Units Preference */}
          <div>
            <label className="flex items-center gap-2 text-[#00ff41] font-mono text-sm mb-2">
              {'>'} UNITS PREFERENCE
            </label>
            <select
              value={profile.units_preference}
              onChange={(e) => setProfile({ ...profile, units_preference: e.target.value })}
              className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
            >
              <option value="imperial">Imperial (lbs, ft/in)</option>
              <option value="metric">Metric (kg, cm)</option>
            </select>
          </div>

          {message && (
            <div className={`font-mono text-sm ${
              message.includes("ERROR") ? "text-[#ff0040]" : "text-[#00ff41]"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00ff41]/20 hover:bg-[#00ff41]/30 border border-[#00ff41] text-[#00ff41] font-mono py-3 px-6 rounded transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]"
          >
            {loading ? "SAVING..." : "SAVE PROFILE ▶"}
          </button>
        </form>
      </div>
    </div>
  );
}
