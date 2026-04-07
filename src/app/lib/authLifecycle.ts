"use client";

export enum AuthLifecycleEventType {
  SESSION_INVALIDATED = "SESSION_INVALIDATED",
  SIGNED_OUT = "SIGNED_OUT",
  SESSION_REFRESHED = "SESSION_REFRESHED",
}

export interface AuthLifecycleEventDetail {
  type: AuthLifecycleEventType;
  reason?: string;
  timestamp: number;
}

const EVENT_NAME = "sayso:auth-lifecycle";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function emitAuthLifecycleEvent(type: AuthLifecycleEventType, reason?: string): void {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent<AuthLifecycleEventDetail>(EVENT_NAME, {
      detail: { type, reason, timestamp: Date.now() },
    })
  );
}

export function subscribeAuthLifecycleEvent(
  listener: (detail: AuthLifecycleEventDetail) => void
): () => void {
  if (!isBrowser()) return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<AuthLifecycleEventDetail>;
    if (!customEvent.detail) return;
    listener(customEvent.detail);
  };

  window.addEventListener(EVENT_NAME, handler as EventListener);
  return () => {
    window.removeEventListener(EVENT_NAME, handler as EventListener);
  };
}
