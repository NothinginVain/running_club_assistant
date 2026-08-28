"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

import { QueryProvider } from "./query-provider";
import { SessionProvider } from "./session-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        {children}
        <Toaster position="top-right" duration={6000} />
      </SessionProvider>
    </QueryProvider>
  );
}
