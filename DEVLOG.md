# DEVLOG — OpenClaw Inspo App

Development log. Every significant change, decision, and milestone tracked here.

Spec: See `~/.openclaw/workspace/docs/projects/openclaw-inspo-app/SPEC.md`
Repo: https://github.com/manvirgrewal/openclaw-inspo-app

---

## 2026-02-13 — Reputation System, Feed Ranking & Anti-Gaming

### Session 5: Non-Linear Reputation + Feed Ranking Algorithm

**Commits:** `a3fb279` → `e24e31a` (7 commits)

**Architecture Document:**
- [x] `docs/REPUTATION-ARCHITECTURE.md` — full system documentation covering Spark, Quality, Trust, feed ranking, modularity, and Supabase migration path

**Feed Ranking Module** (`src/modules/feed/`):
- [x] `feed-ranking.config.ts` — all ranking weights in one tunable file
- [x] `feed-ranking.service.ts` — `rankIdeas()` with freshness (1-week half-life), quality (reputation + community signals), exploration (new/underexposed boost)
- [x] Authenticated formula: `(relevance × 0.4) + (freshness × 0.25) + (quality × 0.2) + (exploration × 0.15)`
- [x] Anonymous formula: `(freshness × 0.3) + (quality × 0.5) + (exploration × 0.2)`
- [x] Wired into home page — feed now sorted by ranking score

**Non-Linear Spark System** (`src/modules/reputation/`):
- [x] 5-stage pipeline: per-idea cap (120) → velocity dampening (0.88^n) → raw accumulation → log transform (`85 × ln(1 + raw/40)`) → display fuzz (±3%)
- [x] Reddit-style karma model: only earn spark when others engage with YOUR content
- [x] Non-round raw weights (3.2, 1.7, 6.4...) to prevent pattern recognition
- [x] Diminishing returns at higher levels (log transform)
- [x] Per-idea caps prevent one viral idea from carrying entire reputation

**Non-Linear Quality Score:**
- [x] Momentum amplification (trending ideas amplify signals up to 1.3x in 24h window)
- [x] Age dampening (14-day half-life — signals on older ideas worth less)
- [x] Signal saturation (diminishing returns after ~30 signals per idea)
- [x] Trust multiplier (low-trust authors' negatives hit 1.5-2x harder)

**Spark Badge UI** (`src/components/reputation/spark-badge.tsx`):
- [x] Simple display: ✦ + number (no tiers publicly shown — like Reddit karma)
- [x] SSR-safe (useEffect defers localStorage read, no hydration mismatch)
- [x] Shown on: idea cards, idea detail, user profiles

**Anti-Gaming & Authorization Fixes:**
- [x] Self-interaction guard: can't boost own spark by engaging with own ideas
- [x] Guest guard: unauthenticated users cannot affect spark at all
- [x] Engagement deduplication: one user = one spark + one quality adjustment per action type per idea
- [x] Save/unsave properly toggles (unsave reverses spark, clears dedup for re-save)
- [x] Only passive signals (views, scrolls) repeat — all active actions (copy, save, built, comment) deduplicated

**Design Decisions:**
- Removed tier badges from public display (✦ + number is simpler, like Reddit karma)
- Removed spark progress bar from own profile (keeps formula opaque)
- Tiers kept in config for potential future use (hidden achievements, internal thresholds)
- Quality score adjustments also deduplicated (prevents spam-copy visibility gaming)
- Stacks page copy: "Curated bundles" → "Bundles" (any user can create, not admin-only)

**Spec Addendum:**
- [x] Added to SPEC.md documenting reputation system implementation

**Build:** Clean ✅ | **Pushed:** All commits on `main`

**Next up (priority):**
- [ ] Supabase local setup + run migration (OVERDUE — blocking real auth, real data)
- [ ] **SSR conversion for SEO** — idea/stack/user pages must be server components (see `docs/SEO-AUDIT.md`)
- [ ] `sitemap.ts` + `robots.ts` + `generateMetadata` on all public pages
- [ ] Admin/moderation backend (see `docs/ADMIN-MODERATION-SPEC.md`) — tables in initial migration, UI iterative
- [ ] Connect auth to real Supabase Auth
- [ ] Realistic seed data overhaul (current seed profiles have arbitrary reputation_score values)
- [ ] Compute seed spark from actual contributions instead of hardcoded numbers
- [ ] JSON-LD structured data + dynamic OG images
- [ ] Wire `recordEngagement()` into all remaining UI interactions
- [ ] Challenges page
- [ ] Share/embed functionality

---

## 2026-02-11 — Phase 3: Auth Gating, Guest Saves & Social Features

### Session 4: Auth Context, Guest Saves, Comments, Nudges

**Commit:** `77582d0` — `feat: phase 3 - auth context, guest saves, comments, toast, auth-gated submit, navigation updates`

**Auth System:**
- [x] `src/lib/auth/auth-context.tsx` — React context with demo mode (localStorage toggle)
- [x] `useAuth()` hook returning `{ user, isAuthenticated, signIn, signOut }`
- [x] AuthProvider wrapping app in root layout
- [x] Desktop nav: "Sign In" button calls `signIn()` (demo toggle), shows avatar + sign out when authenticated
- [x] Bottom nav: "Me" tab routes to `/auth/login` when guest, `/profile` when authenticated

**Auth-Gated Submit Page:**
- [x] `/submit` checks auth state
- [x] Unauthenticated: friendly page with OAuth buttons, inviting tone, zero pressure
- [x] Authenticated: shows existing submit form unchanged

**Guest Saves (localStorage):**
- [x] `src/hooks/use-guest-saves.ts` — saveIdea, unsaveIdea, isSaved, getSavedIds, getSaveCount
- [x] Max 50 saves for guests
- [x] IdeaCard uses guest saves — toggle works immediately, count updates locally
- [x] Idea detail page uses guest saves with toast feedback

**Toast Notifications:**
- [x] `src/components/common/toast.tsx` — ToastProvider + useToast()
- [x] Auto-dismiss after 2 seconds, positioned above bottom nav on mobile
- [x] Used for: "Copied!", "Idea saved!", "Idea unsaved"

**Comments Section:**
- [x] `src/components/social/comments-section.tsx` — threaded comments with seed data (4 comments)
- [x] Auth-gated: comment input for authenticated, gentle nudge for guests
- [x] Reply button on each comment (auth-gated)
- [x] Added to idea detail page

**Gentle Sign-Up Nudges:**
- [x] Save nudge banner: shows after 5th guest save, dismissible, 7-day cooldown
- [x] Comment nudge: "Want to join the conversation? Sign in to comment" — inline, not blocking
- [x] All nudges are non-modal, non-blocking, non-guilt-tripping

**Other:**
- [x] Clean production build ✅

**Next up:**
- [ ] Supabase local setup + run migration
- [ ] Connect auth to real Supabase Auth
- [ ] Saves/collections page with inline nudge
- [ ] Share/embed functionality
- [ ] Challenges page
- [ ] Real-time save sync when Supabase connects

---

## 2026-02-11 — Project Kickoff

### Session 1: Scaffolding & Foundation

**Commit:** `073341a` — `feat: initial scaffold`

**Created:**
- [x] Next.js 15 project (App Router, TypeScript strict, Tailwind CSS)
- [x] Full directory structure per SPEC (11 modules, 8 component groups, lib, hooks, config)
- [x] Core dependencies installed
- [x] Supabase client/server/middleware setup
- [x] IdeaCard component (copy prompt w/ haptic, save toggle, full-width mobile-first)
- [x] CardSkeleton loading state
- [x] BottomNav (mobile, 5 tabs, safe area support)
- [x] TopBar (sticky, minimal)
- [x] FilterChips (horizontal scroll categories)
- [x] Category config (9 categories, colors, icons)
- [x] Constants config (limits, complexity options, rate limits)
- [x] Idea types + Zod validation schemas
- [x] Root layout (dark mode, Inter font, PWA meta, OG tags)
- [x] Home page with seed data (5 example ideas)
- [x] PWA manifest
- [x] `.env.example`
- [x] GitHub repo created + pushed
- [x] Clean production build ✅

**Next up:**
- [x] Database migration (full SQL schema from SPEC)
- [ ] Supabase local setup
- [x] Idea detail page (`/idea/[slug]`)
- [x] API routes (ideas CRUD, feed)
- [ ] Search page
- [ ] Submit idea page
- [ ] Stack card component + stacks page

---

### Session 2: Phase 1 — Data Foundation Layer

**Commit:** `35974c8` — `feat: phase 1 data foundation`

**Database Migration** (`supabase/migrations/00001_initial_schema.sql`):
- [x] All 23+ tables from SPEC (profiles, ideas, stacks, stack_items, saves, collections, collection_items, comments, built_this, votes, follows, activity, reports, challenges, challenge_entries, user_events, notifications, edit_history, subscription_tiers, user_subscriptions, sponsored_content, idea_templates, user_onboarding, idea_similarity)
- [x] All indexes (GIN for skills/tags/full-text, btree for slugs/timestamps/counts)
- [x] All RLS policies (public read, owner write, admin override patterns)
- [x] Counter triggers: saves→ideas.save_count, built_this→ideas.built_count, comments→ideas.comment_count, follows→profiles.follower_count/following_count
- [x] Auto updated_at triggers on all mutable tables
- [x] Seed data for subscription tiers (free/pro/team)

**Module Types:**
- [x] `src/modules/users/users.types.ts` — Profile, UserOnboarding, ProfileUpdateInput
- [x] `src/modules/stacks/stacks.types.ts` — Stack, StackItem, StackCreateInput
- [x] `src/modules/social/social.types.ts` — Save, Comment, Vote, BuiltThis, Follow, Activity, Report
- [x] `src/modules/challenges/challenges.types.ts` — Challenge, ChallengeEntry

**API Routes (v1 MVP):**
- [x] `GET /api/ideas` — paginated feed with cursor, category/complexity/skills filters, sort (trending/newest/most_saved/most_built)
- [x] `POST /api/ideas` — submit new idea (Zod validated, auto-slug generation)
- [x] `GET /api/ideas/[slug]` — single idea detail with author join
- [x] `POST /api/ideas/[slug]/save` — toggle save/unsave
- [x] `POST /api/ideas/[slug]/vote` — upsert vote (1/-1)
- [x] `GET /api/categories` — static category list from config
- [x] `GET /api/search` — full-text search via Supabase websearch
- [x] `POST /api/events` — user event tracking (sendBeacon, batch support)

**Idea Detail Page** (`src/app/idea/[slug]/page.tsx`):
- [x] Full layout: title, description, body (basic markdown rendering), prompt section
- [x] Large "Copy Prompt" button with haptic feedback
- [x] Author info, published date, stats (saves/built/comments)
- [x] Skills chips, tags, save button
- [x] Back navigation
- [x] 404 fallback for unknown slugs
- [x] Seed data fallback (3 ideas with full body content)
- [x] Dark theme, mobile-first, consistent with existing design

**Other:**
- [x] Middleware deprecation notice for Next.js 16
- [x] Clean production build ✅

**Next up:**
- [ ] Supabase local setup + run migration
- [x] Search page UI
- [x] Submit idea page
- [x] Stack card component + stacks page
- [x] Profile page

---

### Session 3: Phase 2 — User-Facing Pages & Auth Flow

**Commit:** `cf9bc07` — `feat: phase 2 - user-facing pages and auth flow`

**Submit Idea Page** (`src/app/(auth)/submit/page.tsx`):
- [x] Mobile-first form with all fields (title, description, prompt, category chips, complexity chips, skills tag input, tags, body)
- [x] Live preview toggle showing IdeaCard with current form data
- [x] Zod validation via ideaCreateSchema on submit
- [x] Auto-save draft to localStorage (debounced 500ms)
- [x] Character counts on all text fields
- [x] Posts to /api/ideas on submit

**Search Page** (`src/app/search/page.tsx`):
- [x] Auto-focused search input with debounced queries (300ms)
- [x] Results displayed as IdeaCard list
- [x] "No results" empty state
- [x] Recent searches stored in localStorage (max 8, shown when input empty)
- [x] Calls GET /api/search?q=...

**Stack Card + Stacks Pages:**
- [x] `src/components/cards/stack-card.tsx` — emerald accent, "STACK" label, idea count, save count, author, CTA button
- [x] `src/app/stacks/page.tsx` — stack listing with 4 seed stacks, category filtering via FilterChips
- [x] `src/app/stacks/[slug]/page.tsx` — stack detail with numbered ideas, context notes, "Copy All Prompts" button

**User Profile Page** (`src/app/user/[username]/page.tsx`):
- [x] Profile header: avatar placeholder, display name, username, bio, stats
- [x] Setup section: agent platform, active skills
- [x] Radix Tabs: Ideas | Built | Stacks | About
- [x] Pinned section (📌 Pinned) above tabs
- [x] Follow button (UI only)
- [x] Seed data for development

**Auth Pages:**
- [x] `src/app/auth/login/page.tsx` — OAuth buttons (Google, GitHub, Discord), magic link email input
- [x] `src/app/auth/callback/route.ts` — Supabase OAuth code exchange, onboarding redirect for new users
- [x] `src/app/auth/onboarding/page.tsx` — 4-step flow (username, role, interests, platform), progress bar, skippable steps

**Desktop Navigation:**
- [x] `src/components/navigation/desktop-nav.tsx` — sticky top nav, hidden on mobile (md:block)
- [x] Updated `layout.tsx` — mobile: top-bar + bottom-nav, desktop: desktop-nav + bottom-nav hidden

**Other:**
- [x] Clean production build ✅

**Next up:**
- [ ] Supabase local setup + run migration
- [ ] Connect pages to real Supabase data
- [ ] Wire up auth flow end-to-end
- [ ] Share/embed functionality
- [ ] Challenges page

---
