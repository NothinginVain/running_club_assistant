import { cn } from "@/lib/utils";

const BARS = [
  { delay: "-0.3s", height: "h-2" },
  { delay: "-0.15s", height: "h-3" },
  { delay: "0s", height: "h-4" },
];

interface RunningFigureLoaderProps {
  className?: string;
  label?: string;
}

/** Pace-bar loader: three sprint-stripe bars pulsing like a cadence meter. */
export function RunningFigureLoader({
  className,
  label = "Loading",
}: RunningFigureLoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex h-4 items-end gap-[3px]", className)}
    >
      {BARS.map(({ delay, height }, index) => (
        <span
          key={delay}
          className={cn(
            "w-[3px] animate-pace-bar rounded-full",
            height,
            index === 2 ? "bg-brand-gold" : "bg-current",
          )}
          style={{ animationDelay: delay }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
