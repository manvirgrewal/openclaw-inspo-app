"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/config/constants";
import { useAuth } from "@/lib/auth/auth-context";
import { UserAvatar } from "@/components/common/user-avatar";

const NAV_LINKS = [
  { href: "/", label: "Discover" },
  { href: "/stacks", label: "Stacks" },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-stone-800/60 bg-stone-950/95 backdrop-blur-md md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gradient-spark text-lg font-extrabold">✦</span>
            <span className="text-lg font-bold text-stone-100">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "text-stone-100"
                      : "text-stone-500 hover:text-stone-300",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-sm font-semibold text-stone-950 transition-all hover:brightness-110 active:brightness-90"
          >
            <Plus size={16} />
            Submit
          </Link>
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
          >
            <Search size={18} />
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg bg-stone-800/60 px-3 py-1.5 text-sm text-stone-300 transition-colors hover:bg-stone-800"
              >
                {user && (
                  <UserAvatar
                    avatarUrl={user.avatar_url}
                    displayName={user.display_name}
                    username={user.username}
                    size="sm"
                    className="!h-5 !w-5 !text-[9px]"
                  />
                )}
                {user?.display_name}
              </Link>
              <button
                onClick={signOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 rounded-lg bg-stone-800/60 px-3.5 py-1.5 text-sm text-stone-300 transition-colors hover:bg-stone-800"
            >
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
