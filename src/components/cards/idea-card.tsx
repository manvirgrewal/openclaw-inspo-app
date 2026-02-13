"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Bookmark, MessageSquare, MoreHorizontal, Check, Share2, Flag, Pencil, Trash2, Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CATEGORY_MAP } from "@/config/categories";
import { COMPLEXITY_OPTIONS } from "@/config/constants";
import { useGuestSaves } from "@/hooks/use-guest-saves";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/common/toast";
import { resolveAuthor } from "@/lib/utils/resolve-author";
import { recordEngagement } from "@/modules/reputation/reputation.service";
import { SparkBadge } from "@/components/reputation/spark-badge";
import type { Idea } from "@/modules/ideas/ideas.types";

interface IdeaCardProps {
  idea: Idea;
  onSave?: (ideaId: string) => void;
  onDelete?: (ideaId: string) => void;
  onPin?: (ideaId: string) => void;
  showManage?: boolean;
  isPinned?: boolean;
  className?: string;
}

export function IdeaCard({ idea, onSave, onDelete, onPin, showManage, isPinned, className }: IdeaCardProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const { isSaved, saveIdea, unsaveIdea } = useGuestSaves();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const saved = isSaved(idea.id);
  const [localCountDelta, setLocalCountDelta] = useState(() => isSaved(idea.id) ? 1 : 0);

  const isOwner = user && idea.author_id === user.id;

  // Live comment count
  const [liveCommentCount, setLiveCommentCount] = useState(idea.comment_count);
  useEffect(() => {
    try {
      const userComments = JSON.parse(localStorage.getItem("inspo-comments") || "{}");
      const userCount = (userComments[idea.id] || []).length;
      setLiveCommentCount(idea.comment_count + userCount);
    } catch {}
  }, [idea.id, idea.comment_count]);

  const category = CATEGORY_MAP[idea.category];
  const complexity = COMPLEXITY_OPTIONS.find((c) => c.id === idea.complexity);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(idea.prompt);
        setCopied(true);
        toast("Copied!");
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setCopied(false), 2000);
        recordEngagement({ type: "copy", ideaId: idea.id, authorId: idea.author_id || undefined, actorId: user?.id });
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = idea.prompt;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        toast("Copied!");
        setTimeout(() => setCopied(false), 2000);
        recordEngagement({ type: "copy", ideaId: idea.id, authorId: idea.author_id || undefined, actorId: user?.id });
      }
    },
    [idea.prompt, idea.id, idea.author_id, user?.id, toast],
  );

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (saved) {
        unsaveIdea(idea.id);
        setLocalCountDelta((d) => d - 1);
        toast("Idea unsaved");
        recordEngagement({ type: "unsave", ideaId: idea.id, authorId: idea.author_id || undefined, actorId: user?.id });
      } else {
        saveIdea(idea.id);
        setLocalCountDelta((d) => d + 1);
        toast("Idea saved!");
        recordEngagement({ type: "save", ideaId: idea.id, authorId: idea.author_id || undefined, actorId: user?.id });
      }
      onSave?.(idea.id);
    },
    [idea.id, idea.author_id, user?.id, onSave, saved, saveIdea, unsaveIdea, toast],
  );

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/idea/${idea.slug}`;
    if ("share" in navigator) {
      (navigator as Navigator).share({ title: idea.title, text: idea.description, url });
    } else {
      (navigator as Navigator).clipboard.writeText(url);
      toast("Link copied!");
    }
    setShowMenu(false);
  }, [idea, toast]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored: Idea[] = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      const updated = stored.filter((i) => i.id !== idea.id);
      localStorage.setItem("inspo-user-ideas", JSON.stringify(updated));
      toast("Idea deleted");
      onDelete?.(idea.id);
    } catch {}
    setShowMenu(false);
  }, [idea.id, toast, onDelete]);

  const handlePin = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPin?.(idea.id);
    toast(isPinned ? "Unpinned" : "Pinned to profile!");
    setShowMenu(false);
  }, [idea.id, isPinned, onPin, toast]);

  const handleReport = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!reportReason.trim()) return;
    try {
      const reports = JSON.parse(localStorage.getItem("inspo-reports") || "[]");
      reports.push({
        id: `report-${Date.now()}`,
        target_type: "idea",
        target_id: idea.id,
        reason: reportReason.trim(),
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("inspo-reports", JSON.stringify(reports));
    } catch {}
    toast("Report submitted. Thanks for helping keep the community safe.");
    setShowReport(false);
    setReportReason("");
    setShowMenu(false);
  }, [idea.id, reportReason, toast]);

  return (
    <Link
      href={`/idea/${idea.slug}`}
      className={cn(
        "card-glow block w-full rounded-xl border border-stone-800/60 bg-stone-900/80 p-4 transition-all hover:border-stone-700/80 active:bg-stone-800/60",
        isPinned && "border-amber-500/20",
        className,
      )}
    >
      {/* Pinned badge */}
      {isPinned && (
        <div className="mb-2 flex items-center gap-1 text-[10px] font-medium text-amber-500/70">
          <Pin size={10} /> Pinned
        </div>
      )}

      {/* Row 1: Complexity + Category */}
      <div className="mb-2 flex items-center gap-2 text-xs">
        {complexity && (
          <span className="text-stone-400">
            {complexity.icon} {complexity.label}
          </span>
        )}
        {category && (
          <>
            <span className="text-stone-600">·</span>
            <span className={cn("rounded-full border px-2 py-0.5", category.color)}>
              {category.label}
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 text-base font-semibold leading-snug text-stone-100 line-clamp-2 sm:text-lg">
        {idea.title}
      </h3>

      {/* Author */}
      {idea.author && (() => {
        const author = resolveAuthor(idea.author);
        return (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-stone-500">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.username}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-[10px] font-medium text-stone-300">
              {(author.display_name || author.username).charAt(0).toUpperCase()}
            </div>
          )}
          <span>by{" "}
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/user/${author.username}`;
              }}
              className="text-stone-400 hover:text-stone-200 hover:underline cursor-pointer"
            >
              @{author.username}
            </span>
          </span>
          {idea.author_id && <SparkBadge authorId={idea.author_id} />}
        </div>
        );
      })()}

      {/* Description */}
      <p className="mb-3 text-sm leading-relaxed text-stone-400 line-clamp-3">
        {idea.description}
      </p>

      {/* Skill chips */}
      {idea.skills.length > 0 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {idea.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="shrink-0 rounded-md bg-stone-800 px-2 py-0.5 text-xs text-stone-400">
              {skill}
            </span>
          ))}
          {idea.skills.length > 4 && (
            <span className="shrink-0 text-xs text-stone-500">+{idea.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            copied
              ? "bg-green-500/10 text-green-400 animate-pulse-success"
              : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:bg-amber-500/25",
          )}
        >
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
        </button>

        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1 text-xs transition-colors",
            saved ? "text-amber-400" : "text-stone-500 hover:text-stone-300",
          )}
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          <span>{idea.save_count + localCountDelta}</span>
        </button>

        <span className="flex items-center gap-1 text-xs text-stone-500">
          <MessageSquare size={14} />
          <span>{liveCommentCount}</span>
        </span>

        {/* More menu */}
        <div className="relative ml-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-stone-600 hover:text-stone-400"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }}
              />
              <div
                className="absolute right-0 bottom-full z-50 mb-1 w-44 rounded-xl border border-stone-800 bg-stone-900 p-1 shadow-xl"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-stone-800"
                >
                  <Share2 size={14} /> Share
                </button>

                {/* Owner actions */}
                {isOwner && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/submit?edit=${idea.id}`);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-stone-800"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    {onPin && (
                      <button
                        onClick={handlePin}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-stone-800"
                      >
                        {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        {isPinned ? "Unpin" : "Pin to Profile"}
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-stone-800"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}

                {/* Report (non-owner only) */}
                {!isOwner && isAuthenticated && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowReport(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-stone-800"
                  >
                    <Flag size={14} /> Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReport(false); }}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-stone-800 bg-stone-900 p-5"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <h3 className="mb-3 text-sm font-semibold text-stone-200">Report this idea</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="What's the issue? (spam, inappropriate, misleading, etc.)"
              rows={3}
              className="mb-3 w-full rounded-lg border border-stone-800 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="flex-1 rounded-lg bg-red-500/20 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-40"
              >
                Submit Report
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReport(false); }}
                className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-stone-400 hover:bg-stone-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
