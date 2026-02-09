import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeckNav } from "@/components/deck-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-charcoal to-bg-black">
      {/* Sticky header – logo + user + sign out */}
      <header className="sticky top-0 z-50 border-b border-[#00ffaa]/20 bg-bg-charcoal/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/app" className="flex items-center">
            <span className="font-space-mono text-lg font-bold tracking-wide text-primary sm:text-xl">
              BIOHACKER
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[140px] truncate text-sm text-secondary sm:inline">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <Button
                variant="ghost"
                size="sm"
                type="submit"
                className="min-h-[40px] min-w-[40px] rounded-lg text-secondary hover:bg-white/10 hover:text-primary"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Hardware-style nav bar – terminal buttons below header */}
      <DeckNav />

      {/* Main content */}
      <main className="dashboard-grid relative mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
