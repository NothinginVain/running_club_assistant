"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, type Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  surveyAnswersDefaultValues,
  surveyAnswersSchema,
  type SurveyAnswersValues,
} from "@/lib/validation/survey";

import { StepExperience } from "./steps/step-experience";
import { StepGoals } from "./steps/step-goals";
import { StepHealth } from "./steps/step-health";
import { StepPreferences } from "./steps/step-preferences";
import { StepSchedule } from "./steps/step-schedule";

interface StepDefinition {
  title: string;
  description: string;
  fields: Path<SurveyAnswersValues>[];
  Component: () => React.JSX.Element;
}

const STEPS: StepDefinition[] = [
  {
    title: "Goals & timeline",
    description: "What are you training for, and when does it start?",
    fields: [
      "goal",
      "target_distance",
      "plan_duration_weeks",
      "plan_start_date",
      "target_event_date",
    ],
    Component: StepGoals,
  },
  {
    title: "Experience & volume",
    description: "Where's your running at right now?",
    fields: [
      "experience_level",
      "current_weekly_distance_km",
      "runs_per_week",
      "longest_recent_run_km",
    ],
    Component: StepExperience,
  },
  {
    title: "Schedule",
    description: "When and how do you like to train?",
    fields: [
      "preferred_training_days",
      "preferred_long_run_day",
      "max_session_minutes",
      "preferred_terrain",
      "available_equipment",
    ],
    Component: StepSchedule,
  },
  {
    title: "Health",
    description: "Help your coach keep you injury-free.",
    fields: [
      "current_issue_areas",
      "current_pain_level",
      "has_medical_clearance",
      "recovery_level",
      "average_sleep_duration",
      "stress_level",
    ],
    Component: StepHealth,
  },
  {
    title: "Preferences",
    description: "A few final details to personalize your plan.",
    fields: ["diet_type", "weight_kg", "main_preference", "detail_level"],
    Component: StepPreferences,
  },
];

export function SurveyForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues?: Partial<SurveyAnswersValues>;
  onSubmit: (values: SurveyAnswersValues) => void;
  isSubmitting: boolean;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const methods = useForm<SurveyAnswersValues>({
    resolver: zodResolver(surveyAnswersSchema),
    defaultValues: { ...surveyAnswersDefaultValues, ...defaultValues },
    mode: "onSubmit",
  });

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  async function handleNext() {
    const isValid = await methods.trigger(step.fields);
    if (isValid) {
      setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
    }
  }

  function handleBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  const submitSurvey = methods.handleSubmit(onSubmit);

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <span>{step.title}</span>
          </div>
          <Progress value={progress} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">{step.title}</h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        {/*
          Native submit is disabled and Save triggers handleSubmit via onClick instead of
          type="submit": with this many Base UI form-associated fields (Select/Slider) on one
          page, a step-advancing "Next" click intermittently reached the browser's implicit-form-
          submission path even with type="button" set, submitting the survey early. Routing Save
          through an explicit handler sidesteps native submit entirely.
        */}
        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-6"
          noValidate
        >
          <step.Component />

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={stepIndex === 0}
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>

            {isLastStep ? (
              <Button type="button" onClick={submitSurvey} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                Save survey
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
