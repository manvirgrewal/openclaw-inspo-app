"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { User, Reply, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/common/toast";

interface Comment {
  id: string;
  idea_id: string;
  author: { username: string; display_name: string };
  body: string;
  created_at: string;
  parent_id: string | null;
}

const COMMENTS_KEY = "inspo-comments";

// Seed comments keyed by idea slug/id
const SEED_COMMENTS: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1", idea_id: "1",
      author: { username: "sarah_dev", display_name: "Sarah Chen" },
      body: "I built this with OpenClaw and it works great! Added stock prices to the briefing too.",
      created_at: "2026-02-10T12:00:00Z", parent_id: null,
    },
    {
      id: "c2", idea_id: "1",
      author: { username: "mike_builds", display_name: "Mike Rivera" },
      body: "Nice idea! How do you handle timezone differences for the weather API?",
      created_at: "2026-02-10T14:30:00Z", parent_id: null,
    },
    {
      id: "c3", idea_id: "1",
      author: { username: "jess_automates", display_name: "Jess Park" },
      body: "I set the location in the agent config — works across timezones seamlessly.",
      created_at: "2026-02-10T15:00:00Z", parent_id: "c2",
    },
  ],
  "2": [
    {
      id: "c4", idea_id: "2",
      author: { username: "devtools", display_name: "Dev Tools" },
      body: "This saved me so much time during tax season. Highly recommend pairing with the budget tracker.",
      created_at: "2026-02-09T16:00:00Z", parent_id: null,
    },
  ],
  "3": [
    {
      id: "c5", idea_id: "3",
      author: { username: "jess_automates", display_name: "Jess Park" },
      body: "Perfect for async standup updates. Our team uses this daily now.",
      created_at: "2026-02-09T10:00:00Z", parent_id: null,
    },
    {
      id: "c6", idea_id: "3",
      author: { username: "sarah_dev", display_name: "Sarah Chen" },
      body: "Would love a version that also includes PR review summaries!",
      created_at: "2026-02-09T11:30:00Z", parent_id: null,
    },
  ],
  "4": [
    {
      id: "c7", idea_id: "4",
      author: { username: "mike_builds", display_name: "Mike Rivera" },
      body: "The context it pulls before meetings is genuinely useful. Feels like having an EA.",
      created_at: "2026-02-08T09:00:00Z", parent_id: null,
    },
  ],
  "5": [
    {
      id: "c8", idea_id: "5",
      author: { username: "sarah_dev", display_name: "Sarah Chen" },
      body: "Getting this every Sunday evening has become my favorite part of the week.",
      created_at: "2026-02-07T18:00:00Z", parent_id: null,
    },
  ],
};

function readComments(): Record<string, Comment[]> {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeComments(all: Record<string, Comment[]>) {
  try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(all)); } catch {}
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CommentItem({
  comment,
  replies,
  depth = 0,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  depth?: number;
  onReply: (parentId: string, body: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className={cn("mt-3", depth > 0 && "ml-6 border-l border-zinc-800 pl-4")}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800">
          <User size={12} className="text-zinc-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <Link href={`/user/${comment.author.username}`} className="font-medium text-zinc-300 hover:text-zinc-100">
              {comment.author.display_name}
            </Link>
            <span className="text-zinc-600">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">{comment.body}</p>
          {isAuthenticated && (
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="mt-1 flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400"
            >
              <Reply size={12} /> Reply
            </button>
          )}
          {showReplyInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
                placeholder="Write a reply..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
              <button
                onClick={handleSubmitReply}
                className="rounded-lg bg-zinc-800 px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-700"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} replies={[]} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}

interface CommentsSectionProps {
  ideaId: string;
  onCommentCountChange?: (count: number) => void;
}

export function CommentsSection({ ideaId, onCommentCountChange }: CommentsSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // Load seed + user comments for this idea
  useEffect(() => {
    const seeds = SEED_COMMENTS[ideaId] || [];
    const userComments = readComments()[ideaId] || [];
    setComments([...seeds, ...userComments]);
  }, [ideaId]);

  const addComment = useCallback((body: string, parentId: string | null) => {
    if (!user) return;
    const comment: Comment = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      idea_id: ideaId,
      author: { username: user.username, display_name: user.display_name },
      body,
      created_at: new Date().toISOString(),
      parent_id: parentId,
    };
    // Save to localStorage
    const all = readComments();
    all[ideaId] = [...(all[ideaId] || []), comment];
    writeComments(all);
    // Update state
    setComments((prev) => {
      const next = [...prev, comment];
      onCommentCountChange?.(next.length);
      return next;
    });
    toast("Comment posted!");
  }, [ideaId, user, toast]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addComment(newComment.trim(), null);
    setNewComment("");
  };

  const handleReply = (parentId: string, body: string) => {
    addComment(body, parentId);
  };

  const topLevel = comments.filter((c) => !c.parent_id);

  return (
    <div className="mt-6 border-t border-zinc-800 pt-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-300">
        Comments ({comments.length})
      </h2>

      {/* Comment input */}
      {isAuthenticated ? (
        <div className="mb-4 flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            placeholder="Share your thoughts..."
            rows={2}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
          />
          <button
            onClick={handleSubmitComment}
            className="self-end rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            <Send size={14} />
          </button>
        </div>
      ) : null}

      {/* Comments list */}
      <div>
        {topLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={comments.filter((c) => c.parent_id === comment.id)}
            onReply={handleReply}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="py-6 text-center text-sm text-zinc-600">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      {/* Gentle nudge for non-authenticated */}
      {!isAuthenticated && (
        <p className="mt-4 text-center text-xs text-zinc-600">
          Want to join the conversation?{" "}
          <Link href="/auth/login" className="text-zinc-400 underline hover:text-zinc-200">
            Sign in to comment
          </Link>
        </p>
      )}
    </div>
  );
}
