import type { RecommendationType } from "./enums";

export type SupportTiming = "before_run" | "after_run" | "separate" | "rest_day";

export interface RunningBlock {
  type: string;
  distance_km: number;
  intensity_level: string;
  details: string;
}

export interface WalkingBlock {
  type: "walk" | "walk_run";
  distance_km: number;
  duration_minutes: number;
  intensity_level: string;
  details: string;
}

export interface SupportBlock {
  focus: string;
  timing: SupportTiming;
  duration_minutes: number;
  details: string;
}

export interface TrainingDay {
  week_number: number;
  date: string;
  day: string;
  running: RunningBlock | null;
  walking: WalkingBlock | null;
  strength: SupportBlock | null;
  mobility: SupportBlock | null;
  notes: string | null;
}

export interface WeeklyDistance {
  week_number: number;
  start_date: string;
  end_date: string;
  distance_km: number;
}

export interface PlanContent {
  summary: string;
  weekly_distance: WeeklyDistance[];
  training_days: TrainingDay[];
  safety_notes: string[];
}

export interface PlanExplanation {
  why_this_plan_fits: string[];
}

export interface RecommendationRead {
  id: string;
  survey_id: string;
  user_id: string;
  recommendation_type: RecommendationType;
  title: string;
  content: PlanContent;
  explanation: PlanExplanation | null;
  survey_snapshot: Record<string, unknown>;
  feedback_rating: number | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecommendationRatingUpdate {
  feedback_rating: number;
}

export interface RecommendationFavoriteUpdate {
  is_favorite: boolean;
}

export const RECOMMENDATION_RATING_MIN = 1;
export const RECOMMENDATION_RATING_MAX = 5;

export interface RevisionSafetyError {
  reason: "needs_health_update" | "requires_coach_review";
  message: string;
}

export interface TrainingBlockedError {
  reason: "training_blocked";
  message: string;
}
