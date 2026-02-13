/**
 * Reputation & Quality Scoring Configuration
 *
 * IMPORTANT: These values are intentionally NOT exposed to users.
 * The formula is opaque by design — multiple non-linear transforms,
 * time-based factors, and internal mixing make reverse-engineering
 * impractical. Tweak freely.
 */

// ============================================
// SPARK (Reputation) — Author-level score
// ============================================

/**
 * Raw engagement weights — these are NOT the final spark values.
 * They feed into a multi-stage pipeline (log scaling, per-idea caps,
 * velocity dampening, time decay) before becoming visible spark.
 * The relationship between engagement and displayed spark is non-linear.
 */
export const SPARK_RAW_WEIGHTS = {
  // Inbound engagement on your ideas (only way to earn spark)
  idea_saved: 3.2,
  idea_copied: 1.7,
  idea_built: 6.4,
  idea_commented: 1.3,
  idea_remixed: 4.1,
  idea_featured_in_stack: 5.8,
  challenge_won: 31,
  first_idea_bonus: 7,

  // Negative (applied to idea author)
  idea_reported_actioned: -13,
  prompt_didnt_work: -2.8,
  idea_removed: -18,
} as const;

/**
 * Per-idea spark cap — a single idea can contribute at most this much
 * raw spark to an author's total. Encourages breadth over one-hit wonders.
 * Applied before the log transform.
 */
export const SPARK_PER_IDEA_CAP = 120;

/**
 * Logarithmic scaling — raw accumulated spark is transformed:
 *   displayed = base * ln(1 + raw / scale)
 * This creates diminishing returns at higher levels.
 * With base=85, scale=40: raw 100 → ~85, raw 500 → ~215, raw 2000 → ~330
 */
export const SPARK_LOG_BASE = 85;
export const SPARK_LOG_SCALE = 40;

/**
 * Velocity dampening — when spark is gained rapidly (many events in short
 * time), each subsequent event in the window is worth less.
 *   effective_weight = raw_weight * (dampening ^ events_in_window)
 * Window is rolling. This prevents gaming via coordinated saves.
 */
export const SPARK_VELOCITY_WINDOW_MS = 3_600_000; // 1 hour
export const SPARK_VELOCITY_DAMPENING = 0.88; // each event worth 88% of previous

/**
 * Display fuzzing — at higher spark values, the displayed number is
 * slightly randomized (seeded by author id) so users can't pinpoint
 * exact formulas. Fuzz range increases with spark level.
 *   fuzz = spark * fuzz_factor (applied as ±)
 * At spark 200, fuzz is ±6. At spark 500, fuzz is ±15.
 */
export const SPARK_DISPLAY_FUZZ_FACTOR = 0.03;

/** Reputation tiers — thresholds based on DISPLAYED (post-transform) spark */
export const SPARK_TIERS = [
  { min: 0, label: "Explorer", icon: "🌱" },
  { min: 20, label: "Builder", icon: "🔧" },
  { min: 75, label: "Creator", icon: "⚡" },
  { min: 200, label: "Innovator", icon: "🔥" },
  { min: 500, label: "Legend", icon: "💎" },
] as const;

/**
 * Daily decay rate for inactive authors.
 * Applied to raw spark from ideas with no engagement in 30+ days.
 * 0.9965 = ~0.35% per day = ~10% per month of stale rep erodes.
 * Aggressive enough to matter, slow enough to be fair.
 */
export const SPARK_DECAY_RATE = 0.9965;

// ============================================
// QUALITY SCORE — Idea-level visibility metric
// ============================================

/**
 * Quality score determines feed ranking / visibility.
 * Range: 0-100 (clamped). Starts at 50 (neutral).
 *
 * The raw deltas below are modified at runtime by:
 * 1. Momentum factor — recent engagement velocity amplifies/dampens signals
 * 2. Age curve — signals on older ideas are worth slightly less
 * 3. Saturation — after many signals, each incremental one matters less
 * 4. Author trust multiplier — low-trust authors' ideas get harsher negatives
 */
export const QUALITY_INITIAL = 50;
export const QUALITY_MIN = 0;
export const QUALITY_MAX = 100;

/** Base positive quality signals (before runtime modifiers) */
export const QUALITY_POSITIVE = {
  save: 1.8,
  copy: 0.9,
  built: 3.6,
  comment: 0.6,
  long_dwell: 0.35,
  remix: 2.4,
} as const;

/** Base negative quality signals (before runtime modifiers) */
export const QUALITY_NEGATIVE = {
  prompt_didnt_work: -3.5,
  quick_scroll_past: -0.12,
  unsave: -1.2,
  report: -6.0,
  report_actioned: -18.0,
} as const;

/**
 * Momentum window — recent engagement velocity affects signal strength.
 * High momentum (lots of engagement recently) amplifies positive signals
 * but also amplifies negative ones. Creates natural trending.
 */
export const QUALITY_MOMENTUM_WINDOW_MS = 86_400_000; // 24 hours
export const QUALITY_MOMENTUM_AMPLIFIER = 1.3; // max multiplier at peak momentum
export const QUALITY_MOMENTUM_BASE_EVENTS = 5; // events needed to reach peak

/**
 * Age curve — signals on older ideas are dampened.
 *   age_factor = 1 / (1 + days_old / age_half_life)
 * At 14 days old, signals are worth ~50% of a fresh idea.
 */
export const QUALITY_AGE_HALF_LIFE_DAYS = 14;

/**
 * Signal saturation — after N total signals on an idea,
 * each additional signal is worth less.
 *   saturation = 1 / (1 + total_signals / saturation_point)^0.5
 */
export const QUALITY_SATURATION_POINT = 30;

/**
 * Engagement ratio threshold — clickbait detection.
 * If views > 50 and (saves + copies + builds) / views < this,
 * apply a soft penalty.
 */
export const LOW_ENGAGEMENT_RATIO_THRESHOLD = 0.02;
export const LOW_ENGAGEMENT_PENALTY = -0.6;

// ============================================
// TRUST SCORE — Author-level, fully internal
// ============================================

/**
 * Trust score affects how new submissions are treated.
 * Range: 0-100. Starts at 50.
 * High trust = auto-publish, feed boost.
 * Low trust = moderation queue, reduced visibility.
 *
 * Trust also acts as a hidden multiplier on quality score penalties:
 *   trust < 40: negative quality signals are 1.5x
 *   trust < 30: negative quality signals are 2x + moderation queue
 */
export const TRUST_INITIAL = 50;
export const TRUST_MIN = 0;
export const TRUST_MAX = 100;

export const TRUST_SIGNALS = {
  idea_published_no_issues: 1,
  high_engagement_idea: 2,
  prompt_didnt_work_on_their_idea: -3,
  report_on_their_idea: -5,
  report_actioned_on_their_idea: -15,
  many_low_quality_ideas: -2,
} as const;

/** Trust-based quality penalty multipliers */
export const TRUST_QUALITY_MULTIPLIERS = {
  low: { threshold: 40, multiplier: 1.5 },
  critical: { threshold: 30, multiplier: 2.0 },
} as const;

export const TRUST_MODERATION_THRESHOLD = 30;
export const TRUST_LOW_VISIBILITY_THRESHOLD = 40;

// ============================================
// PROMPT FEEDBACK
// ============================================

export const PROMPT_FEEDBACK_DELAY_MS = 30_000;
export const DIDNT_WORK_RATE_THRESHOLD = 0.3;
