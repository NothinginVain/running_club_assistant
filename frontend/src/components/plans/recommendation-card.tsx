import { Calendar, ListChecks } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { RecommendationRead } from "@/types";

import { FavoriteButton } from "./favorite-button";
import { StarRating } from "./star-rating";

export function RecommendationCard({
  recommendation,
}: {
  recommendation: RecommendationRead;
}) {
  const weekCount = recommendation.content.weekly_distance.length;
  const dayCount = recommendation.content.training_days.length;

  return (
    <Link href={`/plans/${recommendation.id}`} className="block">
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="min-w-0">
            <h3 className="truncate font-medium leading-snug">
              {recommendation.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" aria-hidden="true" />
              {formatDate(recommendation.created_at)}
            </p>
          </div>
          <FavoriteButton
            recommendationId={recommendation.id}
            isFavorite={recommendation.is_favorite}
            size="sm"
          />
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListChecks className="size-3.5" aria-hidden="true" />
            {weekCount} week{weekCount === 1 ? "" : "s"} · {dayCount} sessions
          </div>
          <StarRating value={recommendation.feedback_rating} size="sm" />
        </CardContent>
      </Card>
    </Link>
  );
}
