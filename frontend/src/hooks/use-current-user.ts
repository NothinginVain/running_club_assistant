"use client";

import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/components/providers/session-provider";
import { usersApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useCurrentUser() {
  const { userId, isHydrated } = useSession();

  const query = useQuery({
    queryKey: queryKeys.user(userId ?? "none"),
    queryFn: () => usersApi.get(userId as string),
    enabled: isHydrated && Boolean(userId),
  });

  return {
    userId,
    user: query.data,
    isLoading: !isHydrated || (Boolean(userId) && query.isLoading),
    isError: query.isError,
    error: query.error,
  };
}
