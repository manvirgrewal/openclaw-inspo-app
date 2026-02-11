"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Plus, GripVertical, X, Layers, Send } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/common/toast";
import { CATEGORIES } from "@/config/categories";
import { SEED_IDEAS } from "@/data/seed-ideas";
import type { Idea } from "@/modules/ideas/ideas.types";
import type { Stack } from "@/modules/stacks/stacks.types";

interface StackItemDraft {
  idea: Idea;
  context_note: string;
}

const MAX_TITLE = 80;
const MAX_DESC = 300;
const MAX_CONTEXT = 200;

export default function CreateStackPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<StackItemDraft[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // All available ideas (seed + user-created)
  const [allIdeas, setAllIdeas] = useState<Idea[]>(SEED_IDEAS);
  useEffect(() => {
    try {
      const userIdeas: Idea[] = JSON.parse(localStorage.getItem("inspo-user-ideas") || "[]");
      setAllIdeas([...userIdeas, ...SEED_IDEAS]);
    } catch {}
  }, []);

  // Filter ideas for search (exclude already added)
  const addedIds = new Set(items.map((i) => i.idea.id));
  const searchResults = searchQuery.trim()
    ? allIdeas
        .filter((idea) => !addedIds.has(idea.id))
        .filter(
          (idea) =>
            idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8)
    : allIdeas.filter((idea) => !addedIds.has(idea.id)).slice(0, 8);

  const addIdea = useCallback((idea: Idea) => {
    setItems((prev) => [...prev, { idea, context_note: "" }]);
    setSearchQuery("");
    setShowSearch(false);
  }, []);

  const removeIdea = useCallback((ideaId: string) => {
    setItems((prev) => prev.filter((i) => i.idea.id !== ideaId));
  }, []);

  const updateContextNote = useCallback((ideaId: string, note: string) => {
    setItems((prev) =>
      prev.map((i) => (i.idea.id === ideaId ? { ...i, context_note: note } : i))
    );
  }, []);

  const moveItem = useCallback((fromIndex: number, direction: "up" | "down") => {
    setItems((prev) => {
      const next = [...prev];
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= next.length) return prev;
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (title.trim().length < 3) newErrors.title = "Title must be at least 3 characters";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category) newErrors.category = "Pick a category";
    if (items.length < 2) newErrors.items = "Add at least 2 ideas to your stack";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const newStack: Stack & { _items: { idea: Idea; context_note: string | null }[] } = {
        id: `user-stack-${Date.now()}`,
        author_id: user?.id ?? "demo-user-1",
        slug: `${slug}-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        cover_image_url: null,
        category,
        is_featured: false,
        status: "published",
        save_count: 0,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          id: user?.id ?? "demo-user-1",
          username: user?.username ?? "demo_user",
          display_name: user?.display_name ?? "Demo User",
          avatar_url: user?.avatar_url ?? null,
        },
        items: items.map((item, i) => ({
          stack_id: "",
          idea_id: item.idea.id,
          position: i,
          context_note: item.context_note.trim() || null,
        })),
        // Store full idea data for detail page rendering
        _items: items.map((item) => ({
          idea: item.idea,
          context_note: item.context_note.trim() || null,
        })),
      };

      // Patch stack_id into items
      newStack.items = newStack.items!.map((it) => ({ ...it, stack_id: newStack.id }));

      const existing = JSON.parse(localStorage.getItem("inspo-user-stacks") || "[]");
      existing.unshift(newStack);
      localStorage.setItem("inspo-user-stacks", JSON.stringify(existing));

      toast("Stack created!");
      router.push(`/stacks/${newStack.slug}`);
    } catch (err) {
      toast("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <Layers size={32} className="mb-3 text-zinc-600" />
        <h1 className="mb-2 text-lg font-semibold text-zinc-200">Sign in to create stacks</h1>
        <p className="mb-6 text-sm text-zinc-500">
          Bundle ideas together into powerful workflows.
        </p>
        <Link href="/" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/stacks" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
          <ArrowLeft size={20} />
          <span className="text-sm">Stacks</span>
        </Link>
      </div>

      <div className="mb-1 flex items-center gap-1.5">
        <Layers size={14} className="text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">New Stack</span>
      </div>
      <h1 className="mb-6 text-xl font-bold">Create a Stack</h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
            maxLength={MAX_TITLE}
            placeholder="The Morning Autopilot"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          <p className="mt-1 text-xs text-zinc-600">{title.length}/{MAX_TITLE}</p>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Description *</label>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
            maxLength={MAX_DESC}
            rows={3}
            placeholder="What does this stack help you do? Why do these ideas work together?"
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
          <p className="mt-1 text-xs text-zinc-600">{description.length}/{MAX_DESC}</p>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Category *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); setErrors((p) => ({ ...p, category: "" })); }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  category === cat.id
                    ? cat.color
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
        </div>

        {/* Ideas in Stack */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Ideas ({items.length}) *
            </label>
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <Plus size={14} />
              Add Idea
            </button>
          </div>
          {errors.items && <p className="mb-2 text-xs text-red-400">{errors.items}</p>}

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-700 py-10 text-center">
              <Layers size={24} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-sm text-zinc-500">No ideas added yet</p>
              <p className="text-xs text-zinc-600">Search and add ideas to build your stack</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={item.idea.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                >
                  <div className="flex items-start gap-2">
                    {/* Position + reorder */}
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-400">
                        {i + 1}
                      </span>
                      <button
                        onClick={() => moveItem(i, "up")}
                        disabled={i === 0}
                        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem(i, "down")}
                        disabled={i === items.length - 1}
                        className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Idea info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{item.idea.title}</p>
                          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">
                            {item.idea.description}
                          </p>
                        </div>
                        <button
                          onClick={() => removeIdea(item.idea.id)}
                          className="shrink-0 text-zinc-600 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Context note */}
                      <input
                        type="text"
                        value={item.context_note}
                        onChange={(e) => updateContextNote(item.idea.id, e.target.value)}
                        maxLength={MAX_CONTEXT}
                        placeholder="Add context — why this idea fits here..."
                        className="mt-2 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <Send size={16} />
          {submitting ? "Creating..." : "Create Stack"}
        </button>
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}
        >
          <div className="max-h-[80dvh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-zinc-900 sm:rounded-2xl">
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ideas to add..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
                <button onClick={() => setShowSearch(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-2" style={{ maxHeight: "calc(80dvh - 60px)" }}>
              {searchResults.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">No ideas found</p>
              ) : (
                searchResults.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => addIdea(idea)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800"
                  >
                    <Plus size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{idea.title}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">{idea.description}</p>
                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        {idea.category} · {idea.complexity}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
