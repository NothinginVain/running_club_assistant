const target = new EventTarget();
const UNAUTHORIZED_EVENT = "unauthorized";

export function emitUnauthorized(): void {
  target.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(handler: () => void): () => void {
  target.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => target.removeEventListener(UNAUTHORIZED_EVENT, handler);
}
