"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GeneratePlanButton } from "@/components/plans/generate-plan-button";
import { RecommendationList } from "@/components/plans/recommendation-list";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useLatestSurvey } from "@/hooks/use-survey";

export default function PlansPage() {
  const { userId } = useCurrentUser();
  const { data: survey, isLoading: isSurveyLoading } = useLatestSurvey(userId);
  const {
    data: recommendations,
    isLoading,
    isError,
  } = useRecommendations(userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every running plan your coach has generated for you.
          </p>
        </div>
        {!isSurveyLoading && userId && survey && (
          <GeneratePlanButton userId={userId} label="Generate new plan" />
        )}
      </div>

      <RecommendationList
        recommendations={recommendations}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <div className="rounded-lg border border-dashed py-12 text-center">
            {survey ? (
              <>
                <p className="text-sm text-muted-foreground">
                  No plans yet. Generate your first one to get started.
                </p>
                {userId && (
                  <div className="mt-4 flex justify-center">
                    <GeneratePlanButton userId={userId} />
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Complete your survey before generating a plan.
                </p>
                <Button
                  className="mt-4"
                  render={<Link href="/survey" />}
                  nativeButton={false}
                >
                  <ClipboardList className="size-4" />
                  Start survey
                </Button>
              </>
            )}
          </div>
        }
      />
    </div>
  );
}
