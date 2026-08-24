"use client";

import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SurveyCard } from "@/components/survey/survey-card";
import { useSurveys } from "@/hooks/use-survey";

export default function SurveyHistoryPage() {
  const { data: surveys, isLoading, isError } = useSurveys();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-tight">Survey history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every survey you&apos;ve submitted. Surveys can&apos;t be edited —
          generate a new plan to submit a new one.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Couldn&apos;t load your surveys. Please try again.
          </AlertDescription>
        </Alert>
      ) : !surveys || surveys.length === 0 ? (
        <div className="braves-stripes rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No surveys yet. Generate a plan to create your first one.
          </p>
          <Button className="mt-4" render={<Link href="/plans" />} nativeButton={false}>
            Go to plans
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      )}
    </div>
  );
}
