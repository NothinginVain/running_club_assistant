"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CheckboxGroupField } from "@/components/survey/checkbox-group-field";
import { EnumSelectField } from "@/components/survey/enum-select-field";
import { FieldInfo } from "@/components/survey/field-info";
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
        info="Report anywhere you're currently feeling pain, tightness, or instability — this directly shapes how conservative your plan needs to be."
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="current_pain_level">Current pain level</Label>
            <FieldInfo>
              0 means no pain at all. Any pain above 0 changes how your plan
              is built, and above 3 significantly limits what can be
              generated automatically.
            </FieldInfo>
          </div>
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
        info="What a doctor or physiotherapist has explicitly told you is safe — not just your pain level — decides which activities your plan can use."
      />

      <EnumSelectField
        name="recovery_level"
        label="How would you rate your recovery?"
        options={RECOVERY_LEVEL_OPTIONS}
        info="How well you bounce back between sessions — used to judge how much load you can safely absorb."
      />
      <EnumSelectField
        name="average_sleep_duration"
        label="Average sleep"
        options={SLEEP_DURATION_OPTIONS}
        info="Sleep affects recovery and injury risk, so it factors into how much your plan asks of you."
      />
      <EnumSelectField
        name="stress_level"
        label="Current stress level"
        options={STRESS_LEVEL_OPTIONS}
        info="High stress reduces your body's capacity to recover from training, so your plan accounts for it."
      />
    </div>
  );
}
