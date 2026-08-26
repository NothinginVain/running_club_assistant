"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { authApi } from "@/lib/api";
import { onUnauthorized } from "@/lib/auth-events";
import { queryKeys } from "@/lib/query-keys";
import { onSessionChangedElsewhere } from "@/lib/session-sync";
import type { User } from "@/types";

interface SessionContextValue {
  user: User | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(
    () =>
      onUnauthorized(() => {
        queryClient.clear();
      }),
    [queryClient],
  );

  useEffect(
    () =>
      // Another tab logged in, switched accounts, or logged out. This tab's
      // cache has no way to know that on its own -- clear it so the
      // actively-mounted currentUser query (and whatever else is on screen)
      // refetches against the browser's actual current session.
      onSessionChangedElsewhere(() => {
        // invalidateQueries (not clear()) so actively-mounted queries --
        // currentUser and whatever else is on screen -- refetch against the
        // browser's actual current cookie. clear() would just blank the
        // data instead of forcing a refetch, since removing an active
        // query from the cache doesn't by itself trigger a new fetch.
        queryClient.invalidateQueries();
      }),
    [queryClient],
  );

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user) }),
    [user, isLoading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}
