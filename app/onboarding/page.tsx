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

    const { data: onboarding } = await supabase
      .from("user_onboarding")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (onboarding) {
      router.push("/app");
    } else {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push("/app");
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
