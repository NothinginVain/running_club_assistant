import { Footprints } from "lucide-react";

import { cn } from "@/lib/utils";

interface RunningFigureLoaderProps {
  className?: string;
  label?: string;
}

export function RunningFigureLoader({
  className,
  label = "Loading",
}: RunningFigureLoaderProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Footprints
        className={cn("size-4 animate-runner-stride", className)}
        aria-hidden="true"
      />
    </span>
  );
}
