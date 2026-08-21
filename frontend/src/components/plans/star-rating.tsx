"use client";

import { Star } from "lucide-react";

import { RECOMMENDATION_RATING_MAX, RECOMMENDATION_RATING_MIN } from "@/types";
import { cn } from "@/lib/utils";

const STAR_VALUES = Array.from(
  { length: RECOMMENDATION_RATING_MAX - RECOMMENDATION_RATING_MIN + 1 },
  (_, index) => RECOMMENDATION_RATING_MIN + index,
);

export function StarRating({
  value,
  onChange,
  disabled,
  size = "default",
}: {
  value: number | null;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: "default" | "sm";
}) {
  const isInteractive = Boolean(onChange);
  const starSize = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div
      className="flex items-center gap-0.5"
      role={isInteractive ? "radiogroup" : undefined}
      aria-label={isInteractive ? "Rate this plan" : `Rated ${value ?? 0} out of ${RECOMMENDATION_RATING_MAX}`}
    >
      {STAR_VALUES.map((starValue) => {
        const filled = value !== null && starValue <= value;

        if (!isInteractive) {
          return (
            <Star
              key={starValue}
              className={cn(
                starSize,
                filled ? "fill-primary text-primary" : "text-muted-foreground/30",
              )}
              aria-hidden="true"
            />
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            disabled={disabled}
            onClick={() => onChange?.(starValue)}
            className="rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <Star
              className={cn(
                starSize,
                filled ? "fill-primary text-primary" : "text-muted-foreground/30",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
