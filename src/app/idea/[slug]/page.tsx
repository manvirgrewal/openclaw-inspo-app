"use client";

import { useState, useCallback, use } from "react";
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
import type { Idea } from "@/modules/ideas/ideas.types";

// Seed data fallback (same pattern as home page)
const SEED_IDEAS: Record<string, Idea> = {
  "morning-briefing-agent": {
    id: "1",
    author_id: "seed-author-1",
    slug: "morning-briefing-agent",
    title: "Morning Briefing Agent",
    description:
      "Your agent reads your calendar, weather, and top emails every morning — delivers a 3-line summary so you can start your day without checking 5 different apps.",
    body: `## How It Works

This agent runs on a schedule every morning at your preferred time. It pulls data from three sources:

1. **Calendar** — Today's events with times and attendees
2. **Weather** — Current conditions and forecast for your location  
3. **Email** — Top 5 unread emails by importance

The output is a concise 3-line briefing delivered however you prefer — Slack message, notification, or spoken aloud.

## Customization Ideas

- Add news headlines from your preferred sources
- Include stock prices or crypto portfolio changes
- Add commute time estimates based on your first meeting location
- Include a motivational quote or daily affirmation`,
    prompt:
      "Every morning at 8am, check my calendar for today's events, get the current weather for my location, and summarize my top 5 unread emails. Deliver this as a concise 3-line briefing.",
    category: "productivity",
    complexity: "quick",
    skills: ["calendar", "email", "weather"],
    tags: ["morning", "routine", "briefing"],
    status: "published",
    save_count: 142,
    comment_count: 8,
    built_count: 23,
    view_count: 1200,
    remix_of: null,
    created_at: "2026-02-10T08:00:00Z",
    updated_at: "2026-02-10T08:00:00Z",
    published_at: "2026-02-10T08:00:00Z",
    author: {
      id: "seed-author-1",
      username: "alexclaw",
      display_name: "Alex",
      avatar_url: null,
    },
  },
  "expense-auto-tracker": {
    id: "2",
    author_id: "seed-author-2",
    slug: "expense-auto-tracker",
    title: "Expense Auto-Tracker",
    description:
      "Forward receipts to your agent via email — it extracts the amount, vendor, and category, then logs it to a spreadsheet automatically.",
    body: `## Setup

Forward any receipt or invoice email to your agent. It will:

1. Parse the email for vendor name, amount, and date
2. Auto-categorize the expense (food, transport, subscriptions, etc.)
3. Append a new row to your designated spreadsheet

## Tips

- Works best with digital receipts (plain text or HTML emails)
- Set up an email forwarding rule for automatic processing
- Review categorization weekly and correct mistakes — the agent learns`,
    prompt:
      "When I forward an email with a receipt or invoice, extract the vendor name, total amount, date, and categorize it (food, transport, subscriptions, etc). Append a row to my expenses spreadsheet with this data.",
    category: "finance",
    complexity: "moderate",
    skills: ["email", "sheets"],
    tags: ["expenses", "tracking", "automation"],
    status: "published",
    save_count: 89,
    comment_count: 12,
    built_count: 15,
    view_count: 890,
    remix_of: null,
    created_at: "2026-02-09T14:00:00Z",
    updated_at: "2026-02-09T14:00:00Z",
    published_at: "2026-02-09T14:00:00Z",
    author: {
      id: "seed-author-2",
      username: "financebot",
      display_name: "Finance Bot",
      avatar_url: null,
    },
  },
  "git-commit-summarizer": {
    id: "3",
    author_id: "seed-author-3",
    slug: "git-commit-summarizer",
    title: "Git Commit Summarizer",
    description:
      "At the end of each day, your agent reviews your git commits and generates a clean summary of what you accomplished — perfect for standups.",
    body: null,
    prompt:
      "Every evening at 6pm, check my recent git commits across all active repos. Generate a bullet-point summary of what I accomplished today, grouped by project. Keep it concise enough for a standup update.",
    category: "development",
    complexity: "quick",
    skills: ["github"],
    tags: ["git", "standup", "developer"],
    status: "published",
    save_count: 201,
    comment_count: 15,
    built_count: 34,
    view_count: 1800,
    remix_of: null,
    created_at: "2026-02-08T10:00:00Z",
    updated_at: "2026-02-08T10:00:00Z",
    published_at: "2026-02-08T10:00:00Z",
    author: {
      id: "seed-author-3",
      username: "devtools",
      display_name: "Dev Tools",
      avatar_url: null,
    },
  },
};

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
  const idea = SEED_IDEAS[slug];

  const [copied, setCopied] = useState(false);
  const { isSaved, saveIdea, unsaveIdea } = useGuestSaves();
  const { toast } = useToast();
  const saved = idea ? isSaved(idea.id) : false;

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
          <span className="font-medium text-zinc-300">
            {idea.author?.display_name ?? idea.author?.username ?? "Anonymous"}
          </span>
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
          <Bookmark size={14} /> {idea.save_count} saves
        </span>
        <span className="flex items-center gap-1.5">
          <Hammer size={14} /> {idea.built_count} built
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare size={14} /> {idea.comment_count} comments
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
      </div>

      {/* Comments */}
      <CommentsSection />
    </div>
  );
}
