import type { CategoryId } from "@/config/categories";
import type { Complexity } from "@/config/constants";

export interface Idea {
  id: string;
  author_id: string | null;
  slug: string;
  title: string;
  description: string;
  body: string | null;
  prompt: string;
  category: CategoryId;
  complexity: Complexity;
  skills: string[];
  tags: string[];
  status: IdeaStatus;
  save_count: number;
  comment_count: number;
  built_count: number;
  view_count: number;
  remix_of: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Joined fields
  author?: AuthorSummary;
  is_saved?: boolean; // For current user
}

export interface AuthorSummary {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export type IdeaStatus = "draft" | "pending" | "published" | "flagged" | "removed";

export interface IdeaCreateInput {
  title: string;
  description: string;
  body?: string;
  prompt: string;
  category: CategoryId;
  complexity: Complexity;
  skills?: string[];
  tags?: string[];
  remix_of?: string;
}

export interface IdeaUpdateInput {
  title?: string;
  description?: string;
  body?: string;
  prompt?: string;
  category?: CategoryId;
  complexity?: Complexity;
  skills?: string[];
  tags?: string[];
}

export interface FeedParams {
  cursor?: string;
  limit?: number;
  category?: CategoryId;
  complexity?: Complexity;
  skills?: string[];
  sort?: "trending" | "newest" | "most_saved" | "most_built";
  search?: string;
}

export interface FeedResponse {
  data: Idea[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
  };
}
