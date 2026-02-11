"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/config/categories";
import { COMPLEXITY_OPTIONS, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_PROMPT_LENGTH, MAX_BODY_LENGTH } from "@/config/constants";
import { ideaCreateSchema } from "@/modules/ideas/ideas.validation";
import { IdeaCard } from "@/components/cards/idea-card";
import { ArrowLeft, Send, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { Idea } from "@/modules/ideas/ideas.types";

const DRAFT_KEY = "inspo-submit-draft";

interface FormData {
  title: string;
  description: string;
  prompt: string;
  category: string;
  complexity: string;
  skills: string[];
  tags: string[];
  body: string;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  prompt: "",
  category: "",
  complexity: "",
  skills: [],
  tags: [],
  body: "",
};

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm(JSON.parse(saved));
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [form]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const addSkill = useCallback(() => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill) && form.skills.length < 10) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput("");
    }
  }, [skillInput, form.skills]);

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  }, [tagInput, form.tags]);

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async () => {
    setSubmitError("");
    const payload = {
      title: form.title,
      description: form.description,
      prompt: form.prompt,
      category: form.category,
      complexity: form.complexity,
      skills: form.skills.length > 0 ? form.skills : undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
      body: form.body || undefined,
    };

    const result = ideaCreateSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Failed to submit");
      }
      localStorage.removeItem(DRAFT_KEY);
      router.push("/");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const previewIdea: Idea = {
    id: "preview",
    author_id: null,
    slug: "preview",
    title: form.title || "Your Idea Title",
    description: form.description || "A short hook describing what this idea does...",
    body: form.body || null,
    prompt: form.prompt || "Your prompt will appear here",
    category: (form.category || "productivity") as Idea["category"],
    complexity: (form.complexity || "quick") as Idea["complexity"],
    skills: form.skills,
    tags: form.tags,
    status: "published",
    save_count: 0,
    comment_count: 0,
    built_count: 0,
    view_count: 0,
    remix_of: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </Link>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
        >
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      <h1 className="mb-6 text-xl font-bold">Submit an Idea</h1>

      {showPreview ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Card preview:</p>
          <IdeaCard idea={previewIdea} />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              placeholder="Morning Briefing Agent"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
            <p className="mt-1 text-xs text-zinc-600">{form.title.length}/{MAX_TITLE_LENGTH}</p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={2}
              placeholder="A short hook — what does this idea do?"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
            <p className="mt-1 text-xs text-zinc-600">{form.description.length}/{MAX_DESCRIPTION_LENGTH}</p>
          </div>

          {/* Prompt */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Prompt *</label>
            <textarea
              value={form.prompt}
              onChange={(e) => updateField("prompt", e.target.value)}
              maxLength={MAX_PROMPT_LENGTH}
              rows={6}
              placeholder="The copyable prompt users will paste into their agent..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none resize-y"
            />
            {errors.prompt && <p className="mt-1 text-xs text-red-400">{errors.prompt}</p>}
            <p className="mt-1 text-xs text-zinc-600">{form.prompt.length}/{MAX_PROMPT_LENGTH}</p>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateField("category", cat.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    form.category === cat.id
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

          {/* Complexity */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Complexity *</label>
            <div className="flex gap-2">
              {COMPLEXITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateField("complexity", opt.id)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2.5 text-center text-xs transition-colors",
                    form.complexity === opt.id
                      ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  <span className="block text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.complexity && <p className="mt-1 text-xs text-red-400">{errors.complexity}</p>}
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Add
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-zinc-600 hover:text-zinc-300">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Tags (optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="text-zinc-600 hover:text-zinc-300">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Body (optional) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Extended Body (optional, markdown)</label>
            <textarea
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              maxLength={MAX_BODY_LENGTH}
              rows={4}
              placeholder="Detailed explanation, setup steps, tips..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none resize-y"
            />
            <p className="mt-1 text-xs text-zinc-600">{form.body.length}/{MAX_BODY_LENGTH}</p>
          </div>

          {/* Submit */}
          {submitError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{submitError}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit Idea"}
          </button>
        </div>
      )}
    </div>
  );
}
