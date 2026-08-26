const CHANNEL_NAME = "rca-session-sync";

// The auth cookie is shared across every tab of the same browser, but each
// tab has its own in-memory query cache. Without this, logging in/out in one
// tab leaves other open tabs showing stale identity and data while silently
// operating against whichever account the (now-changed) shared cookie
// actually belongs to. BroadcastChannel is undefined during SSR and in a
// few older browsers, so every export here degrades to a no-op there.
const channel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;

export function broadcastSessionChanged(): void {
  channel?.postMessage({ type: "session-changed" });
}

export function onSessionChangedElsewhere(handler: () => void): () => void {
  if (!channel) return () => {};

  function listener(event: MessageEvent) {
    if (event.data?.type === "session-changed") handler();
  }

  channel.addEventListener("message", listener);
  return () => channel.removeEventListener("message", listener);
}
