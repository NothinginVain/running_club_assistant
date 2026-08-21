"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RunningFigureLoader } from "@/components/icons/running-figure-loader";
import { useReviseRecommendation } from "@/hooks/use-generate-recommendation";
import { ApiError } from "@/types/api";
import type { RevisionSafetyError } from "@/types/recommendation";

import { HealthUpdateDialog } from "./health-update-dialog";

function isRevisionSafetyError(detail: unknown): detail is RevisionSafetyError {
  return (
    typeof detail === "object" &&
    detail !== null &&
    "reason" in detail &&
    ((detail as { reason: unknown }).reason === "needs_health_update" ||
      (detail as { reason: unknown }).reason === "requires_coach_review")
  );
}

export function RegenerateSection({
  recommendationId,
  feedbackCount,
}: {
  recommendationId: string;
  feedbackCount: number;
}) {
  const router = useRouter();
  const revise = useReviseRecommendation(recommendationId);
  const [healthUpdate, setHealthUpdate] = useState<{
    open: boolean;
    questions: string[];
  }>({ open: false, questions: [] });
  const [coachReviewMessage, setCoachReviewMessage] = useState<string | null>(null);

  function handleGenerate() {
    setCoachReviewMessage(null);

    revise.mutate(undefined, {
      onSuccess: (newRecommendation) => {
        toast.success("Updated plan ready.");
        router.push(`/plans/${newRecommendation.id}`);
      },
      onError: (error) => {
        if (error instanceof ApiError && isRevisionSafetyError(error.detail)) {
          if (error.detail.reason === "needs_health_update") {
            setHealthUpdate({
              open: true,
              questions: error.detail.questions ?? [],
            });
            return;
          }

          setCoachReviewMessage(error.detail.message);
          return;
        }

        toast.error(
          error instanceof ApiError
            ? error.message
            : "Couldn't generate an updated plan.",
        );
      },
    });
  }

  return (
    <div className="space-y-3">
      {coachReviewMessage && (
        <Alert>
          <AlertTriangle className="size-4" />
          <AlertTitle>Automatic revision paused</AlertTitle>
          <AlertDescription>{coachReviewMessage}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleGenerate} disabled={feedbackCount === 0 || revise.isPending}>
        {revise.isPending ? (
          <>
            <RunningFigureLoader label="Updating your plan" />
            Updating your plan…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            Generate updated plan
          </>
        )}
      </Button>
      {feedbackCount === 0 && (
        <p className="text-xs text-muted-foreground">
          Add feedback above before requesting an updated plan.
        </p>
      )}

      <HealthUpdateDialog
        recommendationId={recommendationId}
        questions={healthUpdate.questions}
        open={healthUpdate.open}
        onOpenChange={(open) => setHealthUpdate((state) => ({ ...state, open }))}
      />
    </div>
  );
}
