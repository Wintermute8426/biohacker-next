"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CyberpunkLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

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
      // Redirect to enhanced signup page
      router.push(`/auth/signup?email=${encodeURIComponent(email)}`);
    }
  };

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
        {/* Hardware panel frame */}
        <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e]/95 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,65,0.2)] rounded-lg overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00ff41]" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00ff41]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00ff41]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00ff41]" />

          {/* Hex ID */}
          <div className="absolute top-2 right-6 text-[#00ff41]/50 text-xs font-mono">
            [AUTH-0x42]
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#00ff41] font-mono mb-2 flex items-center">
                <span className="inline-block w-3 h-5 bg-[#00ff41] mr-2 animate-pulse" />
                INITIALIZE BIOHACKER PROTOCOL
              </h1>
              <p className="text-[#00d4ff] text-sm font-mono">
                {'>'} AWAITING CREDENTIALS...
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 font-mono text-sm transition-all relative ${
                  mode === "login"
                    ? "bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]"
                    : "bg-[#1a1f2e] text-gray-400 border-gray-600"
                } border rounded hover:bg-[#00ff41]/10`}
              >
                {mode === "login" && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#00ff41]">
                    ▶
                  </span>
                )}
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 px-4 font-mono text-sm transition-all relative ${
                  mode === "signup"
                    ? "bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]"
                    : "bg-[#1a1f2e] text-gray-400 border-gray-600"
                } border rounded hover:bg-[#00ff41]/10`}
              >
                {mode === "signup" && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#00ff41]">
                    ▶
                  </span>
                )}
                SIGNUP
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-[#00ff41] font-mono text-sm mb-2">
                  {'>'} EMAIL_ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono placeholder-[#00ff41]/30 focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
                  placeholder="user@biohacker.sys"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[#00ff41] font-mono text-sm mb-2">
                  {'>'} PASSWORD_KEY
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-black/50 border border-[#00ff41]/30 rounded px-4 py-3 text-[#00ff41] font-mono placeholder-[#00ff41]/30 focus:outline-none focus:border-[#00ff41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-[#ff0040]/10 border border-[#ff0040]/50 rounded px-4 py-2">
                  <p className="text-[#ff0040] font-mono text-sm">
                    ERROR: {error}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff41]/20 hover:bg-[#00ff41]/30 border border-[#00ff41] text-[#00ff41] font-mono py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] relative overflow-hidden group"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="inline-block w-2 h-2 bg-[#00ff41] rounded-full mr-2 animate-pulse" />
                    PROCESSING...
                  </span>
                ) : (
                  <>
                    {mode === "login" ? "AUTHENTICATE" : "BEGIN INITIALIZATION"}
                    <span className="ml-2">▶</span>
                  </>
                )}
              </button>
            </form>

            {/* Status LED */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
              <span className="text-[#00ff41]/70 text-xs font-mono">
                SYSTEM READY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for matrix rain effect */}
      <style jsx>{`
        @keyframes rain {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        .matrix-rain {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .matrix-rain::before {
          content: "01001001 01001110 01001001 01010100";
          position: absolute;
          top: 0;
          left: 10%;
          color: #00ff41;
          font-family: monospace;
          font-size: 12px;
          animation: rain 10s linear infinite;
        }

        .bg-scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.1) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 3px
          );
        }
      `}</style>
    </div>
  );
}

