"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { getAuthorReputation } from "@/modules/reputation/reputation.service";
import type { AuthorReputation } from "@/modules/reputation/reputation.types";

interface SparkBadgeProps {
  authorId: string;
  /** Show just the icon+tier, or include the spark number */
  showNumber?: boolean;
  /** Compact mode for inline use (idea cards) */
  compact?: boolean;
  className?: string;
}

/**
 * Displays an author's spark tier badge.
 * Unobtrusive — small text, muted colors.
 * Defers localStorage read to client via useEffect to avoid SSR hydration mismatch.
 */
export function SparkBadge({ authorId, showNumber = false, compact = true, className }: SparkBadgeProps) {
  const [rep, setRep] = useState<AuthorReputation | null>(null);

  useEffect(() => {
    setRep(getAuthorReputation(authorId));
  }, [authorId]);

  // Render nothing on server / first paint — avoids hydration mismatch
  if (!rep) return null;

  // Don't show badge for Explorer tier (default/new users) to reduce noise
  if (rep.tier.label === "Explorer" && !showNumber) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-stone-500",
        compact ? "text-[10px]" : "text-xs",
        className,
      )}
      title={`${rep.tier.icon} ${rep.tier.label} · ${rep.spark} spark`}
    >
      <span>{rep.tier.icon}</span>
      {showNumber && (
        <span className="tabular-nums">{rep.spark}</span>
      )}
    </span>
  );
}

interface SparkProgressProps {
  authorId: string;
  className?: string;
}

/**
 * Shows spark number, tier badge, and progress to next tier.
 * For use on the user's own profile page only.
 */
export function SparkProgress({ authorId, className }: SparkProgressProps) {
  const [rep, setRep] = useState<AuthorReputation | null>(null);

  useEffect(() => {
    setRep(getAuthorReputation(authorId));
  }, [authorId]);

  if (!rep) return null;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-base">{rep.tier.icon}</span>
        <span className="font-medium text-stone-300">{rep.tier.label}</span>
        <span className="text-stone-500">·</span>
        <span className="tabular-nums text-stone-400">{rep.spark} spark</span>
      </div>
      {rep.nextTier && (
        <div className="w-full max-w-[200px]">
          <div className="mb-0.5 flex justify-between text-[10px] text-stone-600">
            <span>{rep.tier.min}</span>
            <span>{rep.nextTier.min}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-stone-800">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-amber-500/60 to-orange-500/60 transition-all"
              style={{ width: `${Math.round(rep.progress * 100)}%` }}
            />
          </div>
          <p className="mt-0.5 text-center text-[10px] text-stone-600">
            {rep.nextTier.min - rep.spark} to {rep.nextTier.icon} {rep.nextTier.label}
          </p>
        </div>
      )}
    </div>
  );
}
