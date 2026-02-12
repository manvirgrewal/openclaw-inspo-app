"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StackCard } from "@/components/cards/stack-card";
import { FilterChips } from "@/components/feed/filter-chips";
import { useAuth } from "@/lib/auth/auth-context";
import { SEED_STACKS_LIST } from "@/data/seed-stacks";
import type { Stack } from "@/modules/stacks/stacks.types";

export default function StacksPage() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [userStacks, setUserStacks] = useState<Stack[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-stacks") || "[]");
      setUserStacks(stored);
    } catch {}
  }, []);

  const allStacks = [...userStacks, ...SEED_STACKS_LIST];
  const filtered = activeCategory
    ? allStacks.filter((s) => s.category === activeCategory)
    : allStacks;

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Stacks</h1>
          <p className="mt-1 text-sm text-stone-500">Curated bundles of ideas that work together</p>
        </div>
        {isAuthenticated && (
          <Link
            href="/stacks/create"
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <Plus size={14} />
            Create Stack
          </Link>
        )}
      </div>

      <div className="mb-4">
        <FilterChips selected={activeCategory} onSelect={setActiveCategory} />
      </div>

      <div className="space-y-3">
        {filtered.map((stack) => (
          <StackCard key={stack.id} stack={stack} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-stone-600">No stacks in this category yet</p>
        )}
      </div>
    </div>
  );
}
