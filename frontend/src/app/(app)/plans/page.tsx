"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { RecommendationList } from "@/components/plans/recommendation-list";
import { useRecommendations } from "@/hooks/use-recommendations";

export default function PlansPage() {
  const { data: recommendations, isLoading, isError } = useRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every running plan your coach has generated for you.
          </p>
        </div>
        <Button render={<Link href="/survey/new" />} nativeButton={false}>
          <Sparkles className="size-4" />
          Generate new plan
        </Button>
      </div>

      <RecommendationList
        recommendations={recommendations}
        isLoading={isLoading}
        isError={isError}
        emptyState={
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No plans yet. Complete a survey to get your first one.
            </p>
            <Button className="mt-4" render={<Link href="/survey/new" />} nativeButton={false}>
              <Sparkles className="size-4" />
              Generate new plan
            </Button>
          </div>
        }
      />
    </div>
  );
}
