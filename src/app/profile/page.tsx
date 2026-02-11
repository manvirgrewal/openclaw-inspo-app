"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Settings, Sparkles, LogIn } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuth } from "@/lib/auth/auth-context";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { IdeaCard } from "@/components/cards/idea-card";
import { SEED_IDEAS } from "@/data/seed-ideas";
import type { Idea } from "@/modules/ideas/ideas.types";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, signIn } = useAuth();
  const { savedIds } = useGuestSaves();
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setUserIdeas(stored);
    } catch {}
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  // Pinned idea IDs
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-pinned-ideas") || "[]");
      setPinnedIds(stored);
    } catch {}
  }, []);

  const allIdeas = [...userIdeas, ...SEED_IDEAS];
  const savedIdeas = allIdeas.filter((idea) => savedIds.includes(idea.id));

  const handleDelete = useCallback((ideaId: string) => {
    setUserIdeas((prev) => prev.filter((i) => i.id !== ideaId));
  }, []);

  const handlePin = useCallback((ideaId: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(ideaId)
        ? prev.filter((id) => id !== ideaId)
        : [ideaId, ...prev].slice(0, 3); // max 3 pinned
      try { localStorage.setItem("inspo-pinned-ideas", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Guest profile
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-4">
        <Link href="/" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
          <ArrowLeft size={20} />
        </Link>

        {/* Guest header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl">
            👤
          </div>
          <h1 className="text-lg font-bold text-zinc-200">Guest</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your saves are stored locally on this device
          </p>

          {/* Sign in CTA */}
          <div className="mt-4">
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
            >
              <LogIn size={16} />
              Sign in to sync & post
            </button>
            <p className="mt-2 text-xs text-zinc-600">
              Keep your saves across devices, submit ideas, and join the community
            </p>
          </div>
        </div>

        {/* Saved ideas */}
        <div className="border-t border-zinc-800 pt-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">
            🔖 Saved ({savedIdeas.length})
          </h2>
          {savedIdeas.length > 0 ? (
            <div className="space-y-3">
              {savedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-600">
              No saved ideas yet. Browse the feed and bookmark ideas you like!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authenticated profile
  return (
    <div className="px-4 py-4">
      <Link href="/" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
      </Link>

      {/* Profile Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-zinc-400">
          {user!.display_name?.[0] ?? user!.username[0].toUpperCase()}
        </div>

        <h1 className="text-lg font-bold">{user!.display_name}</h1>
        <p className="text-sm text-zinc-500">@{user!.username}</p>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span>💡 {userIdeas.length} ideas</span>
          <span>🔖 {savedIdeas.length} saved</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700">
            <Settings size={14} />
            Edit Profile
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="saved">
        <Tabs.List className="mb-4 flex border-b border-zinc-800">
          {[
            { value: "ideas", label: "My Ideas" },
            { value: "saved", label: "Saved" },
            { value: "stacks", label: "Stacks" },
            { value: "about", label: "About" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="flex-1 border-b-2 border-transparent px-2 py-2.5 text-center text-sm text-zinc-500 transition-colors data-[state=active]:border-zinc-100 data-[state=active]:text-zinc-100"
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="ideas">
          {userIdeas.length > 0 ? (
            <div className="space-y-3">
              {/* Pinned first, then rest */}
              {[...userIdeas].sort((a, b) => {
                const aPin = pinnedIds.includes(a.id) ? -1 : 0;
                const bPin = pinnedIds.includes(b.id) ? -1 : 0;
                return aPin - bPin;
              }).map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  isPinned={pinnedIds.includes(idea.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-600">
              You haven&apos;t posted any ideas yet. Start by submitting one!
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="saved">
          {savedIdeas.length > 0 ? (
            <div className="space-y-3">
              {savedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-600">
              No saved ideas yet. Browse the feed and bookmark ideas you like!
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="stacks">
          <div className="py-12 text-center text-sm text-zinc-600">No stacks yet</div>
        </Tabs.Content>

        <Tabs.Content value="about">
          <div className="space-y-4 text-sm text-zinc-400">
            <div>
              <h4 className="mb-1 font-medium text-zinc-300">Username</h4>
              <p>@{user!.username}</p>
            </div>
            <div>
              <h4 className="mb-1 font-medium text-zinc-300">Member since</h4>
              <p>February 2026</p>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
