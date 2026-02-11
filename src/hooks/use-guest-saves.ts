"use client";

import { useState, useCallback, useEffect } from "react";

const SAVES_KEY = "inspo-guest-saves";
const MAX_GUEST_SAVES = 50;

function readSaves(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVES_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSaves(ids: string[]) {
  try { localStorage.setItem(SAVES_KEY, JSON.stringify(ids)); } catch {}
}

export function useGuestSaves() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(readSaves());
  }, []);

  const saveIdea = useCallback((id: string) => {
    setSavedIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_GUEST_SAVES) return prev;
      const next = [...prev, id];
      writeSaves(next);
      return next;
    });
  }, []);

  const unsaveIdea = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeSaves(next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const getSaveCount = useCallback(() => savedIds.length, [savedIds]);

  return { savedIds, saveIdea, unsaveIdea, isSaved, getSaveCount };
}

// Static helpers for use outside hooks
export function getGuestSaveCount(): number {
  return readSaves().length;
}

export function getGuestSavedIds(): string[] {
  return readSaves();
}
