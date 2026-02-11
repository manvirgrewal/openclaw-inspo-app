"use client";

import { useState } from "react";
import { StackCard } from "@/components/cards/stack-card";
import { FilterChips } from "@/components/feed/filter-chips";
import { SEED_STACKS_LIST } from "@/data/seed-stacks";

export default function StacksPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? SEED_STACKS_LIST.filter((s) => s.category === activeCategory)
    : SEED_STACKS_LIST;

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
