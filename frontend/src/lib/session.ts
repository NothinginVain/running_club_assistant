const STORAGE_KEY = "running-club-assistant:user-id";

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredUserId(userId: string): void {
  window.localStorage.setItem(STORAGE_KEY, userId);
}

export function clearStoredUserId(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
