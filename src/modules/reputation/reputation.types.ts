export interface SparkTier {
  min: number;
  label: string;
  icon: string;
}

export interface AuthorReputation {
  spark: number;
  tier: SparkTier;
  nextTier: SparkTier | null;
  progress: number; // 0-1 progress to next tier
}

export interface IdeaQuality {
  score: number; // 0-100
  positiveSignals: number;
  negativeSignals: number;
  didntWorkRate: number; // 0-1
}

export interface AuthorTrust {
  score: number; // 0-100
  requiresModeration: boolean;
  reducedVisibility: boolean;
}

export type PromptFeedback = "worked" | "didnt_work";

export interface PromptFeedbackRecord {
  idea_id: string;
  user_id: string;
  feedback: PromptFeedback;
  reason?: string; // optional: 'broken' | 'outdated' | 'misleading' | 'other'
  created_at: string;
}
