"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumSelectField } from "@/components/survey/enum-select-field";
import { FieldInfo } from "@/components/survey/field-info";
import {
  DETAIL_LEVEL_OPTIONS,
  DIET_TYPE_OPTIONS,
  MAIN_PREFERENCE_OPTIONS,
} from "@/lib/survey-options";
import type { SurveyAnswersValues } from "@/lib/validation/survey";

export function StepPreferences() {
  const { control, formState } = useFormContext<SurveyAnswersValues>();

  return (
    <div className="space-y-5">
      <EnumSelectField
        name="diet_type"
        label="Diet type"
        options={DIET_TYPE_OPTIONS}
        info="Used to tailor the nutrition suggestions included with your plan."
      />

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="weight_kg">
            Weight
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          </Label>
          <FieldInfo>
            Optional — used only to make nutrition guidance more specific to
            you.
          </FieldInfo>
        </div>
        <div className="relative">
          <Controller
            control={control}
            name="weight_kg"
            render={({ field }) => (
              <Input
                id="weight_kg"
                type="number"
                min={0}
                step={0.5}
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ? null : Number(event.target.value),
                  )
                }
              />
            )}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            kg
          </span>
        </div>
        {formState.errors.weight_kg && (
          <p className="text-sm text-destructive">
            {formState.errors.weight_kg.message}
          </p>
        )}
      </div>

      <EnumSelectField
        name="main_preference"
        label="What matters most to you?"
        options={MAIN_PREFERENCE_OPTIONS}
        info="Sets the overall tone of your plan — e.g. cautious and steady vs. more ambitious progression."
      />
      <EnumSelectField
        name="detail_level"
        label="How detailed should your plan be?"
        options={DETAIL_LEVEL_OPTIONS}
        info="How much explanation is included alongside each session, from concise to fully detailed."
      />
    </div>
  );
}
