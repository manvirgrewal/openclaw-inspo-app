"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import { useAuth } from "@/lib/auth/auth-context";
import { UserAvatar } from "@/components/common/user-avatar";

export function TopBar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-800/60 bg-stone-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-gradient-spark text-base font-extrabold tracking-tight">✦</span>
          <span className="text-base font-bold text-stone-100">{APP_NAME}</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-colors hover:text-stone-200 active:bg-stone-800"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          >
            {isAuthenticated && user ? (
              <UserAvatar
                avatarUrl={user.avatar_url}
                displayName={user.display_name}
                username={user.username}
                size="sm"
                className="!h-7 !w-7 !text-[10px]"
              />
            ) : (
              <User size={18} className="text-stone-400" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
