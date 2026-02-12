"use client";

import { cn } from "@/lib/utils/cn";

export type FeedTab = "discover" | "following";

interface FeedTabsProps {
  active: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  isAuthenticated?: boolean;
}

export function FeedTabs({
  active,
  onTabChange,
  isAuthenticated,
}: FeedTabsProps) {
  return (
    <div className="flex items-center border-b border-stone-800/60">
      <button
        onClick={() => onTabChange("discover")}
        className={cn(
          "flex-1 py-2.5 text-sm font-medium text-center transition-colors relative",
          active === "discover"
            ? "text-stone-100"
            : "text-stone-500 hover:text-stone-300"
        )}
      >
        Discover
        {active === "discover" && (
          <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
        )}
      </button>
      {isAuthenticated && (
        <button
          onClick={() => onTabChange("following")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium text-center transition-colors relative",
            active === "following"
              ? "text-stone-100"
              : "text-stone-500 hover:text-stone-300"
          )}
        >
          Following
          {active === "following" && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
          )}
        </button>
      )}
    </div>
  );
}
