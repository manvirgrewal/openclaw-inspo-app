/**
 * Feed Ranking Configuration
 *
 * All weights and tunables for the feed ranking algorithm live here.
 * Swap these values to change ranking behavior without touching logic.
 */

// ============================================
// Authenticated user weights
// ============================================
export const AUTHENTICATED_WEIGHTS = {
  relevance: 0.4,
  freshness: 0.25,
  quality: 0.2,
  exploration: 0.15,
} as const;

// ============================================
// Anonymous/demo user weights (no taste profile)
// ============================================
export const ANONYMOUS_WEIGHTS = {
  freshness: 0.3,
  quality: 0.5,
  exploration: 0.2,
} as const;

// ============================================
// Freshness decay
// ============================================
/** Half-life in hours (~1 week) */
export const FRESHNESS_HALF_LIFE_HOURS = 168;

// ============================================
// Quality sub-weights (log-based community signals)
// ============================================
export const QUALITY_SIGNAL_WEIGHTS = {
  save: 0.4,
  built: 0.4,
  comment: 0.2,
} as const;

/**
 * Weight for the reputation-system quality score (0-100) vs community signals.
 * Final quality = (reputationQuality * REP_WEIGHT) + (communitySignals * COMMUNITY_WEIGHT)
 * Both normalized to 0-1 before combining.
 */
export const QUALITY_REP_WEIGHT = 0.6;
export const QUALITY_COMMUNITY_WEIGHT = 0.4;

// ============================================
// Exploration boost
// ============================================
/** Brand new ideas (< 48h) get a bigger random boost */
export const EXPLORATION_NEW_HOURS = 48;
export const EXPLORATION_NEW_BOOST = 2.0;

/** Underexposed ideas (< 100 views) get a moderate boost */
export const EXPLORATION_UNDEREXPOSED_VIEWS = 100;
export const EXPLORATION_UNDEREXPOSED_BOOST = 1.5;

/** Default exploration boost */
export const EXPLORATION_DEFAULT_BOOST = 1.0;
