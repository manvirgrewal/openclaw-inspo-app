"use client";

import { useState } from "react";
import { StackCard } from "@/components/cards/stack-card";
import { FilterChips } from "@/components/feed/filter-chips";
import type { Stack } from "@/modules/stacks/stacks.types";

const SEED_STACKS: Stack[] = [
  {
    id: "s1",
    author_id: "u1",
    slug: "morning-autopilot",
    title: "The Morning Autopilot",
    description: "Automate your entire morning routine — from weather briefing to email triage to task prioritization. 7 prompts that chain together.",
    cover_image_url: null,
    category: "productivity",
    is_featured: true,
    status: "published",
    save_count: 89,
    view_count: 340,
    created_at: "2026-02-01T08:00:00Z",
    updated_at: "2026-02-01T08:00:00Z",
    items: Array.from({ length: 7 }, (_, i) => ({ stack_id: "s1", idea_id: `i${i}`, position: i, context_note: null })),
    author: { id: "u1", username: "sarah_dev", display_name: "Sarah", avatar_url: null },
  },
  {
    id: "s2",
    author_id: "u2",
    slug: "freelancer-finance-stack",
    title: "Freelancer Finance Stack",
    description: "Track expenses, invoice clients, forecast cash flow — all automated through your agent. Stop dreading tax season.",
    cover_image_url: null,
    category: "finance",
    is_featured: false,
    status: "published",
    save_count: 64,
    view_count: 210,
    created_at: "2026-02-03T12:00:00Z",
    updated_at: "2026-02-03T12:00:00Z",
    items: Array.from({ length: 5 }, (_, i) => ({ stack_id: "s2", idea_id: `i${i}`, position: i, context_note: null })),
    author: { id: "u2", username: "alex_finance", display_name: "Alex", avatar_url: null },
  },
  {
    id: "s3",
    author_id: "u3",
    slug: "content-creation-pipeline",
    title: "Content Creation Pipeline",
    description: "From research to outline to draft to social posts. A complete content workflow that turns one idea into multi-platform content.",
    cover_image_url: null,
    category: "creative",
    is_featured: true,
    status: "published",
    save_count: 112,
    view_count: 520,
    created_at: "2026-02-05T14:00:00Z",
    updated_at: "2026-02-05T14:00:00Z",
    items: Array.from({ length: 6 }, (_, i) => ({ stack_id: "s3", idea_id: `i${i}`, position: i, context_note: null })),
    author: { id: "u3", username: "maya_creates", display_name: "Maya", avatar_url: null },
  },
  {
    id: "s4",
    author_id: "u1",
    slug: "dev-productivity-boost",
    title: "Dev Productivity Boost",
    description: "Code review, PR summaries, dependency updates, and changelog generation — automate the boring parts of development.",
    cover_image_url: null,
    category: "development",
    is_featured: false,
    status: "published",
    save_count: 78,
    view_count: 290,
    created_at: "2026-02-07T10:00:00Z",
    updated_at: "2026-02-07T10:00:00Z",
    items: Array.from({ length: 4 }, (_, i) => ({ stack_id: "s4", idea_id: `i${i}`, position: i, context_note: null })),
    author: { id: "u1", username: "sarah_dev", display_name: "Sarah", avatar_url: null },
  },
];

export default function StacksPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? SEED_STACKS.filter((s) => s.category === activeCategory)
    : SEED_STACKS;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">Stacks</h1>
      <p className="mb-4 text-sm text-zinc-500">Curated bundles of ideas that work together</p>

      <div className="mb-4">
        <FilterChips selected={activeCategory} onSelect={setActiveCategory} />
      </div>

      <div className="space-y-3">
        {filtered.map((stack) => (
          <StackCard key={stack.id} stack={stack} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-600">No stacks in this category yet</p>
        )}
      </div>
    </div>
  );
}
