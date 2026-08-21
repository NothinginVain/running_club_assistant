"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SurveyForm } from "@/components/survey/survey-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLatestSurvey } from "@/hooks/use-survey";
import { surveysApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { SurveyAnswersValues } from "@/lib/validation/survey";
import { ApiError } from "@/types/api";
import type { RunningPlanSurveyAnswers } from "@/types";

export default function SurveyPage() {
  const { userId, isLoading: isUserLoading } = useCurrentUser();
  const { data: survey, isLoading: isSurveyLoading } = useLatestSurvey(userId);
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (answers: RunningPlanSurveyAnswers) =>
      survey
        ? surveysApi.update(survey.id, { answers })
        : surveysApi.createRunningPlanSurvey(userId as string, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.latestSurvey(userId as string) });
      toast.success(
        survey ? "Survey updated." : "Survey saved. You're ready to generate a plan.",
      );
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't save your survey.",
      );
    },
  });

  if (isUserLoading || isSurveyLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {survey ? "Update your survey" : "Running plan survey"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer a few questions so your coach can build a plan around you.
        </p>
      </div>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Something went wrong. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <SurveyForm
        defaultValues={
          survey ? (survey.answers as SurveyAnswersValues) : undefined
        }
        isSubmitting={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </div>
  );
}
