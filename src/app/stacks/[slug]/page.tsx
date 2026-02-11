"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Layers } from "lucide-react";
import { IdeaCard } from "@/components/cards/idea-card";
import type { Idea } from "@/modules/ideas/ideas.types";

// Seed data for development
const SEED_IDEAS: Idea[] = [
  {
    id: "si1", author_id: null, slug: "weather-briefing",
    title: "Weather Briefing", description: "Get a concise weather summary for your location every morning.",
    body: null, prompt: "Check the weather for my location and give me a 3-line summary including temperature, conditions, and whether I need an umbrella.",
    category: "productivity", complexity: "quick", skills: ["weather"], tags: [],
    status: "published", save_count: 45, comment_count: 3, built_count: 12, view_count: 200,
    remix_of: null, created_at: "2026-02-01T08:00:00Z", updated_at: "2026-02-01T08:00:00Z", published_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "si2", author_id: null, slug: "calendar-digest",
    title: "Calendar Digest", description: "Summarize your day's calendar events with travel time estimates.",
    body: null, prompt: "Read my calendar for today. List each event with time, title, and if there's travel needed, estimate how long to get there. Flag any conflicts.",
    category: "productivity", complexity: "quick", skills: ["calendar"], tags: [],
    status: "published", save_count: 62, comment_count: 5, built_count: 18, view_count: 310,
    remix_of: null, created_at: "2026-02-01T08:00:00Z", updated_at: "2026-02-01T08:00:00Z", published_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "si3", author_id: null, slug: "email-triage",
    title: "Email Triage", description: "Scan your inbox, categorize by urgency, draft quick replies.",
    body: null, prompt: "Scan my last 20 unread emails. Categorize each as: urgent, needs reply, FYI, or spam. For urgent ones, draft a short reply. Summarize everything in a table.",
    category: "productivity", complexity: "moderate", skills: ["email", "gmail"], tags: [],
    status: "published", save_count: 88, comment_count: 7, built_count: 25, view_count: 450,
    remix_of: null, created_at: "2026-02-01T08:00:00Z", updated_at: "2026-02-01T08:00:00Z", published_at: "2026-02-01T08:00:00Z",
  },
];

const SEED_STACK = {
  title: "The Morning Autopilot",
  description: "Automate your entire morning routine — from weather briefing to email triage to task prioritization. Chain these prompts together for a fully automated morning.",
  author: { username: "sarah_dev" },
  items: [
    { idea: SEED_IDEAS[0], context_note: "Start here — know what the day looks like outside." },
    { idea: SEED_IDEAS[1], context_note: "Now check what's on your schedule. This pairs with the weather to help plan commute." },
    { idea: SEED_IDEAS[2], context_note: null },
  ],
};

export default function StackDetailPage() {
  const [copied, setCopied] = useState(false);

  const copyAllPrompts = useCallback(async () => {
    const allPrompts = SEED_STACK.items
      .map((item, i) => `--- ${i + 1}. ${item.idea?.title ?? "Untitled"} ---\n${item.idea?.prompt ?? ""}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(allPrompts);
      if (navigator.vibrate) navigator.vibrate(50);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

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
      </div>

      <h1 className="mb-2 text-2xl font-bold">{SEED_STACK.title}</h1>
      <p className="mb-2 text-sm text-zinc-400">{SEED_STACK.description}</p>
      <p className="mb-4 text-xs text-zinc-600">by @{SEED_STACK.author.username}</p>

      {/* Copy All Prompts */}
      <button
        onClick={copyAllPrompts}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-3 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10"
      >
        {copied ? <><Check size={16} /> Copied All!</> : <><Copy size={16} /> Copy All Prompts</>}
      </button>

      {/* Ideas in order */}
      <div className="space-y-3">
        {SEED_STACK.items.map((item, i) => (
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
