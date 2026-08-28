import { z } from "zod";

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

const enumValues = <T extends Record<string, string>>(source: T) =>
  Object.values(source) as [T[keyof T], ...T[keyof T][]];

export const surveyAnswersSchema = z
  .object({
    goal: z.enum(enumValues(GoalOption)),
    target_distance: z.enum(enumValues(TargetDistanceOption)),
    plan_duration_weeks: z.union([
      z.literal(4),
      z.literal(6),
      z.literal(8),
      z.literal(12),
      z.literal(16),
    ]),
    plan_start_date: z.string().min(1, "Choose a start date"),
    target_event_date: z.string().nullable(),
    experience_level: z.enum(enumValues(ExperienceLevel)),
    current_weekly_distance_km: z.number().min(0, "Must be 0 or more"),
    runs_per_week: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
      z.literal(7),
    ]),
    longest_recent_run_km: z.number().min(0, "Must be 0 or more"),
    preferred_training_days: z
      .array(z.enum(enumValues(Weekday)))
      .min(1, "Choose at least one training day"),
    preferred_long_run_day: z.enum(enumValues(Weekday)).nullable(),
    max_session_minutes: z.union([
      z.literal(30),
      z.literal(45),
      z.literal(60),
      z.literal(75),
      z.literal(90),
      z.literal(120),
    ]),
    preferred_terrain: z.enum(enumValues(TerrainOption)),
    available_equipment: z
      .array(z.enum(enumValues(EquipmentOption)))
      .min(1, "Choose at least one option"),
    current_issue_areas: z
      .array(z.enum(enumValues(IssueAreaOption)))
      .min(1, "Choose at least one option"),
    current_pain_level: z.number().min(0).max(10),
    medically_cleared_activities: z
      .array(z.enum(enumValues(MedicallyClearedActivity)))
      .max(3, "Choose up to 3 options")
      .nullable(),
    recovery_level: z.enum(enumValues(RecoveryLevel)),
    average_sleep_duration: z.enum(enumValues(SleepDurationOption)),
    stress_level: z.enum(enumValues(StressLevel)),
    diet_type: z.enum(enumValues(DietType)),
    weight_kg: z.number().positive().max(500).nullable(),
    main_preference: z.enum(enumValues(MainPreference)),
    detail_level: z.enum(enumValues(DetailLevel)),
  })
  .superRefine((values, ctx) => {
    if (
      new Set(values.preferred_training_days).size !==
      values.preferred_training_days.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["preferred_training_days"],
        message: "Days cannot repeat",
      });
    }

    if (values.preferred_training_days.length < values.runs_per_week) {
      ctx.addIssue({
        code: "custom",
        path: ["preferred_training_days"],
        message: "Choose at least as many days as your runs per week",
      });
    }

    if (
      values.preferred_long_run_day !== null &&
      !values.preferred_training_days.includes(values.preferred_long_run_day)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["preferred_long_run_day"],
        message: "Long-run day must be one of your training days",
      });
    }

    if (
      values.available_equipment.includes(EquipmentOption.NONE) &&
      values.available_equipment.length > 1
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["available_equipment"],
        message: "\"None\" can't be combined with other equipment",
      });
    }

    if (
      values.current_issue_areas.includes(IssueAreaOption.NONE) &&
      values.current_issue_areas.length > 1
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["current_issue_areas"],
        message: "\"None\" can't be combined with other issues",
      });
    }

    if (
      values.target_event_date &&
      values.target_event_date <= values.plan_start_date
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["target_event_date"],
        message: "Event date must be after the plan start date",
      });
    }

    const hasHealthConcern =
      values.current_pain_level > 0 ||
      !values.current_issue_areas.includes(IssueAreaOption.NONE);

    if (
      hasHealthConcern &&
      (!values.medically_cleared_activities ||
        values.medically_cleared_activities.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["medically_cleared_activities"],
        message: "Required when pain or an issue is reported",
      });
    }

    if (values.medically_cleared_activities) {
      if (
        values.medically_cleared_activities.includes(
          MedicallyClearedActivity.NOT_CLEARED,
        ) &&
        values.medically_cleared_activities.length > 1
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["medically_cleared_activities"],
          message: "\"Not cleared\" can't be combined with other options",
        });
      }

      if (
        new Set(values.medically_cleared_activities).size !==
        values.medically_cleared_activities.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["medically_cleared_activities"],
          message: "Options cannot repeat",
        });
      }
    }
  });

export type SurveyAnswersValues = z.infer<typeof surveyAnswersSchema>;

export const surveyAnswersDefaultValues: SurveyAnswersValues = {
  goal: GoalOption.BUILD_CONSISTENCY,
  target_distance: TargetDistanceOption.NONE,
  plan_duration_weeks: 8,
  plan_start_date: new Date().toISOString().slice(0, 10),
  target_event_date: null,
  experience_level: ExperienceLevel.BEGINNER,
  current_weekly_distance_km: 10,
  runs_per_week: 3,
  longest_recent_run_km: 5,
  preferred_training_days: [Weekday.MONDAY, Weekday.WEDNESDAY, Weekday.SATURDAY],
  preferred_long_run_day: Weekday.SATURDAY,
  max_session_minutes: 60,
  preferred_terrain: TerrainOption.ROAD,
  available_equipment: [EquipmentOption.NONE],
  current_issue_areas: [IssueAreaOption.NONE],
  current_pain_level: 0,
  medically_cleared_activities: null,
  recovery_level: RecoveryLevel.GOOD,
  average_sleep_duration: SleepDurationOption.SEVEN_TO_8_HOURS,
  stress_level: StressLevel.MODERATE,
  diet_type: DietType.OMNIVORE,
  weight_kg: null,
  main_preference: MainPreference.BALANCED_TRAINING,
  detail_level: DetailLevel.BALANCED,
};
