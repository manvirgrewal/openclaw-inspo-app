# Admin & Moderation Backend — Specification

**Status:** Pre-Build  
**Parent:** SPEC.md  
**Priority:** Build alongside Supabase migration  

---

## 1. Overview

This platform lets users submit prompts that other users paste into AI agents. That's a uniquely dangerous attack surface — a malicious "idea" isn't just spam, it's potentially a weapon (prompt injection, social engineering, data exfiltration via crafted prompts). The admin/moderation backend is not a nice-to-have — it's safety infrastructure.

### Threat Model

| Threat | Severity | Example |
|---|---|---|
| **Prompt injection** | 🔴 Critical | "Idea" contains hidden instructions that hijack the user's AI agent |
| **Social engineering** | 🔴 Critical | Prompt tricks agent into revealing user's private data |
| **Data exfiltration** | 🔴 Critical | Prompt instructs agent to send files/data to external endpoint |
| **Spam/SEO abuse** | 🟡 Medium | Low-quality content farming for backlinks or visibility |
| **Coordinated manipulation** | 🟡 Medium | Fake accounts boosting content via saves/built-this |
| **Harassment** | 🟡 Medium | Abusive comments, targeted reporting |
| **Copyright/IP theft** | 🟠 Low-Med | Reposting others' prompts without attribution |
| **NSFW/illegal content** | 🟡 Medium | Inappropriate content in descriptions or prompts |

### Design Principles

1. **Safety first** — prompts are code that runs in people's AI agents. Treat submissions like code review.
2. **Trust is earned** — new users' content goes through more scrutiny. Trust score gates auto-publish.
3. **Transparency** — users should know why content was removed (generic reason categories, not detailed explanations that help evade).
4. **Auditability** — every moderation action is logged with who, what, when, why.
5. **Scalability** — heuristics first, ML later. Design for human-in-the-loop that can progressively automate.

---

## 2. Roles & Permissions

Three roles, checked at both API and RLS level:

| Permission | User | Moderator | Admin |
|---|---|---|---|
| Browse/copy/save | ✅ | ✅ | ✅ |
| Submit ideas | ✅ | ✅ | ✅ |
| Report content | ✅ | ✅ | ✅ |
| View moderation queue | ❌ | ✅ | ✅ |
| Approve/reject content | ❌ | ✅ | ✅ |
| Edit any idea (title, description, tags) | ❌ | ✅ | ✅ |
| Remove content | ❌ | ✅ | ✅ |
| Issue warnings | ❌ | ✅ | ✅ |
| View user trust/spark internals | ❌ | ✅ | ✅ |
| Ban/suspend users | ❌ | ❌ | ✅ |
| Manage roles (promote/demote) | ❌ | ❌ | ✅ |
| Create featured/curated stacks | ❌ | ✅ | ✅ |
| View audit log | ❌ | 🟡 Own actions | ✅ All |
| Manage feature flags | ❌ | ❌ | ✅ |
| View platform analytics | ❌ | ❌ | ✅ |
| Configure safety rules | ❌ | ❌ | ✅ |

---

## 3. Content Pipeline

Every piece of user-generated content flows through this pipeline:

```
User submits idea/comment/stack
         │
         ▼
┌────────────────────┐
│ 1. Input Validation │  Zod schema, size limits, character checks
│    (instant)        │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 2. Safety Scan     │  Heuristic checks on prompt content
│    (instant)       │  (see §5 Content Safety)
└────────┬───────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 PASS       FLAG
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│ Trust  │ │ Moderation │
│ Check  │ │ Queue      │
└───┬────┘ │ (manual)   │
    │      └─────┬──────┘
  ┌─┴──┐        │
  │    │    ┌───┴───┐
  ▼    ▼    ▼       ▼
AUTO  QUEUE APPROVE REJECT
PUBLISH │     │       │
  │     │     │       ▼
  │     ▼     ▼    Removed +
  │   Manual  Published  Warning
  │   Review     │
  ▼     │        │
Published ▼      │
  │   Published  │
  │   or         │
  │   Rejected   │
  ▼              ▼
┌────────────────────┐
│ 3. Ongoing Monitor │  Quality score tracking, report handling,
│    (continuous)     │  pattern detection
└────────────────────┘
```

### Trust-Based Auto-Publish

| Trust Score | Behavior |
|---|---|
| ≥ 70 | Auto-publish (bypass queue) |
| 40–69 | Auto-publish, but flagged for async review |
| 30–39 | Queued for manual review before publishing |
| < 30 | Queued + account under enhanced scrutiny |

New accounts start at 50 (auto-publish with async review).

---

## 4. Admin Panel Pages

### Route Structure

```
/admin                          → Dashboard
/admin/queue                    → Moderation queue (pending content)
/admin/reports                  → User reports inbox
/admin/content                  → All content browser (ideas, stacks, comments)
/admin/content/[id]             → Content detail + moderation actions
/admin/users                    → User management
/admin/users/[id]               → User detail (trust, spark, history, actions)
/admin/stacks/featured          → Curated/featured stacks management
/admin/safety                   → Safety rules & scanning config
/admin/audit                    → Audit log
/admin/analytics                → Platform stats (v2)
```

All `/admin` routes protected by middleware checking `role in ('admin', 'moderator')`.

### 4.1 Dashboard (`/admin`)

The home screen. At-a-glance health of the platform.

```
┌─────────────────────────────────────────────────────┐
│  📊 Platform Overview                    [Last 24h] │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ 12       │ │ 3        │ │ 47       │ │ 891    │ │
│  │ Pending  │ │ Reports  │ │ New Ideas│ │ Active │ │
│  │ Review   │ │ Open     │ │ Today    │ │ Users  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                     │
│  ⚠️ Attention Needed                                │
│  ├─ 3 reports awaiting review                       │
│  ├─ 2 ideas auto-flagged by safety scan             │
│  └─ 1 user with rapid trust decline                 │
│                                                     │
│  📈 Recent Activity                                 │
│  ├─ mod_sarah approved "Git Commit Helper" (2m ago) │
│  ├─ system flagged "Free API Keys" (15m ago)        │
│  └─ admin_manvir banned user toxic123 (1h ago)      │
│                                                     │
│  🔥 Trending (last 24h)                             │
│  ├─ "Morning Briefing Agent" — 42 saves             │
│  ├─ "Expense Auto-Tracker" — 31 saves               │
│  └─ "Meeting Prep Assistant" — 28 saves             │
└─────────────────────────────────────────────────────┘
```

### 4.2 Moderation Queue (`/admin/queue`)

Content awaiting review. Sorted by priority (safety flags first, then age).

**For each item:**
- Full content preview (title, description, prompt — with safety flags highlighted)
- Author info (username, trust score, account age, previous submissions)
- Why it's in the queue (low trust / safety flag / manual flag)
- One-click actions: **Approve** | **Reject** | **Edit & Approve** | **Request Changes**

**Rejection reasons (predefined + custom):**
- Prompt safety concern
- Spam / low quality
- Duplicate content
- Misleading description
- Copyright / attribution issue
- Violates community guidelines
- Custom reason (freetext)

### 4.3 Reports Inbox (`/admin/reports`)

User-submitted reports. Grouped by target.

**For each report:**
- Reported content (full preview)
- Reporter info
- Report reason + details
- Number of reports on this same content (pattern indicator)
- Previous moderation actions on this content/author
- Actions: **Dismiss** | **Warn Author** | **Remove Content** | **Ban Author**

**Auto-escalation:** If an item gets 3+ reports from different users, auto-flag and bump to top of queue.

### 4.4 Content Browser (`/admin/content`)

Search and browse all content with filters:

- Status: published / pending / flagged / removed / draft
- Type: idea / stack / comment
- Date range
- Author
- Quality score range
- Trust score of author
- Has reports (yes/no)
- Free text search

Bulk actions: select multiple → approve / remove / flag

### 4.5 User Management (`/admin/users`)

**User list with:**
- Username, role, account age, trust score, spark (raw + displayed)
- Idea count, report count (as reporter + as target)
- Status: active / warned / suspended / banned
- Filters: role, trust range, status, account age, flagged

**User detail (`/admin/users/[id]`):**
- Full profile info
- Trust score breakdown (why it's at this level)
- Spark internals (raw vs displayed, per-idea breakdown)
- Content history (all ideas, comments, stacks — with quality scores)
- Engagement history (saves, copies, builds — including dedup log)
- Report history (reports they filed + reports against them)
- Moderation history (all actions taken on/by this user)
- Actions: **Warn** | **Suspend (temp)** | **Ban** | **Change Role** | **Reset Trust** | **Reset Spark**

### 4.6 Featured Stacks (`/admin/stacks/featured`)

Create and manage admin-curated stacks:
- Create stack with `is_featured: true`
- Reorder featured stacks (drag-and-drop position)
- Schedule featured stacks (start/end dates — e.g., "Holiday Automation Stack" for Dec)
- Pin to feed (inject into feed at position N)

### 4.7 Audit Log (`/admin/audit`)

Immutable log of every moderation action.

**Schema:**
```sql
create table public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),     -- who performed the action
  actor_role text not null,                   -- role at time of action
  action text not null,                       -- see action types below
  target_type text not null,                  -- 'idea', 'comment', 'user', 'stack', 'report'
  target_id uuid not null,
  reason text,                                -- predefined or custom
  details jsonb,                              -- any extra context (old status, new status, etc.)
  created_at timestamptz default now()
);

create index idx_modlog_actor on moderation_log(actor_id);
create index idx_modlog_target on moderation_log(target_type, target_id);
create index idx_modlog_created on moderation_log(created_at desc);
```

**Action types:**
- `content_approved`, `content_rejected`, `content_removed`, `content_edited`
- `content_flagged`, `content_unflagged`
- `user_warned`, `user_suspended`, `user_unsuspended`, `user_banned`, `user_unbanned`
- `role_changed` (details: `{ from: "user", to: "moderator" }`)
- `report_dismissed`, `report_actioned`
- `trust_reset`, `spark_reset`
- `stack_featured`, `stack_unfeatured`
- `safety_rule_updated`

**RLS:** Admins see all. Moderators see their own actions only.

---

## 5. Content Safety Pipeline

### 5.1 Heuristic Scanning (v1 — Launch)

Run on every idea submission. Fast, no external dependencies.

**Prompt-specific checks:**

| Check | What it catches | Action |
|---|---|---|
| **Injection patterns** | `ignore previous`, `you are now`, `system:`, `<\|im_start\|>`, role-play commands | Flag + queue |
| **Exfiltration patterns** | `curl`, `fetch(`, `send to`, URLs in prompts, `webhook`, `upload` | Flag + queue |
| **Obfuscation** | Base64 strings, excessive unicode, zero-width characters, homoglyphs | Flag + queue |
| **Sensitive data solicitation** | `password`, `API key`, `secret`, `credit card`, `SSN` | Flag + queue |
| **Excessive length** | Prompt > 5000 chars (hiding payload in noise) | Warn + queue if new user |
| **Known bad patterns** | Regex list of known jailbreak prefixes (maintained, updatable) | Flag + queue |

**Non-prompt checks:**

| Check | What it catches | Action |
|---|---|---|
| **Link spam** | >3 URLs in description, URL shorteners | Flag |
| **Duplicate content** | Fuzzy match against existing ideas (trigram similarity > 0.8) | Warn author |
| **Rate burst** | >5 submissions in 1 hour | Auto-queue all |
| **New account + prompt** | Account < 24h old submitting | Queue for review |

### 5.2 Safety Score

Each submission gets a safety score (0-100, higher = safer):

```
safety_score = 100
  - (injection_pattern_hits × 25)
  - (exfiltration_pattern_hits × 30)
  - (obfuscation_hits × 20)
  - (sensitive_data_hits × 15)
  - (link_spam_hits × 10)
  + (author_trust_bonus)        -- trust > 70: +10
```

| Score | Action |
|---|---|
| ≥ 80 | Pass — follow normal trust-based pipeline |
| 50–79 | Soft flag — publish but queue for async review |
| < 50 | Hard flag — queue for manual review before publishing |

### 5.3 Scanning Configuration (`/admin/safety`)

Admins can:
- View and update regex patterns (injection, exfiltration, obfuscation)
- Adjust score weights per check category
- Add/remove known bad patterns
- Set trust bonus thresholds
- View scan statistics (how many flagged per day, false positive rate)
- Test a prompt against the scanner (dry-run mode)

### 5.4 Future: AI-Assisted Moderation (v2-v3)

- LLM review of flagged content ("Is this prompt attempting to manipulate the AI agent?")
- Semantic similarity to known malicious prompts (embeddings)
- Behavioral pattern detection (account creates 10 ideas, 8 get reported → auto-flag account)
- Community-driven moderation (trusted users can vote on queue items)

---

## 6. User-Facing Moderation UX

### What users see when content is moderated:

**Pending review:**
> "Your idea is being reviewed and will be published shortly. This usually takes less than an hour."

**Rejected:**
> "Your idea '[title]' was not published. Reason: [category]. You can edit and resubmit."
> *(With a link to edit the draft)*

**Removed (post-publish):**
> "Your idea '[title]' was removed for violating our community guidelines. Reason: [category]. If you believe this was a mistake, you can appeal."

**Warning:**
> "You've received a community guidelines warning regarding [content]. Repeated violations may result in account restrictions."

**Suspension:**
> "Your account is temporarily restricted until [date]. During this time, you cannot submit new content or comments. Reason: [category]."

### Appeal Process (v2)
- User clicks "Appeal" on removed content or warning
- Opens a form: "Tell us why you think this decision was wrong"
- Creates a report-like item in the admin queue tagged as "appeal"
- Different moderator reviews (not the original actor)

---

## 7. Database Additions

Tables to add to the Supabase migration (beyond what SPEC.md already defines):

### 7.1 Moderation Log (new)
```sql
create table public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  actor_role text not null,
  action text not null,
  target_type text not null check (target_type in ('idea', 'comment', 'user', 'stack', 'report')),
  target_id uuid not null,
  reason text,
  details jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_modlog_actor on moderation_log(actor_id);
create index idx_modlog_target on moderation_log(target_type, target_id);
create index idx_modlog_created on moderation_log(created_at desc);

alter table moderation_log enable row level security;
create policy "Admins read all" on moderation_log for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Mods read own" on moderation_log for select using (
  actor_id = auth.uid() and exists (select 1 from profiles where id = auth.uid() and role = 'moderator')
);
create policy "Mods and admins insert" on moderation_log for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);
```

### 7.2 User Warnings (new)
```sql
create table public.user_warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  issued_by uuid references profiles(id),
  reason text not null,
  details text,
  acknowledged boolean default false,
  created_at timestamptz default now()
);

create index idx_warnings_user on user_warnings(user_id);
```

### 7.3 Safety Scan Results (new)
```sql
create table public.safety_scans (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('idea', 'comment', 'stack')),
  target_id uuid not null,
  safety_score int not null,
  flags jsonb default '[]',                 -- [{ check: "injection", pattern: "ignore previous", severity: "high" }]
  scanned_at timestamptz default now()
);

create index idx_scans_target on safety_scans(target_type, target_id);
create index idx_scans_score on safety_scans(safety_score) where safety_score < 80;
```

### 7.4 Additions to Existing Tables

**profiles — add:**
```sql
alter table profiles add column status text default 'active' 
  check (status in ('active', 'warned', 'suspended', 'banned'));
alter table profiles add column suspended_until timestamptz;
alter table profiles add column warning_count int default 0;
```

**ideas — add:**
```sql
alter table ideas add column safety_score int;
alter table ideas add column reviewed_by uuid references profiles(id);
alter table ideas add column reviewed_at timestamptz;
```

### 7.5 Safety Rules Config (new)
```sql
create table public.safety_rules (
  id text primary key,                      -- 'injection_patterns', 'exfil_patterns', etc.
  patterns text[] not null,                 -- regex patterns
  weight int not null default 25,           -- score deduction per hit
  enabled boolean default true,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

-- Seed with initial rules
insert into safety_rules (id, patterns, weight) values
  ('injection', array[
    'ignore previous', 'ignore all previous', 'disregard.*instructions',
    'you are now', 'act as if', 'pretend you',
    'system:', '<\|im_start\|>', '\[INST\]', '<<SYS>>',
    'jailbreak', 'DAN mode', 'developer mode'
  ], 25),
  ('exfiltration', array[
    'curl ', 'wget ', 'fetch\(', 'send to ', 'webhook',
    'upload.*to', 'post.*to.*http', 'exfiltrate',
    'https?://[^\s]+\.(ru|cn|tk|xyz)/[^\s]+'
  ], 30),
  ('obfuscation', array[
    '[A-Za-z0-9+/]{50,}={0,2}',            -- base64 blocks
    '[\x{200B}-\x{200D}\x{FEFF}]',         -- zero-width chars
    '[\x{0400}-\x{04FF}].*[a-zA-Z]'        -- cyrillic mixed with latin (homoglyph)
  ], 20),
  ('sensitive_data', array[
    'password', 'api.key', 'secret.key', 'credit.card',
    'social.security', 'ssn', 'private.key'
  ], 15);
```

---

## 8. API Routes

```
# Moderation Queue
GET    /api/admin/queue                    # List pending items (filters: type, safety_score, age)
PATCH  /api/admin/queue/[id]/approve       # Approve content
PATCH  /api/admin/queue/[id]/reject        # Reject with reason
PATCH  /api/admin/queue/[id]/edit          # Edit and approve

# Content Management
GET    /api/admin/content                  # Browse all content (filters, pagination)
PATCH  /api/admin/content/[id]/status      # Change status (published/flagged/removed)
PATCH  /api/admin/content/[id]             # Edit content fields

# Reports
GET    /api/admin/reports                  # List reports (filters: status, type)
PATCH  /api/admin/reports/[id]/dismiss     # Dismiss report
PATCH  /api/admin/reports/[id]/action      # Take action on reported content

# User Management
GET    /api/admin/users                    # List users (filters: role, trust, status)
GET    /api/admin/users/[id]               # User detail + history
PATCH  /api/admin/users/[id]/role          # Change role
PATCH  /api/admin/users/[id]/status        # Warn/suspend/ban
PATCH  /api/admin/users/[id]/trust         # Reset trust score
PATCH  /api/admin/users/[id]/spark         # Reset spark

# Featured Stacks
GET    /api/admin/stacks/featured          # List featured stacks
POST   /api/admin/stacks/featured          # Create featured stack
PATCH  /api/admin/stacks/featured/[id]     # Update/reorder
DELETE /api/admin/stacks/featured/[id]     # Unfeature

# Safety
GET    /api/admin/safety/rules             # List safety rules
PATCH  /api/admin/safety/rules/[id]        # Update patterns/weights
POST   /api/admin/safety/scan              # Dry-run scan a prompt

# Audit
GET    /api/admin/audit                    # Audit log (filters: actor, action, target, date)
```

All routes check `role in ('admin', 'moderator')` via middleware. User management actions (ban, role change) require `role = 'admin'`.

---

## 9. Implementation Phases

### Phase 1 — Launch (build with Supabase migration)
- [x] Database tables (moderation_log, user_warnings, safety_scans, safety_rules + alterations)
- [ ] Admin middleware (role check on `/admin/*` and `/api/admin/*`)
- [ ] Dashboard page (stats cards, attention items, recent activity)
- [ ] Moderation queue (list + approve/reject)
- [ ] Reports inbox (list + dismiss/action)
- [ ] Content browser (search + status change)
- [ ] Basic user management (list + warn/ban)
- [ ] Audit log (read-only)
- [ ] Heuristic safety scanner (v1 — regex-based)
- [ ] Safety scan on idea submission (integrated into submit flow)

### Phase 2 — Post-Launch
- [ ] Featured stacks management
- [ ] Safety rules admin UI
- [ ] User detail page (full history, trust/spark internals)
- [ ] Bulk moderation actions
- [ ] Appeal process
- [ ] Email notifications to users on moderation actions
- [ ] Moderator performance metrics

### Phase 3 — Scale
- [ ] AI-assisted content review
- [ ] Behavioral pattern detection
- [ ] Community moderation (trusted user voting)
- [ ] Automated escalation rules
- [ ] Platform analytics dashboard

---

## 10. Open Questions

1. **Should moderators see raw spark/trust formulas?** Current spec says yes — they need it to evaluate gaming. But it's a leak risk if a moderator account is compromised.
2. **Appeal cooldown?** How often can a user appeal? Suggest: 1 appeal per moderation action, 7-day cooldown between appeals.
3. **Auto-ban threshold?** Should X reports or Y trust drops trigger automatic suspension? Suggest: 5 actioned reports in 30 days → auto-suspend pending admin review.
4. **Prompt scanning false positives?** Legitimate prompts might contain "ignore previous" in an instructional context. Need a way to whitelist/override per-idea.
5. **Admin access in demo mode?** Should we have a demo admin account for development/testing? Suggest: yes, `demo_admin` profile with role: admin in seed data.

---

*This spec is an addendum to the main SPEC.md. Database additions should be included in the initial Supabase migration. Admin UI can be built iteratively but the safety pipeline should ship with launch.*
