import type { Idea } from "@/modules/ideas/ideas.types";

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  rules: string | null;
  starts_at: string;
  ends_at: string;
  status: ChallengeStatus;
  winner_idea_id: string | null;
  created_at: string;
  // Joined
  entries?: ChallengeEntry[];
  winner?: Idea;
}

export type ChallengeStatus = "upcoming" | "active" | "voting" | "completed";

export interface ChallengeEntry {
  challenge_id: string;
  idea_id: string;
  submitted_at: string;
  // Joined
  idea?: Idea;
}
