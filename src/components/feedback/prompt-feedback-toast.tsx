"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PromptFeedback } from "@/modules/reputation/reputation.types";

interface PromptFeedbackToastProps {
  visible: boolean;
  onSubmit: (feedback: PromptFeedback, reason?: string) => void;
  onDismiss: () => void;
}

const DIDNT_WORK_REASONS = [
  { id: "broken", label: "Broken / errors" },
  { id: "outdated", label: "Outdated" },
  { id: "misleading", label: "Misleading" },
  { id: "other", label: "Other" },
] as const;

/**
 * Floating toast that appears right after copying a prompt.
 * Shows "Copied! Did it work?" with inline thumbs.
 * Auto-fades after 5s unless interacted with.
 */
export function PromptFeedbackToast({
  visible,
  onSubmit,
  onDismiss,
}: PromptFeedbackToastProps) {
  const [showReasons, setShowReasons] = useState(false);
  const [submitted, setSubmitted] = useState<"positive" | "negative" | null>(null);
  const [interacted, setInteracted] = useState(false);

  if (!visible) return null;

  // Brief thank-you then dismiss
  if (submitted) {
    return (
      <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200 md:bottom-6">
        <div className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
          <span className="text-sm text-stone-300">
            {submitted === "positive" ? "Glad it worked! 🎉" : "Thanks for the feedback 🙏"}
          </span>
        </div>
      </div>
    );
  }

  // Reason picker
  if (showReasons) {
    return (
      <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200 md:bottom-6">
        <div className="rounded-xl border border-stone-800 bg-stone-900/95 p-4 shadow-2xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-200">What went wrong?</span>
            <button
              onClick={() => { setShowReasons(false); onDismiss(); }}
              className="text-stone-600 hover:text-stone-400"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIDNT_WORK_REASONS.map((reason) => (
              <button
                key={reason.id}
                onClick={() => {
                  setSubmitted("negative");
                  onSubmit("didnt_work", reason.id);
                  setTimeout(onDismiss, 1500);
                }}
                className="rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-stone-300 transition-colors hover:border-stone-600 hover:bg-stone-700 active:bg-stone-600"
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main toast: "Copied! Did it work?"
  return (
    <div
      className={cn(
        "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200 md:bottom-6",
        !interacted && "animate-fade-out-delayed",
      )}
      onPointerEnter={() => setInteracted(true)}
    >
      <div className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
        <span className="text-sm text-stone-300">✅ Copied!</span>
        <span className="text-xs text-stone-600">·</span>
        <span className="text-xs text-stone-500">Did it work?</span>

        <button
          onClick={() => {
            setInteracted(true);
            setSubmitted("positive");
            onSubmit("worked");
            setTimeout(onDismiss, 1500);
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-emerald-400/70 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 active:bg-emerald-500/20"
        >
          <ThumbsUp size={13} />
        </button>

        <button
          onClick={() => {
            setInteracted(true);
            setShowReasons(true);
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20"
        >
          <ThumbsDown size={13} />
        </button>

        <button
          onClick={onDismiss}
          className="ml-0.5 text-stone-700 hover:text-stone-500"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
