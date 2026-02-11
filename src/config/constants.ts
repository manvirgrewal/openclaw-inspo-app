export const APP_NAME = "OpenClaw Inspo";
export const APP_DESCRIPTION = "Discover, save, and share AI agent automation ideas.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const FEED_PAGE_SIZE = 20;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 280;
export const MAX_PROMPT_LENGTH = 5000;
export const MAX_BODY_LENGTH = 10000;
export const MAX_PINNED_IDEAS = 3;
export const MAX_PINNED_STACKS = 2;
export const MAX_PINNED_BUILDS = 2;
export const MAX_SKILLS_PER_IDEA = 10;
export const MAX_TAGS_PER_IDEA = 10;

export const COMPLEXITY_OPTIONS = [
  { id: "quick", label: "Quick Setup", icon: "⚡", description: "Under 5 minutes" },
  { id: "moderate", label: "Moderate", icon: "🔧", description: "15-30 minutes" },
  { id: "project", label: "Project", icon: "🏗️", description: "1+ hours" },
] as const;

export type Complexity = (typeof COMPLEXITY_OPTIONS)[number]["id"];

export const RATE_LIMITS = {
  anonymous: { requests: 60, windowMs: 60_000 },
  authenticated: { requests: 120, windowMs: 60_000 },
  writes: { requests: 10, windowMs: 60_000 },
} as const;
