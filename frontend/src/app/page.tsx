"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/components/providers/session-provider";

export default function RootPage() {
  const { userId, isHydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(userId ? "/dashboard" : "/login");
  }, [isHydrated, userId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
