"use client";

import { useState, useEffect, useCallback } from "react";

const FOLLOWS_KEY = "inspo-follows";

/**
 * Persists the set of user IDs the demo user follows.
 * Returns the list, a toggle function, and a membership check.
 */
export function useFollows() {
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

  return { followedIds, toggleFollow, isFollowing, loaded };
}
