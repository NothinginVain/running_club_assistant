export const RecommendationType = {
  RUNNING_PLAN: "running_plan",
  SHOE_RECOMMENDATION: "shoe_recommendation",
} as const;
export type RecommendationType =
  (typeof RecommendationType)[keyof typeof RecommendationType];

export const GoalOption = {
  START_RUNNING: "start_running",
  GENERAL_FITNESS: "general_fitness",
  WEIGHT_MANAGEMENT: "weight_management",
  MAINTAIN_FITNESS: "maintain_fitness",
  BUILD_CONSISTENCY: "build_consistency",
  BUILD_ENDURANCE: "build_endurance",
  IMPROVE_SPEED: "improve_speed",
  RETURN_TO_RUNNING: "return_to_running",
  COMPLETE_FIRST_RACE: "complete_first_race",
  RACE_PREPARATION: "race_preparation",
  PERSONAL_BEST: "personal_best",
  STRESS_RELIEF: "stress_relief",
} as const;
export type GoalOption = (typeof GoalOption)[keyof typeof GoalOption];

export const TargetDistanceOption = {
  NONE: "none",
  ONE_MILE: "one_mile",
  RUN_5K: "5k",
  RUN_10K: "10k",
  FIFTEEN_K: "15k",
  HALF_MARATHON: "half_marathon",
  MARATHON: "marathon",
  ULTRAMARATHON: "ultramarathon",
  OTHER: "other",
} as const;
export type TargetDistanceOption =
  (typeof TargetDistanceOption)[keyof typeof TargetDistanceOption];

export const ExperienceLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;
export type ExperienceLevel =
  (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const Weekday = {
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
  SUNDAY: "sunday",
} as const;
export type Weekday = (typeof Weekday)[keyof typeof Weekday];

export const TerrainOption = {
  ROAD: "road",
  TRAIL: "trail",
  TRACK: "track",
  TREADMILL: "treadmill",
  MIXED: "mixed",
} as const;
export type TerrainOption = (typeof TerrainOption)[keyof typeof TerrainOption];

export const EquipmentOption = {
  NONE: "none",
  RESISTANCE_BAND: "resistance_band",
  DUMBBELLS: "dumbbells",
  KETTLEBELL: "kettlebell",
  GYM: "gym",
  TREADMILL: "treadmill",
  STATIONARY_BIKE: "stationary_bike",
} as const;
export type EquipmentOption =
  (typeof EquipmentOption)[keyof typeof EquipmentOption];

export const IssueAreaOption = {
  NONE: "none",
  FOOT: "foot",
  ANKLE: "ankle",
  ACHILLES: "achilles",
  CALF: "calf",
  SHIN: "shin",
  KNEE: "knee",
  HAMSTRING: "hamstring",
  HIP: "hip",
  LOWER_BACK: "lower_back",
  OTHER: "other",
} as const;
export type IssueAreaOption =
  (typeof IssueAreaOption)[keyof typeof IssueAreaOption];

export const MedicallyClearedActivity = {
  NOT_CLEARED: "not_cleared",
  WALK: "walk",
  WALK_RUN: "walk_run",
  RUN: "run",
} as const;
export type MedicallyClearedActivity =
  (typeof MedicallyClearedActivity)[keyof typeof MedicallyClearedActivity];

export const RecoveryLevel = {
  POOR: "poor",
  FAIR: "fair",
  GOOD: "good",
  EXCELLENT: "excellent",
} as const;
export type RecoveryLevel = (typeof RecoveryLevel)[keyof typeof RecoveryLevel];

export const SleepDurationOption = {
  LESS_THAN_6_HOURS: "less_than_6_hours",
  SIX_TO_7_HOURS: "6_to_7_hours",
  SEVEN_TO_8_HOURS: "7_to_8_hours",
  MORE_THAN_8_HOURS: "more_than_8_hours",
} as const;
export type SleepDurationOption =
  (typeof SleepDurationOption)[keyof typeof SleepDurationOption];

export const StressLevel = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  VERY_HIGH: "very_high",
} as const;
export type StressLevel = (typeof StressLevel)[keyof typeof StressLevel];

export const DietType = {
  OMNIVORE: "omnivore",
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  PESCATARIAN: "pescatarian",
  OTHER: "other",
  PREFER_NOT_TO_SAY: "prefer_not_to_say",
} as const;
export type DietType = (typeof DietType)[keyof typeof DietType];

export const MainPreference = {
  CONSERVATIVE_PROGRESSION: "conservative_progression",
  BALANCED_TRAINING: "balanced_training",
  CHALLENGING_PROGRESSION: "challenging_progression",
  BUILD_CONSISTENCY: "build_consistency",
  STRENGTH_AND_MOBILITY: "strength_and_mobility_focus",
  MINIMAL_TIME: "minimal_time_commitment",
} as const;
export type MainPreference =
  (typeof MainPreference)[keyof typeof MainPreference];

export const DetailLevel = {
  CONCISE: "concise",
  BALANCED: "balanced",
  DETAILED: "detailed",
} as const;
export type DetailLevel = (typeof DetailLevel)[keyof typeof DetailLevel];
