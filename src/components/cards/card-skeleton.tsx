import { cn } from "@/lib/utils/cn";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full animate-pulse rounded-xl border border-zinc-800 bg-zinc-900 p-4",
        className,
      )}
    >
      {/* Complexity + Category */}
      <div className="mb-2 flex items-center gap-2">
        <div className="h-4 w-20 rounded bg-zinc-800" />
        <div className="h-4 w-24 rounded-full bg-zinc-800" />
      </div>
      {/* Title */}
      <div className="mb-1 h-5 w-3/4 rounded bg-zinc-800" />
      {/* Description */}
      <div className="mb-1 h-4 w-full rounded bg-zinc-800" />
      <div className="mb-3 h-4 w-2/3 rounded bg-zinc-800" />
      {/* Skills */}
      <div className="mb-3 flex gap-1.5">
        <div className="h-5 w-16 rounded-md bg-zinc-800" />
        <div className="h-5 w-14 rounded-md bg-zinc-800" />
        <div className="h-5 w-18 rounded-md bg-zinc-800" />
      </div>
      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-16 rounded-lg bg-zinc-800" />
        <div className="h-4 w-10 rounded bg-zinc-800" />
        <div className="h-4 w-8 rounded bg-zinc-800" />
      </div>
    </div>
  );
}
