import type { AuthUser } from "./types/database";

export type AuthSnapshotStatus = "unknown" | "guest" | "authenticated";

export interface AuthSnapshot {
  status: AuthSnapshotStatus;
  user: AuthUser | null;
  source: "server" | "client";
  capturedAt: string;
}

export const UNKNOWN_AUTH_SNAPSHOT: AuthSnapshot = {
  status: "unknown",
  user: null,
  source: "server",
  capturedAt: new Date(0).toISOString(),
};

export function buildGuestSnapshot(source: "server" | "client"): AuthSnapshot {
  return {
    status: "guest",
    user: null,
    source,
    capturedAt: new Date().toISOString(),
  };
}

export function buildAuthenticatedSnapshot(
  user: AuthUser,
  source: "server" | "client"
): AuthSnapshot {
  return {
    status: "authenticated",
    user,
    source,
    capturedAt: new Date().toISOString(),
  };
}

export function buildClientAuthSnapshot(user: AuthUser | null): AuthSnapshot {
  if (!user) return buildGuestSnapshot("client");
  return buildAuthenticatedSnapshot(user, "client");
}
