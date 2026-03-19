"use client";

import {
  AuthLifecycleEventType,
  emitAuthLifecycleEvent,
} from "@/app/lib/authLifecycle";

type AuthenticatedFetchOptions = RequestInit & {
  retryOnAuthFailure?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh-session", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-auth-refresh": "1",
    },
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: AuthenticatedFetchOptions = {},
): Promise<Response> {
  const { retryOnAuthFailure = true, ...requestInit } = init;
  const response = await fetch(input, {
    credentials: "include",
    ...requestInit,
  });

  if (!retryOnAuthFailure) return response;
  // Only treat 401 as a refreshable auth-expiry signal.
  // 403 is usually authorization (role/ownership) and should not invalidate session.
  if (response.status !== 401) return response;

  const target =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.pathname
        : input.url;
  if (target.includes("/api/auth/refresh-session")) {
    emitAuthLifecycleEvent(
      AuthLifecycleEventType.SESSION_INVALIDATED,
      "refresh_endpoint_unauthorized",
    );
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    emitAuthLifecycleEvent(
      AuthLifecycleEventType.SESSION_INVALIDATED,
      "refresh_failed",
    );
    return response;
  }

  emitAuthLifecycleEvent(
    AuthLifecycleEventType.SESSION_REFRESHED,
    "refresh_success",
  );

  const retryResponse = await fetch(input, {
    credentials: "include",
    ...requestInit,
  });

  if (retryResponse.status === 401) {
    emitAuthLifecycleEvent(
      AuthLifecycleEventType.SESSION_INVALIDATED,
      "retry_unauthorized",
    );
  }

  return retryResponse;
}
