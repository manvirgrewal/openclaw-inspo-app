"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { getAuthorSpark } from "@/modules/reputation/reputation.service";

interface SparkBadgeProps {
  authorId: string;
  /** Show the spark number (default true) */
  showNumber?: boolean;
  /** Compact mode for inline use (idea cards) */
  compact?: boolean;
  className?: string;
}

/**
 * Displays an author's spark score.
 * Simple: ✦ + number. Like Reddit karma — no tiers, no explanation needed.
 * Defers localStorage read to client via useEffect to avoid SSR hydration mismatch.
 */
export function SparkBadge({ authorId, showNumber = true, compact = true, className }: SparkBadgeProps) {
  const [spark, setSpark] = useState<number | null>(null);

  useEffect(() => {
    setSpark(getAuthorSpark(authorId));
  }, [authorId]);

  // Render nothing on server / first paint — avoids hydration mismatch
  if (spark === null) return null;

  // Don't show badge if spark is 0
  if (spark === 0 && compact) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-stone-500",
        compact ? "text-[10px]" : "text-xs",
        className,
      )}
      title={`${spark} spark`}
    >
      <span className="text-gradient-spark">✦</span>
      {showNumber && (
        <span className="tabular-nums">{spark}</span>
      )}
    </span>
  );
}
