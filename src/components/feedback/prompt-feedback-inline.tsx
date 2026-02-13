"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PromptFeedback } from "@/modules/reputation/reputation.types";

interface PromptFeedbackInlineProps {
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
 * Persistent inline feedback bar shown on the idea detail page
 * after the user copies a prompt. Stays until they respond or dismiss.
 */
export function PromptFeedbackInline({
  visible,
  onSubmit,
  onDismiss,
}: PromptFeedbackInlineProps) {
  const [showReasons, setShowReasons] = useState(false);
  const [submitted, setSubmitted] = useState<"positive" | "negative" | null>(null);

  if (!visible) return null;

  if (submitted) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-stone-800/50 bg-stone-800/30 px-3 py-2 animate-in fade-in duration-200">
        <span className="text-xs text-stone-500">
          {submitted === "positive" ? "Glad it worked! 🎉" : "Thanks for the feedback 🙏"}
        </span>
      </div>
    );
  }

  if (showReasons) {
    return (
      <div className="mt-3 rounded-lg border border-stone-800/50 bg-stone-800/30 px-3 py-3 animate-in fade-in duration-200">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">What went wrong?</span>
          <button
            onClick={() => { setShowReasons(false); onDismiss(); }}
            className="text-stone-600 hover:text-stone-400"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DIDNT_WORK_REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => {
                setSubmitted("negative");
                onSubmit("didnt_work", reason.id);
              }}
              className="rounded-md border border-stone-700 bg-stone-800 px-2.5 py-1 text-[11px] text-stone-400 transition-colors hover:border-stone-600 hover:bg-stone-700 active:bg-stone-600"
            >
              {reason.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-stone-800/50 bg-stone-800/30 px-3 py-2 animate-in fade-in duration-200">
      <span className="text-xs text-stone-500">Did the prompt work?</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setSubmitted("positive");
            onSubmit("worked");
          }}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
            "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400 active:bg-emerald-500/20",
          )}
        >
          <ThumbsUp size={12} /> Yes
        </button>
        <button
          onClick={() => setShowReasons(true)}
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
            "text-red-400/70 hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20",
          )}
        >
          <ThumbsDown size={12} /> No
        </button>
      </div>
      <button
        onClick={onDismiss}
        className="ml-auto text-stone-700 hover:text-stone-500"
      >
        <X size={13} />
      </button>
    </div>
  );
}
