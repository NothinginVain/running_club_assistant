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
      />

      <div className="space-y-1.5">
        <Label htmlFor="preferred_long_run_day">Preferred long-run day</Label>
        <Controller
          control={control}
          name="preferred_long_run_day"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="preferred_long_run_day" className="w-full">
                <SelectValue placeholder="Choose a training day above first">
                  {(value: string) =>
                    WEEKDAY_OPTIONS.find((option) => option.value === value)?.label ??
                    "Choose a training day above first"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
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
      />
      <EnumSelectField
        name="preferred_terrain"
        label="Preferred terrain"
        options={TERRAIN_OPTIONS}
      />
      <CheckboxGroupField
        name="available_equipment"
        label="Available equipment"
        options={EQUIPMENT_OPTIONS}
        exclusiveValue="none"
      />
    </div>
  );
}
