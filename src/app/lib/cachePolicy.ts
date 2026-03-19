import { NextResponse } from "next/server";

function mergeVary(current: string | null, nextValues: string[]): string {
  const values = new Set(
    (current ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
  nextValues.forEach((value) => values.add(value));
  return Array.from(values).join(", ");
}

export function applyPrivateCachePolicy(
  response: NextResponse,
  options: { noStore?: boolean; maxAge?: number } = {},
): NextResponse {
  const noStore = options.noStore ?? true;
  if (noStore) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  } else {
    const maxAge = Math.max(0, options.maxAge ?? 60);
    response.headers.set("Cache-Control", `private, max-age=${maxAge}, must-revalidate`);
  }
  response.headers.set(
    "Vary",
    mergeVary(response.headers.get("Vary"), ["Cookie", "Authorization"]),
  );
  return response;
}

export function applyPublicCachePolicy(
  response: NextResponse,
  options: { sMaxAge?: number; swr?: number } = {},
): NextResponse {
  const sMaxAge = Math.max(0, options.sMaxAge ?? 60);
  const swr = Math.max(0, options.swr ?? 30);
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  );
  return response;
}
