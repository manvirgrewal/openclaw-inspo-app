/**
 * Feature flags — toggle features without code changes.
 * In v1 these are static. Later, swap for a remote config service.
 */
export const FLAGS = {
  // v1
  FEED_RANKING: true, // Heuristic ranking vs chronological
  EVENT_TRACKING: true, // Track user events for rec engine
  PWA_ENABLED: true,
  COPY_HAPTIC: true, // Haptic feedback on copy (mobile)

  // v2 (disabled for now)
  COLLECTIONS: false,
  COMMENTS: false,
  BUILT_THIS: false,
  REMIXES: false,
  FOLLOWS: false,
  CHALLENGES: false,
  USER_STACKS: true, // Users creating stacks
  NOTIFICATIONS: false,
  WEEKLY_DIGEST: false,

  // v3
  PRO_TIER: false,
  CREATOR_ANALYTICS: false,
  SPONSORED_CONTENT: false,
  SEMANTIC_SEARCH: false,
  EMBEDDINGS: false,
} as const;

export function isEnabled(flag: keyof typeof FLAGS): boolean {
  return FLAGS[flag];
}
