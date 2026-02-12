"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Settings, Sparkles, LogIn } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuth } from "@/lib/auth/auth-context";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { useProfile } from "@/hooks/use-profile";
import { useFollows } from "@/hooks/use-follows";
import { IdeaCard } from "@/components/cards/idea-card";
import { StackCard } from "@/components/cards/stack-card";
import { UserAvatar } from "@/components/common/user-avatar";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { FollowListModal, type FollowListTab } from "@/components/profile/follow-list-modal";
import { ShareButton } from "@/components/share/share-button";
import { SEED_IDEAS } from "@/data/seed-ideas";
import type { Idea } from "@/modules/ideas/ideas.types";
import type { Stack } from "@/modules/stacks/stacks.types";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, signIn } = useAuth();
  const { savedIds } = useGuestSaves();
  const { profile, updateProfile, loaded: profileLoaded } = useProfile();
  const { followedIds, toggleFollow, getFollowerIds, getFollowingIds } = useFollows();
  const [userIdeas, setUserIdeas] = useState<Idea[]>([]);
  const [userStacks, setUserStacks] = useState<Stack[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<FollowListTab>("followers");

  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setUserIdeas(stored);
    } catch {}
    try {
      const storedStacks = JSON.parse(localStorage.getItem("inspo-user-stacks") || "[]");
      setUserStacks(storedStacks);
    } catch {}
    try {
      const storedPins = JSON.parse(localStorage.getItem("inspo-pinned-ideas") || "[]");
      setPinnedIds(storedPins);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-700 border-t-stone-300" />
      </div>
    );
  }

  // Guest profile
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-4">
        <Link href="/" className="mb-4 flex items-center gap-2 text-stone-400 hover:text-stone-200">
          <ArrowLeft size={20} />
        </Link>

        {/* Guest header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-stone-800 text-xl">
            👤
          </div>
          <h1 className="text-lg font-bold text-stone-200">Guest</h1>
          <p className="mt-1 text-sm text-stone-500">
            Your saves are stored locally on this device
          </p>

          {/* Sign in CTA */}
          <div className="mt-4">
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 rounded-lg bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-white"
            >
              <LogIn size={16} />
              Sign in to sync & post
            </button>
            <p className="mt-2 text-xs text-stone-600">
              Keep your saves across devices, submit ideas, and join the community
            </p>
          </div>
        </div>

        {/* Saved ideas */}
        <div className="border-t border-stone-800 pt-4">
          <h2 className="mb-3 text-sm font-semibold text-stone-300">
            🔖 Saved ({savedIdeas.length})
          </h2>
          {savedIdeas.length > 0 ? (
            <div className="space-y-3">
              {savedIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-stone-600">
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
      <Link href="/" className="mb-4 flex items-center gap-2 text-stone-400 hover:text-stone-200">
        <ArrowLeft size={20} />
      </Link>

      {/* Profile Header */}
      <div className="mb-6 text-center">
        <UserAvatar
          avatarUrl={profile.avatar_url}
          displayName={profile.display_name ?? user!.display_name}
          size="lg"
          className="mx-auto mb-3"
        />

        <h1 className="text-lg font-bold">{profile.display_name || user!.display_name}</h1>
        <p className="text-sm text-stone-500">@{profile.username || user!.username}</p>

        {profile.bio && (
          <p className="mx-auto mt-2 max-w-xs text-sm text-stone-400">{profile.bio}</p>
        )}

        {(profile.onboarding_role || profile.agent_platform) && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-stone-500">
            {profile.onboarding_role && <span className="rounded-full bg-stone-800 px-2 py-0.5">{profile.onboarding_role}</span>}
            {profile.agent_platform && <span className="rounded-full bg-stone-800 px-2 py-0.5">{profile.agent_platform}</span>}
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-stone-500">
          <span>💡 {userIdeas.length} ideas</span>
          <span>🔖 {savedIdeas.length} saved</span>
          <button
            onClick={() => { setFollowListTab("followers"); setFollowListOpen(true); }}
            className="hover:text-stone-300 transition-colors"
          >
            <span className="font-semibold text-stone-300">{getFollowerIds(user!.id).length}</span> followers
          </button>
          <button
            onClick={() => { setFollowListTab("following"); setFollowListOpen(true); }}
            className="hover:text-stone-300 transition-colors"
          >
            <span className="font-semibold text-stone-300">{getFollowingIds(user!.id).length}</span> following
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-stone-300 hover:bg-stone-700"
          >
            <Settings size={14} />
            Edit Profile
          </button>
          <ShareButton
            title={`${profile.display_name || user!.display_name} on OpenClaw Inspo`}
            shareUrl={`/user/${profile.username || user!.username}`}
            description={profile.bio ?? undefined}
            iconOnly
          />
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSave={updateProfile}
      />

      {/* Tabs */}
      <Tabs.Root defaultValue="saved">
        <Tabs.List className="mb-4 flex border-b border-stone-800">
          {[
            { value: "ideas", label: "My Ideas" },
            { value: "saved", label: "Saved" },
            { value: "stacks", label: "Stacks" },
            { value: "about", label: "About" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="flex-1 border-b-2 border-transparent px-2 py-2.5 text-center text-sm text-stone-500 transition-colors data-[state=active]:border-stone-100 data-[state=active]:text-stone-100"
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
            <div className="py-12 text-center text-sm text-stone-600">
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
            <div className="py-12 text-center text-sm text-stone-600">
              No saved ideas yet. Browse the feed and bookmark ideas you like!
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
            <div className="py-12 text-center">
              <p className="mb-2 text-sm text-stone-600">No stacks yet</p>
              <Link
                href="/stacks/create"
                className="text-sm text-amber-400 hover:underline"
              >
                Create your first stack →
              </Link>
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="about">
          <div className="space-y-4 text-sm text-stone-400">
            <div>
              <h4 className="mb-1 font-medium text-stone-300">Username</h4>
              <p>@{profile.username || user!.username}</p>
            </div>
            {profile.bio && (
              <div>
                <h4 className="mb-1 font-medium text-stone-300">Bio</h4>
                <p>{profile.bio}</p>
              </div>
            )}
            {profile.agent_platform && (
              <div>
                <h4 className="mb-1 font-medium text-stone-300">Agent Platform</h4>
                <p>{profile.agent_platform}</p>
              </div>
            )}
            {profile.setup_description && (
              <div>
                <h4 className="mb-1 font-medium text-stone-300">Agent Setup</h4>
                <p>{profile.setup_description}</p>
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h4 className="mb-1 font-medium text-stone-300">Interests</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((i) => (
                    <span key={i} className="rounded-full bg-stone-800 px-2 py-0.5 text-xs text-stone-400">{i}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="mb-1 font-medium text-stone-300">Member since</h4>
              <p>February 2026</p>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <FollowListModal
        open={followListOpen}
        onClose={() => setFollowListOpen(false)}
        tab={followListTab}
        onTabChange={setFollowListTab}
        profileId={user!.id}
        followingIds={getFollowingIds(user!.id)}
        followerIds={getFollowerIds(user!.id)}
        myFollowedIds={followedIds}
        myUserId={user!.id}
        onToggleFollow={toggleFollow}
      />
    </div>
  );
}
