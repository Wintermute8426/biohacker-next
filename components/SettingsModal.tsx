"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { 
  User, Scale, Ruler, Activity, Mail, Calendar,
  CreditCard, MessageSquare, Send, History,
  CheckCircle, Clock, Syringe, X, LogOut
} from "lucide-react";
import { markTaskComplete } from "@/lib/onboarding-helper";
import { useRouter } from "next/navigation";

interface Profile {
  gender: string;
  weight_lbs: string;
  height_inches: string;
  body_fat_pct: string;
  units_preference: string;
}

interface CycleHistory {
  id: string;
  peptide_name: string;
  frequency: string;
  start_date: string;
  end_date: string;
  total_doses: number;
  logged_doses: number;
}

interface FeatureRequest {
  request_type: string;
  title: string;
  description: string;
  priority: string;
}

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile>({
    gender: "",
    weight_lbs: "",
    height_inches: "",
    body_fat_pct: "",
    units_preference: "imperial",
  });
  const [cycleHistory, setCycleHistory] = useState<CycleHistory[]>([]);
  const [featureRequest, setFeatureRequest] = useState<FeatureRequest>({
    request_type: "feature",
    title: "",
    description: "",
    priority: "normal",
  });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      loadCycleHistory();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUserEmail(user.email || "");
      setUserId(user.id);
      
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

  const loadCycleHistory = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cycles } = await supabase
      .from("cycles")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });

    if (cycles) {
      const history: CycleHistory[] = [];
      
      for (const cycle of cycles) {
        const { data: doses } = await supabase
          .from("doses")
          .select("*")
          .eq("cycle_id", cycle.id);
        
        const totalDoses = doses?.length || 0;
        const loggedDoses = doses?.filter(d => d.logged).length || 0;

        history.push({
          id: cycle.id,
          peptide_name: cycle.peptide_name,
          frequency: cycle.frequency,
          start_date: cycle.start_date,
          end_date: cycle.end_date,
          total_doses: totalDoses,
          logged_doses: loggedDoses,
        });
      }
      
      setCycleHistory(history);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileLoading(true);
    setProfileMessage("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      markTaskComplete("profile_setup");
      setProfileMessage("✓ PROFILE UPDATED");
    } else {
      setProfileMessage(`ERROR: ${error.message}`);
    }
    setProfileLoading(false);
  };

  const handleFeatureRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRequestLoading(true);
    setRequestMessage("");

    if (!featureRequest.title.trim() || !featureRequest.description.trim()) {
      setRequestMessage("ERROR: Title and description required");
      setRequestLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("feature_requests").insert({
      user_id: user.id,
      user_email: user.email,
      request_type: featureRequest.request_type,
      title: featureRequest.title.trim(),
      description: featureRequest.description.trim(),
      priority: featureRequest.priority,
      status: "pending",
    });

    if (!error) {
      setRequestMessage("✓ REQUEST SUBMITTED");
      setFeatureRequest({
        request_type: "feature",
        title: "",
        description: "",
        priority: "normal",
      });
    } else {
      setRequestMessage(`ERROR: ${error.message}`);
    }
    setRequestLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/auth/login");
  };

  const heightFeet = profile.height_inches ? Math.floor(parseFloat(profile.height_inches) / 12) : "";
  const heightInches = profile.height_inches ? Math.floor(parseFloat(profile.height_inches) % 12) : "";

  const handleHeightChange = (feet: string, inches: string) => {
    const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
    setProfile({ ...profile, height_inches: totalInches > 0 ? totalInches.toString() : "" });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl my-8 dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 rounded-lg px-1 py-2 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scanline-layer-thin" aria-hidden />
        <div className="scanline-layer-thick" aria-hidden />

        <div className="relative z-10 space-y-6">
          {/* Header with Close Button */}
          <div className="deck-section relative space-y-3 pt-4 pb-2">
            <div className="deck-bracket-bottom-left" aria-hidden />
            <div className="deck-bracket-bottom-right" aria-hidden />

            <div className="flex items-center justify-between">
              <h1 className="font-space-mono text-xl sm:text-2xl font-bold tracking-wider text-[#f5f5f7] uppercase">
                SETTINGS | ACCOUNT
              </h1>
              <button
                onClick={onClose}
                className="p-2 text-[#9a9aa3] hover:text-[#f5f5f7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="sys-info flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[#22d3ee]">
              <span>USER: {userEmail}</span>
            </div>

            <span className="hex-id absolute right-12 top-3 z-10" aria-hidden>0xSET01</span>
          </div>

          {/* Account Details */}
          <div className="deck-panel deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6">
            <div className="led-card-top-right">
              <span className="led-dot led-green" aria-hidden />
            </div>
            <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xACC</span>

            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-[#00ffaa] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Account Details
              </h2>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-mono">
                <Mail className="w-4 h-4 text-[#00ffaa]/80" />
                <span className="text-[#9a9aa3]">Email:</span>
                <span className="text-[#e0e0e5] truncate">{userEmail}</span>
              </div>
              <div className="flex items-start gap-2 text-sm font-mono">
                <Calendar className="w-4 h-4 text-[#00ffaa]/80 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[#9a9aa3]">User ID:</span>
                  <span className="text-[#e0e0e5] text-xs block break-all">{userId}</span>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="mt-4 w-full flex items-center justify-center gap-2 border border-red-500/40 bg-red-500/10 text-red-400 font-mono py-2.5 px-4 rounded-lg transition-all hover:bg-red-500/20 hover:border-red-500/60 text-sm"
            >
              <LogOut className="w-4 h-4" />
              SIGN OUT
            </button>
          </div>

          {/* Profile Settings */}
          <div className="deck-panel deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6">
            <div className="led-card-top-right">
              <span className="led-dot led-green" aria-hidden />
            </div>
            <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xPROF</span>

            <div className="flex items-center gap-2 mt-2">
              <Activity className="h-4 w-4 text-[#00ffaa] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Profile Settings
              </h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                    Height (feet)
                  </label>
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => handleHeightChange(e.target.value, heightInches.toString())}
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                    placeholder="Feet"
                  />
                </div>

                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => handleHeightChange(heightFeet.toString(), e.target.value)}
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                    placeholder="Inches"
                    min="0"
                    max="11"
                  />
                </div>

                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                    Units
                  </label>
                  <select
                    value={profile.units_preference}
                    onChange={(e) => setProfile({ ...profile, units_preference: e.target.value })}
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                  >
                    <option value="imperial">Imperial</option>
                    <option value="metric">Metric</option>
                  </select>
                </div>
              </div>

              {profileMessage && (
                <div className={`text-sm font-mono ${
                  profileMessage.includes("ERROR") ? "text-red-400" : "text-[#00ffaa]"
                }`}>
                  {profileMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-[#00ffaa]/20 hover:bg-[#00ffaa]/30 border border-[#00ffaa] text-[#00ffaa] font-mono py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 text-sm"
              >
                {profileLoading ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </form>
          </div>

          {/* Cycle History */}
          <div className="deck-panel deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6">
            <div className="led-card-top-right">
              <span className="led-dot led-green" aria-hidden />
            </div>
            <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xHIST</span>

            <div className="flex items-center gap-2 mt-2">
              <History className="h-4 w-4 text-[#00ffaa] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Complete History
              </h2>
            </div>

            <p className="mt-2 text-xs font-mono text-[#9a9aa3]">
              All cycles and peptides you've tracked
            </p>

            {cycleHistory.length === 0 ? (
              <div className="mt-4 text-center py-8 text-[#9a9aa3] font-mono text-sm">
                No cycles tracked yet. Start a cycle to see your history here.
              </div>
            ) : (
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {cycleHistory.map((cycle) => {
                  const adherence = cycle.total_doses > 0 
                    ? Math.round((cycle.logged_doses / cycle.total_doses) * 100)
                    : 0;
                  const isCompleted = new Date(cycle.end_date) < new Date();

                  return (
                    <div
                      key={cycle.id}
                      className="border border-[#00ffaa]/20 bg-black/30 rounded-lg p-4 hover:border-[#00ffaa]/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Syringe className="w-4 h-4 text-[#00ffaa]" />
                            <h3 className="font-mono font-bold text-[#f5f5f7]">
                              {cycle.peptide_name}
                            </h3>
                          </div>
                          <div className="text-xs font-mono text-[#9a9aa3] space-y-1">
                            <div>Frequency: {cycle.frequency}</div>
                            <div className="truncate">
                              {new Date(cycle.start_date).toLocaleDateString()} → {new Date(cycle.end_date).toLocaleDateString()}
                            </div>
                            <div>
                              Doses: {cycle.logged_doses} / {cycle.total_doses} logged ({adherence}%)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono">
                          {isCompleted ? (
                            <span className="flex items-center gap-1 text-[#00ffaa]">
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Clock className="w-4 h-4" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="deck-panel deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6">
            <div className="led-card-top-right">
              <span className="led-dot led-green" aria-hidden />
            </div>
            <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xPAY</span>

            <div className="flex items-center gap-2 mt-2">
              <CreditCard className="h-4 w-4 text-[#00ffaa] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Billing & Subscription
              </h2>
            </div>

            <div className="mt-4 p-4 bg-black/30 border border-[#00ffaa]/20 rounded-lg">
              <p className="text-sm font-mono text-[#9a9aa3]">
                Subscription management will be available after app store launch.
              </p>
              <p className="mt-2 text-xs font-mono text-[#00ffaa]/60">
                Currently in beta - free access for all users
              </p>
            </div>
          </div>

          {/* Feature Request */}
          <div className="deck-panel deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6">
            <div className="led-card-top-right">
              <span className="led-dot led-green" aria-hidden />
            </div>
            <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xFEAT</span>

            <div className="flex items-center gap-2 mt-2">
              <MessageSquare className="h-4 w-4 text-[#00ffaa] shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
                Request a Feature
              </h2>
            </div>

            <p className="mt-2 text-xs font-mono text-[#9a9aa3]">
              Help us improve the app with your feedback
            </p>

            <form onSubmit={handleFeatureRequestSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                    Request Type *
                  </label>
                  <select
                    value={featureRequest.request_type}
                    onChange={(e) => setFeatureRequest({ ...featureRequest, request_type: e.target.value })}
                    required
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                  >
                    <option value="bug">🐛 Bug Report</option>
                    <option value="feature">✨ Feature Request</option>
                    <option value="improvement">🔧 Improvement</option>
                    <option value="other">💬 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    value={featureRequest.priority}
                    onChange={(e) => setFeatureRequest({ ...featureRequest, priority: e.target.value })}
                    className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  value={featureRequest.title}
                  onChange={(e) => setFeatureRequest({ ...featureRequest, title: e.target.value })}
                  required
                  maxLength={200}
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa]"
                  placeholder="Brief summary of your request"
                />
              </div>

              <div>
                <label className="block text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                  Description *
                </label>
                <textarea
                  value={featureRequest.description}
                  onChange={(e) => setFeatureRequest({ ...featureRequest, description: e.target.value })}
                  required
                  rows={4}
                  maxLength={2000}
                  className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-2 text-[#f5f5f7] font-mono text-sm focus:outline-none focus:border-[#00ffaa] resize-none"
                  placeholder="Detailed description of the feature, bug, or improvement you're suggesting..."
                />
                <div className="mt-1 text-right text-xs font-mono text-[#9a9aa3]">
                  {featureRequest.description.length} / 2000
                </div>
              </div>

              {requestMessage && (
                <div className={`text-sm font-mono ${
                  requestMessage.includes("ERROR") ? "text-red-400" : "text-[#00ffaa]"
                }`}>
                  {requestMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full bg-[#00ffaa]/20 hover:bg-[#00ffaa]/30 border border-[#00ffaa] text-[#00ffaa] font-mono py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {requestLoading ? (
                  "SUBMITTING..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    SUBMIT REQUEST
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
