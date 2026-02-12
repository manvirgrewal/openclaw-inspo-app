"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Layers, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/auth-context";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const NAV_ITEMS = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/submit", icon: Plus, label: "Add", accent: true },
    { href: "/stacks", icon: Layers, label: "Stacks" },
    { href: "/profile", icon: User, label: "Me" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-800/60 bg-stone-950/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, accent }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition-colors",
                isActive
                  ? accent ? "text-amber-400" : "text-stone-100"
                  : accent ? "text-amber-500/60 active:text-amber-400" : "text-stone-500 active:text-stone-300",
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
