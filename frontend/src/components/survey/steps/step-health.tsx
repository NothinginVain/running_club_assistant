"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CheckboxGroupField } from "@/components/survey/checkbox-group-field";
import { EnumSelectField } from "@/components/survey/enum-select-field";
import {
  ISSUE_AREA_OPTIONS,
  MEDICALLY_CLEARED_ACTIVITY_OPTIONS,
  RECOVERY_LEVEL_OPTIONS,
  SLEEP_DURATION_OPTIONS,
  STRESS_LEVEL_OPTIONS,
} from "@/lib/survey-options";
import type { SurveyAnswersValues } from "@/lib/validation/survey";

export function StepHealth() {
  const { control, watch } = useFormContext<SurveyAnswersValues>();
  const painLevel = watch("current_pain_level");

  return (
    <div className="space-y-5">
      <CheckboxGroupField
        name="current_issue_areas"
        label="Any current issue areas?"
        options={ISSUE_AREA_OPTIONS}
        exclusiveValue="none"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="current_pain_level">Current pain level</Label>
          <span className="text-sm text-muted-foreground">{painLevel}/10</span>
        </div>
        <Controller
          control={control}
          name="current_pain_level"
          render={({ field }) => (
            <Slider
              id="current_pain_level"
              min={0}
              max={10}
              step={1}
              value={[field.value]}
              onValueChange={(newValue) =>
                field.onChange(Array.isArray(newValue) ? newValue[0] : newValue)
              }
            />
          )}
        />
      </div>

      <CheckboxGroupField
        name="medically_cleared_activities"
        label="Which activities are you medically cleared for?"
        description="Required if you reported pain or an issue area above — this decides whether your plan can include running, walk-run intervals, or walking only."
        options={MEDICALLY_CLEARED_ACTIVITY_OPTIONS}
        exclusiveValue="not_cleared"
      />

      <EnumSelectField
        name="recovery_level"
        label="How would you rate your recovery?"
        options={RECOVERY_LEVEL_OPTIONS}
      />
      <EnumSelectField
        name="average_sleep_duration"
        label="Average sleep"
        options={SLEEP_DURATION_OPTIONS}
      />
      <EnumSelectField
        name="stress_level"
        label="Current stress level"
        options={STRESS_LEVEL_OPTIONS}
      />
    </div>
  );
}
