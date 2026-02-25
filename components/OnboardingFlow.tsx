"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Heart, 
  TrendingUp, 
  Zap, 
  Scale, 
  Brain, 
  Shield,
  Moon,
  Flame,
  Activity,
  Sparkles,
  Battery,
  Eye,
  ChevronRight,
  ChevronLeft,
  Check
} from "lucide-react";

type Goal = "recovery" | "longevity" | "performance" | "body-composition" | "cognitive" | "immune";
type Experience = "beginner" | "intermediate" | "advanced";
type Priority = "sleep" | "inflammation" | "injury" | "skin-hair" | "energy" | "focus";

interface OnboardingData {
  goals: Goal[];
  experience: Experience | null;
  priorities: Priority[];
}

interface ProtocolRecommendation {
  name: string;
  peptides: string[];
  purpose: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  matchScore: number;
}

const GOALS = [
  { id: "recovery" as Goal, label: "Recovery & Healing", icon: Heart, description: "Heal injuries, reduce inflammation" },
  { id: "longevity" as Goal, label: "Longevity & Anti-Aging", icon: TrendingUp, description: "Cellular health, telomeres" },
  { id: "performance" as Goal, label: "Athletic Performance", icon: Zap, description: "Strength, endurance, recovery" },
  { id: "body-composition" as Goal, label: "Body Composition", icon: Scale, description: "Fat loss, muscle gain" },
  { id: "cognitive" as Goal, label: "Cognitive Enhancement", icon: Brain, description: "Focus, memory, clarity" },
  { id: "immune" as Goal, label: "Immune Support", icon: Shield, description: "Immune function, resilience" }
];

const EXPERIENCE_LEVELS = [
  { id: "beginner" as Experience, label: "Never Used Peptides", description: "I'm new to peptides and want to start safely" },
  { id: "intermediate" as Experience, label: "Some Experience", description: "I've completed 1-3 cycles" },
  { id: "advanced" as Experience, label: "Advanced User", description: "I've completed 4+ cycles and know my way around" }
];

const PRIORITIES = [
  { id: "sleep" as Priority, label: "Sleep Quality", icon: Moon },
  { id: "inflammation" as Priority, label: "Inflammation Reduction", icon: Flame },
  { id: "injury" as Priority, label: "Injury Recovery", icon: Activity },
  { id: "skin-hair" as Priority, label: "Skin & Hair Health", icon: Sparkles },
  { id: "energy" as Priority, label: "Energy Levels", icon: Battery },
  { id: "focus" as Priority, label: "Focus & Clarity", icon: Eye }
];

// Protocol recommendations based on user input
const PROTOCOL_DATABASE: ProtocolRecommendation[] = [
  {
    name: "Healing Stack",
    peptides: ["BPC-157", "TB-500"],
    purpose: "Accelerate healing of injuries, reduce inflammation, improve flexibility",
    duration: "8 weeks",
    difficulty: "beginner",
    matchScore: 0
  },
  {
    name: "Longevity Protocol",
    peptides: ["Epitalon"],
    purpose: "Telomere health, circadian rhythm, cellular rejuvenation",
    duration: "10-20 days (intensive)",
    difficulty: "intermediate",
    matchScore: 0
  },
  {
    name: "GH Secretagogue Stack",
    peptides: ["Ipamorelin", "CJC-1295 (no DAC)"],
    purpose: "Natural growth hormone release, sleep, recovery, body composition",
    duration: "12 weeks",
    difficulty: "intermediate",
    matchScore: 0
  },
  {
    name: "Skin & Hair Rejuvenation",
    peptides: ["GHK-Cu"],
    purpose: "Collagen production, wound healing, anti-aging for skin and hair",
    duration: "8-12 weeks",
    difficulty: "beginner",
    matchScore: 0
  },
  {
    name: "Cognitive Enhancement",
    peptides: ["Selank", "Semax"],
    purpose: "Focus, anxiety reduction, memory, cognitive performance",
    duration: "4 weeks",
    difficulty: "intermediate",
    matchScore: 0
  },
  {
    name: "Immune Optimization",
    peptides: ["Thymosin Alpha-1"],
    purpose: "Immune function, chronic infections, autoimmune support",
    duration: "8 weeks",
    difficulty: "intermediate",
    matchScore: 0
  }
];

export default function OnboardingFlow({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    experience: null,
    priorities: []
  });
  const [recommendations, setRecommendations] = useState<ProtocolRecommendation[]>([]);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleGoal = (goal: Goal) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const setExperience = (experience: Experience) => {
    setData(prev => ({ ...prev, experience }));
  };

  const togglePriority = (priority: Priority) => {
    setData(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }));
  };

  const calculateRecommendations = () => {
    const scored = PROTOCOL_DATABASE.map(protocol => {
      let score = 0;

      // Match goals
      if (data.goals.includes("recovery") && protocol.name.includes("Healing")) score += 3;
      if (data.goals.includes("longevity") && protocol.name.includes("Longevity")) score += 3;
      if (data.goals.includes("performance") && protocol.name.includes("GH Secretagogue")) score += 3;
      if (data.goals.includes("body-composition") && protocol.name.includes("GH Secretagogue")) score += 2;
      if (data.goals.includes("cognitive") && protocol.name.includes("Cognitive")) score += 3;
      if (data.goals.includes("immune") && protocol.name.includes("Immune")) score += 3;

      // Match priorities
      if (data.priorities.includes("injury") && protocol.name.includes("Healing")) score += 2;
      if (data.priorities.includes("sleep") && protocol.name.includes("GH Secretagogue")) score += 2;
      if (data.priorities.includes("inflammation") && protocol.name.includes("Healing")) score += 2;
      if (data.priorities.includes("skin-hair") && protocol.name.includes("Skin")) score += 3;
      if (data.priorities.includes("focus") && protocol.name.includes("Cognitive")) score += 2;
      if (data.priorities.includes("energy") && protocol.name.includes("GH Secretagogue")) score += 1;

      // Filter by experience level
      if (data.experience === "beginner" && protocol.difficulty !== "beginner") score -= 1;
      if (data.experience === "advanced" && protocol.difficulty === "beginner") score += 1;

      return { ...protocol, matchScore: score };
    });

    // Sort by score and take top 3
    const top3 = scored
      .filter(p => p.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    setRecommendations(top3);
  };

  const handleNext = () => {
    if (step === 2) {
      // Calculate recommendations before showing them
      calculateRecommendations();
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Save onboarding data
      await supabase.from("user_onboarding").upsert({
        user_id: user.id,
        goals: data.goals,
        experience_level: data.experience,
        priorities: data.priorities,
        completed_at: new Date().toISOString()
      });

      // Call onComplete callback or redirect
      if (onComplete) {
        onComplete();
      } else {
        router.push("/app/dashboard");
      }
    } catch (error) {
      console.error("Onboarding save error:", error);
      alert("Failed to save onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return data.goals.length > 0;
    if (step === 1) return data.experience !== null;
    if (step === 2) return data.priorities.length > 0;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-space-mono text-2xl font-bold text-[#f5f5f7] mb-2">
                What are your primary goals?
              </h2>
              <p className="font-mono text-sm text-[#9a9aa3]">
                Select all that apply. We'll use this to recommend protocols.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map(goal => {
                const Icon = goal.icon;
                const isSelected = data.goals.includes(goal.id);

                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-[#00ffaa] bg-[#00ffaa]/10 shadow-[0_0_12px_rgba(0,255,170,0.2)]"
                        : "border-[#00ffaa]/20 bg-black/30 hover:border-[#00ffaa]/40"
                    }`}
                  >
                    <Icon className={`h-6 w-6 shrink-0 ${isSelected ? "text-[#00ffaa]" : "text-[#9a9aa3]"}`} />
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-semibold text-[#f5f5f7] mb-1">
                        {goal.label}
                      </h3>
                      <p className="font-mono text-xs text-[#9a9aa3]">
                        {goal.description}
                      </p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-[#00ffaa]" />}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-space-mono text-2xl font-bold text-[#f5f5f7] mb-2">
                What's your experience level?
              </h2>
              <p className="font-mono text-sm text-[#9a9aa3]">
                This helps us recommend appropriate protocols for your comfort level.
              </p>
            </div>

            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map(level => {
                const isSelected = data.experience === level.id;

                return (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? "border-[#00ffaa] bg-[#00ffaa]/10 shadow-[0_0_12px_rgba(0,255,170,0.2)]"
                        : "border-[#00ffaa]/20 bg-black/30 hover:border-[#00ffaa]/40"
                    }`}
                  >
                    <div>
                      <h3 className="font-mono text-sm font-semibold text-[#f5f5f7] mb-1">
                        {level.label}
                      </h3>
                      <p className="font-mono text-xs text-[#9a9aa3]">
                        {level.description}
                      </p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-[#00ffaa]" />}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-space-mono text-2xl font-bold text-[#f5f5f7] mb-2">
                What are your health priorities?
              </h2>
              <p className="font-mono text-sm text-[#9a9aa3]">
                Select all areas you'd like to improve.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {PRIORITIES.map(priority => {
                const Icon = priority.icon;
                const isSelected = data.priorities.includes(priority.id);

                return (
                  <button
                    key={priority.id}
                    onClick={() => togglePriority(priority.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-[#00ffaa] bg-[#00ffaa]/10 shadow-[0_0_12px_rgba(0,255,170,0.2)]"
                        : "border-[#00ffaa]/20 bg-black/30 hover:border-[#00ffaa]/40"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? "text-[#00ffaa]" : "text-[#9a9aa3]"}`} />
                    <span className="font-mono text-xs text-center text-[#f5f5f7]">
                      {priority.label}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-[#00ffaa]" />}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-space-mono text-2xl font-bold text-[#f5f5f7] mb-2">
                Recommended Protocols
              </h2>
              <p className="font-mono text-sm text-[#9a9aa3]">
                Based on your goals and experience, here are our top recommendations:
              </p>
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-xl border border-[#00ffaa]/30 bg-[#00ffaa]/5 p-6 text-center">
                <p className="font-mono text-sm text-[#e0e0e5]">
                  No specific recommendations match your selections. Check out our Protocols library for all options!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((protocol, index) => (
                  <div
                    key={index}
                    className="rounded-xl border-2 border-[#00ffaa]/30 bg-[#00ffaa]/5 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-mono text-lg font-bold text-[#00ffaa] mb-1">
                          {protocol.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {protocol.peptides.map((peptide, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-[#00ffaa]/20 border border-[#00ffaa]/40 font-mono text-xs text-[#00ffaa]"
                            >
                              {peptide}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-[#22d3ee]/20 border border-[#22d3ee]/40 font-mono text-xs text-[#22d3ee] capitalize">
                        {protocol.difficulty}
                      </span>
                    </div>

                    <p className="font-mono text-xs text-[#e0e0e5] mb-2">
                      {protocol.purpose}
                    </p>

                    <p className="font-mono text-[10px] text-[#9a9aa3]">
                      <span className="font-semibold">Duration:</span> {protocol.duration}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded border border-[#22d3ee]/40 bg-[#22d3ee]/5 p-4">
              <p className="font-mono text-xs text-[#22d3ee]">
                <span className="font-semibold">NEXT STEPS:</span> Explore these protocols in the Protocols page, or start creating your first cycle!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-hardware group deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-[#00ffaa]">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="font-mono text-xs text-[#9a9aa3]">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-black/50 border border-[#00ffaa]/20 overflow-hidden">
            <div
              className="h-full bg-[#00ffaa] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="deck-panel deck-card-bg deck-border-thick rounded-xl border-[#00ffaa]/30 p-6 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-lg border-2 border-[#00ffaa]/20 bg-black/30 px-4 py-2 font-mono text-sm text-[#9a9aa3] hover:border-[#00ffaa]/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-lg border-2 border-[#00ffaa] bg-[#00ffaa]/10 px-6 py-2 font-mono text-sm font-semibold text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(0,255,170,0.3)]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border-2 border-[#00ffaa] bg-[#00ffaa]/10 px-6 py-2 font-mono text-sm font-semibold text-[#00ffaa] hover:bg-[#00ffaa]/20 disabled:opacity-50 shadow-[0_0_12px_rgba(0,255,170,0.3)]"
            >
              {loading ? "Saving..." : "Complete Setup"}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Skip Option */}
        {step < totalSteps - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="font-mono text-xs text-[#9a9aa3] hover:text-[#00ffaa] transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
