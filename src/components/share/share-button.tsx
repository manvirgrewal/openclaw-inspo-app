"use client";

import { useState, useCallback } from "react";
import { Share2, Link2, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/common/toast";

interface ShareButtonProps {
  title: string;
  slug: string;
  description?: string;
  className?: string;
}

export function ShareButton({ title, slug, description, className }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/idea/${slug}`
    : `/idea/${slug}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link copied!");
      setTimeout(() => { setCopied(false); setShowMenu(false); }, 1500);
    } catch {}
  }, [url, toast]);

  const handleShareX = useCallback(() => {
    const text = `Check out this AI automation idea: "${title}" 🤖\n\n${description ? description + "\n\n" : ""}Copy the prompt and try it → ${url}\n\n#AIautomation`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
    setShowMenu(false);
  }, [title, description, url]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        setShowMenu(false);
      } catch {}
    }
  }, [title, description, url]);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => {
          // Try native share first on mobile
          if (typeof navigator !== "undefined" && "share" in navigator) {
            handleNativeShare();
          } else {
            setShowMenu(!showMenu);
          }
        }}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
      >
        <Share2 size={16} />
        Share
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-xl">
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={handleShareX}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <XIcon size={14} />
              Share to X
            </button>
          </div>
        </>
      )}
    </div>
  );
}
