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
import { Slider } from "@/components/ui/slider";
import { CheckboxGroupField } from "@/components/survey/checkbox-group-field";
import { EnumSelectField } from "@/components/survey/enum-select-field";
import {
  ISSUE_AREA_OPTIONS,
  RECOVERY_LEVEL_OPTIONS,
  SLEEP_DURATION_OPTIONS,
  STRESS_LEVEL_OPTIONS,
} from "@/lib/survey-options";
import type { SurveyAnswersValues } from "@/lib/validation/survey";

const MEDICAL_CLEARANCE_OPTIONS = [
  { value: "unknown", label: "Not sure / prefer not to say" },
  { value: "yes", label: "Yes, I have clearance" },
  { value: "no", label: "No" },
];

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

      <div className="space-y-1.5">
        <Label htmlFor="has_medical_clearance">Medical clearance</Label>
        <Controller
          control={control}
          name="has_medical_clearance"
          render={({ field }) => (
            <Select
              value={
                field.value === null ? "unknown" : field.value ? "yes" : "no"
              }
              onValueChange={(value) =>
                field.onChange(value === "unknown" ? null : value === "yes")
              }
            >
              <SelectTrigger id="has_medical_clearance" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    MEDICAL_CLEARANCE_OPTIONS.find((option) => option.value === value)
                      ?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MEDICAL_CLEARANCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

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
