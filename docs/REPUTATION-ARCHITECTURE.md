# Reputation & Feed Ranking Architecture

## Overview

Three scoring systems work together to surface good content and reward good authors. All formulas are intentionally non-linear and multi-layered — making them difficult to reverse-engineer from the outside (Reddit-style opacity).

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Spark Score    │     │  Quality Score   │     │   Trust Score    │
│  (per-author)    │     │   (per-idea)     │     │  (per-author)    │
│  Visible to all  │     │   Internal only  │     │  Internal only   │
│                  │     │                  │     │                  │
│  Non-linear:     │     │  Multi-factor:   │     │  Affects:        │
│  • Log scaling   │     │  • Momentum      │     │  • Moderation    │
│  • Per-idea caps │     │  • Age decay     │     │  • Quality       │
│  • Velocity damp │     │  • Saturation    │     │    penalties     │
│  • Display fuzz  │     │  • Trust mult    │     │  • Feed exposure │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌────────────────┐               │
         │              │  Feed Ranking  │◄──────────────┘
         │              │    Service     │
         │              └────────┬───────┘
         │                       │
         ▼                       ▼
   Tier badges            Feed sort order
   + spark number         on home page
```

## 1. Spark (Author Reputation) — Non-Linear Pipeline

**What:** A reputation score for each author, earned when other users engage with their content (Reddit model — you can't earn spark by interacting with others' content).

**Visibility:** Public — shown as tier badge + spark number.

### Pipeline (raw engagement → displayed number)

```
User saves an idea
       │
       ▼
┌──────────────────┐
│ 1. Per-Idea Cap  │  Single idea can contribute max 120 raw spark.
│                  │  Encourages breadth over one viral hit.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. Velocity      │  Rapid events in 1-hour window are dampened.
│    Dampening     │  Each event worth 88% of the previous.
│                  │  Prevents coordinated save-bombing.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. Raw Spark     │  Accumulated total (can be large).
│    Stored        │  This is what persists in the database.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. Log Transform │  displayed = 85 × ln(1 + raw / 40)
│                  │  Massive diminishing returns at higher levels.
│                  │  raw 100 → ~85, raw 500 → ~215, raw 2000 → ~330
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. Display Fuzz  │  ±3% variance seeded by author ID.
│                  │  Same author always shows same number,
│                  │  but prevents exact formula reverse-engineering.
└────────┬─────────┘
         │
         ▼
   Displayed Spark Number (what users see)
```

### Why this is hard to game/decipher:
- You can't count saves and predict spark (log transform + per-idea cap + velocity dampening)
- The displayed number has a fuzz factor that varies by user
- Raw weights use non-round numbers (3.2, 1.7, 6.4...) — no obvious patterns
- Diminishing returns mean your 100th save on one idea gives almost nothing
- Rapid coordinated engagement is automatically dampened

### Tiers (based on displayed/post-transform spark)
| Min | Label | Icon |
|-----|-------|------|
| 0 | Explorer | 🌱 |
| 20 | Builder | 🔧 |
| 75 | Creator | ⚡ |
| 200 | Innovator | 🔥 |
| 500 | Legend | 💎 |

### Where displayed:
- Idea cards (small badge next to `@username`) — Explorer tier hidden to reduce noise
- Idea detail page (next to author name)
- Public user profile
- Own profile page (with progress bar to next tier)

### Decay
Raw spark decays at 0.35%/day (~10%/month) for ideas with no engagement in 30+ days. Active authors don't decay. This prevents "post once, coast forever."

## 2. Quality Score (Idea Visibility) — Multi-Factor

**What:** A 0–100 score per idea controlling feed visibility. Users never see this number.

### Signal modifiers (every signal goes through all of these):

**Momentum** — Ideas with high recent engagement (24h window) get amplified signals (up to 1.3x). Creates natural trending behavior. Works both ways — a pile-on of reports also gets amplified.

**Age dampening** — Signals on older ideas are worth less. Half-life of 14 days. A save on day 1 is worth 2x a save on day 14.

**Signal saturation** — After ~30 total signals on an idea, each incremental one matters less. Formula: `1 / sqrt(1 + count/30)`. Prevents any single idea from reaching 100 quality through sheer volume.

**Trust multiplier** — If the idea's author has low trust score:
- Trust < 40: negative signals are 1.5x
- Trust < 30: negative signals are 2x

This means low-trust authors' bad ideas sink faster.

### The result:
The same "save" action could produce different quality deltas depending on:
1. How many other events happened in the last 24h (momentum)
2. How old the idea is (age)
3. How many total signals the idea has received (saturation)
4. The author's trust score (for negatives)

Making it impossible to predict the exact quality impact of any single action.

## 3. Trust Score (Author Moderation)

**What:** Internal 0–100 score per author. Starts at 50.

**Effects:**
- Below 40: Reduced feed exposure + harsher quality penalties (1.5x negatives)
- Below 30: Moderation queue + even harsher penalties (2x negatives)

**Trust feeds back into Quality** — creating a compounding loop. Bad actors' content sinks exponentially faster.

## 4. Feed Ranking Algorithm

Located in `src/modules/feed/`. Consumes quality scores but doesn't know how they're calculated — clean separation.

### Authenticated Users
```
score = (relevance × 0.4) + (freshness × 0.25) + (quality × 0.2) + (exploration × 0.15)
```

### Anonymous/Demo Users
```
score = (freshness × 0.3) + (quality × 0.5) + (exploration × 0.2)
```

### Components

**Freshness:** `1 / (1 + hours / 168)` — one-week half-life decay.

**Quality:** Blends reputation quality score (60%) with log-based community signals (40%). The reputation score is itself non-linear (see above), so this is a non-linear function of a non-linear input.

**Exploration:** Deterministic pseudo-random boost per idea ID. New (<48h): 2x boost. Underexposed (<100 views): 1.5x. Ensures niche content gets discovered.

**Relevance:** Placeholder (returns 0.5). Future: taste profile matching.

## 5. How to Modify

### Tune weights/thresholds
Edit `reputation.config.ts` or `feed-ranking.config.ts`. All tunables are named constants with explanatory comments.

### Change spark formula
Modify the pipeline functions in `reputation.service.ts`: `transformSpark()`, `getVelocityMultiplier()`, `applyPerIdeaCap()`, `fuzzDisplay()`. Each is independent — swap or remove any stage.

### Change quality formula
Modify the factor functions: `getQualityMomentum()`, `getAgeFactor()`, `getSaturationFactor()`, `getTrustPenaltyMultiplier()`. All applied in `adjustIdeaQuality()`.

### Replace the feed algorithm entirely
Swap the `rankIdeas()` call in the home page. The feed module is self-contained.

### Add new signals
1. Add weight to `reputation.config.ts`
2. Add case to `recordEngagement()` in `reputation.service.ts`
3. Feed ranking picks up quality changes automatically

## 6. Supabase Migration Path

### Current State (localStorage)
All data access goes through helper functions:
- `readMap(key)` / `writeMap(key, data)` — for score maps
- `readJsonMap(key)` / `writeJsonMap(key, data)` — for complex structures (event timestamps)
- `readList(key)` / `writeList(key, data)` — for feedback records

### Migration Steps
1. Create tables: `author_spark_raw`, `idea_quality`, `author_trust`, `prompt_feedback`, `spark_events`, `quality_events`
2. Replace localStorage helpers with Supabase client calls
3. Move `recordEngagement()` to a server action or API route
4. Spark transform pipeline stays as-is (it's pure math on the raw value)
5. Consider moving the log transform + fuzz to a Postgres computed column or view

### What stays the same
- All scoring logic (pure functions)
- All UI components (same service interface)
- Config values
- Feed ranking module (only consumes `getIdeaQuality()`)

## File Map

```
src/modules/
├── reputation/
│   ├── reputation.config.ts    # All tunables: weights, caps, thresholds, decay rates
│   ├── reputation.types.ts     # TypeScript interfaces
│   └── reputation.service.ts   # Non-linear scoring pipeline + recordEngagement()
├── feed/
│   ├── feed-ranking.config.ts  # Feed ranking weights
│   └── feed-ranking.service.ts # rankIdeas(), score components
src/components/
└── reputation/
    └── spark-badge.tsx         # SparkBadge (inline) + SparkProgress (profile)
```
