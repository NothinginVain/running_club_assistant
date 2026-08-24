"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RunningFigureLoader } from "@/components/icons/running-figure-loader";
import { SurveyForm } from "@/components/survey/survey-form";
import { useGenerateRecommendation } from "@/hooks/use-generate-recommendation";
import { surveysApi } from "@/lib/api";
import type { RunningPlanSurveyAnswers, SurveyRead } from "@/types";
import { ApiError } from "@/types/api";

export default function NewSurveyPage() {
  const router = useRouter();
  const [createdSurvey, setCreatedSurvey] = useState<SurveyRead | null>(null);
  const generate = useGenerateRecommendation();

  const createSurvey = useMutation({
    mutationFn: (answers: RunningPlanSurveyAnswers) => surveysApi.create(answers),
    onSuccess: (survey) => {
      setCreatedSurvey(survey);
      runGeneration();
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't save your survey.",
      );
    },
  });

  function runGeneration() {
    generate.mutate(undefined, {
      onSuccess: (recommendation) => {
        toast.success("Your new plan is ready.");
        router.push(`/plans/${recommendation.id}`);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Couldn't generate a plan. Please try again.",
        );
      },
    });
  }

  const isGenerating = createSurvey.isPending || generate.isPending;

  if (createdSurvey && generate.isError) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight">
            Your survey was saved
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your coach couldn&apos;t generate a plan from it yet. Nothing was
            lost — you can retry right away.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            {generate.error instanceof ApiError
              ? generate.error.message
              : "Couldn't generate a plan. Please try again."}
          </AlertDescription>
        </Alert>

        <Button onClick={runGeneration} disabled={generate.isPending}>
          {generate.isPending ? (
            <>
              <RunningFigureLoader label="Generating your plan" />
              Your coach is building your plan…
            </>
          ) : (
            "Retry generating my plan"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">
          Running plan survey
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer a few questions so your coach can build a plan around you.
        </p>
      </div>

      {createSurvey.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createSurvey.error instanceof ApiError
              ? createSurvey.error.message
              : "Something went wrong. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <SurveyForm
        isSubmitting={isGenerating}
        submitLabel={
          isGenerating ? "Your coach is building your plan…" : "Generate my plan"
        }
        onSubmit={(values) => createSurvey.mutate(values)}
      />
    </div>
  );
}
