/**
 * HTTP Caching Utilities
 * Provides cache headers and response caching strategies
 */

import { NextResponse } from "next/server";

export type CacheStrategy =
  | "public"
  | "private"
  | "no-cache"
  | "no-store"
  | "immutable"
  | "stale-while-revalidate";

export interface CacheOptions {
  maxAge?: number; // Max age in seconds
  sMaxAge?: number; // Shared max age (CDN) in seconds
  staleWhileRevalidate?: number; // Stale-while-revalidate in seconds
  strategy?: CacheStrategy;
  mustRevalidate?: boolean;
  noTransform?: boolean;
  immutable?: boolean; // Immutable directive for static assets
}

/**
 * Generate Cache-Control header value
 */
export function generateCacheControl(options: CacheOptions = {}): string {
  const {
    maxAge = 3600, // Default 1 hour
    sMaxAge,
    staleWhileRevalidate,
    strategy = "public",
    mustRevalidate = false,
    noTransform = false,
    immutable = false,
  } = options;

  const directives: string[] = [strategy];

  if (maxAge > 0) {
    directives.push(`max-age=${maxAge}`);
  }

  if (sMaxAge !== undefined && sMaxAge > 0) {
    directives.push(`s-maxage=${sMaxAge}`);
  }

  if (staleWhileRevalidate !== undefined && staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  if (mustRevalidate) {
    directives.push("must-revalidate");
  }

  if (noTransform) {
    directives.push("no-transform");
  }

  if (immutable) {
    directives.push("immutable");
  }

  return directives.join(", ");
}

/**
 * Cache presets for different content types
 */
export const CachePresets = {
  // Static assets - cache for 1 year (immutable)
  static: (): string =>
    generateCacheControl({
      strategy: "public",
      maxAge: 31536000, // 1 year
      immutable: true,
    }),

  // API responses - cache for 5 minutes, stale for 1 hour
  api: (maxAge: number = 300): string =>
    generateCacheControl({
      strategy: "public",
      maxAge,
      sMaxAge: maxAge * 2,
      staleWhileRevalidate: 3600, // Serve stale for 1 hour while revalidating
      mustRevalidate: true,
    }),

  // Dynamic content - short cache, immediate revalidation
  dynamic: (maxAge: number = 60): string =>
    generateCacheControl({
      strategy: "private",
      maxAge,
      mustRevalidate: true,
    }),

  // Business data - cache for 5 minutes with stale-while-revalidate for faster loading
  business: (): string =>
    generateCacheControl({
      strategy: "public",
      maxAge: 300, // 5 minutes
      sMaxAge: 600, // 10 minutes on CDN
      staleWhileRevalidate: 1800, // Serve stale for 30 minutes while revalidating in background
    }),

  // Review data - cache for 5 minutes
  reviews: (): string =>
    generateCacheControl({
      strategy: "public",
      maxAge: 300, // 5 minutes
      sMaxAge: 600, // 10 minutes on CDN
      staleWhileRevalidate: 1800,
    }),

  // User data - no cache or very short cache
  user: (): string =>
    generateCacheControl({
      strategy: "private",
      maxAge: 0,
      mustRevalidate: true,
    }),

  // No cache for sensitive data
  noCache: (): string =>
    generateCacheControl({
      strategy: "no-store",
      maxAge: 0,
    }),
};

/**
 * Add cache headers to NextResponse
 */
export function withCache(
  response: NextResponse,
  options: CacheOptions | string = CachePresets.api()
): NextResponse {
  const cacheControl = typeof options === "string" ? options : generateCacheControl(options);

  response.headers.set("Cache-Control", cacheControl);

  // Add ETag support for better caching
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

/**
 * Create cached JSON response
 */
export function cachedJsonResponse(
  data: any,
  cacheOptions: CacheOptions | string = CachePresets.api(),
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return withCache(response, cacheOptions);
}

/**
 * Create ETag from data
 */
export function generateETag(data: any): string {
  if (typeof data === "string") {
    return `"${Buffer.from(data).toString("base64")}"`;
  }
  const jsonString = JSON.stringify(data);
  const hash = Buffer.from(jsonString).toString("base64");
  return `"${hash.substring(0, 27)}"`; // Limit ETag length
}

/**
 * Check if request has matching ETag (304 Not Modified)
 */
export function checkETag(request: Request, etag: string): NextResponse | null {
  const ifNoneMatch = request.headers.get("if-none-match");

  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": CachePresets.static(),
      },
    });
  }

  return null;
}
