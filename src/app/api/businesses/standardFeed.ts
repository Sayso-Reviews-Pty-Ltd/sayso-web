import { NextResponse } from "next/server";
import type { SupabaseClientInstance, BusinessRPCResult } from "./route.types";
import {
  calculateDistanceKm,
  highlightText,
  extractSnippet,
  isValidLatitude,
  isValidLongitude,
} from "@/app/lib/utils/searchHelpers";
import {
  calculateContactRankingBoost,
  compareContactCompletenessDesc,
} from "@/app/lib/utils/contactCompleteness";
import { executeFallbackQuery } from "./standardFeed.fallback";
import {
  calculatePersonalizationScore,
  filterByDealbreakers as filterBusinessesByDealbreakers,
  type BusinessForScoring,
} from "@/app/lib/services/personalizationService";
import {
  fetchUserPreferences,
  logSearchHistory,
  excludeSystemBusinesses,
  transformBusinessForCard,
  encodeFeedCursor,
  applySharedResponseHeaders,
} from "./route.utils";

export type StandardFeedOptions = {
  supabase: SupabaseClientInstance;
  limit: number;
  cursorId: string | null;
  cursorCreatedAt: string | null;
  cursorOffset: number;
  category: string | null;
  badge: string | null;
  verified: boolean | null;
  priceRange: string | null;
  location: string | null;
  minRating: number | null;
  requireCoordinates: boolean;
  interestIds: string[];
  subInterestIds: string[];
  subcategoriesToFilter: string[];
  q: string | null;
  search: string | null;
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
  radius: number;
  sortBy: string;
  sortOrder: string;
  sortParam: string | null;
  userId: string | null;
  feedStrategy: string;
};

export async function handleStandardFeed(options: StandardFeedOptions): Promise<NextResponse> {
  const {
    supabase, limit, cursorId, cursorCreatedAt, cursorOffset,
    category, badge, verified, priceRange, location, minRating,
    requireCoordinates, interestIds, subInterestIds, subcategoriesToFilter,
    q, search, lat, lng, radiusKm, radius,
    sortBy, sortOrder, sortParam, userId, feedStrategy,
  } = options;

  // ── RLS visible count check ──────────────────────────────────────────────
  const countStart = Date.now();
  const { count: visibleCount, error: countError } = await supabase
    .from('businesses')
    .select('id', { head: true, count: 'exact' })
    .eq('status', 'active')
    .or('is_system.is.null,is_system.eq.false');
  console.log('[BUSINESSES API] Visible count duration ms:', Date.now() - countStart);

  if (visibleCount === 0 && !countError) {
    console.warn('[BUSINESSES API] RLS returned 0 businesses — check policies');
  }

  let businesses: BusinessRPCResult[] | null = null;
  let error: any = null;

  // ── RPC path ─────────────────────────────────────────────────────────────
  try {
    const rpcParams = {
      p_limit: limit,
      p_cursor_id: cursorId,
      p_cursor_created_at: cursorCreatedAt,
      p_category: category,
      p_location: location,
      p_verified: verified,
      p_price_range: priceRange,
      p_badge: badge,
      p_min_rating: minRating,
      p_search: search,
      p_latitude: lat,
      p_longitude: lng,
      p_radius_km: radius,
      p_sort_by: sortBy,
      p_sort_order: sortOrder,
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [BUSINESSES API] Calling RPC with params:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[BUSINESSES API] RPC params:', JSON.stringify(rpcParams, null, 2));

    const { data, error: rpcError } = await supabase.rpc('list_businesses_optimized', rpcParams);

    if (rpcError) {
      console.error('[BUSINESSES API] RPC error:', {
        code: rpcError.code,
        message: rpcError.message,
        details: rpcError.details,
        hint: rpcError.hint,
      });

      if (rpcError.code === '42883' || rpcError.code === 'PGRST301' ||
          rpcError.code === '42703' ||
          rpcError.message?.includes('uploaded_image') ||
          rpcError.message?.includes('column') && rpcError.message?.includes('does not exist')) {
        console.log('[BUSINESSES API] RPC function error detected, using fallback query');
        throw new Error('RPC not found or schema error');
      }

      console.log('[BUSINESSES API] RPC returned error, trying fallback query');
      throw new Error('RPC error');
    }

    if (data && Array.isArray(data)) {
      if (data.length > 0) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ [BUSINESSES API] RPC returned', data.length, 'businesses');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[BUSINESSES API] Sample businesses:', data.slice(0, 3).map((b: { id: string; name: string; category: string; location: string; uploaded_images?: string[] }) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          location: b.location,
          uploaded_images_count: Array.isArray(b.uploaded_images) ? b.uploaded_images.length : 0,
        })));

        const normalized = (data as Array<Record<string, unknown>>).map((row) => {
          const b = { ...row } as unknown as BusinessRPCResult;
          b.lat = (row.lat as number | null) ?? (row.latitude as number | null) ?? null;
          b.lng = (row.lng as number | null) ?? (row.longitude as number | null) ?? null;
          if (row.primary_subcategory_slug != null) {
            b.category = (row.primary_subcategory_slug as string) ?? b.category;
            b.sub_interest_id = (row.primary_subcategory_slug as string) ?? b.sub_interest_id;
            b.category_label = (row.primary_subcategory_label as string | null) ?? b.category_label ?? null;
          }
          if (row.primary_category_slug != null) {
            b.interest_id = (row.primary_category_slug as string) ?? b.interest_id;
          }
          return b;
        });

        if (lat !== null && lng !== null && isValidLatitude(lat) && isValidLongitude(lng)) {
          businesses = normalized.map((b) => {
            if (b.lat != null && b.lng != null) {
              b.distance_km = calculateDistanceKm(lat, lng, b.lat, b.lng);
            }
            return b;
          });

          if (radiusKm !== null && radiusKm > 0) {
            businesses = businesses.filter(
              (b) => b.distance_km !== null && b.distance_km <= radiusKm
            );
          }
        } else {
          businesses = normalized;
        }
      } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  [BUSINESSES API] RPC returned 0 businesses (empty result)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[BUSINESSES API] Query filters:', {
          category, location, sortBy, sortOrder, limit, verified,
          priceRange, badge, minRating, search, lat, lng, radius,
        });
        businesses = [];
      }
    } else {
      console.log('[BUSINESSES API] RPC returned null/undefined data, trying fallback');
      throw new Error('RPC returned null');
    }
    error = null;
  } catch (rpcError: any) {
    const fallbackResult = await executeFallbackQuery(options);
    if (fallbackResult instanceof NextResponse) return fallbackResult;
    businesses = fallbackResult;
  }

  if (error) {
    console.error('[BUSINESSES API] Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', details: error.message },
      { status: 500 }
    );
  }

  // ── Personalization ──────────────────────────────────────────────────────
  const typedBusinesses = excludeSystemBusinesses((businesses || []) as (BusinessRPCResult & { is_system?: boolean | null })[]);

  const userPreferences = await fetchUserPreferences(supabase, userId);
  if (userPreferences.latitude === undefined && lat !== null && lng !== null) {
    userPreferences.latitude = lat;
    userPreferences.longitude = lng;
  }

  let personalizedBusinesses = typedBusinesses.map((business) => {
    const businessForScoring: BusinessForScoring = {
      id: business.id,
      interest_id: business.interest_id,
      sub_interest_id: business.sub_interest_id,
      category: business.category,
      price_range: business.price_range,
      average_rating: business.average_rating,
      total_reviews: business.total_reviews,
      distance_km: business.distance_km,
      percentiles: business.percentiles,
      verified: business.verified,
      created_at: business.created_at,
      updated_at: business.updated_at,
    };

    const score = calculatePersonalizationScore(businessForScoring, userPreferences);

    return {
      ...business,
      personalization_score: score.totalScore,
      personalization_insights: score.insights,
    };
  });
  let dealbreakersRelaxed = false;

  if (userPreferences.dealbreakerIds.length > 0 && personalizedBusinesses.length > 0) {
    const beforeCount = personalizedBusinesses.length;
    const preDealbreakerBusinesses = personalizedBusinesses;
    personalizedBusinesses = personalizedBusinesses.filter((business) => {
      const businessForScoring: BusinessForScoring = {
        id: business.id,
        interest_id: business.interest_id,
        sub_interest_id: business.sub_interest_id,
        category: business.category,
        price_range: business.price_range,
        average_rating: business.average_rating,
        total_reviews: business.total_reviews,
        distance_km: business.distance_km,
        percentiles: business.percentiles,
        verified: business.verified,
      };

      const filtered = filterBusinessesByDealbreakers([businessForScoring], userPreferences.dealbreakerIds);
      return filtered.length > 0;
    });

    if (personalizedBusinesses.length === 0) {
      console.warn('[BUSINESSES API] Dealbreakers removed all results; relaxing filter for standard feed.', {
        beforeCount,
        dealbreakers: userPreferences.dealbreakerIds.length,
      });
      personalizedBusinesses = preDealbreakerBusinesses;
      dealbreakersRelaxed = true;
    }
  }

  if (userPreferences.interestIds.length > 0 || userPreferences.subcategoryIds.length > 0) {
    personalizedBusinesses.sort((a, b) => {
      const scoreA = (a.personalization_score || 0) + calculateContactRankingBoost(a, 0.8);
      const scoreB = (b.personalization_score || 0) + calculateContactRankingBoost(b, 0.8);
      if (scoreA !== scoreB) return scoreB - scoreA;
      const contactDiff = compareContactCompletenessDesc(a, b);
      if (contactDiff !== 0) return contactDiff;
      return a.id.localeCompare(b.id);
    });
  }

  if (userId && q) {
    logSearchHistory(supabase, userId, q, lat, lng, radiusKm, sortParam || null).catch(() => {});
  }

  console.log(`[BUSINESSES API] Successfully fetched ${personalizedBusinesses.length} businesses`);
  console.log('[BUSINESSES API] Query params:', {
    category, badge, verified, priceRange, location, q, search,
    sortBy, sortOrder, sort: sortParam, limit, cursorId, lat, lng, radiusKm
  });

  // ── Transform + respond ──────────────────────────────────────────────────
  const transformedBusinesses = personalizedBusinesses.map((business) => {
    const transformed = transformBusinessForCard(business);

    if (q) {
      (transformed as any).highlighted_name = highlightText(business.name, q);
      if (business.description) {
        (transformed as any).highlighted_snippet = extractSnippet(business.description, q);
      }
    }

    if ((business as any).combo_score !== undefined) {
      (transformed as any).combo_score = (business as any).combo_score;
    }

    if ((business as any).personalization_score !== undefined) {
      (transformed as any).personalization_score = (business as any).personalization_score;
    }
    if ((business as any).personalization_insights !== undefined) {
      (transformed as any).personalization_insights = (business as any).personalization_insights;
    }

    return transformed;
  });

  const nextCursorData = typedBusinesses.length > 0
    ? {
        cursor_id: typedBusinesses[typedBusinesses.length - 1].cursor_id,
        cursor_created_at: typedBusinesses[typedBusinesses.length - 1].cursor_created_at,
      }
    : null;

  const hasMore = typedBusinesses.length === limit;
  const nextCursorId = nextCursorData?.cursor_id ?? null;
  const encodedNextCursor = hasMore && nextCursorData
    ? encodeFeedCursor({
        kind: 'business-keyset',
        cursor_id: nextCursorData.cursor_id,
        cursor_created_at: nextCursorData.cursor_created_at,
      })
    : null;

  const response = NextResponse.json({
    items: transformedBusinesses,
    businesses: transformedBusinesses,
    nextCursor: encodedNextCursor,
    cursorId: nextCursorId,
    meta: dealbreakersRelaxed ? { dealbreakersRelaxed: true } : undefined,
  });
  response.headers.set('X-Feed-Path', 'standard');
  let res = applySharedResponseHeaders(response);
  if (feedStrategy === 'standard' && !q) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  return res;
}

