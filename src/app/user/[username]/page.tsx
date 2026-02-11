"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, LogIn } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";
import { IdeaCard } from "@/components/cards/idea-card";
import { StackCard } from "@/components/cards/stack-card";
import { FollowListModal, type FollowListTab } from "@/components/profile/follow-list-modal";
import { ShareButton } from "@/components/share/share-button";
import { useAuth } from "@/lib/auth/auth-context";
import { useFollows } from "@/hooks/use-follows";
import { useToast } from "@/components/common/toast";
import { SEED_IDEAS } from "@/data/seed-ideas";
import { SEED_STACKS_LIST } from "@/data/seed-stacks";
import { getProfileByUsername } from "@/data/seed-profiles";
import { UserAvatar } from "@/components/common/user-avatar";
import type { Idea } from "@/modules/ideas/ideas.types";

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
  const router = useRouter();
  const seedProfile = getProfileByUsername(username);
  const { user, isAuthenticated } = useAuth();

  // If viewing own profile, redirect to /profile
  const isOwnProfile = user && user.username === username;
  useEffect(() => {
    if (isOwnProfile) router.replace("/profile");
  }, [isOwnProfile, router]);

  // Merge localStorage profile data for demo_user (or any local user)
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [localIdeas, setLocalIdeas] = useState<Idea[]>([]);
  const [localStacks, setLocalStacks] = useState<any[]>([]);
  useEffect(() => {
    try {
      // Check if this username matches the logged-in demo user's profile
      const storedProfile = JSON.parse(localStorage.getItem("inspo-user-profile") || "{}");
      if (storedProfile.username === username || (username === "demo_user" && Object.keys(storedProfile).length > 0)) {
        setLocalProfile(storedProfile);
      }
      // Load user-created ideas
      const ideas: Idea[] = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setLocalIdeas(ideas.filter((i) => i.author?.username === username));
      // Load user-created stacks
      const stacks = JSON.parse(localStorage.getItem("inspo-user-stacks") || "[]");
      setLocalStacks(stacks.filter((s: any) => s.author?.username === username));
    } catch {}
  }, [username]);

  // Merge seed profile with local overrides
  const profile = seedProfile ? {
    ...seedProfile,
    ...(localProfile ? {
      display_name: localProfile.display_name || seedProfile.display_name,
      bio: localProfile.bio || seedProfile.bio,
      avatar_url: localProfile.avatar_url || seedProfile.avatar_url,
      agent_platform: localProfile.agent_platform || seedProfile.agent_platform,
      active_skills: localProfile.active_skills?.length ? localProfile.active_skills : seedProfile.active_skills,
      onboarding_role: localProfile.onboarding_role || seedProfile.onboarding_role,
      setup_description: localProfile.setup_description || seedProfile.setup_description,
    } : {}),
  } : null;
  const { toggleFollow, isFollowing, followedIds, getFollowerIds, getFollowingIds } = useFollows();
  const { toast } = useToast();
  const following = profile ? isFollowing(profile.id) : false;
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<FollowListTab>("followers");

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

  const userIdeas = [...SEED_IDEAS.filter((i) => i.author_id === profile.id), ...localIdeas];
  const userStacks = [...SEED_STACKS_LIST.filter((s) => s.author_id === profile.id), ...localStacks];

  return (
    <div className="px-4 py-4">
      {/* Back */}
      <Link href="/" className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
      </Link>

      {/* Profile Header */}
      <div className="mb-6 text-center">
        <UserAvatar
          avatarUrl={profile.avatar_url}
          displayName={profile.display_name}
          username={profile.username}
          size="lg"
          className="mx-auto mb-3"
        />

        <h1 className="text-lg font-bold">{profile.display_name ?? profile.username}</h1>
        <p className="text-sm text-zinc-500">@{profile.username}</p>

        {profile.bio && (
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <span>💡 {userIdeas.length} ideas</span>
          <button
            onClick={() => { setFollowListTab("followers"); setFollowListOpen(true); }}
            className="hover:text-zinc-300 transition-colors"
          >
            <span className="font-semibold text-zinc-300">{getFollowerIds(profile.id).length}</span> followers
          </button>
          <button
            onClick={() => { setFollowListTab("following"); setFollowListOpen(true); }}
            className="hover:text-zinc-300 transition-colors"
          >
            <span className="font-semibold text-zinc-300">{getFollowingIds(profile.id).length}</span> following
          </button>
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
            onClick={() => {
              if (!isAuthenticated) {
                toast("Sign in to follow users");
                return;
              }
              toggleFollow(profile.id);
            }}
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
          <ShareButton
            title={`${profile.display_name ?? profile.username} on OpenClaw Inspo`}
            shareUrl={`/user/${profile.username}`}
            description={profile.bio ?? undefined}
            iconOnly
          />
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
                  {profile.active_skills.map((skill: string) => (
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

      <FollowListModal
        open={followListOpen}
        onClose={() => setFollowListOpen(false)}
        tab={followListTab}
        onTabChange={setFollowListTab}
        profileId={profile.id}
        followingIds={getFollowingIds(profile.id)}
        followerIds={getFollowerIds(profile.id)}
        myFollowedIds={followedIds}
        myUserId={user?.id ?? null}
        onToggleFollow={toggleFollow}
      />
    </div>
  );
}
