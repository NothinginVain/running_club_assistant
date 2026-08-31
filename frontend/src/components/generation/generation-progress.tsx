"use client";

import { RunningFigureLoader } from "@/components/icons/running-figure-loader";
import { Progress } from "@/components/ui/progress";
import {
  useGenerationProgress,
  type GenerationMode,
} from "@/hooks/use-generation-progress";
import { cn } from "@/lib/utils";

interface GenerationProgressProps {
  isGenerating: boolean;
  mode: GenerationMode;
  className?: string;
}

/**
 * Simulated "generating your plan" loading state: pace-bar loader, a
 * progress bar, and a stage label — all driven by useGenerationProgress.
 * Same visual treatment for both generation and revision; only the copy
 * (via `mode`) differs, since the two flows genuinely start differently
 * (reviewing a survey vs. reviewing feedback on an existing plan).
 */
export function GenerationProgress({
  isGenerating,
  mode,
  className,
}: GenerationProgressProps) {
  const progress = useGenerationProgress(isGenerating, mode);

  if (!progress) return null;

  return (
    <div className={cn("flex flex-col items-center gap-5 py-14 text-center", className)}>
      <RunningFigureLoader label="Generating your plan" size="lg" />
      <Progress
        value={progress.progressPercent}
        aria-label="Plan generation progress"
        className="mx-auto w-full max-w-sm"
      />
      <p
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-muted-foreground"
      >
        {progress.stageLabel}
      </p>
    </div>
  );
}
