"use client";

import { useState } from "react";
import { IdeaCard } from "@/components/cards/idea-card";
import { CardSkeleton } from "@/components/cards/card-skeleton";
import { FilterChips } from "@/components/feed/filter-chips";
import { SaveNudgeBanner } from "@/components/common/save-nudge-banner";
import type { Idea } from "@/modules/ideas/ideas.types";

// Seed data for development — replaced with real API calls once Supabase is connected
const SEED_IDEAS: Idea[] = [
  {
    id: "1",
    author_id: "u1",
    slug: "morning-briefing-agent",
    author: { id: "u1", username: "sarah_dev", display_name: "Sarah Chen", avatar_url: null },
    title: "Morning Briefing Agent",
    description:
      "Your agent reads your calendar, weather, and top emails every morning — delivers a 3-line summary so you can start your day without checking 5 different apps.",
    body: null,
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
  },
  {
    id: "2",
    author_id: "u2",
    slug: "expense-auto-tracker",
    author: { id: "u2", username: "mike_builds", display_name: "Mike Rivera", avatar_url: null },
    title: "Expense Auto-Tracker",
    description:
      "Forward receipts to your agent via email — it extracts the amount, vendor, and category, then logs it to a spreadsheet automatically.",
    body: null,
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
  },
  {
    id: "3",
    author_id: "u1",
    slug: "git-commit-summarizer",
    author: { id: "u1", username: "sarah_dev", display_name: "Sarah Chen", avatar_url: null },
    title: "Git Commit Summarizer",
    description:
      "At the end of each day, your agent reviews your git commits and generates a clean summary of what you accomplished — perfect for standups or personal tracking.",
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
  },
  {
    id: "4",
    author_id: "u3",
    slug: "meeting-prep-assistant",
    author: { id: "u3", username: "jess_automates", display_name: "Jess Park", avatar_url: null },
    title: "Meeting Prep Assistant",
    description:
      "30 minutes before any calendar event, your agent pulls relevant context — last meeting notes, shared docs, and attendee info — so you walk in prepared.",
    body: null,
    prompt:
      "Monitor my calendar. 30 minutes before each meeting, look up the attendees, find any previous meeting notes or shared documents related to this topic, and send me a brief prep summary with key talking points.",
    category: "productivity",
    complexity: "moderate",
    skills: ["calendar", "drive", "contacts"],
    tags: ["meetings", "preparation", "context"],
    status: "published",
    save_count: 167,
    comment_count: 6,
    built_count: 19,
    view_count: 1100,
    remix_of: null,
    created_at: "2026-02-07T16:00:00Z",
    updated_at: "2026-02-07T16:00:00Z",
    published_at: "2026-02-07T16:00:00Z",
  },
  {
    id: "5",
    author_id: "u2",
    slug: "weekly-learning-digest",
    author: { id: "u2", username: "mike_builds", display_name: "Mike Rivera", avatar_url: null },
    title: "Weekly Learning Digest",
    description:
      "Your agent curates a personalized learning digest — it scans your saved articles, bookmarks, and interests to recommend 5 things worth reading this week.",
    body: null,
    prompt:
      "Every Sunday evening, review my bookmarked articles, saved links, and browsing interests. Curate a digest of the 5 most interesting and relevant things I should read this week, with a one-line summary for each.",
    category: "learning",
    complexity: "moderate",
    skills: ["web-search", "bookmarks"],
    tags: ["learning", "weekly", "curation"],
    status: "published",
    save_count: 95,
    comment_count: 4,
    built_count: 11,
    view_count: 720,
    remix_of: null,
    created_at: "2026-02-06T12:00:00Z",
    updated_at: "2026-02-06T12:00:00Z",
    published_at: "2026-02-06T12:00:00Z",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIdeas = selectedCategory
    ? SEED_IDEAS.filter((idea) => idea.category === selectedCategory)
    : SEED_IDEAS;

  return (
    <div>
      {/* Filter chips */}
      <FilterChips selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Save nudge banner */}
      <SaveNudgeBanner />

      {/* Feed */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {filteredIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}

        {filteredIdeas.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-500">
            No ideas in this category yet. Be the first to submit one!
          </div>
        )}
      </div>
    </div>
  );
}
