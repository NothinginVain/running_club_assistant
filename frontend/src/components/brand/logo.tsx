import { cn } from "@/lib/utils";

/**
 * Icon-only badge: a red circle carrying a white flame/motion swoosh —
 * same spirit as the club's fire-and-speed mark, drawn from scratch
 * rather than reproducing their monogram.
 */
export function BravesMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" className="fill-brand-red" />
      <path
        d="M20 7c3 3 4.5 6 3.5 9 2.5-1.5 4 .5 3.5 4-.6 4-4 7-8 7-5 0-9-3.5-9-8.5 0-2.5 1-4.5 3-6-.3 2 .3 3 1.5 3.5-.7-3.5.6-6.8 5.5-9Z"
        className="fill-[oklch(0.99_0_0)]"
      />
      <path
        d="M20.5 16c1.3 1.6 1.8 3.2 1 4.8 1.6-.4 2.2 1 1.7 2.7-.6 2-2.4 3-4.2 2.7-2.3-.4-3.6-2.3-3-4.4.3-1 1-1.8 1.9-2.2-.1.9.3 1.4 1 1.5-.7-1.8-.2-3.5 1.6-5.1Z"
        className="fill-brand-red"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  subtitle = "COACH",
}: {
  className?: string;
  markClassName?: string;
  subtitle?: string | null;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BravesMark className={cn("size-8 shrink-0", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-black tracking-tight uppercase">
          Braves
        </span>
        {subtitle && (
          <span className="text-[10px] font-semibold tracking-[0.2em] text-brand-red uppercase">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
