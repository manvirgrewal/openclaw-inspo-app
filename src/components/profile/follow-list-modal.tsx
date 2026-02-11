"use client";

import { useRef } from "react";
import Link from "next/link";
import { X, UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getProfileById, ALL_PROFILES } from "@/data/seed-profiles";
import { UserAvatar } from "@/components/common/user-avatar";
import type { Profile } from "@/modules/users/users.types";

export type FollowListTab = "followers" | "following";

interface FollowListModalProps {
  open: boolean;
  onClose: () => void;
  tab: FollowListTab;
  onTabChange: (tab: FollowListTab) => void;
  /** The user whose followers/following we're viewing */
  profileId: string;
  /** IDs that profileId is following (from localStorage graph) */
  followingIds: string[];
  /** IDs that follow profileId (from localStorage graph) */
  followerIds: string[];
  /** IDs that the current logged-in user follows */
  myFollowedIds: string[];
  /** Current logged-in user's ID */
  myUserId: string | null;
  /** Toggle follow for the logged-in user */
  onToggleFollow: (userId: string) => void;
}

export function FollowListModal({
  open,
  onClose,
  tab,
  onTabChange,
  profileId,
  followingIds,
  followerIds,
  myFollowedIds,
  myUserId,
  onToggleFollow,
}: FollowListModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const list = tab === "followers" ? followerIds : followingIds;
  const profiles = list
    .map((id) => getProfileById(id))
    .filter((p): p is Profile => !!p);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
    >
      <div className="relative max-h-[80dvh] w-full max-w-md overflow-hidden rounded-t-2xl bg-zinc-900 sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
              <X size={20} />
            </button>
            <div className="flex-1" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {(["followers", "following"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={cn(
                  "relative flex-1 py-2.5 text-center text-sm font-medium transition-colors",
                  tab === t ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {t === "followers" ? `Followers (${followerIds.length})` : `Following (${followingIds.length})`}
                {tab === t && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(80dvh - 100px)" }}>
          {profiles.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-600">
              {tab === "followers" ? "No followers yet" : "Not following anyone yet"}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {profiles.map((profile) => {
                const isMe = profile.id === myUserId;
                const amFollowing = myFollowedIds.includes(profile.id);

                return (
                  <div key={profile.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Avatar */}
                    <Link
                      href={isMe ? "/profile" : `/user/${profile.username}`}
                      onClick={onClose}
                    >
                      <UserAvatar
                        avatarUrl={profile.avatar_url}
                        displayName={profile.display_name}
                        username={profile.username}
                        size="md"
                      />
                    </Link>

                    {/* Info */}
                    <Link
                      href={isMe ? "/profile" : `/user/${profile.username}`}
                      onClick={onClose}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {profile.display_name ?? profile.username}
                      </p>
                      <p className="truncate text-xs text-zinc-500">@{profile.username}</p>
                    </Link>

                    {/* Follow button (don't show for self) */}
                    {!isMe && myUserId && (
                      <button
                        onClick={() => onToggleFollow(profile.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          amFollowing
                            ? "bg-zinc-800 text-zinc-400 hover:bg-red-950/30 hover:text-red-400"
                            : "bg-zinc-100 text-zinc-900 hover:bg-white"
                        )}
                      >
                        {amFollowing ? (
                          <>
                            <UserCheck size={12} />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
