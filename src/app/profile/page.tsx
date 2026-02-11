"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Settings } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuth } from "@/lib/auth/auth-context";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { IdeaCard } from "@/components/cards/idea-card";
import { SEED_IDEAS } from "@/data/seed-ideas";

const TAB_ITEMS = [
  { value: "ideas", label: "My Ideas" },
  { value: "saved", label: "Saved" },
  { value: "stacks", label: "Stacks" },
  { value: "about", label: "About" },
];

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { savedIds } = useGuestSaves();
  const router = useRouter();
  const [userIdeas, setUserIdeas] = useState<import("@/modules/ideas/ideas.types").Idea[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setUserIdeas(stored);
    } catch {}
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  const allIdeas = [...userIdeas, ...SEED_IDEAS];
  const savedIdeas = allIdeas.filter((idea) => savedIds.includes(idea.id));

  return (
    <div className="px-4 py-4">
      {/* Back */}
      <Link href="/" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
      </Link>

      {/* Profile Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-zinc-400">
          {user.display_name?.[0] ?? user.username[0].toUpperCase()}
        </div>

        <h1 className="text-lg font-bold">{user.display_name}</h1>
        <p className="text-sm text-zinc-500">@{user.username}</p>

        {/* Stats */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span>💡 {userIdeas.length} ideas</span>
          <span>🔖 {savedIdeas.length} saved</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
          >
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
          {TAB_ITEMS.map((tab) => (
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
              {userIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
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
          <div className="py-12 text-center text-sm text-zinc-600">
            No stacks yet
          </div>
        </Tabs.Content>

        <Tabs.Content value="about">
          <div className="space-y-4 text-sm text-zinc-400">
            <div>
              <h4 className="mb-1 font-medium text-zinc-300">Username</h4>
              <p>@{user.username}</p>
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
