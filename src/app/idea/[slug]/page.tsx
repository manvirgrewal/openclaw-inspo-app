"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Bookmark,
  MessageSquare,
  Hammer,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CATEGORY_MAP } from "@/config/categories";
import { COMPLEXITY_OPTIONS } from "@/config/constants";
import { useAuth } from "@/lib/auth/auth-context";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { useToast } from "@/components/common/toast";
import { CommentsSection } from "@/components/social/comments-section";
import { BuiltThisSection } from "@/components/social/built-this-section";
import { ShareButton } from "@/components/share/share-button";
import { SEED_IDEAS } from "@/data/seed-ideas";
import type { Idea } from "@/modules/ideas/ideas.types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function IdeaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Check seed ideas first
  const seedIdea = SEED_IDEAS.find((i) => i.slug === slug);
  const [userIdea, setUserIdea] = useState<Idea | undefined>(undefined);
  useEffect(() => {
    if (seedIdea) return; // no need to check localStorage
    try {
      const stored: Idea[] = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setUserIdea(stored.find((i) => i.slug === slug));
    } catch {}
  }, [slug, seedIdea]);
  const idea = seedIdea ?? userIdea;

  const [copied, setCopied] = useState(false);
  const { isSaved, saveIdea, unsaveIdea } = useGuestSaves();
  const { toast } = useToast();
  const saved = idea ? isSaved(idea.id) : false;

  // Live counts — set by child sections once they load seed + user data
  const [liveCommentCount, setLiveCommentCount] = useState(0);
  const [liveBuiltCount, setLiveBuiltCount] = useState(0);

  // Live save count
  const liveSaveCount = idea ? idea.save_count + (saved ? 1 : 0) : 0;

  const handleCopy = useCallback(async () => {
    if (!idea) return;
    try {
      await navigator.clipboard.writeText(idea.prompt);
      if (navigator.vibrate) navigator.vibrate(50);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = idea.prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }, [idea, toast]);

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">Idea not found</h1>
        <p className="mb-6 text-sm text-zinc-500">
          This idea may have been removed or doesn&apos;t exist yet.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const category = CATEGORY_MAP[idea.category];
  const complexity = COMPLEXITY_OPTIONS.find((c) => c.id === idea.complexity);

  return (
    <div className="px-4 py-4">
      {/* Back nav */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      {/* Meta row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        {complexity && (
          <span className="text-zinc-400">
            {complexity.icon} {complexity.label}
          </span>
        )}
        {category && (
          <>
            <span className="text-zinc-600">·</span>
            <span className={cn("rounded-full border px-2 py-0.5", category.color)}>
              {category.label}
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-bold leading-tight text-zinc-100 sm:text-3xl">
        {idea.title}
      </h1>

      {/* Description */}
      <p className="mb-4 text-base leading-relaxed text-zinc-400">{idea.description}</p>

      {/* Author + date */}
      <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800">
          <User size={14} className="text-zinc-400" />
        </div>
        <div>
          {idea.author?.username ? (
            <Link href={`/user/${idea.author.username}`} className="font-medium text-zinc-300 hover:text-zinc-100 hover:underline">
              {idea.author.display_name ?? idea.author.username}
            </Link>
          ) : (
            <span className="font-medium text-zinc-300">Anonymous</span>
          )}
          {idea.published_at && (
            <>
              <span className="mx-1.5">·</span>
              <span>{formatDate(idea.published_at)}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 flex items-center gap-5 text-sm text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Bookmark size={14} /> {liveSaveCount} saves
        </span>
        <span className="flex items-center gap-1.5">
          <Hammer size={14} /> {liveBuiltCount} built
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare size={14} /> {liveCommentCount} comments
        </span>
      </div>

      {/* Prompt section */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Prompt
          </h2>
          <span className="flex items-center gap-1 text-xs text-zinc-600">
            <Clock size={12} /> Ready to paste
          </span>
        </div>
        <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {idea.prompt}
        </p>
        <button
          onClick={handleCopy}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors",
            copied
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300",
          )}
        >
          {copied ? (
            <>
              <Check size={18} /> Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy size={18} /> Copy Prompt
            </>
          )}
        </button>
      </div>

      {/* Skills */}
      {idea.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Skills & Tools
          </h2>
          <div className="flex flex-wrap gap-2">
            {idea.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Body (markdown rendered as plain text for now) */}
      {idea.body && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Details
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-zinc-400">
            {idea.body.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h3 key={i} className="mb-2 mt-4 text-base font-semibold text-zinc-200">
                    {line.replace("## ", "")}
                  </h3>
                );
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <p key={i} className="mb-1 pl-4 text-sm text-zinc-400">
                    • {line.replace(/^[-*] /, "")}
                  </p>
                );
              }
              if (line.match(/^\d+\. /)) {
                return (
                  <p key={i} className="mb-1 pl-4 text-sm text-zinc-400">
                    {line}
                  </p>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              return (
                <p key={i} className="mb-2 text-sm text-zinc-400">
                  {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
        <button
          onClick={() => {
            if (saved) {
              unsaveIdea(idea.id);
              toast("Idea unsaved");
            } else {
              saveIdea(idea.id);
              toast("Idea saved!");
            }
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            saved
              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
          )}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>

        <ShareButton
          title={idea.title}
          slug={idea.slug}
          description={idea.description}
        />
      </div>

      {/* Built This */}
      <BuiltThisSection ideaId={idea.id} onBuiltCountChange={setLiveBuiltCount} />

      {/* Comments */}
      <CommentsSection ideaId={idea.id} onCommentCountChange={setLiveCommentCount} />
    </div>
  );
}
