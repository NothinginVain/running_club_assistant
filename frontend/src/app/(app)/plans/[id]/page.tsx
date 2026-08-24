"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { FeedbackList } from "@/components/feedback/feedback-list";
import { FavoriteButton } from "@/components/plans/favorite-button";
import { NoteList } from "@/components/plans/note-list";
import { RegenerateSection } from "@/components/plans/regenerate-section";
import { StarRating } from "@/components/plans/star-rating";
import { TrainingDaysView } from "@/components/plans/training-days-view";
import { WeeklyDistanceOverview } from "@/components/plans/weekly-distance-overview";
import { useFeedback } from "@/hooks/use-feedback";
import { useUpdateRating } from "@/hooks/use-recommendation-actions";
import { useRecommendation } from "@/hooks/use-recommendations";
import { formatDate } from "@/lib/format";

export default function RecommendationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: recommendation, isLoading, isError } = useRecommendation(id);
  const { data: feedback, isLoading: isFeedbackLoading } = useFeedback(id);
  const updateRating = useUpdateRating(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !recommendation) {
    return (
      <div className="space-y-4">
        <Link href="/plans" className="text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-1 inline size-3.5" />
          Back to plans
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            We couldn&apos;t find that plan. It may have been deleted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { content, explanation } = recommendation;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/plans"
          className="text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="mr-1 inline size-3.5" />
          Back to plans
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight">
              {recommendation.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatDate(recommendation.created_at)}
            </p>
          </div>
          <FavoriteButton
            recommendationId={recommendation.id}
            isFavorite={recommendation.is_favorite}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Your rating:</span>
          <StarRating
            value={recommendation.feedback_rating}
            onChange={(rating) =>
              updateRating.mutate(rating, {
                onError: () => toast.error("Couldn't save your rating."),
              })
            }
            disabled={updateRating.isPending}
          />
        </div>
      </div>

      {content.summary && (
        <section>
          <p className="text-sm leading-relaxed">{content.summary}</p>
        </section>
      )}

      {content.weekly_distance.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Weekly distance
          </h2>
          <WeeklyDistanceOverview weeks={content.weekly_distance} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Training schedule
        </h2>
        <TrainingDaysView content={content} />
      </section>

      {(content.nutrition.length > 0 || content.safety_notes.length > 0) && (
        <section className="grid gap-6 sm:grid-cols-2">
          <NoteList title="Nutrition" items={content.nutrition} />
          <NoteList title="Safety notes" items={content.safety_notes} />
        </section>
      )}

      {explanation && (
        <section className="grid gap-6 sm:grid-cols-2">
          <NoteList title="Why this plan fits" items={explanation.why_this_plan_fits} />
          <NoteList title="Assumptions" items={explanation.important_assumptions} />
        </section>
      )}

      <Separator />

      <section className="space-y-4">
        <h2 className="text-base font-medium">Feedback</h2>
        {isFeedbackLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <FeedbackList feedback={feedback ?? []} />
        )}
        <FeedbackForm recommendationId={id} />
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium">Update this plan</h2>
        <p className="text-sm text-muted-foreground">
          Your coach can build an updated version of this plan based on your
          feedback above.
        </p>
        <RegenerateSection
          recommendationId={id}
          feedbackCount={feedback?.length ?? 0}
        />
      </section>
    </div>
  );
}
