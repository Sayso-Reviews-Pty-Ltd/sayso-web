import { NextResponse } from "next/server";
import type { BusinessRPCResult, DatabaseBusinessRow } from "./route.types";
import { normalizeBusinessImages } from "@/app/lib/utils/businessImages";
import {
  calculateDistanceKm,
  calculateComboScore,
  priceRangeToLevel,
  isValidLatitude,
  isValidLongitude,
} from "@/app/lib/utils/searchHelpers";
import {
  calculateContactRankingBoost,
  compareContactCompletenessDesc,
} from "@/app/lib/utils/contactCompleteness";
import type { StandardFeedOptions } from "./standardFeed";

/**
 * Fallback query path executed when the RPC is unavailable or returns an error.
 * Returns either an error NextResponse (if the fallback query itself fails),
 * or an array of BusinessRPCResult rows on success.
 */
export async function executeFallbackQuery(
  options: StandardFeedOptions
): Promise<NextResponse | BusinessRPCResult[]> {
  const {
    supabase,
    limit,
    cursorId,
    cursorCreatedAt,
    category,
    badge,
    verified,
    priceRange,
    location,
    minRating,
    interestIds,
    subInterestIds,
    subcategoriesToFilter,
    q,
    lat,
    lng,
    radiusKm,
    sortBy,
    sortOrder,
  } = options;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔄 [BUSINESSES API] Using fallback query method");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[BUSINESSES API] Fallback query filters:", {
    category,
    location,
    verified,
    priceRange,
    badge,
    minRating,
    sortBy,
    sortOrder,
    limit,
  });

  let query = supabase.from("businesses").select(`
      id, name, description, primary_subcategory_slug, primary_subcategory_label, primary_category_slug, location, address,
      phone, email, website, image_url,
      verified, price_range, badge, slug, created_at, updated_at,
      business_stats (
        total_reviews, average_rating, percentiles
      ),
      business_images (
        id,
        url,
        type,
        sort_order,
        is_primary
      )
    `);

  if (typeof (query as any).eq === "function") {
    query = (query as any).eq("status", "active");
  }
  if (typeof (query as any).or === "function") {
    query = (query as any).or("is_hidden.is.null,is_hidden.eq.false");
    query = (query as any).or("is_system.is.null,is_system.eq.false");
  }

  if (typeof (query as any).eq === "function") {
    if (category) {
      console.log("[BUSINESSES API] Fallback: Applying category filter:", category);
      query = (query as any).eq("primary_subcategory_slug", category);
    }
    if (badge) {
      console.log("[BUSINESSES API] Fallback: Applying badge filter:", badge);
      query = (query as any).eq("badge", badge);
    }
    if (verified !== null) {
      console.log("[BUSINESSES API] Fallback: Applying verified filter:", verified);
      query = (query as any).eq("verified", verified);
    }
    if (priceRange) {
      console.log("[BUSINESSES API] Fallback: Applying priceRange filter:", priceRange);
      query = (query as any).eq("price_range", priceRange);
    }
  }

  if (typeof (query as any).in === "function") {
    if (interestIds.length > 0) {
      console.log("[BUSINESSES API] Filtering by interest_id:", interestIds);
      query = (query as any).in("primary_category_slug", interestIds);
    }
    if (subInterestIds.length > 0) {
      console.log(
        "[BUSINESSES API] Fallback: Filtering by sub_interest_id (primary_subcategory_slug):",
        subInterestIds
      );
      query = (query as any).in("primary_subcategory_slug", subInterestIds);
    } else if (subcategoriesToFilter && subcategoriesToFilter.length > 0) {
      console.log(
        "[BUSINESSES API] Fallback: Filtering by mapped subcategories:",
        subcategoriesToFilter
      );
      query = (query as any).in("primary_subcategory_slug", subcategoriesToFilter);
    }
  }

  if (typeof (query as any).ilike === "function" && location) {
    console.log("[BUSINESSES API] Fallback: Applying location filter (ILIKE):", location);
    query = (query as any).ilike("location", `%${location}%`);
  }

  if (typeof (query as any).or === "function" && q) {
    const escapeLike = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const safeQ = escapeLike(q);
    query = (query as any).or(
      `name.ilike.%${safeQ}%,description.ilike.%${safeQ}%,primary_subcategory_slug.ilike.%${safeQ}%,location.ilike.%${safeQ}%`
    );
  }

  if (typeof (query as any).lt === "function" && typeof (query as any).gt === "function") {
    if (cursorId && cursorCreatedAt) {
      if (sortOrder === "desc") {
        query = (query as any).lt("created_at", cursorCreatedAt);
      } else {
        query = (query as any).gt("created_at", cursorCreatedAt);
      }
    }
  }

  const fetchLimit =
    (lat !== null && lng !== null) || sortBy === "combo" || sortBy === "relevance"
      ? limit * 3
      : limit;

  if (typeof (query as any).limit === "function") {
    if (interestIds.length > 0) {
      console.log("[BUSINESSES API] Using random sort for interest-filtered results");
      query = (query as any).limit(fetchLimit);
    } else {
      if (typeof (query as any).order === "function") {
        if (sortBy === "rating" || sortBy === "total_rating") {
          query = (query as any).order("created_at", { ascending: sortOrder === "asc" });
        } else if (sortBy === "price") {
          query = (query as any).order("price_range", { ascending: sortOrder === "asc" });
        } else {
          query = (query as any).order("created_at", { ascending: sortOrder === "asc" });
        }
      }
      query = (query as any).limit(fetchLimit);
    }
  }

  const { data: fallbackData, error: fallbackError } = await query;

  console.log("[BUSINESSES API] Fallback query result:", {
    dataLength: fallbackData?.length || 0,
    hasError: !!fallbackError,
    error: fallbackError
      ? { message: fallbackError.message, code: fallbackError.code, details: fallbackError.details }
      : null,
  });

  if (fallbackError) {
    console.error("[BUSINESSES API] Fallback query error:", fallbackError);
    return NextResponse.json(
      { items: [], businesses: [], nextCursor: null, cursorId: null },
      { status: 200 }
    );
  }

  let transformedFallbackData = (fallbackData || []).map((b: any) => {
    let distanceKm: number | null = null;
    if (lat !== null && lng !== null && isValidLatitude(lat) && isValidLongitude(lng)) {
      if (b.lat !== null && b.lng !== null) {
        distanceKm = calculateDistanceKm(lat, lng, b.lat, b.lng);
      }
    }

    const row = b as DatabaseBusinessRow & { lat?: number | null; lng?: number | null };
    const { uploaded_images: fallbackUploadedImages } = normalizeBusinessImages(row);
    return {
      ...row,
      category: row.primary_subcategory_slug ?? (row as any).category ?? "",
      category_label: row.primary_subcategory_label ?? (row as any).category_label ?? null,
      interest_id: row.primary_category_slug ?? (row as any).interest_id ?? null,
      sub_interest_id: row.primary_subcategory_slug ?? (row as any).sub_interest_id ?? null,
      lat: row.lat,
      lng: row.lng,
      total_reviews: row.business_stats?.[0]?.total_reviews || 0,
      average_rating: row.business_stats?.[0]?.average_rating || 0,
      percentiles: row.business_stats?.[0]?.percentiles || null,
      uploaded_images: fallbackUploadedImages ?? [],
      distance_km: distanceKm,
      cursor_id: row.id,
      cursor_created_at: row.created_at,
    };
  });

  if (radiusKm !== null && radiusKm > 0 && lat !== null && lng !== null) {
    transformedFallbackData = transformedFallbackData.filter(
      (b) => b.distance_km !== null && b.distance_km <= radiusKm
    );
  }

  if (sortBy === "distance" && lat !== null && lng !== null) {
    transformedFallbackData.sort((a, b) => {
      const distA = a.distance_km ?? Infinity;
      const distB = b.distance_km ?? Infinity;
      const distDiff = distA - distB;
      if (distDiff !== 0) return distDiff;
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      const contactDiff = compareContactCompletenessDesc(a, b);
      if (contactDiff !== 0) return contactDiff;
      return a.id.localeCompare(b.id);
    });
  } else if (sortBy === "rating" || sortBy === "rating_desc") {
    transformedFallbackData.sort((a, b) => {
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      const reviewDiff = (b.total_reviews || 0) - (a.total_reviews || 0);
      if (reviewDiff !== 0) return reviewDiff;
      const contactDiff = compareContactCompletenessDesc(a, b);
      if (contactDiff !== 0) return contactDiff;
      return a.id.localeCompare(b.id);
    });
  } else if (sortBy === "price" || sortBy === "price_asc") {
    transformedFallbackData.sort((a, b) => {
      const priceA = priceRangeToLevel(a.price_range) ?? 999;
      const priceB = priceRangeToLevel(b.price_range) ?? 999;
      if (priceA !== priceB) return priceA - priceB;
      const ratingDiff = (b.average_rating || 0) - (a.average_rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      const contactDiff = compareContactCompletenessDesc(a, b);
      if (contactDiff !== 0) return contactDiff;
      return a.id.localeCompare(b.id);
    });
  } else if (sortBy === "combo" && lat !== null && lng !== null) {
    transformedFallbackData.forEach((b) => {
      (b as any).combo_score =
        calculateComboScore(b.distance_km, b.average_rating, priceRangeToLevel(b.price_range)) +
        calculateContactRankingBoost(b, 0.15);
    });
    transformedFallbackData.sort((a, b) => {
      const scoreA = (a as any).combo_score ?? 0;
      const scoreB = (b as any).combo_score ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      const contactDiff = compareContactCompletenessDesc(a, b);
      if (contactDiff !== 0) return contactDiff;
      return a.id.localeCompare(b.id);
    });
  } else if (sortBy === "relevance" && q) {
    transformedFallbackData.sort((a, b) => {
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      const reviewsA = a.total_reviews || 0;
      const reviewsB = b.total_reviews || 0;
      const scoreA = ratingA * 2 + Math.log(reviewsA + 1) + calculateContactRankingBoost(a, 1.2);
      const scoreB = ratingB * 2 + Math.log(reviewsB + 1) + calculateContactRankingBoost(b, 1.2);
      if (scoreA !== scoreB) return scoreB - scoreA;
      const contactDiff = compareContactCompletenessDesc(a, b);
      if (contactDiff !== 0) return contactDiff;
      return a.id.localeCompare(b.id);
    });
  }

  if (interestIds && interestIds.length > 0 && transformedFallbackData.length > 0) {
    console.log("[BUSINESSES API] Randomizing results for interest filter");
    for (let i = transformedFallbackData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [transformedFallbackData[i], transformedFallbackData[j]] = [
        transformedFallbackData[j],
        transformedFallbackData[i],
      ];
    }
  }

  transformedFallbackData = transformedFallbackData.slice(0, limit);
  return transformedFallbackData as BusinessRPCResult[];
}
