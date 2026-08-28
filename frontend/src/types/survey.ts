import type {
  DetailLevel,
  DietType,
  EquipmentOption,
  ExperienceLevel,
  GoalOption,
  IssueAreaOption,
  MainPreference,
  MedicallyClearedActivity,
  RecommendationType,
  RecoveryLevel,
  SleepDurationOption,
  StressLevel,
  TargetDistanceOption,
  TerrainOption,
  Weekday,
} from "./enums";

export interface RunningPlanSurveyAnswers {
  goal: GoalOption;
  target_distance: TargetDistanceOption;
  plan_duration_weeks: 4 | 6 | 8 | 12 | 16;
  plan_start_date: string;
  target_event_date: string | null;
  experience_level: ExperienceLevel;
  current_weekly_distance_km: number;
  runs_per_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  longest_recent_run_km: number;
  preferred_training_days: Weekday[];
  preferred_long_run_day: Weekday | null;
  max_session_minutes: 30 | 45 | 60 | 75 | 90 | 120;
  preferred_terrain: TerrainOption;
  available_equipment: EquipmentOption[];
  current_issue_areas: IssueAreaOption[];
  current_pain_level: number;
  medically_cleared_activities: MedicallyClearedActivity[] | null;
  recovery_level: RecoveryLevel;
  average_sleep_duration: SleepDurationOption;
  stress_level: StressLevel;
  diet_type: DietType;
  weight_kg: number | null;
  main_preference: MainPreference;
  detail_level: DetailLevel;
}

export interface RunningPlanSurveyCreate {
  survey_type: typeof RecommendationType.RUNNING_PLAN;
  answers: RunningPlanSurveyAnswers;
}

export interface SurveyRead {
  id: string;
  user_id: string;
  survey_type: RecommendationType;
  answers: RunningPlanSurveyAnswers | Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
