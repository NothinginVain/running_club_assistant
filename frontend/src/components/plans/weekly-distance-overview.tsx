import type { WeeklyDistance } from "@/types";

export function WeeklyDistanceOverview({ weeks }: { weeks: WeeklyDistance[] }) {
  if (weeks.length === 0) return null;

  const maxDistance = Math.max(...weeks.map((week) => week.distance_km), 1);

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-1">
      {weeks.map((week) => (
        <div key={week.week_number} className="flex min-w-14 flex-col items-center gap-1">
          <span className="text-xs font-medium">{week.distance_km}km</span>
          <div className="flex h-20 w-full items-end rounded-sm bg-muted">
            <div
              className="w-full rounded-sm bg-primary"
              style={{
                height: `${Math.max((week.distance_km / maxDistance) * 100, 4)}%`,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">W{week.week_number}</span>
        </div>
      ))}
    </div>
  );
}
