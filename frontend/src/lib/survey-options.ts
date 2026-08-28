import {
  DetailLevel,
  DietType,
  EquipmentOption,
  ExperienceLevel,
  GoalOption,
  IssueAreaOption,
  MainPreference,
  MedicallyClearedActivity,
  RecoveryLevel,
  SleepDurationOption,
  StressLevel,
  TargetDistanceOption,
  TerrainOption,
  Weekday,
} from "@/types/enums";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export const GOAL_OPTIONS: SelectOption<GoalOption>[] = [
  { value: GoalOption.START_RUNNING, label: "Start running" },
  { value: GoalOption.GENERAL_FITNESS, label: "General fitness" },
  { value: GoalOption.WEIGHT_MANAGEMENT, label: "Weight management" },
  { value: GoalOption.MAINTAIN_FITNESS, label: "Maintain fitness" },
  { value: GoalOption.BUILD_CONSISTENCY, label: "Build consistency" },
  { value: GoalOption.BUILD_ENDURANCE, label: "Build endurance" },
  { value: GoalOption.IMPROVE_SPEED, label: "Improve speed" },
  { value: GoalOption.RETURN_TO_RUNNING, label: "Return to running" },
  { value: GoalOption.COMPLETE_FIRST_RACE, label: "Complete my first race" },
  { value: GoalOption.RACE_PREPARATION, label: "Race preparation" },
  { value: GoalOption.PERSONAL_BEST, label: "Personal best" },
  { value: GoalOption.STRESS_RELIEF, label: "Stress relief" },
];

export const TARGET_DISTANCE_OPTIONS: SelectOption<TargetDistanceOption>[] = [
  { value: TargetDistanceOption.NONE, label: "No specific distance" },
  { value: TargetDistanceOption.ONE_MILE, label: "1 mile" },
  { value: TargetDistanceOption.RUN_5K, label: "5K" },
  { value: TargetDistanceOption.RUN_10K, label: "10K" },
  { value: TargetDistanceOption.FIFTEEN_K, label: "15K" },
  { value: TargetDistanceOption.HALF_MARATHON, label: "Half marathon" },
  { value: TargetDistanceOption.MARATHON, label: "Marathon" },
  { value: TargetDistanceOption.ULTRAMARATHON, label: "Ultramarathon" },
  { value: TargetDistanceOption.OTHER, label: "Other" },
];

export const PLAN_DURATION_OPTIONS = [4, 6, 8, 12, 16] as const;

export const EXPERIENCE_LEVEL_OPTIONS: SelectOption<ExperienceLevel>[] = [
  { value: ExperienceLevel.BEGINNER, label: "Beginner" },
  { value: ExperienceLevel.INTERMEDIATE, label: "Intermediate" },
  { value: ExperienceLevel.ADVANCED, label: "Advanced" },
];

export const WEEKDAY_OPTIONS: SelectOption<Weekday>[] = [
  { value: Weekday.MONDAY, label: "Monday" },
  { value: Weekday.TUESDAY, label: "Tuesday" },
  { value: Weekday.WEDNESDAY, label: "Wednesday" },
  { value: Weekday.THURSDAY, label: "Thursday" },
  { value: Weekday.FRIDAY, label: "Friday" },
  { value: Weekday.SATURDAY, label: "Saturday" },
  { value: Weekday.SUNDAY, label: "Sunday" },
];

export const RUNS_PER_WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

export const MAX_SESSION_MINUTES_OPTIONS = [30, 45, 60, 75, 90, 120] as const;

export const TERRAIN_OPTIONS: SelectOption<TerrainOption>[] = [
  { value: TerrainOption.ROAD, label: "Road" },
  { value: TerrainOption.TRAIL, label: "Trail" },
  { value: TerrainOption.TRACK, label: "Track" },
  { value: TerrainOption.TREADMILL, label: "Treadmill" },
  { value: TerrainOption.MIXED, label: "Mixed" },
];

export const EQUIPMENT_OPTIONS: SelectOption<EquipmentOption>[] = [
  { value: EquipmentOption.NONE, label: "None" },
  { value: EquipmentOption.RESISTANCE_BAND, label: "Resistance band" },
  { value: EquipmentOption.DUMBBELLS, label: "Dumbbells" },
  { value: EquipmentOption.KETTLEBELL, label: "Kettlebell" },
  { value: EquipmentOption.GYM, label: "Full gym" },
  { value: EquipmentOption.TREADMILL, label: "Treadmill" },
  { value: EquipmentOption.STATIONARY_BIKE, label: "Stationary bike" },
];

export const ISSUE_AREA_OPTIONS: SelectOption<IssueAreaOption>[] = [
  { value: IssueAreaOption.NONE, label: "None" },
  { value: IssueAreaOption.FOOT, label: "Foot" },
  { value: IssueAreaOption.ANKLE, label: "Ankle" },
  { value: IssueAreaOption.ACHILLES, label: "Achilles" },
  { value: IssueAreaOption.CALF, label: "Calf" },
  { value: IssueAreaOption.SHIN, label: "Shin" },
  { value: IssueAreaOption.KNEE, label: "Knee" },
  { value: IssueAreaOption.HAMSTRING, label: "Hamstring" },
  { value: IssueAreaOption.HIP, label: "Hip" },
  { value: IssueAreaOption.LOWER_BACK, label: "Lower back" },
  { value: IssueAreaOption.OTHER, label: "Other" },
];

export const MEDICALLY_CLEARED_ACTIVITY_OPTIONS: SelectOption<MedicallyClearedActivity>[] = [
  { value: MedicallyClearedActivity.NOT_CLEARED, label: "Not cleared for any of these" },
  { value: MedicallyClearedActivity.WALK, label: "Walking" },
  { value: MedicallyClearedActivity.WALK_RUN, label: "Walk-run intervals" },
  { value: MedicallyClearedActivity.RUN, label: "Running" },
];

export const RECOVERY_LEVEL_OPTIONS: SelectOption<RecoveryLevel>[] = [
  { value: RecoveryLevel.POOR, label: "Poor" },
  { value: RecoveryLevel.FAIR, label: "Fair" },
  { value: RecoveryLevel.GOOD, label: "Good" },
  { value: RecoveryLevel.EXCELLENT, label: "Excellent" },
];

export const SLEEP_DURATION_OPTIONS: SelectOption<SleepDurationOption>[] = [
  { value: SleepDurationOption.LESS_THAN_6_HOURS, label: "Less than 6 hours" },
  { value: SleepDurationOption.SIX_TO_7_HOURS, label: "6–7 hours" },
  { value: SleepDurationOption.SEVEN_TO_8_HOURS, label: "7–8 hours" },
  { value: SleepDurationOption.MORE_THAN_8_HOURS, label: "More than 8 hours" },
];

export const STRESS_LEVEL_OPTIONS: SelectOption<StressLevel>[] = [
  { value: StressLevel.LOW, label: "Low" },
  { value: StressLevel.MODERATE, label: "Moderate" },
  { value: StressLevel.HIGH, label: "High" },
  { value: StressLevel.VERY_HIGH, label: "Very high" },
];

export const DIET_TYPE_OPTIONS: SelectOption<DietType>[] = [
  { value: DietType.OMNIVORE, label: "Omnivore" },
  { value: DietType.VEGETARIAN, label: "Vegetarian" },
  { value: DietType.VEGAN, label: "Vegan" },
  { value: DietType.PESCATARIAN, label: "Pescatarian" },
  { value: DietType.OTHER, label: "Other" },
  { value: DietType.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
];

export const MAIN_PREFERENCE_OPTIONS: SelectOption<MainPreference>[] = [
  { value: MainPreference.CONSERVATIVE_PROGRESSION, label: "Conservative progression" },
  { value: MainPreference.BALANCED_TRAINING, label: "Balanced training" },
  { value: MainPreference.CHALLENGING_PROGRESSION, label: "Challenging progression" },
  { value: MainPreference.BUILD_CONSISTENCY, label: "Build consistency" },
  { value: MainPreference.STRENGTH_AND_MOBILITY, label: "Strength & mobility focus" },
  { value: MainPreference.MINIMAL_TIME, label: "Minimal time commitment" },
];

export const DETAIL_LEVEL_OPTIONS: SelectOption<DetailLevel>[] = [
  { value: DetailLevel.CONCISE, label: "Concise" },
  { value: DetailLevel.BALANCED, label: "Balanced" },
  { value: DetailLevel.DETAILED, label: "Detailed" },
];
