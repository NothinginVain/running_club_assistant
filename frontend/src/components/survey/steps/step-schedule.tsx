"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckboxGroupField } from "@/components/survey/checkbox-group-field";
import { EnumSelectField } from "@/components/survey/enum-select-field";
import { FieldInfo } from "@/components/survey/field-info";
import {
  EQUIPMENT_OPTIONS,
  MAX_SESSION_MINUTES_OPTIONS,
  TERRAIN_OPTIONS,
  WEEKDAY_OPTIONS,
} from "@/lib/survey-options";
import type { SurveyAnswersValues } from "@/lib/validation/survey";

const MAX_SESSION_SELECT_OPTIONS = MAX_SESSION_MINUTES_OPTIONS.map((minutes) => ({
  value: String(minutes),
  label: `${minutes} minutes`,
}));

export function StepSchedule() {
  const { control, watch, formState } = useFormContext<SurveyAnswersValues>();
  const selectedDays = watch("preferred_training_days") ?? [];
  const longRunDayOptions = WEEKDAY_OPTIONS.filter((option) =>
    selectedDays.includes(option.value),
  );

  return (
    <div className="space-y-5">
      <CheckboxGroupField
        name="preferred_training_days"
        label="Which days can you train?"
        options={WEEKDAY_OPTIONS}
        info="Pick every day you could realistically train — your coach will only ever schedule sessions on days you choose here."
      />

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="preferred_long_run_day">Preferred long-run day</Label>
          <FieldInfo>
            Your weekly long run, if you have one, is placed on this day.
            Choose &quot;No preference&quot; if you don&apos;t want a
            dedicated long run.
          </FieldInfo>
        </div>
        <Controller
          control={control}
          name="preferred_long_run_day"
          render={({ field }) => (
            <Select
              value={field.value ?? "none"}
              onValueChange={(value) =>
                field.onChange(value === "none" ? null : value)
              }
            >
              <SelectTrigger id="preferred_long_run_day" className="w-full">
                <SelectValue placeholder="Choose a training day above first">
                  {(value: string) =>
                    value === "none"
                      ? "No preference"
                      : (WEEKDAY_OPTIONS.find((option) => option.value === value)
                          ?.label ?? "Choose a training day above first")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {longRunDayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {formState.errors.preferred_long_run_day && (
          <p className="text-sm text-destructive">
            {formState.errors.preferred_long_run_day.message}
          </p>
        )}
      </div>

      <EnumSelectField
        name="max_session_minutes"
        label="Maximum session duration"
        options={MAX_SESSION_SELECT_OPTIONS}
        numeric
        info="The most time you can realistically give a single session, including warm-up and any strength or mobility work."
      />
      <EnumSelectField
        name="preferred_terrain"
        label="Preferred terrain"
        options={TERRAIN_OPTIONS}
        info="Helps your coach suggest realistic paces and session types for the surfaces you'll actually be running on."
      />
      <CheckboxGroupField
        name="available_equipment"
        label="Available equipment"
        options={EQUIPMENT_OPTIONS}
        exclusiveValue="none"
        info="Only exercises using equipment you select here will be included in strength sessions."
      />
    </div>
  );
}
