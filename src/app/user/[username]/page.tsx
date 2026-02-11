"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Share2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";
import { IdeaCard } from "@/components/cards/idea-card";
import { StackCard } from "@/components/cards/stack-card";
import { SEED_IDEAS } from "@/data/seed-ideas";
import { SEED_STACKS_LIST } from "@/data/seed-stacks";
import type { Profile } from "@/modules/users/users.types";

// Seed user profiles
const SEED_PROFILES: Record<string, Profile> = {
  sarah_dev: {
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
    ideas_contributed_count: 3,
    follower_count: 142,
    following_count: 38,
    pinned_ideas: [],
    pinned_stacks: [],
    pinned_builds: [],
    onboarding_completed: true,
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-02-10T08:00:00Z",
  },
  mike_builds: {
    id: "u2",
    username: "mike_builds",
    display_name: "Mike Rivera",
    avatar_url: null,
    bio: "Finance nerd meets automation junkie. Making money while I sleep (sort of).",
    role: "user",
    reputation_score: 280,
    agent_platform: "OpenClaw",
    active_skills: ["email", "sheets", "web-search"],
    setup_description: null,
    setup_score: 60,
    onboarding_role: "Entrepreneur",
    interests: ["finance", "productivity"],
    ideas_built_count: 8,
    ideas_contributed_count: 2,
    follower_count: 89,
    following_count: 45,
    pinned_ideas: [],
    pinned_stacks: [],
    pinned_builds: [],
    onboarding_completed: true,
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-02-10T08:00:00Z",
  },
  jess_automates: {
    id: "u3",
    username: "jess_automates",
    display_name: "Jess Park",
    avatar_url: null,
    bio: "Product manager by day, automation enthusiast by night. Everything should be one click.",
    role: "user",
    reputation_score: 310,
    agent_platform: "Claude",
    active_skills: ["calendar", "drive", "contacts"],
    setup_description: null,
    setup_score: 55,
    onboarding_role: "Marketer",
    interests: ["productivity", "communication"],
    ideas_built_count: 6,
    ideas_contributed_count: 1,
    follower_count: 67,
    following_count: 52,
    pinned_ideas: [],
    pinned_stacks: [],
    pinned_builds: [],
    onboarding_completed: true,
    created_at: "2026-01-25T08:00:00Z",
    updated_at: "2026-02-10T08:00:00Z",
  },
};

const TAB_ITEMS = [
  { value: "ideas", label: "Ideas" },
  { value: "stacks", label: "Stacks" },
  { value: "about", label: "About" },
];

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const profile = SEED_PROFILES[username];
  const [following, setFollowing] = useState(false);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">User not found</h1>
        <p className="mb-6 text-sm text-zinc-500">@{username} doesn&apos;t exist yet.</p>
        <Link href="/" className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700">
          Back to Feed
        </Link>
      </div>
    );
  }

  const userIdeas = SEED_IDEAS.filter((i) => i.author_id === profile.id);
  const userStacks = SEED_STACKS_LIST.filter((s) => s.author_id === profile.id);

  return (
    <div className="px-4 py-4">
      {/* Back */}
      <Link href="/" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
      </Link>

      {/* Profile Header */}
      <div className="mb-6 text-center">
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
          <span>💡 {userIdeas.length} ideas</span>
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
          {userIdeas.length > 0 ? (
            <div className="space-y-3">
              {userIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-600">
              No ideas posted yet
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="stacks">
          {userStacks.length > 0 ? (
            <div className="space-y-3">
              {userStacks.map((stack) => (
                <StackCard key={stack.id} stack={stack} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-600">
              No stacks created yet
            </div>
          )}
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
            {profile.onboarding_role && (
              <div>
                <h4 className="mb-1 font-medium text-zinc-300">Role</h4>
                <p>{profile.onboarding_role}</p>
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
