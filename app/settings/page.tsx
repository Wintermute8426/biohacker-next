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
      setTimeout(() => setMessage(""), 3000);
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
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-full rounded-lg px-1 py-2">
      {/* Scanline effects */}
      <div className="scanline-layer-thin" aria-hidden="true"></div>
      <div className="scanline-layer-thick" aria-hidden="true"></div>

      {/* Main content */}
      <div className="relative z-10 space-y-6">
        {/* Header section with status light */}
        <div className="deck-section relative space-y-3 pt-4 pb-2">
          <div className="deck-bracket-bottom-left" aria-hidden="true"></div>
          <div className="deck-bracket-bottom-right" aria-hidden="true"></div>

          <div className="flex items-center gap-4">
            <h1 className="font-space-mono text-2xl font-bold tracking-wider text-[#f5f5f7] uppercase sm:text-3xl">
              PROFILE SETTINGS | CONFIG:
            </h1>
            {/* Large PC-style power LED */}
            <div className="relative flex items-center justify-center -translate-y-1 ml-2">
              <div className="absolute w-12 h-12 rounded-full bg-[#00ff41] opacity-30 blur-xl animate-pulse"></div>
              <div className="absolute w-9 h-9 rounded-full bg-[#00ff41] opacity-50 blur-md"></div>
              <div className="relative w-8 h-8 rounded-full bg-black border-[3px] border-gray-700 shadow-inner flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-[#00ff41] shadow-[0_0_16px_#00ff41,inset_0_1px_3px_rgba(255,255,255,0.3)] animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3e5]">
            <span>CONFIG.VER: 1.0</span>
            <span>●</span>
            <span>BIOMETRIC DATA CONFIGURATION</span>
          </div>
          <span className="hex-id absolute right-3 top-3 z-10" aria-hidden="true">
            0xCFG1
          </span>
        </div>

        {/* Profile Form Card */}
        <div className="group deck-card-bg deck-border-thick relative rounded-xl p-8 transition-all duration-300 animate-fade-in">
          <div className="led-card-top-right">
            <span className="led-dot led-green" aria-hidden="true"></span>
          </div>
          <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
            0xPRF1
          </span>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Gender */}
            <div>
              <label className="flex items-center gap-2 text-[#00ff41] font-mono text-xs uppercase tracking-wider mb-2">
                <User className="w-4 h-4" />
                {'>'} GENDER
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-black border border-[#00ff41]/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
              >
                <option value="" className="bg-black">Select...</option>
                <option value="male" className="bg-black">Male</option>
                <option value="female" className="bg-black">Female</option>
                <option value="other" className="bg-black">Other</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="flex items-center gap-2 text-[#00ff41] font-mono text-xs uppercase tracking-wider mb-2">
                <Scale className="w-4 h-4" />
                {'>'} WEIGHT (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.weight_lbs}
                onChange={(e) => setProfile({ ...profile, weight_lbs: e.target.value })}
                className="w-full bg-black border border-[#00ff41]/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
                placeholder="185.0"
              />
            </div>

            {/* Height */}
            <div>
              <label className="flex items-center gap-2 text-[#00ff41] font-mono text-xs uppercase tracking-wider mb-2">
                <Ruler className="w-4 h-4" />
                {'>'} HEIGHT
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => handleHeightChange(e.target.value, heightInches.toString())}
                    className="w-full bg-black border border-[#00ff41]/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
                    placeholder="Feet"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => handleHeightChange(heightFeet.toString(), e.target.value)}
                    className="w-full bg-black border border-[#00ff41]/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
                    placeholder="Inches"
                    min="0"
                    max="11"
                  />
                </div>
              </div>
            </div>

            {/* Body Fat % */}
            <div>
              <label className="flex items-center gap-2 text-[#00ff41] font-mono text-xs uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4" />
                {'>'} BODY FAT % (optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={profile.body_fat_pct}
                onChange={(e) => setProfile({ ...profile, body_fat_pct: e.target.value })}
                className="w-full bg-black border border-[#00ff41]/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
                placeholder="15.0"
                min="0"
                max="50"
              />
            </div>

            {/* Units Preference */}
            <div>
              <label className="flex items-center gap-2 text-[#00ff41] font-mono text-xs uppercase tracking-wider mb-2">
                {'>'} UNITS PREFERENCE
              </label>
              <select
                value={profile.units_preference}
                onChange={(e) => setProfile({ ...profile, units_preference: e.target.value })}
                className="w-full bg-black border border-[#00ff41]/30 rounded px-4 py-3 text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all"
              >
                <option value="imperial" className="bg-black">Imperial (lbs, ft/in)</option>
                <option value="metric" className="bg-black">Metric (kg, cm)</option>
              </select>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`p-3 rounded border font-mono text-sm ${
                message.includes("ERROR") 
                  ? "border-red-500/50 bg-red-500/10 text-red-400" 
                  : "border-[#00ff41]/50 bg-[#00ff41]/10 text-[#00ff41]"
              }`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ff41]/10 hover:bg-[#00ff41]/20 border border-[#00ff41] text-[#00ff41] font-mono py-3 px-6 rounded transition-all duration-300 disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]"
            >
              {loading ? "{'>'} SAVING..." : "{'>'} SAVE PROFILE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
