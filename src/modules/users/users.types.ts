export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  reputation_score: number;

  // Agent setup
  agent_platform: string | null;
  active_skills: string[];
  setup_description: string | null;
  setup_score: number;

  // Onboarding
  onboarding_role: string | null;
  interests: string[];

  // Counts
  ideas_built_count: number;
  ideas_contributed_count: number;
  follower_count: number;
  following_count: number;

  // Pinned
  pinned_ideas: string[];
  pinned_stacks: string[];
  pinned_builds: string[];

  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = "user" | "moderator" | "admin";

export interface UserOnboarding {
  user_id: string;
  step: number;
  completed: boolean;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateInput {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  agent_platform?: string;
  active_skills?: string[];
  setup_description?: string;
  onboarding_role?: string;
  interests?: string[];
}
