-- ============================================
-- OpenClaw Inspo App — Initial Schema
-- Migration: 00001_initial_schema.sql
-- ============================================

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'moderator', 'admin')),
  reputation_score int default 0,

  agent_platform text,
  active_skills text[] default '{}',
  setup_description text,
  setup_score int default 0,

  onboarding_role text,
  interests text[] default '{}',

  ideas_built_count int default 0,
  ideas_contributed_count int default 0,
  follower_count int default 0,
  following_count int default 0,

  pinned_ideas uuid[] default '{}',
  pinned_stacks uuid[] default '{}',
  pinned_builds uuid[] default '{}',

  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_username on profiles(username);
create index idx_profiles_reputation on profiles(reputation_score desc);

-- ============================================
-- IDEAS
-- ============================================
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  slug text unique not null,
  title text not null,
  description text not null,
  body text,
  prompt text not null,
  category text not null,
  complexity text not null check (complexity in ('quick', 'moderate', 'project')),
  skills text[] default '{}',
  tags text[] default '{}',
  template_id text,
  status text default 'published' check (status in ('draft', 'pending', 'published', 'flagged', 'removed')),
  source_url text,

  save_count int default 0,
  comment_count int default 0,
  built_count int default 0,
  view_count int default 0,

  remix_of uuid references ideas(id) on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

create index idx_ideas_slug on ideas(slug);
create index idx_ideas_category on ideas(category);
create index idx_ideas_status on ideas(status) where status = 'published';
create index idx_ideas_trending on ideas(save_count desc, created_at desc) where status = 'published';
create index idx_ideas_newest on ideas(published_at desc) where status = 'published';
create index idx_ideas_author on ideas(author_id);
create index idx_ideas_skills on ideas using gin(skills);
create index idx_ideas_tags on ideas using gin(tags);
create index idx_ideas_search on ideas using gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(body, ''))
);

-- ============================================
-- STACKS
-- ============================================
create table public.stacks (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  slug text unique not null,
  title text not null,
  description text not null,
  cover_image_url text,
  category text not null,
  is_featured boolean default false,
  status text default 'published' check (status in ('draft', 'pending', 'published', 'removed')),
  save_count int default 0,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.stack_items (
  stack_id uuid references stacks(id) on delete cascade,
  idea_id uuid references ideas(id) on delete cascade,
  position int not null,
  context_note text,
  primary key (stack_id, idea_id)
);

create index idx_stacks_slug on stacks(slug);
create index idx_stacks_category on stacks(category);
create index idx_stacks_featured on stacks(is_featured) where is_featured = true;

-- ============================================
-- SAVES
-- ============================================
create table public.saves (
  user_id uuid references profiles(id) on delete cascade,
  idea_id uuid references ideas(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, idea_id)
);

create index idx_saves_user on saves(user_id);

-- ============================================
-- COLLECTIONS
-- ============================================
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.collection_items (
  collection_id uuid references collections(id) on delete cascade,
  idea_id uuid references ideas(id) on delete cascade,
  position int default 0,
  added_at timestamptz default now(),
  primary key (collection_id, idea_id)
);

create index idx_collections_user on collections(user_id);

-- ============================================
-- COMMENTS
-- ============================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  parent_id uuid references comments(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_comments_idea on comments(idea_id, created_at);

-- ============================================
-- BUILT THIS
-- ============================================
create table public.built_this (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  story text,
  screenshot_urls text[] default '{}',
  time_saved_weekly text,
  before_workflow text,
  after_workflow text,
  impact_rating int check (impact_rating between 1 and 5),
  created_at timestamptz default now()
);

create index idx_built_idea on built_this(idea_id);

-- ============================================
-- VOTES
-- ============================================
create table public.votes (
  user_id uuid references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('idea', 'comment')),
  target_id uuid not null,
  value int not null check (value in (1, -1)),
  created_at timestamptz default now(),
  primary key (user_id, target_type, target_id)
);

create index idx_votes_target on votes(target_type, target_id);

-- ============================================
-- FOLLOWS
-- ============================================
create table public.follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);

-- ============================================
-- ACTIVITY FEED
-- ============================================
create table public.activity (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz default now()
);

create index idx_activity_actor on activity(actor_id, created_at desc);

-- ============================================
-- REPORTS
-- ============================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete set null,
  target_type text not null check (target_type in ('idea', 'comment', 'user')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz default now()
);

-- ============================================
-- CHALLENGES
-- ============================================
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  rules text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text default 'upcoming' check (status in ('upcoming', 'active', 'voting', 'completed')),
  winner_idea_id uuid references ideas(id),
  created_at timestamptz default now()
);

create table public.challenge_entries (
  challenge_id uuid references challenges(id) on delete cascade,
  idea_id uuid references ideas(id) on delete cascade,
  submitted_at timestamptz default now(),
  primary key (challenge_id, idea_id)
);

create index idx_challenges_status on challenges(status);

-- ============================================
-- USER EVENTS
-- ============================================
create table public.user_events (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  event_type text not null,
  idea_id uuid references ideas(id) on delete set null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_events_user_time on user_events(user_id, created_at desc);
create index idx_events_idea on user_events(idea_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user_unread on notifications(user_id, read) where read = false;

-- ============================================
-- EDIT HISTORY
-- ============================================
create table public.edit_history (
  id bigint generated always as identity primary key,
  target_type text not null,
  target_id uuid not null,
  editor_id uuid references profiles(id),
  previous_data jsonb not null,
  created_at timestamptz default now()
);

-- ============================================
-- SUBSCRIPTION TIERS
-- ============================================
create table public.subscription_tiers (
  id text primary key,
  name text not null,
  price_monthly_cents int,
  price_yearly_cents int,
  features jsonb not null default '{}',
  created_at timestamptz default now()
);

-- ============================================
-- USER SUBSCRIPTIONS
-- ============================================
create table public.user_subscriptions (
  user_id uuid primary key references profiles(id) on delete cascade,
  tier_id text references subscription_tiers(id) default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SPONSORED CONTENT
-- ============================================
create table public.sponsored_content (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references ideas(id),
  sponsor_name text not null,
  sponsor_url text,
  sponsor_logo_url text,
  placement text default 'feed',
  impressions_budget int,
  impressions_served int default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);

-- ============================================
-- IDEA TEMPLATES
-- ============================================
create table public.idea_templates (
  id text primary key,
  name text not null,
  description text,
  structure jsonb not null,
  created_at timestamptz default now()
);

-- ============================================
-- USER ONBOARDING
-- ============================================
create table public.user_onboarding (
  user_id uuid primary key references profiles(id) on delete cascade,
  step int default 0,
  completed boolean default false,
  data jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- IDEA SIMILARITY (Phase 2)
-- ============================================
create table public.idea_similarity (
  idea_a uuid references ideas(id) on delete cascade,
  idea_b uuid references ideas(id) on delete cascade,
  score float not null,
  computed_at timestamptz default now(),
  primary key (idea_a, idea_b)
);

-- ============================================
-- COUNTER TRIGGERS
-- ============================================

-- saves → ideas.save_count
create or replace function update_idea_save_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update ideas set save_count = save_count + 1 where id = NEW.idea_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update ideas set save_count = save_count - 1 where id = OLD.idea_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_saves_count
  after insert or delete on saves
  for each row execute function update_idea_save_count();

-- built_this → ideas.built_count
create or replace function update_idea_built_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update ideas set built_count = built_count + 1 where id = NEW.idea_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update ideas set built_count = built_count - 1 where id = OLD.idea_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_built_count
  after insert or delete on built_this
  for each row execute function update_idea_built_count();

-- comments → ideas.comment_count
create or replace function update_idea_comment_count() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update ideas set comment_count = comment_count + 1 where id = NEW.idea_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update ideas set comment_count = comment_count - 1 where id = OLD.idea_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_comment_count
  after insert or delete on comments
  for each row execute function update_idea_comment_count();

-- follows → profiles.follower_count / following_count
create or replace function update_follow_counts() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update profiles set following_count = following_count + 1 where id = NEW.follower_id;
    update profiles set follower_count = follower_count + 1 where id = NEW.following_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update profiles set following_count = following_count - 1 where id = OLD.follower_id;
    update profiles set follower_count = follower_count - 1 where id = OLD.following_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_follow_counts
  after insert or delete on follows
  for each row execute function update_follow_counts();

-- updated_at auto-update
create or replace function update_updated_at() returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger trg_ideas_updated_at before update on ideas for each row execute function update_updated_at();
create trigger trg_stacks_updated_at before update on stacks for each row execute function update_updated_at();
create trigger trg_collections_updated_at before update on collections for each row execute function update_updated_at();
create trigger trg_comments_updated_at before update on comments for each row execute function update_updated_at();
create trigger trg_user_subscriptions_updated_at before update on user_subscriptions for each row execute function update_updated_at();
create trigger trg_user_onboarding_updated_at before update on user_onboarding for each row execute function update_updated_at();

-- ============================================
-- ROW-LEVEL SECURITY
-- ============================================

-- PROFILES
alter table profiles enable row level security;
create policy "Public reads profiles" on profiles for select using (true);
create policy "Users update own" on profiles for update using (auth.uid() = id);

-- IDEAS
alter table ideas enable row level security;
create policy "Public reads published" on ideas for select using (status = 'published');
create policy "Authors manage own" on ideas for all using (auth.uid() = author_id);
create policy "Admins manage all" on ideas for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);

-- STACKS
alter table stacks enable row level security;
create policy "Public reads published stacks" on stacks for select using (status = 'published');
create policy "Authors manage own stacks" on stacks for all using (auth.uid() = author_id);
create policy "Admins manage all stacks" on stacks for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);

-- STACK ITEMS
alter table stack_items enable row level security;
create policy "Public reads stack items" on stack_items for select using (true);
create policy "Stack authors manage items" on stack_items for all using (
  exists (select 1 from stacks where id = stack_id and author_id = auth.uid())
);

-- SAVES
alter table saves enable row level security;
create policy "Users manage own saves" on saves for all using (auth.uid() = user_id);

-- COLLECTIONS
alter table collections enable row level security;
create policy "Public reads public collections" on collections for select using (is_public = true);
create policy "Owners manage own" on collections for all using (auth.uid() = user_id);

-- COLLECTION ITEMS
alter table collection_items enable row level security;
create policy "Public reads collection items" on collection_items for select using (
  exists (select 1 from collections where id = collection_id and is_public = true)
);
create policy "Owners manage collection items" on collection_items for all using (
  exists (select 1 from collections where id = collection_id and user_id = auth.uid())
);

-- COMMENTS
alter table comments enable row level security;
create policy "Public reads comments" on comments for select using (true);
create policy "Auth users create" on comments for insert with check (auth.uid() = author_id);
create policy "Authors edit own" on comments for update using (auth.uid() = author_id);

-- BUILT THIS
alter table built_this enable row level security;
create policy "Public reads" on built_this for select using (true);
create policy "Auth users create" on built_this for insert with check (auth.uid() = user_id);

-- VOTES
alter table votes enable row level security;
create policy "Users manage own votes" on votes for all using (auth.uid() = user_id);

-- FOLLOWS
alter table follows enable row level security;
create policy "Public reads follows" on follows for select using (true);
create policy "Users manage own follows" on follows for all using (auth.uid() = follower_id);

-- ACTIVITY
alter table activity enable row level security;
create policy "Public reads activity" on activity for select using (true);

-- REPORTS
alter table reports enable row level security;
create policy "Auth users create reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "Admins read reports" on reports for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);

-- CHALLENGES
alter table challenges enable row level security;
create policy "Public reads challenges" on challenges for select using (true);
create policy "Admins manage challenges" on challenges for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);

-- CHALLENGE ENTRIES
alter table challenge_entries enable row level security;
create policy "Public reads entries" on challenge_entries for select using (true);
create policy "Auth users submit entries" on challenge_entries for insert with check (
  exists (select 1 from ideas where id = idea_id and author_id = auth.uid())
);

-- USER EVENTS
alter table user_events enable row level security;
create policy "Users create own events" on user_events for insert with check (auth.uid() = user_id);
create policy "Users read own events" on user_events for select using (auth.uid() = user_id);

-- NOTIFICATIONS
alter table notifications enable row level security;
create policy "Users read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);

-- EDIT HISTORY
alter table edit_history enable row level security;
create policy "Public reads edit history" on edit_history for select using (true);

-- SUBSCRIPTION TIERS
alter table subscription_tiers enable row level security;
create policy "Public reads tiers" on subscription_tiers for select using (true);

-- USER SUBSCRIPTIONS
alter table user_subscriptions enable row level security;
create policy "Users read own subscription" on user_subscriptions for select using (auth.uid() = user_id);

-- SPONSORED CONTENT
alter table sponsored_content enable row level security;
create policy "Public reads active sponsored" on sponsored_content for select using (status = 'active');
create policy "Admins manage sponsored" on sponsored_content for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);

-- IDEA TEMPLATES
alter table idea_templates enable row level security;
create policy "Public reads templates" on idea_templates for select using (true);

-- USER ONBOARDING
alter table user_onboarding enable row level security;
create policy "Users manage own onboarding" on user_onboarding for all using (auth.uid() = user_id);

-- IDEA SIMILARITY
alter table idea_similarity enable row level security;
create policy "Public reads similarity" on idea_similarity for select using (true);

-- ============================================
-- SEED SUBSCRIPTION TIERS
-- ============================================
insert into subscription_tiers (id, name, price_monthly_cents, price_yearly_cents, features) values
  ('free', 'Free', 0, 0, '{"max_collections": 5, "private_collections": false, "max_ideas_per_month": 5}'),
  ('pro', 'Pro', 999, 9990, '{"max_collections": 50, "private_collections": true, "max_ideas_per_month": 50, "analytics": true}'),
  ('team', 'Team', 2999, 29990, '{"max_collections": -1, "private_collections": true, "max_ideas_per_month": -1, "analytics": true, "api_access": true}');
