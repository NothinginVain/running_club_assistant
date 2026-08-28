"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldInfo } from "@/components/survey/field-info";
import type { SurveyAnswersValues } from "@/lib/validation/survey";

interface NumberFieldProps {
  name: keyof SurveyAnswersValues;
  label: string;
  description?: string;
  info?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  optional?: boolean;
}

export function NumberField({
  name,
  label,
  description,
  info,
  min,
  max,
  step = 1,
  suffix,
  optional = false,
}: NumberFieldProps) {
  const { register, formState } = useFormContext<SurveyAnswersValues>();
  const error = formState.errors[name];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={name}>
          {label}
          {optional && (
            <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
          )}
        </Label>
        {info && <FieldInfo>{info}</FieldInfo>}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="relative">
        <Input
          id={name}
          type="number"
          min={min}
          max={max}
          step={step}
          {...register(name, { valueAsNumber: true })}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">
          {error.message ? String(error.message) : "This field needs attention."}
        </p>
      )}
    </div>
  );
}
