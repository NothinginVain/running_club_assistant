"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumSelectField } from "@/components/survey/enum-select-field";
import { FieldInfo } from "@/components/survey/field-info";
import {
  GOAL_OPTIONS,
  PLAN_DURATION_OPTIONS,
  TARGET_DISTANCE_OPTIONS,
} from "@/lib/survey-options";
import type { SurveyAnswersValues } from "@/lib/validation/survey";

const PLAN_DURATION_SELECT_OPTIONS = PLAN_DURATION_OPTIONS.map((weeks) => ({
  value: String(weeks),
  label: `${weeks} weeks`,
}));

export function StepGoals() {
  const { register, control, formState } = useFormContext<SurveyAnswersValues>();

  return (
    <div className="space-y-5">
      <EnumSelectField
        name="goal"
        label="What's your main goal?"
        options={GOAL_OPTIONS}
        info="Shapes the overall focus of your plan — e.g. build endurance favors longer easy runs, while improve speed adds more quality sessions."
      />
      <EnumSelectField
        name="target_distance"
        label="Target distance"
        options={TARGET_DISTANCE_OPTIONS}
        info="If you're training toward a specific race distance, your plan is built to reach it safely by your target date."
      />
      <EnumSelectField
        name="plan_duration_weeks"
        label="Plan length"
        options={PLAN_DURATION_SELECT_OPTIONS}
        numeric
        info="Longer plans allow a more gradual, safer build-up in training load."
      />

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="plan_start_date">Plan start date</Label>
          <FieldInfo>
            The first day of week 1 — your whole plan is scheduled forward
            from this date.
          </FieldInfo>
        </div>
        <Input
          id="plan_start_date"
          type="date"
          {...register("plan_start_date")}
        />
        {formState.errors.plan_start_date && (
          <p className="text-sm text-destructive">
            {formState.errors.plan_start_date.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="target_event_date">
            Target event date
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </Label>
          <FieldInfo>
            If you have a race booked, add it here so your plan can taper
            properly in the days before it.
          </FieldInfo>
        </div>
        <Controller
          control={control}
          name="target_event_date"
          render={({ field }) => (
            <Input
              id="target_event_date"
              type="date"
              value={field.value ?? ""}
              onChange={(event) =>
                field.onChange(event.target.value === "" ? null : event.target.value)
              }
            />
          )}
        />
        {formState.errors.target_event_date && (
          <p className="text-sm text-destructive">
            {formState.errors.target_event_date.message}
          </p>
        )}
      </div>
    </div>
  );
}
