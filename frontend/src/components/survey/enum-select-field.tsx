"use client";

import { Controller, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SurveyAnswersValues } from "@/lib/validation/survey";
import type { SelectOption } from "@/lib/survey-options";

interface EnumSelectFieldProps {
  name: keyof SurveyAnswersValues;
  label: string;
  description?: string;
  options: SelectOption[];
  numeric?: boolean;
  placeholder?: string;
}

export function EnumSelectField({
  name,
  label,
  description,
  options,
  numeric = false,
  placeholder = "Select an option",
}: EnumSelectFieldProps) {
  const { control, formState } = useFormContext<SurveyAnswersValues>();
  const error = formState.errors[name];

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            value={field.value === null || field.value === undefined ? "" : String(field.value)}
            onValueChange={(value) => field.onChange(numeric ? Number(value) : value)}
          >
            <SelectTrigger id={name} className="w-full">
              <SelectValue placeholder={placeholder}>
                {(value: string) =>
                  options.find((option) => option.value === value)?.label ?? placeholder
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-sm text-destructive">
          {error.message ? String(error.message) : "This field needs attention."}
        </p>
      )}
    </div>
  );
}
