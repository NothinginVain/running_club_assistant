"use client";

import { useSession } from "@/components/providers/session-provider";

export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useSession();

  return {
    user,
    userId: user?.id ?? null,
    isLoading,
    isAuthenticated,
  };
}
