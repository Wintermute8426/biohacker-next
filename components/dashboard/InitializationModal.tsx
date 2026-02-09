"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Circle, Award } from "lucide-react";
import { useRouter } from "next/navigation";

interface OnboardingProgress {
  profile_setup?: boolean;
  first_weight_log?: boolean;
  explore_research?: boolean;
  review_protocol?: boolean;
  set_first_cycle?: boolean;
}

interface InitializationModalProps {
  onClose: () => void;
  onboardingProgress: OnboardingProgress;
  onboardingCompleted: boolean;
}

export default function InitializationModal({
  onClose,
  onboardingProgress,
  onboardingCompleted,
}: InitializationModalProps) {
  const [showReward, setShowReward] = useState(false);
  const router = useRouter();

  const tasks = [
    {
      key: "profile_setup",
      label: "Profile Setup",
      description: "Complete gender, weight, height, and body fat %",
      link: "/app/settings",
    },
    {
      key: "first_weight_log",
      label: "First Weight Log",
      description: "Record your baseline weight",
      link: "/app/weight-log",
    },
    {
      key: "explore_research",
      label: "Explore Research",
      description: "View at least one peptide in Research tab",
      link: "/app/research",
    },
    {
      key: "review_protocol",
      label: "Review Protocol",
      description: "Open one protocol template",
      link: "/app/protocols",
    },
    {
      key: "set_first_cycle",
      label: "Set First Cycle",
      description: "Create your first peptide cycle",
      link: "/app/cycles",
    },
  ];

  const completedTasks = tasks.filter(
    (task) => onboardingProgress[task.key as keyof OnboardingProgress]
  ).length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  useEffect(() => {
    if (onboardingCompleted && !showReward) {
      setShowReward(true);
      // Auto-dismiss reward after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [onboardingCompleted, showReward, onClose]);

  const handleTaskClick = (link: string) => {
    router.push(link);
    onClose(); // Close modal after navigation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Hardware panel frame */}
        <div className="relative border border-[#00ff41]/30 bg-[#1a1f2e]/98 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,65,0.3)] rounded-lg overflow-hidden">
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />

          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00ff41]" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00ff41]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#00ff41]" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#00ff41]" />

          {/* Hex ID */}
          <div className="absolute top-3 right-8 text-[#00ff41]/50 text-xs font-mono">
            [INIT-0x7F]
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-[#00ff41] transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="p-8 pt-12">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#00ff41] font-mono mb-2 flex items-center">
                <span className="inline-block w-3 h-5 bg-[#00ff41] mr-2 animate-pulse" />
                INITIALIZATION PROTOCOL
              </h2>
              <p className="text-[#00d4ff] text-sm font-mono">
                {'>'} COMPLETE ALL TASKS TO ACTIVATE SYSTEM
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#00ff41] font-mono text-sm">
                  PROGRESS: {completedTasks}/{totalTasks}
                </span>
                <span className="text-[#00d4ff] font-mono text-sm">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-black/50 border border-[#00ff41]/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00ff41] to-[#00d4ff] transition-all duration-500 shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {tasks.map((task, idx) => {
                const isComplete =
                  onboardingProgress[task.key as keyof OnboardingProgress];
                return (
                  <button
                    key={task.key}
                    onClick={() => handleTaskClick(task.link)}
                    className="block w-full group text-left"
                  >
                    <div
                      className={`relative border rounded-lg p-4 transition-all ${
                        isComplete
                          ? "border-[#00ff41]/50 bg-[#00ff41]/10"
                          : "border-gray-600/50 bg-[#1a1f2e]/50 hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/5 cursor-pointer"
                      }`}
                    >
                      {/* Status LED */}
                      <div className="absolute top-4 left-4">
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00ff41]" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      <div className="ml-8">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={`font-mono text-sm font-bold ${
                              isComplete ? "text-[#00ff41]" : "text-gray-300"
                            }`}
                          >
                            {idx + 1}. {task.label}
                          </h3>
                          {isComplete && (
                            <span className="text-[#00ff41] font-mono text-xs">
                              ✓ COMPLETE
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            isComplete ? "text-[#00ff41]/70" : "text-gray-400"
                          }`}
                        >
                          {task.description}
                        </p>
                      </div>

                      {/* Hover arrow */}
                      {!isComplete && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reward banner */}
            {showReward && onboardingCompleted && (
              <div className="mt-6 border border-[#00ff41] bg-[#00ff41]/20 rounded-lg p-6 text-center animate-pulse">
                <Award className="w-12 h-12 text-[#00ff41] mx-auto mb-3" />
                <h3 className="text-xl font-bold text-[#00ff41] font-mono mb-2">
                  PROTOCOL INITIALIZED
                </h3>
                <p className="text-[#00d4ff] font-mono text-sm">
                  🧊 ACHIEVEMENT UNLOCKED: SYSTEM ONLINE
                </p>
              </div>
            )}

            {/* Status footer */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  onboardingCompleted
                    ? "bg-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.8)]"
                    : "bg-yellow-500 shadow-[0_0_8px_rgba(255,170,0,0.8)]"
                } animate-pulse`}
              />
              <span
                className={`font-mono text-xs ${
                  onboardingCompleted
                    ? "text-[#00ff41]"
                    : "text-yellow-500"
                }`}
              >
                {onboardingCompleted
                  ? "SYSTEM ONLINE"
                  : "INITIALIZATION IN PROGRESS"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
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
