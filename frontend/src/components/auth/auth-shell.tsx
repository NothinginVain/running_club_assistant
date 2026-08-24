import type { ReactNode } from "react";

import { BravesMark } from "@/components/brand/logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="braves-stripes relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink px-4 py-10 text-sidebar-foreground">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red" />
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-card p-8 text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <BravesMark className="size-11" />
          <div>
            <h1 className="font-display text-xl font-black tracking-tight uppercase">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {children}

        {footer && (
          <p className="text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}
