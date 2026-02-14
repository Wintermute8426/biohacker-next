"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center overflow-hidden">
        {/* Matrix rain background effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="matrix-rain" />
        </div>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />

        {/* Success panel */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e]/95 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,65,0.2)] rounded-lg overflow-hidden p-8">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />

            {/* Hex ID */}
            <div className="absolute top-2 right-6 text-[#00ff41]/50 text-xs font-mono">
              [CONFIRM-0x7F]
            </div>

            {/* Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00ff41]/20 border-2 border-[#00ff41] flex items-center justify-center">
                  <span className="text-3xl text-[#00ff41]">✓</span>
                </div>
                <h1 className="text-2xl font-bold text-[#00ff41] font-mono mb-2">
                  VERIFICATION SENT
                </h1>
                <p className="text-[#00d4ff] text-sm font-mono">
                  {'>'} Check your email: <span className="text-white">{email}</span>
                </p>
              </div>

              <div className="mb-6 p-4 bg-[#00ff41]/5 border border-[#00ff41]/20 rounded">
                <p className="text-sm text-gray-300 font-mono leading-relaxed">
                  Click the confirmation link in your email to activate your account.
                  Don't see it? Check your spam folder.
                </p>
              </div>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full py-3 px-4 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]"
              >
                {'>'} BACK TO LOGIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0a0e1a] flex items-center justify-center overflow-hidden">
      {/* Matrix rain background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-rain" />
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />

      {/* Main terminal panel */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00ff41] font-mono mb-2 animate-pulse">
            BIOHACKER
          </h1>
          <p className="text-[#00d4ff] font-mono text-sm">
            {'>'} PEPTIDE PROTOCOL TRACKER v1.0
          </p>
        </div>

        {/* Hardware panel frame */}
        <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e]/95 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,65,0.2)] rounded-lg overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />

          {/* Hex ID */}
          <div className="absolute top-2 right-6 text-[#00ff41]/50 text-xs font-mono">
            [SIGNUP-0xA3]
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#00ff41] font-mono mb-2 flex items-center">
                <span className="inline-block w-3 h-5 bg-[#00ff41] mr-2 animate-pulse" />
                CREATE NEW ACCOUNT
              </h2>
              <p className="text-[#00d4ff] text-sm font-mono">
                {'>'} Start tracking your peptide protocols
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-400 text-sm font-mono">
                  {'>'} ERROR: {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
                  {'>'} EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#00ff41]/30 rounded text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
                  {'>'} PASSWORD
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#00ff41]/30 rounded text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 font-mono">{'>'} Minimum 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-xs font-mono text-[#00d4ff] uppercase tracking-wider">
                  {'>'} CONFIRM PASSWORD
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#0a0e1a] border border-[#00ff41]/30 rounded text-white font-mono focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_12px_rgba(0,255,65,0.3)] transition-all disabled:opacity-50"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "{'>'} CREATING ACCOUNT..." : "{'>'} CREATE ACCOUNT"}
              </button>

              {/* Login Link */}
              <p className="text-sm text-center text-gray-400 font-mono">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#00d4ff] hover:text-[#00ff41] transition-colors">
                  Sign in
                </Link>
              </p>
            </form>

            {/* Terms */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-center text-xs text-gray-500 font-mono">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#00d4ff] hover:text-[#00ff41] transition-colors">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#00d4ff] hover:text-[#00ff41] transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
