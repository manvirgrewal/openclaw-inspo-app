"use client";

import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/config/categories";

interface FilterChipsProps {
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
          selected === null
            ? "border-zinc-100 bg-zinc-100 text-zinc-900"
            : "border-zinc-700 text-zinc-400 hover:border-zinc-500 active:bg-zinc-800",
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id === selected ? null : cat.id)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            cat.id === selected
              ? "border-zinc-100 bg-zinc-100 text-zinc-900"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 active:bg-zinc-800",
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
