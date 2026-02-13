/**
 * Feed Ranking Service
 *
 * Scores and sorts ideas using the Phase 1 heuristic formula.
 * Pure functions — no side effects, no localStorage access.
 * Depends on reputation service for quality scores.
 *
 * Authenticated:  score = (relevance × 0.4) + (freshness × 0.25) + (quality × 0.2) + (exploration × 0.15)
 * Anonymous:      score = (freshness × 0.3) + (quality × 0.5) + (exploration × 0.2)
 */

import {
  AUTHENTICATED_WEIGHTS,
  ANONYMOUS_WEIGHTS,
  FRESHNESS_HALF_LIFE_HOURS,
  QUALITY_SIGNAL_WEIGHTS,
  QUALITY_REP_WEIGHT,
  QUALITY_COMMUNITY_WEIGHT,
  EXPLORATION_NEW_HOURS,
  EXPLORATION_NEW_BOOST,
  EXPLORATION_UNDEREXPOSED_VIEWS,
  EXPLORATION_UNDEREXPOSED_BOOST,
  EXPLORATION_DEFAULT_BOOST,
} from "./feed-ranking.config";
import { getIdeaQuality } from "@/modules/reputation/reputation.service";
import type { Idea } from "@/modules/ideas/ideas.types";

// ============================================
// Score components (all return 0-1)
// ============================================

/**
 * Freshness: decays over time with ~1 week half-life.
 * freshness = 1 / (1 + hours_since_published / 168)
 */
export function computeFreshness(createdAt: string, now: Date = new Date()): number {
  const hours = Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / 3_600_000);
  return 1 / (1 + hours / FRESHNESS_HALF_LIFE_HOURS);
}

/**
 * Quality: blends the reputation system's quality score with log-based community signals.
 * Both normalized to 0-1, then weighted.
 */
export function computeQuality(idea: Idea): number {
  // Reputation quality score (0-100 → 0-1)
  const repQuality = getIdeaQuality(idea.id) / 100;

  // Community signals (log-based, normalized roughly to 0-1)
  const saveSig = Math.log(1 + idea.save_count) * QUALITY_SIGNAL_WEIGHTS.save;
  const builtSig = Math.log(1 + idea.built_count) * QUALITY_SIGNAL_WEIGHTS.built;
  const commentSig = Math.log(1 + idea.comment_count) * QUALITY_SIGNAL_WEIGHTS.comment;
  const communityRaw = saveSig + builtSig + commentSig;
  // Normalize: log(1+150)*0.4 + log(1+25)*0.4 + log(1+10)*0.2 ≈ 3.3 is a rough max
  const communityNorm = Math.min(1, communityRaw / 3.5);

  return repQuality * QUALITY_REP_WEIGHT + communityNorm * QUALITY_COMMUNITY_WEIGHT;
}

/**
 * Exploration: random boost weighted by idea exposure.
 * New (<48h) and underexposed (<100 views) ideas get bigger boosts.
 */
export function computeExploration(idea: Idea, now: Date = new Date()): number {
  const ageHours = (now.getTime() - new Date(idea.created_at).getTime()) / 3_600_000;

  let boost = EXPLORATION_DEFAULT_BOOST;
  if (ageHours < EXPLORATION_NEW_HOURS) {
    boost = EXPLORATION_NEW_BOOST;
  } else if (idea.view_count < EXPLORATION_UNDEREXPOSED_VIEWS) {
    boost = EXPLORATION_UNDEREXPOSED_BOOST;
  }

  // Seeded random based on idea id for consistency within a session
  // but still provides diversity across ideas
  const hash = simpleHash(idea.id);
  const pseudoRandom = (hash % 1000) / 1000;

  return Math.min(1, pseudoRandom * boost);
}

/**
 * Relevance: placeholder for taste-profile matching.
 * Returns 0.5 (neutral) until taste profiles are implemented.
 */
export function computeRelevance(_idea: Idea, _userId?: string): number {
  // TODO: Implement when taste profiles exist
  // relevance = (category_affinity × 0.5) + (skill_overlap × 0.3) + (complexity_match × 0.2)
  return 0.5;
}

// ============================================
// Composite scoring
// ============================================

export interface RankedIdea extends Idea {
  _rankScore: number;
}

/**
 * Score a single idea for feed ranking.
 */
export function scoreIdea(idea: Idea, options: { authenticated: boolean; userId?: string; now?: Date }): number {
  const now = options.now ?? new Date();
  const freshness = computeFreshness(idea.created_at, now);
  const quality = computeQuality(idea);
  const exploration = computeExploration(idea, now);

  if (!options.authenticated) {
    return (
      freshness * ANONYMOUS_WEIGHTS.freshness +
      quality * ANONYMOUS_WEIGHTS.quality +
      exploration * ANONYMOUS_WEIGHTS.exploration
    );
  }

  const relevance = computeRelevance(idea, options.userId);
  return (
    relevance * AUTHENTICATED_WEIGHTS.relevance +
    freshness * AUTHENTICATED_WEIGHTS.freshness +
    quality * AUTHENTICATED_WEIGHTS.quality +
    exploration * AUTHENTICATED_WEIGHTS.exploration
  );
}

/**
 * Rank an array of ideas by feed score (descending).
 * Returns new array — does not mutate input.
 */
export function rankIdeas(
  ideas: Idea[],
  options: { authenticated: boolean; userId?: string; now?: Date },
): RankedIdea[] {
  const now = options.now ?? new Date();
  return ideas
    .map((idea) => ({
      ...idea,
      _rankScore: scoreIdea(idea, { ...options, now }),
    }))
    .sort((a, b) => b._rankScore - a._rankScore);
}

// ============================================
// Helpers
// ============================================

/** Simple string hash for deterministic pseudo-random per idea */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}
