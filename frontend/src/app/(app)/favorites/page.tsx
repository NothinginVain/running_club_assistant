"use client";

import { RecommendationList } from "@/components/plans/recommendation-list";
import { useFavoriteRecommendations } from "@/hooks/use-recommendations";

export default function FavoritesPage() {
  const { data: recommendations, isLoading, isError } = useFavoriteRecommendations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plans you&apos;ve marked as favorites for quick access.
        </p>
      </div>

      <RecommendationList
        recommendations={recommendations}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No favorites yet. Tap the heart on a plan to save it here.
            </p>
          </div>
        }
      />
    </div>
  );
}
