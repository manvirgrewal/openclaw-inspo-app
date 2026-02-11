"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pin, UserPlus, Share2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";
import { IdeaCard } from "@/components/cards/idea-card";
import { StackCard } from "@/components/cards/stack-card";
import type { Idea } from "@/modules/ideas/ideas.types";
import type { Stack } from "@/modules/stacks/stacks.types";
import type { Profile } from "@/modules/users/users.types";

// Seed data
const SEED_PROFILE: Profile = {
  id: "u1",
  username: "sarah_dev",
  display_name: "Sarah Chen",
  avatar_url: null,
  bio: "Full-stack dev automating everything I can. Building with OpenClaw daily.",
  role: "user",
  reputation_score: 420,
  agent_platform: "OpenClaw",
  active_skills: ["calendar", "email", "github", "weather"],
  setup_description: null,
  setup_score: 75,
  onboarding_role: "Developer",
  interests: ["productivity", "development"],
  ideas_built_count: 12,
  ideas_contributed_count: 8,
  follower_count: 142,
  following_count: 38,
  pinned_ideas: ["p1"],
  pinned_stacks: [],
  pinned_builds: [],
  onboarding_completed: true,
  created_at: "2026-01-15T08:00:00Z",
  updated_at: "2026-02-10T08:00:00Z",
};

const SEED_IDEAS: Idea[] = [
  {
    id: "p1", author_id: "u1", slug: "morning-briefing-agent",
    title: "Morning Briefing Agent", description: "Your agent reads your calendar, weather, and top emails every AM — delivers a 3-line summary.",
    body: null, prompt: "Every morning at 7am, check my calendar, weather, and unread emails. Give me a 3-line briefing.",
    category: "productivity", complexity: "quick", skills: ["calendar", "email", "weather"], tags: [],
    status: "published", save_count: 142, comment_count: 8, built_count: 35, view_count: 680,
    remix_of: null, created_at: "2026-01-20T08:00:00Z", updated_at: "2026-01-20T08:00:00Z", published_at: "2026-01-20T08:00:00Z",
  },
  {
    id: "p2", author_id: "u1", slug: "pr-summary-bot",
    title: "PR Summary Bot", description: "Auto-generate PR descriptions from your git diff and commit messages.",
    body: null, prompt: "Read the git diff and commit messages for my current branch. Write a clear PR description with: summary, changes, testing notes.",
    category: "development", complexity: "moderate", skills: ["github"], tags: ["git"],
    status: "published", save_count: 78, comment_count: 4, built_count: 22, view_count: 310,
    remix_of: null, created_at: "2026-01-25T08:00:00Z", updated_at: "2026-01-25T08:00:00Z", published_at: "2026-01-25T08:00:00Z",
  },
];

const SEED_STACKS: Stack[] = [
  {
    id: "s1", author_id: "u1", slug: "morning-autopilot",
    title: "The Morning Autopilot", description: "Automate your entire morning routine.",
    cover_image_url: null, category: "productivity", is_featured: true, status: "published",
    save_count: 89, view_count: 340, created_at: "2026-02-01T08:00:00Z", updated_at: "2026-02-01T08:00:00Z",
    items: Array.from({ length: 7 }, (_, i) => ({ stack_id: "s1", idea_id: `i${i}`, position: i, context_note: null })),
    author: { id: "u1", username: "sarah_dev", display_name: "Sarah Chen", avatar_url: null },
  },
];

const TAB_ITEMS = [
  { value: "ideas", label: "Ideas" },
  { value: "built", label: "Built" },
  { value: "stacks", label: "Stacks" },
  { value: "about", label: "About" },
];

export default function UserProfilePage() {
  const profile = SEED_PROFILE;
  const [following, setFollowing] = useState(false);

  return (
    <div className="px-4 py-4">
      {/* Back */}
      <Link href="/" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
      </Link>

      {/* Profile Header */}
      <div className="mb-6 text-center">
        {/* Avatar */}
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-zinc-400">
          {profile.display_name?.[0] ?? profile.username[0].toUpperCase()}
        </div>

        <h1 className="text-lg font-bold">{profile.display_name ?? profile.username}</h1>
        <p className="text-sm text-zinc-500">@{profile.username}</p>

        {profile.bio && (
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span>💡 {profile.ideas_contributed_count} ideas</span>
          <span>⚡ {profile.ideas_built_count} built</span>
          <span>👥 {profile.follower_count} followers</span>
        </div>

        {/* Setup */}
        {profile.agent_platform && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <span>🤖 {profile.agent_platform}</span>
            {profile.active_skills.length > 0 && (
              <span>· {profile.active_skills.slice(0, 3).join(", ")}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setFollowing(!following)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              following
                ? "bg-zinc-800 text-zinc-300"
                : "bg-zinc-100 text-zinc-950 hover:bg-white"
            )}
          >
            <UserPlus size={14} />
            {following ? "Following" : "Follow"}
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Pinned Section */}
      {SEED_IDEAS.filter((i) => profile.pinned_ideas.includes(i.id)).length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <Pin size={12} />
            📌 Pinned
          </div>
          <div className="space-y-3">
            {SEED_IDEAS.filter((i) => profile.pinned_ideas.includes(i.id)).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs.Root defaultValue="ideas">
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
          <div className="space-y-3">
            {SEED_IDEAS.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="built">
          <div className="py-12 text-center text-sm text-zinc-600">
            No builds to show yet
          </div>
        </Tabs.Content>

        <Tabs.Content value="stacks">
          <div className="space-y-3">
            {SEED_STACKS.map((stack) => (
              <StackCard key={stack.id} stack={stack} />
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="about">
          <div className="space-y-4 text-sm text-zinc-400">
            {profile.bio && <p>{profile.bio}</p>}
            {profile.agent_platform && (
              <div>
                <h4 className="mb-1 font-medium text-zinc-300">Agent Platform</h4>
                <p>{profile.agent_platform}</p>
              </div>
            )}
            {profile.active_skills.length > 0 && (
              <div>
                <h4 className="mb-1 font-medium text-zinc-300">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.active_skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="mb-1 font-medium text-zinc-300">Joined</h4>
              <p>{new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
