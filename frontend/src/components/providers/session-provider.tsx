"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { clearStoredUserId, getStoredUserId, setStoredUserId } from "@/lib/session";

const SESSION_CHANGED_EVENT = "running-club-assistant:session-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_CHANGED_EVENT, callback);
  };
}

function getSnapshot() {
  return getStoredUserId();
}

function getServerSnapshot() {
  return null;
}

function noopSubscribe() {
  return () => {};
}

interface SessionContextValue {
  userId: string | null;
  isHydrated: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const userId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const login = useCallback((nextUserId: string) => {
    setStoredUserId(nextUserId);
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  }, []);

  const logout = useCallback(() => {
    clearStoredUserId();
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
  }, []);

  const value = useMemo(
    () => ({ userId, isHydrated, login, logout }),
    [userId, isHydrated, login, logout],
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
