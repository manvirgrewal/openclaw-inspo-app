"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock } from "lucide-react";
import { IdeaCard } from "@/components/cards/idea-card";
import type { Idea } from "@/modules/ideas/ideas.types";

const RECENT_KEY = "inspo-recent-searches";
const MAX_RECENT = 8;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRecent = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recent.filter((r) => r !== trimmed)].slice(0, MAX_RECENT);
    setRecent(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
  };

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
      if (value.trim()) saveRecent(value);
    }, 300);
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    doSearch(q);
    saveRecent(q);
  };

  const clearRecent = () => {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  };

  return (
    <div className="px-4 py-4">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search ideas, prompts, skills..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Recent searches (when no query) */}
      {!query && recent.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Recent Searches</span>
            <button onClick={clearRecent} className="text-xs text-zinc-600 hover:text-zinc-400">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((q) => (
              <button
                key={q}
                onClick={() => handleRecentClick(q)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
              >
                <Clock size={12} />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="py-16 text-center">
          <Search size={32} className="mx-auto mb-3 text-zinc-700" />
          <p className="text-sm text-zinc-500">No results found for &ldquo;{query}&rdquo;</p>
          <p className="mt-1 text-xs text-zinc-600">Try different keywords or browse categories</p>
        </div>
      )}

      {/* Empty state */}
      {!query && recent.length === 0 && (
        <div className="py-16 text-center">
          <Search size={32} className="mx-auto mb-3 text-zinc-700" />
          <p className="text-sm text-zinc-500">Search for ideas, prompts, and skills</p>
        </div>
      )}
    </div>
  );
}
