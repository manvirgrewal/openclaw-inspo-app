"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Copy, Bookmark, MessageSquare, MoreHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CATEGORY_MAP } from "@/config/categories";
import { COMPLEXITY_OPTIONS } from "@/config/constants";
import type { Idea } from "@/modules/ideas/ideas.types";

interface IdeaCardProps {
  idea: Idea;
  onSave?: (ideaId: string) => void;
  className?: string;
}

export function IdeaCard({ idea, onSave, className }: IdeaCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(idea.is_saved ?? false);

  const category = CATEGORY_MAP[idea.category];
  const complexity = COMPLEXITY_OPTIONS.find((c) => c.id === idea.complexity);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(idea.prompt);
        setCopied(true);
        // Haptic feedback on mobile
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = idea.prompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [idea.prompt],
  );

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSaved((prev) => !prev);
      onSave?.(idea.id);
    },
    [idea.id, onSave],
  );

  return (
    <Link
      href={`/idea/${idea.slug}`}
      className={cn(
        "block w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80 active:bg-zinc-800/60",
        className,
      )}
    >
      {/* Row 1: Complexity + Category */}
      <div className="mb-2 flex items-center gap-2 text-xs">
        {complexity && (
          <span className="text-zinc-400">
            {complexity.icon} {complexity.label}
          </span>
        )}
        {category && (
          <>
            <span className="text-zinc-600">·</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5",
                category.color,
              )}
            >
              {category.label}
            </span>
          </>
        )}
      </div>

      {/* Row 2: Title */}
      <h3 className="mb-1 text-base font-semibold leading-snug text-zinc-100 line-clamp-2 sm:text-lg">
        {idea.title}
      </h3>

      {/* Row 3: Description */}
      <p className="mb-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">
        {idea.description}
      </p>

      {/* Row 4: Skill chips */}
      {idea.skills.length > 0 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {idea.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
            >
              {skill}
            </span>
          ))}
          {idea.skills.length > 4 && (
            <span className="shrink-0 text-xs text-zinc-500">
              +{idea.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Row 5: Actions */}
      <div className="flex items-center gap-3">
        {/* Copy Prompt Button */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "bg-green-500/10 text-green-400"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600",
          )}
        >
          {copied ? (
            <>
              <Check size={14} /> Copied!
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1 text-xs transition-colors",
            saved
              ? "text-yellow-400"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          <span>{idea.save_count + (saved && !idea.is_saved ? 1 : 0)}</span>
        </button>

        {/* Comments */}
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <MessageSquare size={14} />
          <span>{idea.comment_count}</span>
        </span>

        {/* More menu */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="ml-auto text-zinc-600 hover:text-zinc-400"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </Link>
  );
}
