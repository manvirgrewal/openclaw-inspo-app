"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Layers,
  Bookmark,
  Hammer,
  MessageSquare,
  Star,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IdeaCard } from "@/components/cards/idea-card";
import { useAuth } from "@/lib/auth/auth-context";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { useToast } from "@/components/common/toast";
import { CommentsSection } from "@/components/social/comments-section";
import { BuiltThisSection } from "@/components/social/built-this-section";
import { ShareButton } from "@/components/share/share-button";
import { SEED_STACK_DETAILS } from "@/data/seed-stacks";

function useStackDetail(slug: string) {
  const [userStack, setUserStack] = useState<any>(null);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-stacks") || "[]");
      const found = stored.find((s: any) => s.slug === slug);
      if (found) setUserStack(found);
    } catch {}
  }, [slug]);

  const seedDetail = SEED_STACK_DETAILS[slug];
  if (seedDetail) return seedDetail;

  if (userStack) {
    return {
      stack: {
        ...userStack,
        items: (userStack._items || []).map((item: any) => ({
          idea: item.idea,
          context_note: item.context_note,
        })),
      },
    };
  }
  return null;
}

export default function StackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuth();
  const detail = useStackDetail(slug);
  const [copied, setCopied] = useState(false);
  const { isSaved, saveIdea, unsaveIdea } = useGuestSaves();
  const { toast } = useToast();

  // Live counts from child sections
  const [liveCommentCount, setLiveCommentCount] = useState(0);
  const [liveBuiltCount, setLiveBuiltCount] = useState(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  const stackId = detail ? (detail.stack.id ?? `stack-${slug}`) : "";
  const saved = stackId ? isSaved(stackId) : false;
  const liveSaveCount = detail ? (detail.stack.save_count || 0) + (saved ? 1 : 0) : 0;

  const copyAllPrompts = useCallback(async () => {
    if (!detail) return;
    const allPrompts = detail.stack.items
      .map(
        (item: any, i: number) =>
          `--- ${i + 1}. ${item.idea?.title ?? "Untitled"} ---\n${item.idea?.prompt ?? ""}`
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(allPrompts);
      if (navigator.vibrate) navigator.vibrate(50);
      setCopied(true);
      toast("All prompts copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [detail, toast]);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">
          Stack not found
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          This stack may have been removed or doesn&apos;t exist yet.
        </p>
        <Link
          href="/stacks"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
        >
          Browse Stacks
        </Link>
      </div>
    );
  }

  const { stack } = detail;

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <Link
        href="/stacks"
        className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Stacks</span>
      </Link>

      <div className="mb-2 flex items-center gap-1.5">
        <Layers size={14} className="text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Stack
        </span>
        {stack.is_featured && (
          <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            Featured
          </span>
        )}
      </div>

      <h1 className="mb-2 text-2xl font-bold">{stack.title}</h1>
      <p className="mb-2 text-sm text-zinc-400">{stack.description}</p>

      {/* Author + meta */}
      <div className="mb-4 flex items-center gap-3 text-xs text-zinc-500">
        {stack.author && (
          <Link
            href={`/user/${stack.author.username}`}
            className="hover:text-zinc-300 hover:underline"
          >
            by @{stack.author.username}
          </Link>
        )}
        <span>·</span>
        <span>{stack.items.length} prompts</span>
      </div>

      {/* Stats row */}
      <div className="mb-6 flex items-center gap-5 text-sm text-zinc-500">
        {avgRating !== null && (
          <span className="flex items-center gap-1 text-yellow-400">
            <Star size={14} fill="currentColor" /> {avgRating.toFixed(1)}
          </span>
        )}
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

      {/* Copy All Prompts */}
      <button
        onClick={copyAllPrompts}
        className={cn(
          "mb-6 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors",
          copied
            ? "border-green-500/20 bg-green-500/10 text-green-400"
            : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
        )}
      >
        {copied ? (
          <>
            <Check size={16} /> Copied All!
          </>
        ) : (
          <>
            <Copy size={16} /> Copy All Prompts
          </>
        )}
      </button>

      {/* Ideas in order */}
      <div className="space-y-3">
        {stack.items.map((item: any, i: number) => (
          <div key={item.idea?.id ?? i}>
            {item.context_note && (
              <div className="mb-2 ml-4 border-l-2 border-emerald-500/30 pl-3 text-sm text-zinc-500 italic">
                {item.context_note}
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="mt-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                {i + 1}
              </span>
              <div className="flex-1">
                {item.idea && <IdeaCard idea={item.idea} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="mt-6 flex items-center gap-3 border-t border-zinc-800 pt-4">
        {user && stack.author_id === user.id && (
          <button
            onClick={() => {/* TODO: edit stack */}}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            <Pencil size={16} /> Edit
          </button>
        )}

        <button
          onClick={() => {
            if (saved) {
              unsaveIdea(stackId);
              toast("Stack unsaved");
            } else {
              saveIdea(stackId);
              toast("Stack saved!");
            }
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            saved
              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          )}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>

        <ShareButton
          title={stack.title}
          slug={`stacks/${slug}`}
          description={stack.description}
        />
      </div>

      {/* Built This */}
      <BuiltThisSection
        ideaId={stackId}
        onBuiltCountChange={setLiveBuiltCount}
        onAvgRatingChange={setAvgRating}
      />

      {/* Comments */}
      <CommentsSection
        ideaId={stackId}
        onCommentCountChange={setLiveCommentCount}
      />
    </div>
  );
}
