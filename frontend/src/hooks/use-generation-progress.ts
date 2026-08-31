"use client";

import { useEffect, useState } from "react";

export type GenerationMode = "generate" | "revise";

interface ProgressCheckpoint {
  atSeconds: number;
  progressPercent: number;
  generateLabel: string;
  reviseLabel: string;
}

// Ordered to mirror the two sequential LLM calls the backend actually makes
// (a safety check, then plan design/revision), followed by a long-tail
// stage that lasts up to the 180s client timeout. There is no real progress
// signal from the server during this wait, so these numbers are simulated
// -- deliberately capped short of 100% so the bar never claims the call has
// finished before it actually has. Generation reviews a fresh survey;
// revision reviews feedback on an existing plan, so the wording differs
// per mode even though the timing/structure is shared.
const CHECKPOINTS: ProgressCheckpoint[] = [
  {
    atSeconds: 0,
    progressPercent: 4,
    generateLabel: "Reviewing your survey…",
    reviseLabel: "Reviewing your feedback…",
  },
  {
    atSeconds: 8,
    progressPercent: 15,
    generateLabel: "Running a quick safety check on your answers…",
    reviseLabel: "Checking your feedback for anything that needs a closer look…",
  },
  {
    atSeconds: 25,
    progressPercent: 35,
    generateLabel: "Sketching your training weeks…",
    reviseLabel: "Reworking your training weeks…",
  },
  {
    atSeconds: 55,
    progressPercent: 60,
    generateLabel: "Balancing mileage, rest, and your goals…",
    reviseLabel: "Rebalancing mileage, rest, and your goals…",
  },
  {
    atSeconds: 90,
    progressPercent: 82,
    generateLabel: "Still going — a personalized plan takes real work. Hang tight.",
    reviseLabel: "Still going — updating a plan takes real work. Hang tight.",
  },
];

const LONG_WAIT_AT_SECONDS = 140;
const LONG_WAIT_LABEL =
  "This is taking longer than usual — your coach is still on it, nothing's gone wrong.";
const PROGRESS_CAP = 92;
const CREEP_TIME_CONSTANT_SECONDS = 40;

export function computeProgressPercent(elapsedSeconds: number): number {
  const last = CHECKPOINTS[CHECKPOINTS.length - 1];

  if (elapsedSeconds <= last.atSeconds) {
    let lower = CHECKPOINTS[0];
    let upper = last;
    for (let i = 0; i < CHECKPOINTS.length - 1; i++) {
      if (
        elapsedSeconds >= CHECKPOINTS[i].atSeconds &&
        elapsedSeconds <= CHECKPOINTS[i + 1].atSeconds
      ) {
        lower = CHECKPOINTS[i];
        upper = CHECKPOINTS[i + 1];
        break;
      }
    }
    const span = upper.atSeconds - lower.atSeconds;
    const ratio = span === 0 ? 1 : (elapsedSeconds - lower.atSeconds) / span;
    return lower.progressPercent + ratio * (upper.progressPercent - lower.progressPercent);
  }

  const secondsIntoTail = elapsedSeconds - last.atSeconds;
  const creep =
    (PROGRESS_CAP - last.progressPercent) *
    (1 - Math.exp(-secondsIntoTail / CREEP_TIME_CONSTANT_SECONDS));
  return Math.min(PROGRESS_CAP, last.progressPercent + creep);
}

export function computeStageLabel(mode: GenerationMode, elapsedSeconds: number): string {
  if (elapsedSeconds >= LONG_WAIT_AT_SECONDS) return LONG_WAIT_LABEL;

  let label = mode === "generate" ? CHECKPOINTS[0].generateLabel : CHECKPOINTS[0].reviseLabel;
  for (const checkpoint of CHECKPOINTS) {
    if (elapsedSeconds >= checkpoint.atSeconds) {
      label = mode === "generate" ? checkpoint.generateLabel : checkpoint.reviseLabel;
    }
  }
  return label;
}

export interface GenerationProgress {
  stageLabel: string;
  progressPercent: number;
  isLongWait: boolean;
}

/**
 * Simulated progress for the two-sequential-LLM-call plan generation/
 * revision flow. The backend gives no real progress signal, so elapsed
 * time drives a piecewise-linear-then-asymptotic-creep progress
 * percentage, capped at 92% until the caller's mutation actually succeeds.
 */
export function useGenerationProgress(
  isGenerating: boolean,
  mode: GenerationMode,
): GenerationProgress | null {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      setElapsedSeconds(0);
    };
  }, [isGenerating]);

  if (!isGenerating) return null;

  return {
    stageLabel: computeStageLabel(mode, elapsedSeconds),
    progressPercent: computeProgressPercent(elapsedSeconds),
    isLongWait: elapsedSeconds >= CHECKPOINTS[CHECKPOINTS.length - 1].atSeconds,
  };
}
