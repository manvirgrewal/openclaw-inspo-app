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
        "block w-full rounded-xl border border-emerald-500/20 bg-zinc-900 p-4 transition-colors hover:border-emerald-500/40 hover:bg-zinc-900/80 active:bg-zinc-800/60",
        className,
      )}
    >
      {/* Stack label */}
      <div className="mb-2 flex items-center gap-1.5">
        <Layers size={12} className="text-emerald-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Stack</span>
      </div>

      {/* Title */}
      <h3 className="mb-1 text-base font-semibold leading-snug text-zinc-100 line-clamp-2 sm:text-lg">
        {stack.title}
      </h3>

      {/* Description */}
      <p className="mb-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">
        {stack.description}
      </p>

      {/* Meta */}
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
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
              className="cursor-pointer hover:text-zinc-300 hover:underline"
            >
              by @{stack.author.username}
            </span>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10">
        View Stack <ArrowRight size={14} />
      </div>
    </Link>
  );
}
