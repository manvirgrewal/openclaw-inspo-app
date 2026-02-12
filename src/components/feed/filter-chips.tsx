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
          "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all",
          selected === null
            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
            : "border-stone-700 text-stone-400 hover:border-stone-500 active:bg-stone-800",
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id === selected ? null : cat.id)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all",
            cat.id === selected
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-stone-700 text-stone-400 hover:border-stone-500 active:bg-stone-800",
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
