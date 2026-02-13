"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/config/categories";

interface FilterChipsProps {
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag state
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0, hasMoved: false });

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      ro.disconnect();
    };
  }, [updateScrollButtons]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  // Click-and-drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    // Only drag with primary button
    if (e.button !== 0) return;
    dragState.current.isDragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.scrollLeft = el.scrollLeft;
    dragState.current.hasMoved = false;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 8) dragState.current.hasMoved = true;
    el.scrollLeft = dragState.current.scrollLeft - dx;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current.isDragging = false;
    el.style.cursor = "";
    el.style.userSelect = "";
  }, []);

  // Prevent click on chip if we just dragged
  const handleChipClick = useCallback((e: React.MouseEvent, categoryId: string | null) => {
    if (dragState.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelect(categoryId);
  }, [onSelect]);

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-stone-900/90 p-1 shadow-lg border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 backdrop-blur-sm md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Chips */}
      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none cursor-grab md:px-6"
      >
        <button
          onClick={(e) => handleChipClick(e, null)}
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
            onClick={(e) => handleChipClick(e, cat.id === selected ? null : cat.id)}
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

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-stone-900/90 p-1 shadow-lg border border-stone-700 text-stone-400 hover:text-stone-200 hover:border-stone-500 backdrop-blur-sm md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
