import { NextResponse } from "next/server";
import type { getServerSupabase } from "@/app/lib/supabase/server";
import { CachePresets } from "@/app/lib/utils/httpCache";
import { isValidLatitude, isValidLongitude } from "@/app/lib/utils/searchHelpers";
import {
  LEGACY_TRAVEL_SUBCATEGORY_MAP,
  SUBCATEGORY_TO_INTEREST,
} from "@/app/lib/onboarding/subcategoryMapping";
import type {
  ForYouErrorDetails,
  ForYouErrorStatus,
  PreferenceReadError,
  EncodedFeedCursor,
  BusinessRPCResult,
} from "./route.types";
import type { UserPreferences } from "@/app/lib/services/personalizationService";
import {
  CANONICAL_SUBCATEGORY_SET,
  CATEGORY_LABEL_TO_SLUG,
  DEALBREAKER_RULES,
  KNOWN_MAIN_CATEGORY_SLUGS,
  DEFAULT_SUBCATEGORY_BY_MAIN_CATEGORY,
  SEARCH_SYNONYMS,
  normalizeCategoryToken,
} from "./route.constants";

// ── Error utilities ──────────────────────────────────────────────────────────

export function normalizeForYouError(error: any): ForYouErrorDetails {
  return {
    code: typeof error?.code === "string" ? error.code : null,
    message: typeof error?.message === "string" ? error.message : "Unknown error",
    details: typeof error?.details === "string" ? error.details : null,
    hint: typeof error?.hint === "string" ? error.hint : null,
  };
}

export function isRlsOrPermissionError(error: any): boolean {
  const normalized = normalizeForYouError(error);
  const haystack = `${normalized.message} ${normalized.details ?? ""}`.toLowerCase();
  return (
    normalized.code === "42501" ||
    normalized.code === "PGRST301" ||
    haystack.includes("row-level security") ||
    haystack.includes("permission denied")
  );
}

export function createForYouErrorResponse(args: {
  status: ForYouErrorStatus;
  code: string;
  message: string;
  requestId: string;
  details?: ForYouErrorDetails | null;
}): NextResponse {
  const payload: {
    error: string;
    code: string;
    meta: { requestId: string; feed: "for-you" };
    details?: ForYouErrorDetails;
  } = {
    error: args.message,
    code: args.code,
    meta: { requestId: args.requestId, feed: "for-you" },
  };

  if (args.details) {
    payload.details = args.details;
  }

  const response = NextResponse.json(payload, { status: args.status });
  response.headers.set("X-Feed-Path", "for_you_error");
  return applySharedResponseHeaders(response);
}

// ── Preference utilities ─────────────────────────────────────────────────────

export async function fetchUserPreferences(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  userId: string | null
): Promise<UserPreferences> {
  if (!userId) {
    return { interestIds: [], subcategoryIds: [], dealbreakerIds: [] };
  }

  try {
    const [interestsResult, subcategoriesResult, dealbreakersResult] = await Promise.all([
      supabase.from("user_interests").select("interest_id").eq("user_id", userId),
      supabase.from("user_subcategories").select("subcategory_id").eq("user_id", userId),
      supabase.from("user_dealbreakers").select("dealbreaker_id").eq("user_id", userId),
    ]);

    return {
      interestIds: (interestsResult.data || []).map((i) => i.interest_id),
      subcategoryIds: (subcategoriesResult.data || []).map((s) => s.subcategory_id),
      dealbreakerIds: (dealbreakersResult.data || []).map((d) => d.dealbreaker_id),
    };
  } catch (error) {
    console.warn("[BUSINESSES API] Error fetching user preferences:", error);
    return { interestIds: [], subcategoryIds: [], dealbreakerIds: [] };
  }
}

export async function fetchUserPreferencesWithDiagnostics(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  userId: string
): Promise<{ preferences: UserPreferences; error: PreferenceReadError | null }> {
  const [interestsResult, subcategoriesResult, dealbreakersResult] = await Promise.all([
    supabase.from("user_interests").select("interest_id").eq("user_id", userId),
    supabase.from("user_subcategories").select("subcategory_id").eq("user_id", userId),
    supabase.from("user_dealbreakers").select("dealbreaker_id").eq("user_id", userId),
  ]);

  const interestIds = (interestsResult.data || []).map(
    (row: { interest_id: string }) => row.interest_id
  );
  const subcategoryIds = (subcategoriesResult.data || []).map(
    (row: { subcategory_id: string }) => row.subcategory_id
  );
  const dealbreakerIds = (dealbreakersResult.data || []).map(
    (row: { dealbreaker_id: string }) => row.dealbreaker_id
  );

  const preferenceReadError = interestsResult.error
    ? ({ source: "user_interests", details: normalizeForYouError(interestsResult.error) } as const)
    : subcategoriesResult.error
      ? ({
          source: "user_subcategories",
          details: normalizeForYouError(subcategoriesResult.error),
        } as const)
      : dealbreakersResult.error
        ? ({
            source: "user_dealbreakers",
            details: normalizeForYouError(dealbreakersResult.error),
          } as const)
        : null;

  return {
    preferences: { interestIds, subcategoryIds, dealbreakerIds },
    error: preferenceReadError,
  };
}

export async function logSearchHistory(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  userId: string | null,
  query: string | null,
  lat: number | null,
  lng: number | null,
  radiusKm: number | null,
  sort: string | null
) {
  if (!userId || !query || query.trim().length === 0) return;

  try {
    await supabase.from("search_history").insert({
      user_id: userId,
      query: query.trim(),
      lat: lat !== null && isValidLatitude(lat) ? lat : null,
      lng: lng !== null && isValidLongitude(lng) ? lng : null,
      radius_km: radiusKm !== null && radiusKm > 0 ? radiusKm : null,
      sort: sort || null,
    });
  } catch (error) {
    console.warn("[BUSINESSES API] Failed to log search history:", error);
  }
}

// ── Category/search utilities ────────────────────────────────────────────────

export function excludeSystemBusinesses<T extends { is_system?: boolean | null }>(rows: T[]): T[] {
  return rows.filter((row) => row?.is_system !== true);
}

export function resolveInterestId(b: {
  interest_id?: string | null;
  sub_interest_id?: string | null;
}): string | undefined {
  if (b.interest_id != null && b.interest_id !== "") return b.interest_id;
  if (b.sub_interest_id != null && b.sub_interest_id !== "")
    return SUBCATEGORY_TO_INTEREST[b.sub_interest_id];
  return undefined;
}

export function resolveCanonicalCategorySlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const lowered = trimmed.toLowerCase();
  const legacyTravel = LEGACY_TRAVEL_SUBCATEGORY_MAP[lowered];
  if (legacyTravel) return legacyTravel;

  if (CANONICAL_SUBCATEGORY_SET.has(lowered)) return lowered;

  const normalizedLabel = normalizeCategoryToken(trimmed);
  const mappedFromLabel = CATEGORY_LABEL_TO_SLUG[normalizedLabel];
  if (mappedFromLabel) return mappedFromLabel;

  const slugified = normalizedLabel.replace(/\s+/g, "-");
  if (CANONICAL_SUBCATEGORY_SET.has(slugified)) return slugified;

  return null;
}

export function normalizeMainCategorySlug(input: string | null | undefined): string | null {
  const value = String(input || "")
    .trim()
    .toLowerCase();
  if (!value) return null;
  if (value === "other") return "miscellaneous";
  return KNOWN_MAIN_CATEGORY_SLUGS.has(value) ? value : null;
}

export function getFallbackSubcategoryForMainCategory(mainCategorySlug: string | null): string {
  if (!mainCategorySlug) return "miscellaneous";
  return DEFAULT_SUBCATEGORY_BY_MAIN_CATEGORY[mainCategorySlug] ?? "miscellaneous";
}

export function expandSearchWithSynonyms(query: string): string {
  if (!query || query.trim().length === 0) return query;

  const lowerQuery = query.toLowerCase().trim();
  const fullQuerySynonyms = SEARCH_SYNONYMS[lowerQuery];
  if (fullQuerySynonyms && fullQuerySynonyms.length > 0) {
    const primarySynonym = fullQuerySynonyms[0];
    console.log("[BUSINESSES API] Search query expansion:", {
      original: query,
      primarySynonym,
      allSynonyms: fullQuerySynonyms,
    });
    if (lowerQuery === "coffee") return "cafe";
    return primarySynonym;
  }

  console.log("[BUSINESSES API] No synonyms found for:", query);
  return query;
}

// ── Cursor utilities ─────────────────────────────────────────────────────────

export function parseEncodedFeedCursor(rawCursor: string | null): EncodedFeedCursor | null {
  if (!rawCursor) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(rawCursor, "base64url").toString("utf8")
    ) as Partial<EncodedFeedCursor>;
    if (
      decoded.kind === "business-keyset" &&
      typeof decoded.cursor_id === "string" &&
      typeof decoded.cursor_created_at === "string"
    ) {
      return {
        kind: "business-keyset",
        cursor_id: decoded.cursor_id,
        cursor_created_at: decoded.cursor_created_at,
      };
    }

    if (
      decoded.kind === "offset" &&
      typeof decoded.offset === "number" &&
      Number.isFinite(decoded.offset)
    ) {
      return { kind: "offset", offset: Math.max(0, Math.floor(decoded.offset)) };
    }
  } catch {
    return null;
  }

  return null;
}

export function encodeFeedCursor(cursor: EncodedFeedCursor | null): string | null {
  if (!cursor) return null;
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

// ── Feed utilities ───────────────────────────────────────────────────────────

export function derivePriceFilters(
  primary: string | null,
  preferred?: string[] | null
): string[] | undefined {
  const values = new Set<string>();
  preferred?.forEach((value) => {
    if (value) values.add(value);
  });
  if (primary) values.add(primary);
  return values.size > 0 ? Array.from(values) : undefined;
}

export function filterByDealbreakers(
  businesses: BusinessRPCResult[],
  dealbreakerIds?: string[]
): BusinessRPCResult[] {
  if (!dealbreakerIds || dealbreakerIds.length === 0) return businesses;
  return businesses.filter((business) =>
    dealbreakerIds.every((id) => {
      const rule = DEALBREAKER_RULES[id];
      if (!rule) return true;
      try {
        return rule(business);
      } catch {
        return true;
      }
    })
  );
}

// ── Response utilities ───────────────────────────────────────────────────────

export function applySharedResponseHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", CachePresets.business());
  response.headers.set("ETag", `W/"businesses-${Date.now()}"`);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Vary", "Accept-Encoding");
  return response;
}

// Re-export transform utilities (consumed by forYouFeed.ts / standardFeed.ts)
export {
  transformBusinessForCard,
  excludeAlreadyReviewedBusinesses,
  prioritizeRecentlyReviewedBusinesses,
  findSimilarBusinesses,
  calculateRecencyBoost,
  scorePersonal,
  scoreTopRated,
  scoreExplore,
} from "./businessTransform.utils";
