"use client";

import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldInfo } from "@/components/survey/field-info";
import type { SurveyAnswersValues } from "@/lib/validation/survey";
import type { SelectOption } from "@/lib/survey-options";

interface CheckboxGroupFieldProps {
  name: keyof SurveyAnswersValues;
  label: string;
  description?: string;
  info?: ReactNode;
  options: SelectOption[];
  exclusiveValue?: string;
}

export function CheckboxGroupField({
  name,
  label,
  description,
  info,
  options,
  exclusiveValue,
}: CheckboxGroupFieldProps) {
  const { control, formState } = useFormContext<SurveyAnswersValues>();
  const error = formState.errors[name];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {info && <FieldInfo>{info}</FieldInfo>}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = (field.value as string[]) ?? [];

          function toggle(optionValue: string, checked: boolean) {
            if (checked && optionValue === exclusiveValue) {
              field.onChange([optionValue]);
              return;
            }

            if (checked) {
              const withoutExclusive = exclusiveValue
                ? value.filter((item) => item !== exclusiveValue)
                : value;
              field.onChange([...withoutExclusive, optionValue]);
              return;
            }

            field.onChange(value.filter((item) => item !== optionValue));
          }

          return (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {options.map((option) => {
                const checkboxId = `${name}-${option.value}`;
                const checked = value.includes(option.value);

                return (
                  <label
                    key={option.value}
                    htmlFor={checkboxId}
                    className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={(state) => toggle(option.value, state === true)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          );
        }}
      />
      {error && (
        <p className="text-sm text-destructive">
          {error.message ? String(error.message) : "This field needs attention."}
        </p>
      )}
    </div>
  );
}
