"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Reply, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/auth-context";

interface Comment {
  id: string;
  author: { username: string; display_name: string };
  body: string;
  created_at: string;
  parent_id: string | null;
}

const SEED_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: { username: "sarah_dev", display_name: "Sarah Chen" },
    body: "I built this with OpenClaw and it works great! Added stock prices to the briefing too.",
    created_at: "2026-02-10T12:00:00Z",
    parent_id: null,
  },
  {
    id: "c2",
    author: { username: "mike_builds", display_name: "Mike Rivera" },
    body: "Nice idea! How do you handle timezone differences for the weather API?",
    created_at: "2026-02-10T14:30:00Z",
    parent_id: null,
  },
  {
    id: "c3",
    author: { username: "jess_automates", display_name: "Jess Park" },
    body: "I set the location in the agent config — works across timezones seamlessly.",
    created_at: "2026-02-10T15:00:00Z",
    parent_id: "c2",
  },
  {
    id: "c4",
    author: { username: "devtools", display_name: "Dev Tools" },
    body: "Would love a version that runs at custom times. Submitting a remix!",
    created_at: "2026-02-11T09:00:00Z",
    parent_id: null,
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CommentItem({ comment, replies, depth = 0 }: { comment: Comment; replies: Comment[]; depth?: number }) {
  const { isAuthenticated } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);

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
                placeholder="Write a reply..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
              <button className="rounded-lg bg-zinc-800 px-2.5 py-1.5 text-zinc-300 hover:bg-zinc-700">
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} replies={[]} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CommentsSection() {
  const { isAuthenticated } = useAuth();
  const topLevel = SEED_COMMENTS.filter((c) => !c.parent_id);

  return (
    <div className="mt-6 border-t border-zinc-800 pt-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-300">
        Comments ({SEED_COMMENTS.length})
      </h2>

      {/* Comment input or auth nudge */}
      {isAuthenticated ? (
        <div className="mb-4 flex gap-2">
          <textarea
            placeholder="Share your thoughts..."
            rows={2}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
          />
          <button className="self-end rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
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
            replies={SEED_COMMENTS.filter((c) => c.parent_id === comment.id)}
          />
        ))}
      </div>

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
