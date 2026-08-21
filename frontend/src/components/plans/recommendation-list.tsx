import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecommendationRead } from "@/types";

import { RecommendationCard } from "./recommendation-card";

export function RecommendationList({
  recommendations,
  isLoading,
  isError,
  emptyState,
}: {
  recommendations: RecommendationRead[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyState: ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Couldn&apos;t load plans. Check that the backend is running and try
          again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {recommendations.map((recommendation) => (
        <RecommendationCard key={recommendation.id} recommendation={recommendation} />
      ))}
    </div>
  );
}
