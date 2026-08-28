import { Activity, Dumbbell, Footprints, StretchHorizontal } from "lucide-react";

import { formatDistance } from "@/lib/format";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";
import type { TrainingDay } from "@/types";

const TIMING_LABEL: Record<string, string> = {
  before_run: "Before run",
  after_run: "After run",
  separate: "Separate session",
  rest_day: "Rest day",
};

export function SessionCard({ trainingDay }: { trainingDay: TrainingDay }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium">{titleCase(trainingDay.day)}</h4>
        <span className="text-xs text-muted-foreground">{trainingDay.date}</span>
      </div>

      <div className="mt-3 space-y-3">
        {trainingDay.running && (
          <div className="flex gap-2.5">
            <Activity className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {titleCase(trainingDay.running.type)} ·{" "}
                {formatDistance(trainingDay.running.distance_km)} ·{" "}
                {titleCase(trainingDay.running.intensity_level)}
              </p>
              <p className="text-sm text-muted-foreground">
                {trainingDay.running.details}
              </p>
            </div>
          </div>
        )}

        {trainingDay.walking && (
          <div className="flex gap-2.5">
            <Footprints className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {trainingDay.walking.type === "walk_run" ? "Walk-run" : "Walk"} ·{" "}
                {formatDistance(trainingDay.walking.distance_km)} ·{" "}
                {trainingDay.walking.duration_minutes} min ·{" "}
                {titleCase(trainingDay.walking.intensity_level)}
              </p>
              <p className="text-sm text-muted-foreground">
                {trainingDay.walking.details}
              </p>
            </div>
          </div>
        )}

        {trainingDay.strength && (
          <div className="flex gap-2.5">
            <Dumbbell className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {titleCase(trainingDay.strength.focus)} ·{" "}
                {trainingDay.strength.duration_minutes} min ·{" "}
                {TIMING_LABEL[trainingDay.strength.timing] ?? trainingDay.strength.timing}
              </p>
              <p className="text-sm text-muted-foreground">
                {trainingDay.strength.details}
              </p>
            </div>
          </div>
        )}

        {trainingDay.mobility && (
          <div className="flex gap-2.5">
            <StretchHorizontal
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {titleCase(trainingDay.mobility.focus)} ·{" "}
                {trainingDay.mobility.duration_minutes} min ·{" "}
                {TIMING_LABEL[trainingDay.mobility.timing] ?? trainingDay.mobility.timing}
              </p>
              <p className="text-sm text-muted-foreground">
                {trainingDay.mobility.details}
              </p>
            </div>
          </div>
        )}

        {trainingDay.notes && (
          <p
            className={cn(
              "border-t pt-2 text-xs text-muted-foreground",
            )}
          >
            {trainingDay.notes}
          </p>
        )}
      </div>
    </div>
  );
}
