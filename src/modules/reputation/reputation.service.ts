/**
 * Reputation & Quality Scoring Service
 *
 * Three systems, all opaque to users:
 * 1. Spark (author reputation) — visible number + tier badge, non-linear formula
 * 2. Quality Score (per-idea visibility) — invisible, affects feed ranking
 * 3. Trust Score (per-author) — invisible, affects moderation + quality penalties
 *
 * The math is intentionally multi-layered:
 * - Logarithmic scaling (diminishing returns at higher levels)
 * - Per-idea caps (breadth > one viral hit)
 * - Velocity dampening (anti-gaming)
 * - Display fuzzing (prevents reverse-engineering exact formulas)
 * - Signal saturation + age curves on quality (prevents stale dominance)
 *
 * Currently localStorage-backed (demo mode).
 * Swap to Supabase by replacing read/write helpers.
 */

import {
  SPARK_TIERS,
  SPARK_RAW_WEIGHTS,
  SPARK_PER_IDEA_CAP,
  SPARK_LOG_BASE,
  SPARK_LOG_SCALE,
  SPARK_VELOCITY_WINDOW_MS,
  SPARK_VELOCITY_DAMPENING,
  SPARK_DISPLAY_FUZZ_FACTOR,
  QUALITY_INITIAL,
  QUALITY_MIN,
  QUALITY_MAX,
  QUALITY_POSITIVE,
  QUALITY_NEGATIVE,
  QUALITY_AGE_HALF_LIFE_DAYS,
  QUALITY_SATURATION_POINT,
  QUALITY_MOMENTUM_WINDOW_MS,
  QUALITY_MOMENTUM_AMPLIFIER,
  QUALITY_MOMENTUM_BASE_EVENTS,
  TRUST_INITIAL,
  TRUST_MIN,
  TRUST_MAX,
  TRUST_MODERATION_THRESHOLD,
  TRUST_LOW_VISIBILITY_THRESHOLD,
  TRUST_QUALITY_MULTIPLIERS,
} from "./reputation.config";
import type {
  AuthorReputation,
  IdeaQuality,
  AuthorTrust,
  PromptFeedback,
  PromptFeedbackRecord,
} from "./reputation.types";
import { getProfileById } from "@/data/seed-profiles";

// ============================================
// Storage Keys
// ============================================
const SPARK_RAW_KEY = "inspo-spark-raw"; // { [authorId]: number } — raw accumulated spark
const SPARK_EVENTS_KEY = "inspo-spark-events"; // { [authorId]: number[] } — timestamps for velocity
const SPARK_PER_IDEA_KEY = "inspo-spark-per-idea"; // { [ideaId]: number } — per-idea accumulator
const QUALITY_KEY = "inspo-quality-scores"; // { [ideaId]: number }
const QUALITY_SIGNALS_KEY = "inspo-quality-signals"; // { [ideaId]: number } — total signal count
const QUALITY_EVENTS_KEY = "inspo-quality-events"; // { [ideaId]: number[] } — timestamps for momentum
const TRUST_KEY = "inspo-trust-scores"; // { [authorId]: number }
const FEEDBACK_KEY = "inspo-prompt-feedback"; // PromptFeedbackRecord[]
const IDEA_AUTHOR_MAP_KEY = "inspo-idea-author-map"; // { [ideaId]: authorId }

// ============================================
// Generic localStorage helpers
// ============================================
function readMap(key: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function writeMap(key: string, data: Record<string, number>) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function readJsonMap<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function writeJsonMap<T>(key: string, data: Record<string, T>) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function readList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeList<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================
// SPARK (Author Reputation) — Non-linear pipeline
// ============================================

/**
 * Get raw (pre-transform) spark for an author.
 * Falls back to seed profile reputation_score for demo realism.
 */
function getRawSpark(authorId: string): number {
  const stored = readMap(SPARK_RAW_KEY)[authorId];
  if (stored !== undefined) return stored;
  const profile = getProfileById(authorId);
  return profile?.reputation_score ?? 0;
}

/**
 * Apply velocity dampening — recent rapid events reduce the effective weight.
 * Returns a multiplier 0-1.
 */
function getVelocityMultiplier(authorId: string): number {
  const events = readJsonMap<number[]>(SPARK_EVENTS_KEY);
  const timestamps = events[authorId] ?? [];
  const now = Date.now();
  const recentCount = timestamps.filter(
    (t) => now - t < SPARK_VELOCITY_WINDOW_MS,
  ).length;
  // Each event in the window dampens the next one
  return Math.pow(SPARK_VELOCITY_DAMPENING, recentCount);
}

/**
 * Record a spark event timestamp for velocity tracking.
 */
function recordSparkEvent(authorId: string): void {
  const events = readJsonMap<number[]>(SPARK_EVENTS_KEY);
  const timestamps = events[authorId] ?? [];
  const now = Date.now();
  // Keep only events within the window
  timestamps.push(now);
  events[authorId] = timestamps.filter(
    (t) => now - t < SPARK_VELOCITY_WINDOW_MS * 2, // keep 2x window for overlap
  );
  writeJsonMap(SPARK_EVENTS_KEY, events);
}

/**
 * Check and enforce per-idea spark cap.
 * Returns the effective delta (may be reduced or zero if cap reached).
 */
function applyPerIdeaCap(ideaId: string, rawDelta: number): number {
  if (rawDelta <= 0) return rawDelta; // negatives bypass cap
  const perIdea = readMap(SPARK_PER_IDEA_KEY);
  const current = perIdea[ideaId] ?? 0;
  const headroom = Math.max(0, SPARK_PER_IDEA_CAP - current);
  const effective = Math.min(rawDelta, headroom);
  if (effective > 0) {
    perIdea[ideaId] = current + effective;
    writeMap(SPARK_PER_IDEA_KEY, perIdea);
  }
  return effective;
}

/**
 * Transform raw spark to displayed spark via logarithmic scaling.
 *   displayed = base * ln(1 + raw / scale)
 * This is the core "hard to reverse-engineer" transform.
 */
function transformSpark(raw: number): number {
  if (raw <= 0) return 0;
  return SPARK_LOG_BASE * Math.log(1 + raw / SPARK_LOG_SCALE);
}

/**
 * Apply display fuzzing — seeded by author id for consistency,
 * but makes exact calculation impossible from the outside.
 */
function fuzzDisplay(spark: number, authorId: string): number {
  if (spark < 10) return Math.round(spark); // no fuzz at low levels
  const hash = simpleHash(authorId);
  const fuzzRange = spark * SPARK_DISPLAY_FUZZ_FACTOR;
  // Deterministic offset from hash — same author always gets same fuzz
  const offset = ((hash % 1000) / 500 - 1) * fuzzRange; // range: -fuzz to +fuzz
  return Math.round(spark + offset);
}

/**
 * Adjust raw spark for an author. Goes through the full pipeline:
 * 1. Per-idea cap check
 * 2. Velocity dampening
 * 3. Write raw value
 */
export function adjustSpark(
  authorId: string,
  rawDelta: number,
  ideaId?: string,
): number {
  // Step 1: Per-idea cap (if we know which idea triggered this)
  let effectiveDelta = ideaId
    ? applyPerIdeaCap(ideaId, rawDelta)
    : rawDelta;

  // Step 2: Velocity dampening (only for positive gains)
  if (effectiveDelta > 0) {
    const velocityMult = getVelocityMultiplier(authorId);
    effectiveDelta *= velocityMult;
    recordSparkEvent(authorId);
  }

  // Step 3: Write raw spark
  const scores = readMap(SPARK_RAW_KEY);
  const current = scores[authorId] ?? getRawSpark(authorId);
  const next = Math.max(0, current + effectiveDelta);
  scores[authorId] = next;
  writeMap(SPARK_RAW_KEY, scores);
  return next;
}

/**
 * Get the displayed spark value for an author.
 * Pipeline: raw → log transform → fuzz
 */
export function getAuthorSpark(authorId: string): number {
  const raw = getRawSpark(authorId);
  const transformed = transformSpark(raw);
  return fuzzDisplay(transformed, authorId);
}

/**
 * Get full reputation info for an author (spark, tier, progress).
 */
export function getAuthorReputation(authorId: string): AuthorReputation {
  const spark = getAuthorSpark(authorId);
  const tierIndex = [...SPARK_TIERS]
    .reverse()
    .findIndex((t) => spark >= t.min);
  const actualIndex =
    tierIndex === -1 ? 0 : SPARK_TIERS.length - 1 - tierIndex;
  const tier = SPARK_TIERS[actualIndex];
  const nextTier =
    actualIndex < SPARK_TIERS.length - 1
      ? SPARK_TIERS[actualIndex + 1]
      : null;

  const progress = nextTier
    ? (spark - tier.min) / (nextTier.min - tier.min)
    : 1;

  return { spark, tier, nextTier, progress: clamp(progress, 0, 1) };
}

// ============================================
// QUALITY SCORE — Non-linear, multi-factor
// ============================================

/**
 * Get the quality momentum multiplier for an idea.
 * High recent engagement → amplified signals (trending effect).
 */
function getQualityMomentum(ideaId: string): number {
  const events = readJsonMap<number[]>(QUALITY_EVENTS_KEY);
  const timestamps = events[ideaId] ?? [];
  const now = Date.now();
  const recentCount = timestamps.filter(
    (t) => now - t < QUALITY_MOMENTUM_WINDOW_MS,
  ).length;
  // Ramp up to max amplifier based on recent event count
  const momentum = Math.min(
    QUALITY_MOMENTUM_AMPLIFIER,
    1 + (recentCount / QUALITY_MOMENTUM_BASE_EVENTS) * (QUALITY_MOMENTUM_AMPLIFIER - 1),
  );
  return momentum;
}

/**
 * Record a quality event for momentum tracking.
 */
function recordQualityEvent(ideaId: string): void {
  const events = readJsonMap<number[]>(QUALITY_EVENTS_KEY);
  const timestamps = events[ideaId] ?? [];
  timestamps.push(Date.now());
  // Keep recent only
  const now = Date.now();
  events[ideaId] = timestamps.filter(
    (t) => now - t < QUALITY_MOMENTUM_WINDOW_MS * 2,
  );
  writeJsonMap(QUALITY_EVENTS_KEY, events);
}

/**
 * Compute the age dampening factor for an idea.
 * Older ideas' signals are worth less.
 */
function getAgeFactor(ideaCreatedAt?: string): number {
  if (!ideaCreatedAt) return 1;
  const daysOld = Math.max(
    0,
    (Date.now() - new Date(ideaCreatedAt).getTime()) / 86_400_000,
  );
  return 1 / (1 + daysOld / QUALITY_AGE_HALF_LIFE_DAYS);
}

/**
 * Compute signal saturation factor — diminishing returns after many signals.
 */
function getSaturationFactor(ideaId: string): number {
  const signals = readMap(QUALITY_SIGNALS_KEY);
  const count = signals[ideaId] ?? 0;
  return 1 / Math.pow(1 + count / QUALITY_SATURATION_POINT, 0.5);
}

/**
 * Increment signal count for saturation tracking.
 */
function recordSignal(ideaId: string): void {
  const signals = readMap(QUALITY_SIGNALS_KEY);
  signals[ideaId] = (signals[ideaId] ?? 0) + 1;
  writeMap(QUALITY_SIGNALS_KEY, signals);
}

/**
 * Get trust-based penalty multiplier for an author's ideas.
 */
function getTrustPenaltyMultiplier(authorId?: string): number {
  if (!authorId) return 1;
  const trust = getAuthorTrust(authorId);
  if (trust < TRUST_QUALITY_MULTIPLIERS.critical.threshold) {
    return TRUST_QUALITY_MULTIPLIERS.critical.multiplier;
  }
  if (trust < TRUST_QUALITY_MULTIPLIERS.low.threshold) {
    return TRUST_QUALITY_MULTIPLIERS.low.multiplier;
  }
  return 1;
}

export function getIdeaQuality(ideaId: string): number {
  return readMap(QUALITY_KEY)[ideaId] ?? QUALITY_INITIAL;
}

/**
 * Adjust quality score with full non-linear pipeline:
 * 1. Momentum amplification
 * 2. Age dampening
 * 3. Signal saturation
 * 4. Trust penalty multiplier (for negatives)
 */
export function adjustIdeaQuality(
  ideaId: string,
  baseDelta: number,
  options?: { ideaCreatedAt?: string; authorId?: string },
): number {
  let delta = baseDelta;

  // Momentum — recent engagement amplifies signals
  const momentum = getQualityMomentum(ideaId);
  delta *= momentum;

  // Age — older ideas' signals dampened
  delta *= getAgeFactor(options?.ideaCreatedAt);

  // Saturation — diminishing returns after many signals
  delta *= getSaturationFactor(ideaId);

  // Trust penalty — low-trust authors get harsher negatives
  if (delta < 0 && options?.authorId) {
    delta *= getTrustPenaltyMultiplier(options.authorId);
  }

  // Track for future calculations
  recordQualityEvent(ideaId);
  recordSignal(ideaId);

  // Apply
  const scores = readMap(QUALITY_KEY);
  const current = scores[ideaId] ?? QUALITY_INITIAL;
  const next = clamp(current + delta, QUALITY_MIN, QUALITY_MAX);
  scores[ideaId] = next;
  writeMap(QUALITY_KEY, scores);
  return next;
}

export function getIdeaQualityDetail(ideaId: string): IdeaQuality {
  const score = getIdeaQuality(ideaId);
  const feedback = getPromptFeedback(ideaId);
  const total = feedback.length;
  const negative = feedback.filter((f) => f.feedback === "didnt_work").length;

  return {
    score,
    positiveSignals: total - negative,
    negativeSignals: negative,
    didntWorkRate: total > 0 ? negative / total : 0,
  };
}

// ============================================
// TRUST SCORE (Author-level, internal)
// ============================================

export function getAuthorTrust(authorId: string): number {
  return readMap(TRUST_KEY)[authorId] ?? TRUST_INITIAL;
}

export function adjustAuthorTrust(authorId: string, delta: number): number {
  const scores = readMap(TRUST_KEY);
  const current = scores[authorId] ?? TRUST_INITIAL;
  const next = clamp(current + delta, TRUST_MIN, TRUST_MAX);
  scores[authorId] = next;
  writeMap(TRUST_KEY, scores);
  return next;
}

export function getAuthorTrustDetail(authorId: string): AuthorTrust {
  const score = getAuthorTrust(authorId);
  return {
    score,
    requiresModeration: score < TRUST_MODERATION_THRESHOLD,
    reducedVisibility: score < TRUST_LOW_VISIBILITY_THRESHOLD,
  };
}

// ============================================
// PROMPT FEEDBACK
// ============================================

export function getPromptFeedback(ideaId: string): PromptFeedbackRecord[] {
  return readList<PromptFeedbackRecord>(FEEDBACK_KEY).filter(
    (f) => f.idea_id === ideaId,
  );
}

export function getAllPromptFeedback(): PromptFeedbackRecord[] {
  return readList<PromptFeedbackRecord>(FEEDBACK_KEY);
}

export function hasUserGivenFeedback(ideaId: string, userId: string): boolean {
  return readList<PromptFeedbackRecord>(FEEDBACK_KEY).some(
    (f) => f.idea_id === ideaId && f.user_id === userId,
  );
}

export function submitPromptFeedback(
  ideaId: string,
  userId: string,
  feedback: PromptFeedback,
  reason?: string,
): void {
  if (hasUserGivenFeedback(ideaId, userId)) return;

  const record: PromptFeedbackRecord = {
    idea_id: ideaId,
    user_id: userId,
    feedback,
    reason,
    created_at: new Date().toISOString(),
  };

  const all = readList<PromptFeedbackRecord>(FEEDBACK_KEY);
  all.push(record);
  writeList(FEEDBACK_KEY, all);

  if (feedback === "didnt_work") {
    adjustIdeaQuality(ideaId, QUALITY_NEGATIVE.prompt_didnt_work);
  } else {
    adjustIdeaQuality(ideaId, QUALITY_POSITIVE.copy * 0.4);
  }
}

// ============================================
// COMPOSITE EVENT HANDLER
// ============================================

/**
 * Central handler for engagement events.
 * Call this from UI actions — it updates all three systems at once.
 *
 * Spark: only the idea AUTHOR earns spark (Reddit model).
 * Quality: the idea's visibility score adjusts.
 * Trust: author trust adjusts on negative signals.
 */
export function recordEngagement(event: EngagementEvent): void {
  switch (event.type) {
    case "save":
      adjustIdeaQuality(event.ideaId, QUALITY_POSITIVE.save, {
        authorId: event.authorId,
      });
      if (event.authorId)
        adjustSpark(event.authorId, SPARK_RAW_WEIGHTS.idea_saved, event.ideaId);
      break;

    case "unsave":
      adjustIdeaQuality(event.ideaId, QUALITY_NEGATIVE.unsave, {
        authorId: event.authorId,
      });
      // Unsave reduces raw spark — but through the pipeline it's non-obvious
      if (event.authorId)
        adjustSpark(event.authorId, -SPARK_RAW_WEIGHTS.idea_saved * 0.4, event.ideaId);
      break;

    case "copy":
      adjustIdeaQuality(event.ideaId, QUALITY_POSITIVE.copy, {
        authorId: event.authorId,
      });
      if (event.authorId)
        adjustSpark(event.authorId, SPARK_RAW_WEIGHTS.idea_copied, event.ideaId);
      break;

    case "built":
      adjustIdeaQuality(event.ideaId, QUALITY_POSITIVE.built, {
        authorId: event.authorId,
      });
      if (event.authorId)
        adjustSpark(event.authorId, SPARK_RAW_WEIGHTS.idea_built, event.ideaId);
      break;

    case "comment":
      adjustIdeaQuality(event.ideaId, QUALITY_POSITIVE.comment, {
        authorId: event.authorId,
      });
      if (event.authorId)
        adjustSpark(event.authorId, SPARK_RAW_WEIGHTS.idea_commented, event.ideaId);
      break;

    case "view_long":
      adjustIdeaQuality(event.ideaId, QUALITY_POSITIVE.long_dwell, {
        authorId: event.authorId,
      });
      break;

    case "view_short":
      adjustIdeaQuality(event.ideaId, QUALITY_NEGATIVE.quick_scroll_past, {
        authorId: event.authorId,
      });
      break;

    case "report":
      adjustIdeaQuality(event.ideaId, QUALITY_NEGATIVE.report, {
        authorId: event.authorId,
      });
      if (event.authorId) adjustAuthorTrust(event.authorId, -5);
      break;

    case "prompt_feedback":
      if (event.feedback) {
        submitPromptFeedback(
          event.ideaId,
          event.actorId || "anonymous",
          event.feedback,
          event.feedbackReason,
        );
        if (event.feedback === "didnt_work" && event.authorId) {
          adjustSpark(
            event.authorId,
            SPARK_RAW_WEIGHTS.prompt_didnt_work,
            event.ideaId,
          );
          adjustAuthorTrust(event.authorId, -3);
        }
      }
      break;
  }
}

export interface EngagementEvent {
  type:
    | "save"
    | "unsave"
    | "copy"
    | "built"
    | "comment"
    | "view_long"
    | "view_short"
    | "report"
    | "prompt_feedback";
  ideaId: string;
  authorId?: string;
  actorId?: string;
  feedback?: PromptFeedback;
  feedbackReason?: string;
}

// ============================================
// Helpers
// ============================================

/** Simple string hash for deterministic pseudo-random */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}
