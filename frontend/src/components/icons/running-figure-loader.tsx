import { cn } from "@/lib/utils";

const SIZE_BARS = {
  sm: [
    { delay: "-0.3s", height: "h-2" },
    { delay: "-0.15s", height: "h-3" },
    { delay: "0s", height: "h-4" },
  ],
  lg: [
    { delay: "-0.3s", height: "h-5" },
    { delay: "-0.15s", height: "h-7" },
    { delay: "0s", height: "h-9" },
  ],
} as const;

const SIZE_CONFIG = {
  sm: { container: "h-4 items-end gap-[3px]", bar: "w-[3px]" },
  lg: { container: "h-9 items-end gap-[5px]", bar: "w-[5px]" },
} as const;

interface RunningFigureLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "lg";
}

/** Pace-bar loader: three sprint-stripe bars pulsing like a cadence meter. */
export function RunningFigureLoader({
  className,
  label = "Loading",
  size = "sm",
}: RunningFigureLoaderProps) {
  const bars = SIZE_BARS[size];
  const config = SIZE_CONFIG[size];

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex", config.container, className)}
    >
      {bars.map(({ delay, height }, index) => (
        <span
          key={delay}
          className={cn(
            "animate-pace-bar rounded-full",
            config.bar,
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
