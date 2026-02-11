import { z } from "zod";
import { CATEGORIES } from "@/config/categories";
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_BODY_LENGTH,
  MAX_SKILLS_PER_IDEA,
  MAX_TAGS_PER_IDEA,
} from "@/config/constants";

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]];

export const ideaCreateSchema = z.object({
  title: z.string().min(3).max(MAX_TITLE_LENGTH).trim(),
  description: z.string().min(10).max(MAX_DESCRIPTION_LENGTH).trim(),
  body: z.string().max(MAX_BODY_LENGTH).trim().optional(),
  prompt: z.string().min(10).max(MAX_PROMPT_LENGTH).trim(),
  category: z.enum(categoryIds),
  complexity: z.enum(["quick", "moderate", "project"]),
  skills: z.array(z.string().max(30)).max(MAX_SKILLS_PER_IDEA).optional(),
  tags: z.array(z.string().max(30)).max(MAX_TAGS_PER_IDEA).optional(),
  remix_of: z.string().uuid().optional(),
});

export const ideaUpdateSchema = ideaCreateSchema.partial();

export const feedParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  category: z.enum(categoryIds).optional(),
  complexity: z.enum(["quick", "moderate", "project"]).optional(),
  skills: z.string().optional(), // Comma-separated, parsed in service
  sort: z.enum(["trending", "newest", "most_saved", "most_built"]).default("trending"),
  search: z.string().max(200).optional(),
});
