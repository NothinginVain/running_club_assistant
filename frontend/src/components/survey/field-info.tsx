"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function FieldInfo({ children }: { children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
        aria-label="More information"
      >
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
