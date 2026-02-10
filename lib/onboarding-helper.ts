import { createClient } from "@/lib/supabase/client";

export async function markTaskComplete(taskKey: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get current progress
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_progress")
    .eq("id", user.id)
    .single();

  const progress = profile?.onboarding_progress || {};
  progress[taskKey] = true;

  // Update progress
  await supabase
    .from("profiles")
    .update({ onboarding_progress: progress })
    .eq("id", user.id);

  // Check if all tasks complete
  const allComplete =
    progress.profile_setup &&
    progress.first_weight_log &&
    progress.explore_research &&
    progress.review_protocol &&
    progress.set_first_cycle;

  if (allComplete) {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
  }
}
