/**
 * Resolve the latest author profile data for display.
 * 
 * In demo mode: checks localStorage profile (for demo user) + seed profiles.
 * With Supabase: this function becomes unnecessary — the DB join handles it.
 * 
 * Used by IdeaCard, idea detail, comments, built-this, stack detail, etc.
 * to always show the freshest avatar/display_name for any author.
 */

import { SEED_PROFILES } from "@/data/seed-profiles";

export interface AuthorDisplay {
  id?: string;
  username: string;
  display_name: string | null;
  avatar_url?: string | null;
}

/**
 * Given snapshot author data (from a post/comment/build), resolve the latest
 * profile info. Returns enriched author with current avatar + display name.
 */
export function resolveAuthor<T extends AuthorDisplay>(author: T): T {
  // Check localStorage profile (covers demo user + any future local users)
  try {
    const localProfile = JSON.parse(
      localStorage.getItem("inspo-user-profile") || "{}"
    );
    // Match by username (demo mode identifier)
    if (
      localProfile.username === author.username ||
      (author.username === "demo_user" && Object.keys(localProfile).length > 0)
    ) {
      return {
        ...author,
        display_name: localProfile.display_name || author.display_name,
        avatar_url: localProfile.avatar_url || author.avatar_url,
      };
    }
  } catch {}

  // Check seed profiles for latest data
  const seed = SEED_PROFILES[author.username];
  if (seed) {
    return {
      ...author,
      display_name: seed.display_name ?? author.display_name,
      avatar_url: seed.avatar_url ?? author.avatar_url,
    };
  }

  return author;
}
