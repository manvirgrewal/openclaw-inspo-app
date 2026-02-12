"use client";

import Link from "next/link";
import { Bookmark, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Stack } from "@/modules/stacks/stacks.types";

interface StackCardProps {
  stack: Stack;
  className?: string;
}

export function StackCard({ stack, className }: StackCardProps) {
  const itemCount = stack.items?.length ?? 0;

  return (
    <Link
      href={`/stacks/${stack.slug}`}
      className={cn(
        "card-glow block w-full rounded-xl border border-amber-500/15 bg-stone-900/80 p-4 transition-all hover:border-amber-500/30 active:bg-stone-800/60",
        className,
      )}
    >
      {/* Stack label */}
      <div className="mb-2 flex items-center gap-1.5">
        <Layers size={12} className="text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Stack</span>
      </div>

      {/* Title */}
      <h3 className="mb-1 text-base font-semibold leading-snug text-stone-100 line-clamp-2 sm:text-lg">
        {stack.title}
      </h3>

      {/* Description */}
      <p className="mb-3 text-sm leading-relaxed text-stone-400 line-clamp-3">
        {stack.description}
      </p>

      {/* Meta */}
      <div className="mb-3 flex items-center gap-2 text-xs text-stone-500">
        <span>{itemCount} idea{itemCount !== 1 ? "s" : ""}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Bookmark size={12} />
          {stack.save_count}
        </span>
        {stack.author && (
          <>
            <span>·</span>
            <span
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/user/${stack.author!.username}`; }}
              className="cursor-pointer hover:text-stone-300 hover:underline"
            >
              by @{stack.author.username}
            </span>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10">
        View Stack <ArrowRight size={14} />
      </div>
    </Link>
  );
}
