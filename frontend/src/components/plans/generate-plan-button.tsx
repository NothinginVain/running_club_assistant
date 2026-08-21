"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RunningFigureLoader } from "@/components/icons/running-figure-loader";
import { useGenerateRecommendation } from "@/hooks/use-generate-recommendation";
import { ApiError } from "@/types/api";

export function GeneratePlanButton({
  label = "Generate my plan",
}: {
  label?: string;
}) {
  const router = useRouter();
  const generate = useGenerateRecommendation();

  function handleClick() {
    generate.mutate(undefined, {
      onSuccess: (recommendation) => {
        toast.success("Your new plan is ready.");
        router.push(`/plans/${recommendation.id}`);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "Couldn't generate a plan. Please try again.";
        toast.error(message);
      },
    });
  }

  return (
    <Button onClick={handleClick} disabled={generate.isPending}>
      {generate.isPending ? (
        <>
          <RunningFigureLoader label="Generating your plan" />
          Your coach is building your plan…
        </>
      ) : (
        <>
          <Sparkles className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
