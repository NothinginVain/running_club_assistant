"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatShortDate } from "@/lib/format";
import type { PlanContent } from "@/types";

import { SessionCard } from "./session-card";

export function TrainingDaysView({ content }: { content: PlanContent }) {
  const weekNumbers = content.weekly_distance.map((week) => week.week_number);

  if (weekNumbers.length === 0) {
    return null;
  }

  return (
    <Tabs defaultValue={String(weekNumbers[0])}>
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        {weekNumbers.map((weekNumber) => (
          <TabsTrigger
            key={weekNumber}
            value={String(weekNumber)}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Week {weekNumber}
          </TabsTrigger>
        ))}
      </TabsList>

      {weekNumbers.map((weekNumber) => {
        const week = content.weekly_distance.find(
          (item) => item.week_number === weekNumber,
        );
        const days = content.training_days.filter(
          (day) => day.week_number === weekNumber,
        );

        return (
          <TabsContent key={weekNumber} value={String(weekNumber)} className="space-y-3 pt-4">
            {week && (
              <p className="text-sm text-muted-foreground">
                {formatShortDate(week.start_date)} – {formatShortDate(week.end_date)} ·{" "}
                {week.distance_km} km total
              </p>
            )}
            {days.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No training days scheduled this week.
              </p>
            ) : (
              days.map((day) => (
                <SessionCard key={`${day.week_number}-${day.date}`} trainingDay={day} />
              ))
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
