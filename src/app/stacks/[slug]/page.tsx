"use client";

import { useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Layers, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IdeaCard } from "@/components/cards/idea-card";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { useToast } from "@/components/common/toast";
import { SEED_STACK_DETAILS } from "@/data/seed-stacks";

export default function StackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const detail = SEED_STACK_DETAILS[slug];
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyAllPrompts = useCallback(async () => {
    if (!detail) return;
    const allPrompts = detail.stack.items
      .map((item, i) => `--- ${i + 1}. ${item.idea?.title ?? "Untitled"} ---\n${item.idea?.prompt ?? ""}`)
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
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">Stack not found</h1>
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
      <Link href="/stacks" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
        <span className="text-sm">Stacks</span>
      </Link>

      <div className="mb-2 flex items-center gap-1.5">
        <Layers size={14} className="text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Stack</span>
        {stack.is_featured && (
          <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            Featured
          </span>
        )}
      </div>

      <h1 className="mb-2 text-2xl font-bold">{stack.title}</h1>
      <p className="mb-2 text-sm text-zinc-400">{stack.description}</p>

      {/* Meta */}
      <div className="mb-4 flex items-center gap-3 text-xs text-zinc-500">
        {stack.author && (
          <Link href={`/user/${stack.author.username}`} className="hover:text-zinc-300 hover:underline">
            by @{stack.author.username}
          </Link>
        )}
        <span>·</span>
        <span>{stack.items.length} ideas</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Bookmark size={12} /> {stack.save_count}
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
        {copied ? <><Check size={16} /> Copied All!</> : <><Copy size={16} /> Copy All Prompts</>}
      </button>

      {/* Ideas in order */}
      <div className="space-y-3">
        {stack.items.map((item, i) => (
          <div key={item.idea?.id ?? i}>
            {/* Context note */}
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
    </div>
  );
}
