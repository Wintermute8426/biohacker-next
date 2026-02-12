"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

export default function CyberpunkLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();
  const supabase = createClient();

  // Listen for auth state changes (crucial for OAuth)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          router.push("/app");
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/app");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/app");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dashboard-hardware deck-grid deck-noise deck-circuits deck-vignette deck-bezel matrix-bg relative z-10 flex items-center justify-center p-4">
      <div className="scanline-layer-thin" aria-hidden />
      <div className="scanline-layer-thick" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <div className="deck-panel deck-card-bg deck-border-thick relative rounded-xl p-8 pt-10">
          <div className="led-card-top-right">
            <span className="led-dot led-green" aria-hidden />
          </div>
          <span className="hex-id absolute left-6 top-3 z-10" aria-hidden>0xAUTH</span>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#f5f5f7] font-space-mono mb-2 uppercase">
              BIOHACKER
            </h1>
            <p className="text-[#00ffaa] text-sm font-mono">
              {mode === "login" ? "{'>'} AUTHENTICATE" : "{'>'} INITIALIZE PROTOCOL"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2.5 px-4 font-mono text-xs uppercase tracking-wider transition-all rounded-lg border-2 ${
                mode === "login"
                  ? "border-[#00ffaa] bg-[#00ffaa]/30 text-[#00ffaa] shadow-[0_0_10px_rgba(0,255,170,0.3)]"
                  : "border-[#00ffaa]/25 bg-black/40 text-[#e0e0e5] hover:border-[#00ffaa]/50 hover:bg-[#00ffaa]/10"
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex-1 py-2.5 px-4 font-mono text-xs uppercase tracking-wider transition-all rounded-lg border-2 ${
                mode === "signup"
                  ? "border-[#00ffaa] bg-[#00ffaa]/30 text-[#00ffaa] shadow-[0_0_10px_rgba(0,255,170,0.3)]"
                  : "border-[#00ffaa]/25 bg-black/40 text-[#e0e0e5] hover:border-[#00ffaa]/50 hover:bg-[#00ffaa]/10"
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Sign Up
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mb-6 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-sans">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#00ffaa]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0a] px-2 text-[#9a9aa3] font-mono">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[#9a9aa3] font-mono text-xs mb-2 uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-black/50 border border-[#00ffaa]/30 rounded-lg px-4 py-3 text-[#f5f5f7] font-mono focus:outline-none focus:border-[#00ffaa] focus:shadow-[0_0_10px_rgba(0,255,170,0.3)] transition-all"
                placeholder="••••••••"
              />
              {mode === "signup" && (
                <p className="mt-1 text-xs font-mono text-[#9a9aa3]">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {error && (
              <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-3">
                <p className="text-red-400 font-mono text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00ffaa]/20 hover:bg-[#00ffaa]/30 border border-[#00ffaa] text-[#00ffaa] font-mono py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,255,170,0.2)] hover:shadow-[0_0_15px_rgba(0,255,170,0.4)] text-sm font-semibold uppercase tracking-wider"
            >
              {loading ? (
                "PROCESSING..."
              ) : mode === "login" ? (
                "AUTHENTICATE ▶"
              ) : (
                "CREATE ACCOUNT ▶"
              )}
            </button>
          </form>

          {/* Footer Status */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ffaa] animate-pulse shadow-[0_0_6px_rgba(0,255,170,0.8)]" />
            <span className="text-[#00ffaa]/70 text-xs font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
