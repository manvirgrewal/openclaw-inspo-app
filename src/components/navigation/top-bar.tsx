"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";
import { APP_NAME } from "@/config/constants";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-base font-bold text-zinc-100">
          {APP_NAME}
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 active:bg-zinc-800"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 active:bg-zinc-800"
          >
            <User size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
