"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if onboarding already completed
    const { data: onboarding } = await supabase
      .from("user_onboarding")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (onboarding) {
      // Already completed, redirect to dashboard
      router.push("/app/dashboard");
    } else {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push("/app/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neon-green font-mono">Loading...</div>
      </div>
    );
  }

  return <OnboardingFlow onComplete={handleComplete} />;
}
