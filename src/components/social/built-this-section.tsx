"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Hammer, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/common/toast";
import { UserAvatar } from "@/components/common/user-avatar";
import { resolveAuthor } from "@/lib/utils/resolve-author";

interface BuiltEntry {
  id: string;
  idea_id: string;
  user: { username: string; display_name: string; avatar_url?: string | null };
  story: string | null;
  time_saved_weekly: string | null;
  before_workflow: string | null;
  after_workflow: string | null;
  impact_rating: number | null; // 1-5
  created_at: string;
}

const BUILDS_KEY = "inspo-builds";

// Seed builds per idea
const SEED_BUILDS: Record<string, BuiltEntry[]> = {
  "1": [
    {
      id: "b1", idea_id: "1",
      user: { username: "sarah_dev", display_name: "Sarah Chen", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=sarah_dev&backgroundColor=c0aede" },
      story: "Set this up with OpenClaw in about 3 minutes. Added stock prices and news headlines to my briefing too. Now I don't open 5 apps every morning.",
      time_saved_weekly: "2 hours",
      before_workflow: "Manually checking calendar, weather app, Gmail, news, stocks every morning",
      after_workflow: "One notification at 7am with everything I need",
      impact_rating: 5,
      created_at: "2026-02-10T09:00:00Z",
    },
    {
      id: "b2", idea_id: "1",
      user: { username: "devtools", display_name: "Dev Tools", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=devtools&backgroundColor=c0e8ff" },
      story: "Works perfectly. I customized the time to 6:30am so it's ready when I wake up.",
      time_saved_weekly: "1.5 hours",
      before_workflow: null, after_workflow: null,
      impact_rating: 4,
      created_at: "2026-02-10T11:00:00Z",
    },
  ],
  "3": [
    {
      id: "b3", idea_id: "3",
      user: { username: "mike_builds", display_name: "Mike Rivera", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=mike_builds&backgroundColor=ffd5dc" },
      story: "Our whole team uses this now. The standup summaries are actually useful instead of 'I did stuff'.",
      time_saved_weekly: "30 minutes",
      before_workflow: "Trying to remember what I did yesterday at standup",
      after_workflow: "Copy-paste the summary and add any context",
      impact_rating: 5,
      created_at: "2026-02-09T14:00:00Z",
    },
  ],
  // Stack seed builds
  "s1": [
    {
      id: "b4", idea_id: "s1",
      user: { username: "jess_automates", display_name: "Jess Park", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=jess_automates&backgroundColor=d1f4d9" },
      story: "Ran through this whole stack in one afternoon. The morning briefing alone was worth it, but combined with the commit summarizer it's a game changer for my daily flow.",
      time_saved_weekly: "4 hours",
      before_workflow: "Scattered morning routine, manual git log reviews",
      after_workflow: "Automated briefing + commit summaries before standup",
      impact_rating: 5,
      created_at: "2026-02-08T16:00:00Z",
    },
  ],
  "s3": [
    {
      id: "b5", idea_id: "s3",
      user: { username: "sarah_dev", display_name: "Sarah Chen", avatar_url: "https://api.dicebear.com/9.x/notionists/svg?seed=sarah_dev&backgroundColor=c0aede" },
      story: "This stack turned my side project into something that actually ships. The content pipeline is *chef's kiss*.",
      time_saved_weekly: "3 hours",
      before_workflow: null, after_workflow: null,
      impact_rating: 4,
      created_at: "2026-02-07T10:00:00Z",
    },
  ],
};

function readBuilds(): Record<string, BuiltEntry[]> {
  try {
    return JSON.parse(localStorage.getItem(BUILDS_KEY) || "{}");
  } catch { return {}; }
}

function writeBuilds(all: Record<string, BuiltEntry[]>) {
  try { localStorage.setItem(BUILDS_KEY, JSON.stringify(all)); } catch {}
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          disabled={!onChange}
          className={cn(
            "transition-colors",
            onChange ? "cursor-pointer hover:text-amber-300" : "cursor-default",
            i <= rating ? "text-amber-400" : "text-stone-700"
          )}
        >
          <Star size={16} fill={i <= rating ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function BuildEntry({ entry }: { entry: BuiltEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = entry.before_workflow || entry.after_workflow || entry.time_saved_weekly;
  const resolved = resolveAuthor(entry.user);

  return (
    <div className="rounded-lg border border-stone-800 bg-stone-900/50 p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar
            avatarUrl={resolved.avatar_url}
            displayName={resolved.display_name}
            username={resolved.username}
            size="sm"
            className="!h-6 !w-6 !text-[10px]"
          />
          <div>
            <Link href={`/user/${resolved.username}`} className="text-sm font-medium text-stone-300 hover:text-stone-100 hover:underline">
              {resolved.display_name}
            </Link>
            <span className="ml-2 text-xs text-stone-600">{timeAgo(entry.created_at)}</span>
          </div>
        </div>
        {entry.impact_rating && <StarRating rating={entry.impact_rating} />}
      </div>

      {entry.story && (
        <p className="mt-2 text-sm text-stone-400">{entry.story}</p>
      )}

      {hasDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-stone-600 hover:text-stone-400"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Hide details" : "Show impact details"}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 rounded-lg bg-stone-800/50 p-3 text-xs">
              {entry.time_saved_weekly && (
                <div>
                  <span className="font-medium text-stone-400">⏱ Time saved weekly:</span>
                  <span className="ml-1 text-stone-300">{entry.time_saved_weekly}</span>
                </div>
              )}
              {entry.before_workflow && (
                <div>
                  <span className="font-medium text-red-400/70">Before:</span>
                  <span className="ml-1 text-stone-400">{entry.before_workflow}</span>
                </div>
              )}
              {entry.after_workflow && (
                <div>
                  <span className="font-medium text-green-400/70">After:</span>
                  <span className="ml-1 text-stone-400">{entry.after_workflow}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface BuiltThisSectionProps {
  ideaId: string;
  onBuiltCountChange?: (count: number) => void;
  onAvgRatingChange?: (avg: number | null) => void;
}

export function BuiltThisSection({ ideaId, onBuiltCountChange, onAvgRatingChange }: BuiltThisSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [builds, setBuilds] = useState<BuiltEntry[]>([]);
  const [hasBuilt, setHasBuilt] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  // Form state
  const [story, setStory] = useState("");
  const [timeSaved, setTimeSaved] = useState("");
  const [beforeWork, setBeforeWork] = useState("");
  const [afterWork, setAfterWork] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const seeds = SEED_BUILDS[ideaId] || [];
    const userBuilds = readBuilds()[ideaId] || [];
    const all = [...seeds, ...userBuilds];
    setBuilds(all);
    onBuiltCountChange?.(all.length);
    // Compute average rating
    const rated = all.filter((b) => b.impact_rating != null);
    if (rated.length > 0) {
      const avg = rated.reduce((sum, b) => sum + b.impact_rating!, 0) / rated.length;
      onAvgRatingChange?.(Math.round(avg * 10) / 10);
    } else {
      onAvgRatingChange?.(null);
    }
    // Check if current user already built
    if (user) {
      setHasBuilt(all.some((b) => b.user.username === user.username));
    }
  }, [ideaId, user, onBuiltCountChange, onAvgRatingChange]);

  const handleSubmit = useCallback(() => {
    if (!user || !rating) return;
    const entry: BuiltEntry = {
      id: `user-build-${Date.now()}`,
      idea_id: ideaId,
      user: { username: user.username, display_name: user.display_name, avatar_url: user.avatar_url ?? null },
      story: story.trim() || null,
      time_saved_weekly: timeSaved.trim() || null,
      before_workflow: beforeWork.trim() || null,
      after_workflow: afterWork.trim() || null,
      impact_rating: rating,
      created_at: new Date().toISOString(),
    };
    const all = readBuilds();
    all[ideaId] = [...(all[ideaId] || []), entry];
    writeBuilds(all);
    setBuilds((prev) => {
      const next = [...prev, entry];
      onBuiltCountChange?.(next.length);
      const rated = next.filter((b) => b.impact_rating != null);
      if (rated.length > 0) {
        const avg = rated.reduce((sum, b) => sum + b.impact_rating!, 0) / rated.length;
        onAvgRatingChange?.(Math.round(avg * 10) / 10);
      }
      return next;
    });
    setHasBuilt(true);
    setShowForm(false);
    setStory(""); setTimeSaved(""); setBeforeWork(""); setAfterWork(""); setRating(0);
    toast("Nice! Your build has been shared 🎉");
  }, [ideaId, user, story, timeSaved, beforeWork, afterWork, rating, toast, onBuiltCountChange]);

  return (
    <div className="mt-6 border-t border-stone-800 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-300 hover:text-stone-100 transition-colors"
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <Hammer size={14} /> Built This ({builds.length})
        </button>
        <div className="flex items-center gap-2">
          {isAuthenticated && !hasBuilt && !showForm && (
            <button
              onClick={() => { setCollapsed(false); setShowForm(true); }}
              className="rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
            >
              ⚡ I Built This
            </button>
          )}
          {hasBuilt && (
            <span className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400">
              <Hammer size={12} /> You built this!
            </span>
          )}
        </div>
      </div>

      {!collapsed && <>
      {/* Submit form */}
      {showForm && (
        <div className="mb-4 space-y-3 rounded-xl border border-stone-800 bg-stone-900 p-4">
          <h3 className="text-sm font-medium text-stone-200">Share your build</h3>

          <div>
            <label className="mb-1 block text-xs text-stone-500">Impact rating *</label>
            <StarRating rating={rating} onChange={setRating} />
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500">How did it go? (optional)</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="I set this up in 5 minutes and now..."
              rows={2}
              className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500">Time saved weekly (optional)</label>
            <input
              type="text"
              value={timeSaved}
              onChange={(e) => setTimeSaved(e.target.value)}
              placeholder="e.g. 2 hours"
              className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-stone-500">Before (optional)</label>
              <input
                type="text"
                value={beforeWork}
                onChange={(e) => setBeforeWork(e.target.value)}
                placeholder="Checked 5 apps manually"
                className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-stone-500">After (optional)</label>
              <input
                type="text"
                value={afterWork}
                onChange={(e) => setAfterWork(e.target.value)}
                placeholder="One notification at 7am"
                className="w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!rating}
              className="flex-1 rounded-lg bg-orange-500/20 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/30 disabled:opacity-40"
            >
              Share Build
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-stone-400 hover:bg-stone-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Builds list */}
      {builds.length > 0 ? (
        <div className="space-y-2">
          {builds.map((entry) => (
            <BuildEntry key={entry.id} entry={entry} />
          ))}
        </div>
      ) : !showForm ? (
        <p className="py-4 text-center text-sm text-stone-600">
          No one has built this yet. Be the first!
        </p>
      ) : null}
      </>}
    </div>
  );
}
