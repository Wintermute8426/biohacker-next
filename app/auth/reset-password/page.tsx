"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
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
              [RESET-0x9D]
            </div>

            {/* Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00ff41]/20 border-2 border-[#00ff41] flex items-center justify-center">
                  <span className="text-3xl text-[#00ff41]">✉</span>
                </div>
                <h1 className="text-2xl font-bold text-[#00ff41] font-mono mb-2">
                  RESET LINK SENT
                </h1>
                <p className="text-[#00d4ff] text-sm font-mono">
                  {'>'} Check your email: <span className="text-white">{email}</span>
                </p>
              </div>

              <div className="mb-6 p-4 bg-[#00ff41]/5 border border-[#00ff41]/20 rounded">
                <p className="text-sm text-gray-300 font-mono leading-relaxed">
                  We've sent you a password reset link. Please check your email and follow
                  the instructions to reset your password.
                </p>
              </div>

              <Link href="/auth/login" className="block">
                <button className="w-full py-3 px-4 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,255,65,0.3)]">
                  {'>'} BACK TO LOGIN
                </button>
              </Link>
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
            [RESET-0xB8]
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#00ff41] font-mono mb-2 flex items-center">
                <span className="inline-block w-3 h-5 bg-[#00ff41] mr-2 animate-pulse" />
                RESET PASSWORD
              </h2>
              <p className="text-[#00d4ff] text-sm font-mono">
                {'>'} Enter your email to receive a reset link
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleReset} className="space-y-5">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] rounded font-mono hover:bg-[#00ff41]/20 transition-all duration-300 hover:shadow-[0_0_12px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "{'>'} SENDING..." : "{'>'} SEND RESET LINK"}
              </button>

              {/* Back to Login Link */}
              <Link href="/auth/login" className="block">
                <button
                  type="button"
                  className="w-full py-3 px-4 border border-gray-600 bg-transparent text-gray-400 rounded font-mono hover:bg-gray-800/30 hover:border-gray-500 transition-all duration-300"
                >
                  {'>'} BACK TO LOGIN
                </button>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
