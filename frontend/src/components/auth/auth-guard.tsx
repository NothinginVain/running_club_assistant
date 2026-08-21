"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useSession } from "@/components/providers/session-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { userId, isHydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !userId) {
      router.replace("/login");
    }
  }, [isHydrated, userId, router]);

  if (!isHydrated || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
