"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { recordEngagement, hasUserGivenFeedback } from "@/modules/reputation/reputation.service";
import type { PromptFeedback } from "@/modules/reputation/reputation.types";

interface PromptFeedbackState {
  /** Show the floating toast (auto-fades after 5s) */
  showToast: boolean;
  /** Show the persistent inline bar on the detail page */
  showInline: boolean;
  /** Trigger after a copy event */
  onCopy: (ideaId: string, authorId?: string) => void;
  /** Submit feedback (works from either surface) */
  submitFeedback: (feedback: PromptFeedback, reason?: string) => void;
  /** Dismiss the toast (inline stays) */
  dismissToast: () => void;
  /** Dismiss the inline bar */
  dismissInline: () => void;
}

/**
 * Manages prompt feedback across two surfaces:
 * 1. A floating toast shown immediately after copy (auto-fades ~5s)
 * 2. A persistent inline bar on the idea detail page (stays until dismissed)
 *
 * Feedback can be given from either surface — once given, both hide.
 */
export function usePromptFeedback(userId?: string): PromptFeedbackState {
  const [showToast, setShowToast] = useState(false);
  const [showInline, setShowInline] = useState(false);
  const [pendingIdeaId, setPendingIdeaId] = useState<string | null>(null);
  const [pendingAuthorId, setPendingAuthorId] = useState<string | undefined>();
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const givenRef = useRef<Set<string>>(new Set());

  // Cleanup
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const onCopy = useCallback(
    (ideaId: string, authorId?: string) => {
      // Don't show if already gave feedback this session
      if (givenRef.current.has(ideaId)) return;
      if (userId && hasUserGivenFeedback(ideaId, userId)) {
        givenRef.current.add(ideaId);
        return;
      }

      setPendingIdeaId(ideaId);
      setPendingAuthorId(authorId);

      // Show toast immediately
      setShowToast(true);
      // Show inline bar
      setShowInline(true);

      // Auto-hide toast after 5s (inline stays)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
      }, 5000);
    },
    [userId],
  );

  const submitFeedback = useCallback(
    (feedback: PromptFeedback, reason?: string) => {
      if (!pendingIdeaId) return;

      recordEngagement({
        type: "prompt_feedback",
        ideaId: pendingIdeaId,
        authorId: pendingAuthorId,
        actorId: userId || "anonymous",
        feedback,
        feedbackReason: reason,
      });

      givenRef.current.add(pendingIdeaId);

      // Keep surfaces visible briefly for the thank-you state,
      // then the components handle their own submitted state
    },
    [pendingIdeaId, pendingAuthorId, userId],
  );

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setShowToast(false);
  }, []);

  const dismissInline = useCallback(() => {
    setShowInline(false);
    if (pendingIdeaId) givenRef.current.add(pendingIdeaId);
  }, [pendingIdeaId]);

  return {
    showToast,
    showInline,
    onCopy,
    submitFeedback,
    dismissToast,
    dismissInline,
  };
}
