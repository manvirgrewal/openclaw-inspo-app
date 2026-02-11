"use client";

import { useState, useEffect } from "react";
import { IdeaCard } from "@/components/cards/idea-card";
import { FilterChips } from "@/components/feed/filter-chips";
import { SaveNudgeBanner } from "@/components/common/save-nudge-banner";
import { SEED_IDEAS } from "@/data/seed-ideas";
import type { Idea } from "@/modules/ideas/ideas.types";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setUserIdeas(stored);
    } catch {}
  }, []);

  const allIdeas = [...userIdeas, ...SEED_IDEAS];
  const filteredIdeas = selectedCategory
    ? allIdeas.filter((idea) => idea.category === selectedCategory)
    : allIdeas;

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
