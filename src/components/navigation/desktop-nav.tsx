"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/config/constants";

const NAV_LINKS = [
  { href: "/", label: "Discover" },
  { href: "/stacks", label: "Stacks" },
  { href: "/challenges", label: "Challenges" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-bold text-zinc-100">
            ✦ {APP_NAME}
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
                      ? "text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Submit + Search + Sign In */}
        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            <Plus size={16} />
            Submit Idea
          </Link>
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            <User size={16} />
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
