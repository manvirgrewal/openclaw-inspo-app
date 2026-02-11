import type { Idea } from "@/modules/ideas/ideas.types";

export interface Stack {
  id: string;
  author_id: string | null;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  category: string;
  is_featured: boolean;
  status: StackStatus;
  save_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  items?: StackItem[];
  author?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}

export type StackStatus = "draft" | "pending" | "published" | "removed";

export interface StackItem {
  stack_id: string;
  idea_id: string;
  position: number;
  context_note: string | null;
  // Joined
  idea?: Idea;
}

export interface StackCreateInput {
  title: string;
  description: string;
  category: string;
  cover_image_url?: string;
  items: { idea_id: string; position: number; context_note?: string }[];
}
