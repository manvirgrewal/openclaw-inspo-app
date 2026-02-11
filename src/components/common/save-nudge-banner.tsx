"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { getGuestSaveCount } from "@/hooks/use-guest-saves";

const DISMISS_KEY = "inspo-nudge-dismissed";
const DISMISS_DAYS = 7;

export function SaveNudgeBanner() {
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 86400000) return;
    if (getGuestSaveCount() >= 5) setShow(true);
  }, [isAuthenticated]);

  if (!show) return null;

  return (
    <div className="mx-4 mb-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
      <p className="flex-1 text-zinc-400">
        You&apos;ve saved 5 ideas! Sign in to keep them synced across devices.
      </p>
      <Link href="/auth/login" className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200">
        Sign In
      </Link>
      <button
        onClick={() => {
          setShow(false);
          try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
        }}
        className="shrink-0 text-zinc-600 hover:text-zinc-400"
      >
        <X size={16} />
      </button>
    </div>
  );
}
