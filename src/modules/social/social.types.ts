export interface Save {
  user_id: string;
  idea_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  idea_id: string;
  author_id: string | null;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  // Joined
  author?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
  replies?: Comment[];
}

export interface Vote {
  user_id: string;
  target_type: VoteTargetType;
  target_id: string;
  value: 1 | -1;
  created_at: string;
}

export type VoteTargetType = "idea" | "comment";

export interface BuiltThis {
  id: string;
  idea_id: string;
  user_id: string;
  story: string | null;
  screenshot_urls: string[];
  time_saved_weekly: string | null;
  before_workflow: string | null;
  after_workflow: string | null;
  impact_rating: number | null;
  created_at: string;
  // Joined
  author?: { id: string; username: string; display_name: string | null; avatar_url: string | null };
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Activity {
  id: number;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string | null;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export type ReportTargetType = "idea" | "comment" | "user";
export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";
