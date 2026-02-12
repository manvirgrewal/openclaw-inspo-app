"use client";

import { useState, useEffect, useCallback } from "react";
import { IdeaCard } from "@/components/cards/idea-card";
import { StackCard } from "@/components/cards/stack-card";
import { FilterChips } from "@/components/feed/filter-chips";
import { FeedTabs, type FeedTab } from "@/components/feed/feed-tabs";
import { SaveNudgeBanner } from "@/components/common/save-nudge-banner";
import { useAuth } from "@/lib/auth/auth-context";
import { useFollows } from "@/hooks/use-follows";
import { SEED_IDEAS } from "@/data/seed-ideas";
import { SEED_STACKS_LIST } from "@/data/seed-stacks";
import type { Idea } from "@/modules/ideas/ideas.types";

// Inject a stack promo card every N ideas
function injectSlots(ideas: Idea[]): (Idea | { type: "stack"; index: number })[] {
  const result: (Idea | { type: "stack"; index: number })[] = [];
  let stackIdx = 0;
  for (let i = 0; i < ideas.length; i++) {
    result.push(ideas[i]);
    // Insert a stack promo after every 3rd idea (positions 2, 5, 8...)
    if ((i + 1) % 3 === 0 && stackIdx < SEED_STACKS_LIST.length) {
      result.push({ type: "stack", index: stackIdx });
      stackIdx++;
    }
  }
  return result;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { followedIds } = useFollows();
  const [activeTab, setActiveTab] = useState<FeedTab>("discover");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [followingCategory, setFollowingCategory] = useState<string | null>(null);
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setUserIdeas(stored);
    } catch {}
  }, []);

  const handleDelete = useCallback((ideaId: string) => {
    setUserIdeas((prev) => prev.filter((i) => i.id !== ideaId));
  }, []);

  const allIdeas = [...userIdeas, ...SEED_IDEAS];
  const filteredIdeas = selectedCategory
    ? allIdeas.filter((idea) => idea.category === selectedCategory)
    : allIdeas;

  // Following tab: show ideas from users you follow
  const followingIdeas = allIdeas.filter((idea) => idea.author_id && followedIds.includes(idea.author_id));
  const filteredFollowing = followingCategory
    ? followingIdeas.filter((idea) => idea.category === followingCategory)
    : followingIdeas;

  const displayIdeas = activeTab === "following" ? filteredFollowing : filteredIdeas;
  const feedItems = activeTab === "discover" && !selectedCategory
    ? injectSlots(displayIdeas)
    : displayIdeas;

  return (
    <div>
      {/* Feed tabs */}
      <FeedTabs active={activeTab} onTabChange={setActiveTab} isAuthenticated={isAuthenticated} />

      {/* Filter chips */}
      <FilterChips
        selected={activeTab === "following" ? followingCategory : selectedCategory}
        onSelect={activeTab === "following" ? setFollowingCategory : setSelectedCategory}
      />

      {/* Save nudge banner */}
      <SaveNudgeBanner />

      {/* Feed */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {activeTab === "following" && followingIdeas.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-2 text-sm text-stone-400">Your feed is empty</p>
            <p className="text-xs text-stone-600">
              Follow creators from their profiles to see their ideas here.
            </p>
          </div>
        ) : (
          feedItems.map((item, i) => {
            if ("type" in item && item.type === "stack") {
              const stack = SEED_STACKS_LIST[item.index];
              return stack ? (
                <StackCard key={`stack-promo-${stack.id}`} stack={stack} />
              ) : null;
            }
            return <IdeaCard key={(item as Idea).id} idea={item as Idea} onDelete={handleDelete} />;
          })
        )}

        {activeTab === "discover" && displayIdeas.length === 0 && (
          <div className="py-12 text-center text-sm text-stone-500">
            No ideas in this category yet. Be the first to submit one!
          </div>
        )}
      </div>
    </div>
  );
}
