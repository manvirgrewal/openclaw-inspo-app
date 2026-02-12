"use client";

import { cn } from "@/lib/utils/cn";

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-20 w-20 text-2xl",
};

export function UserAvatar({
  avatarUrl,
  displayName,
  username,
  size = "md",
  className,
}: UserAvatarProps) {
  const initial = (displayName ?? username ?? "?")?.[0]?.toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ?? username ?? "User"}
        className={cn("rounded-full object-cover", SIZES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-stone-800 font-bold text-stone-400",
        SIZES[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
