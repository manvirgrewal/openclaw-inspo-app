"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const FOLLOWS_KEY = "inspo-follows";

/**
 * Seed follow graph — simulates existing relationships between seed users.
 * Map of userId → userIds they follow.
 */
const SEED_GRAPH: Record<string, string[]> = {
  u1: ["u2", "u3"],           // sarah follows mike & jess
  u2: ["u1"],                 // mike follows sarah
  u3: ["u1", "u2"],           // jess follows sarah & mike
};

/**
 * Persists the demo user's follow relationships in localStorage.
 * Also exposes the full follow graph (seed + demo) for computing
 * followers/following for any user.
 */
export function useFollows(myUserId: string = "demo-user-1") {
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FOLLOWS_KEY);
      if (raw) setFollowedIds(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const persist = (ids: string[]) => {
    try { localStorage.setItem(FOLLOWS_KEY, JSON.stringify(ids)); } catch {}
  };

  const toggleFollow = useCallback((userId: string) => {
    setFollowedIds((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      persist(next);
      return next;
    });
  }, []);

  const isFollowing = useCallback(
    (userId: string) => followedIds.includes(userId),
    [followedIds]
  );

  // Full graph: seed + demo user's follows
  const fullGraph = useMemo(() => {
    const graph = { ...SEED_GRAPH };
    graph[myUserId] = followedIds;
    return graph;
  }, [followedIds, myUserId]);

  /** Get IDs that a given user is following */
  const getFollowingIds = useCallback(
    (userId: string): string[] => fullGraph[userId] ?? [],
    [fullGraph]
  );

  /** Get IDs that follow a given user */
  const getFollowerIds = useCallback(
    (userId: string): string[] =>
      Object.entries(fullGraph)
        .filter(([, following]) => following.includes(userId))
        .map(([id]) => id),
    [fullGraph]
  );

  return {
    followedIds,
    toggleFollow,
    isFollowing,
    getFollowingIds,
    getFollowerIds,
    loaded,
  };
}
