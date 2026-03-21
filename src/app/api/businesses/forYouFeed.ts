import { NextResponse } from "next/server";
import { isValidLatitude, isValidLongitude } from "@/app/lib/utils/searchHelpers";
import type { BusinessRPCResult, MixedFeedOptions } from "./route.types";
import {
  normalizeForYouError,
  isRlsOrPermissionError,
  createForYouErrorResponse,
  derivePriceFilters,
  filterByDealbreakers,
  transformBusinessForCard,
  applySharedResponseHeaders,
} from "./route.utils";
import { encodeFeedCursor } from "./route.utils";

/** Seed component that rotates daily so the feed feels fresh. */
export function createDailySeedComponent(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

const DIVERSITY_FALLBACK_BUCKET = 'miscellaneous';

function normalizeDiversityBucket(value: string | null | undefined): string {
  if (!value) return DIVERSITY_FALLBACK_BUCKET;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : DIVERSITY_FALLBACK_BUCKET;
}

function getRawBusinessBucket(
  business: Pick<BusinessRPCResult, 'sub_interest_id' | 'category' | 'interest_id'>
): string {
  return normalizeDiversityBucket(
    business.sub_interest_id ?? business.category ?? business.interest_id ?? null
  );
}

function getCardBusinessBucket(
  business: Record<string, unknown>
): string {
  return normalizeDiversityBucket(
    (business.sub_interest_id as string | undefined) ??
      (business.subInterestId as string | undefined) ??
      (business.category as string | undefined) ??
      (business.interest_id as string | undefined) ??
      (business.interestId as string | undefined) ??
      null
  );
}

function diversifyByBucket<T>(
  items: T[],
  getBucket: (item: T) => string,
  context: { requestId?: string | null; source: string }
): T[] {
  if (items.length <= 2) return items;

  const bucketOrder: string[] = [];
  const bucketMap = new Map<string, { items: T[]; cursor: number }>();
  for (const item of items) {
    const bucket = getBucket(item);
    if (!bucketMap.has(bucket)) {
      bucketOrder.push(bucket);
      bucketMap.set(bucket, { items: [], cursor: 0 });
    }
    bucketMap.get(bucket)!.items.push(item);
  }

  if (bucketOrder.length <= 1) return items;

  const diversified: T[] = [];
  let remaining = items.length;
  while (remaining > 0) {
    let addedThisRound = 0;
    for (const bucket of bucketOrder) {
      const state = bucketMap.get(bucket);
      if (!state || state.cursor >= state.items.length) continue;
      diversified.push(state.items[state.cursor]);
      state.cursor += 1;
      remaining -= 1;
      addedThisRound += 1;
    }
    if (addedThisRound === 0) break;
  }

  if (diversified.length !== items.length) return items;

  const changedOrder = diversified.some((item, index) => item !== items[index]);
  if (changedOrder) {
    console.log('[BUSINESSES API] For You sequence diversity applied:', {
      requestId: context.requestId ?? null,
      source: context.source,
      buckets: bucketOrder.length,
      total: items.length,
    });
  }

  return diversified;
}

/**
 * Unified For You feed.
 * Calls recommend_for_you_unified — single RPC that handles preference scoring,
 * quality (Bayesian), freshness, new-business discovery, and dealbreaker exclusions.
 * `punctuality` / `friendliness` dealbreakers (percentile-based) are still applied
 * in Node after the RPC so that no-stats businesses are never incorrectly excluded.
 */
export async function handleForYouFeed(options: MixedFeedOptions): Promise<NextResponse> {
  const start = Date.now();
  const {
    supabase,
    limit,
    cursorOffset = 0,
    interestIds,
    subInterestIds,
    dealbreakerIds,
    preferredPriceRanges,
    latitude,
    longitude,
    requireCoordinates = false,
    requestId,
    seed: windowSeed,
  } = options;

  const priceFilters = derivePriceFilters(options.priceRange, preferredPriceRanges);
  const dailyPart = createDailySeedComponent();
  const seed = windowSeed ? `${windowSeed}-${dailyPart}` : dailyPart;

  console.log('[BUSINESSES API] For You unified:', {
    limit,
    cursorOffset,
    interestIds: interestIds?.length || 0,
    subInterestIds: subInterestIds?.length || 0,
    dealbreakerIds: dealbreakerIds?.length || 0,
    seedPrefix: seed.slice(0, 20),
  });

  let rpcData: any[] | null = null;
  let rpcError: any = null;

  try {
    const fetchLimit = Math.min(Math.max(cursorOffset + limit + 1, limit + 1), 1000);
    const result = await supabase.rpc('recommend_for_you_unified', {
      p_interest_ids: interestIds || [],
      p_sub_interest_ids: subInterestIds || [],
      p_dealbreaker_ids: dealbreakerIds || [],
      p_price_ranges: priceFilters && priceFilters.length > 0 ? priceFilters : null,
      p_latitude: latitude,
      p_longitude: longitude,
      p_limit: fetchLimit,
      p_seed: seed,
    });
    rpcData = Array.isArray(result.data) ? result.data : null;
    rpcError = result.error ?? null;
  } catch (err: any) {
    rpcError = err;
  }

  if (rpcError) {
    const normalizedRpcError = normalizeForYouError(rpcError);
    const status = isRlsOrPermissionError(normalizedRpcError) ? 403 : 500;
    const code = status === 403 ? 'FOR_YOU_RLS_BLOCKED' : 'FOR_YOU_DB_ERROR';
    const message =
      status === 403
        ? 'For You query blocked by RLS or account mismatch.'
        : 'For You recommendation query failed.';
    console.error('FOR_YOU ERROR', { status, code, requestId: requestId ?? null, ...normalizedRpcError });
    const rpcErrorResponse = createForYouErrorResponse({
      status: status as 403 | 500,
      code,
      message,
      requestId: requestId ?? 'unknown',
      details: normalizedRpcError,
    });
    rpcErrorResponse.headers.set('X-Feed-Path', 'for_you_unified_error');
    return rpcErrorResponse;
  }

  if (!rpcData || rpcData.length === 0) {
    console.warn('[BUSINESSES API] For You unified returned no data; falling back to top picks.');
    const fallback = await fetchTopPicksFallback(options, { reason: 'for_you_unified_empty' });
    fallback.headers.set('X-Feed-Path', 'for_you_unified_fallback');
    return fallback;
  }

  const businesses: BusinessRPCResult[] = rpcData.map((row: any) => ({
    id: row.id,
    name: row.name,
    is_system: row.is_system ?? null,
    description: row.description,
    category: row.category,
    interest_id: row.interest_id,
    sub_interest_id: row.sub_interest_id,
    location: row.location,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    hours: row.hours,
    image_url: row.image_url,
    uploaded_images: Array.isArray(row.uploaded_images) ? row.uploaded_images : [],
    verified: row.verified,
    price_range: row.price_range,
    badge: row.badge,
    slug: row.slug,
    lat: row.latitude ?? row.lat,
    lng: row.longitude ?? row.lng,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_reviews: row.total_reviews ?? 0,
    average_rating: Number(row.average_rating ?? 0),
    percentiles: row.percentiles ?? null,
    distance_km: null,
    cursor_id: row.id,
    cursor_created_at: row.created_at,
    personalization_score: row.personalization_score,
    diversity_rank: row.diversity_rank,
  }));

  // Apply only the stat-dependent dealbreakers in Node (punctuality, friendliness).
  // trustworthiness / value-for-money / expensive are already applied in SQL.
  const statDependentDealbreakers = (dealbreakerIds || []).filter((d) =>
    d === 'punctuality' || d === 'friendliness'
  );
  let filteredBusinesses =
    statDependentDealbreakers.length > 0
      ? filterByDealbreakers(businesses, statDependentDealbreakers)
      : businesses;

  const filteredOutAll =
    businesses.length > 0 && filteredBusinesses.length === 0 && statDependentDealbreakers.length > 0;
  if (filteredOutAll) {
    console.warn('[BUSINESSES API] Stat-dependent dealbreakers removed all For You results; relaxing.', {
      dealbreakers: statDependentDealbreakers,
      requestId: requestId ?? null,
    });
    filteredBusinesses = businesses;
  }

  // Normalize For You images to match Trending behavior:
  // prefer business_images primary first, then fallback order.
  const businessIds = filteredBusinesses.map((b) => b.id);
  if (businessIds.length > 0) {
    const { data: imagesData } = await supabase
      .from('business_images')
      .select('business_id, url, sort_order, is_primary')
      .in('business_id', businessIds)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    if (imagesData) {
      type ImageRow = {
        business_id: string;
        url: string;
        sort_order: number | null;
        is_primary: boolean | null;
      };

      const byBusiness = new Map<string, ImageRow[]>();
      for (const img of imagesData as ImageRow[]) {
        const list = byBusiness.get(img.business_id) || [];
        list.push(img);
        byBusiness.set(img.business_id, list);
      }

      for (const b of filteredBusinesses) {
        const rows = byBusiness.get(b.id);
        if (!rows || rows.length === 0) continue;

        const orderedUrls = rows.map((row) => row.url).filter(Boolean);
        if (orderedUrls.length > 0) {
          b.uploaded_images = orderedUrls;
        }

        const primaryImage = rows.find((row) => row.is_primary) || rows[0];
        if (primaryImage?.url) {
          b.image_url = primaryImage.url;
        }
      }
    }
  }

  const cleanedBusinesses = filteredBusinesses.filter(
    (business) => business?.is_system !== true && business?.name !== 'Sayso System'
  );
  const diversifiedBusinesses = diversifyByBucket(cleanedBusinesses, getRawBusinessBucket, {
    requestId,
    source: 'for_you_unified_raw',
  });
  const transformedBusinesses = diversifiedBusinesses.map(transformBusinessForCard);
  const coordinateFilteredBusinesses = requireCoordinates
    ? transformedBusinesses.filter(
        (business) =>
          typeof business.lat === 'number' &&
          typeof business.lng === 'number' &&
          isValidLatitude(business.lat) &&
          isValidLongitude(business.lng)
      )
    : transformedBusinesses;

  if (requireCoordinates && coordinateFilteredBusinesses.length === 0 && transformedBusinesses.length > 0) {
    console.warn('[BUSINESSES API] For You requested map-ready results but unified set had no valid coordinates; using coordinate fallback.', {
      requestId: requestId ?? null,
      unifiedCount: transformedBusinesses.length,
    });
    const fallback = await fetchTopPicksFallback(options, {
      reason: 'for_you_unified_no_coordinates',
      details: 'No map-ready rows in unified recommender output',
    });
    fallback.headers.set('X-Feed-Path', 'for_you_unified_coords_fallback');
    return fallback;
  }

  const businessesForResponse = diversifyByBucket(
    coordinateFilteredBusinesses,
    getCardBusinessBucket,
    {
      requestId,
      source: requireCoordinates ? 'for_you_unified_coords' : 'for_you_unified',
    }
  );
  const pagedBusinesses = businessesForResponse.slice(cursorOffset, cursorOffset + limit);
  const nextCursor =
    businessesForResponse.length > cursorOffset + limit
      ? encodeFeedCursor({
          kind: 'offset',
          offset: cursorOffset + limit,
        })
      : null;
  console.log('FOR_YOU RESULTS COUNT', {
    requestId: requestId ?? null,
    count: pagedBusinesses.length,
    totalAvailable: businessesForResponse.length,
    nextCursor: nextCursor !== null,
  });

  const response = NextResponse.json({
    items: pagedBusinesses,
    businesses: pagedBusinesses,
    nextCursor,
    cursorId: null,
    meta: {
      requestId: requestId ?? null,
      seed: seed.slice(0, 30),
      durationMs: Date.now() - start,
      feed: 'for-you',
      offset: cursorOffset,
      dealbreakersRelaxed: filteredOutAll ? true : undefined,
    },
  });
  response.headers.set('X-Feed-Path', requireCoordinates ? 'for_you_unified_coords' : 'for_you_unified');
  response.headers.set('X-For-You-Results-Count', String(pagedBusinesses.length));
  return applySharedResponseHeaders(response);
}

export async function fetchTopPicksFallback(
  options: MixedFeedOptions,
  details: { reason: string; details?: string }
): Promise<NextResponse> {
  const start = Date.now();
  const {
    supabase,
    limit,
    cursorOffset = 0,
    requestId,
    seed,
    dealbreakerIds,
    requireCoordinates = false,
    interestIds,
    subInterestIds,
  } = options;

  const fetchLimit = Math.min(Math.max(limit, 20), 80);
  const buildFallbackQuery = (applyTaxonomyFilters: boolean) => {
    let query: any = supabase
      .from('businesses')
      .select(
        'id,name,description,primary_subcategory_slug,primary_category_slug,location,address,phone,email,website,image_url,verified,price_range,badge,slug,lat,lng,created_at,updated_at,is_hidden,is_system'
      )
      .eq('status', 'active')
      .eq('is_hidden', false)
      .or('is_system.is.null,is_system.eq.false')
      .order('created_at', { ascending: false });

    if (applyTaxonomyFilters) {
      if (subInterestIds && subInterestIds.length > 0) {
        query = query.in('primary_subcategory_slug', subInterestIds);
      } else if (interestIds && interestIds.length > 0) {
        query = query.in('primary_category_slug', interestIds);
      }
    }

    if (requireCoordinates) {
      query = query.not('lat', 'is', null).not('lng', 'is', null);
    }

    return query.limit(fetchLimit);
  };

  const hasTaxonomyFilters =
    (subInterestIds && subInterestIds.length > 0) ||
    (interestIds && interestIds.length > 0);

  let { data: rawData } = await buildFallbackQuery(true);
  if ((!rawData || rawData.length === 0) && hasTaxonomyFilters) {
    console.warn('[BUSINESSES API] Top picks fallback returned 0 with preference filters; relaxing taxonomy filters.', {
      requestId: requestId ?? null,
      subInterestFilters: subInterestIds?.length ?? 0,
      interestFilters: interestIds?.length ?? 0,
    });
    ({ data: rawData } = await buildFallbackQuery(false));
  }

  const rows: BusinessRPCResult[] = (rawData ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    is_system: row.is_system ?? null,
    description: row.description,
    category: row.primary_subcategory_slug,
    interest_id: row.primary_category_slug,
    sub_interest_id: row.primary_subcategory_slug,
    location: row.location,
    address: row.address,
    phone: row.phone,
    email: row.email,
    website: row.website,
    hours: null,
    image_url: row.image_url,
    uploaded_images: [],
    verified: row.verified,
    price_range: row.price_range,
    badge: row.badge,
    slug: row.slug,
    lat: row.lat,
    lng: row.lng,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_reviews: 0,
    average_rating: 0,
    percentiles: null,
    distance_km: null,
    cursor_id: row.id,
    cursor_created_at: row.created_at,
    personalization_score: null,
    diversity_rank: null,
  }));

  const statDependentDealbreakers = (dealbreakerIds || []).filter(
    (d) => d === 'punctuality' || d === 'friendliness'
  );
  const filtered =
    statDependentDealbreakers.length > 0
      ? filterByDealbreakers(rows, statDependentDealbreakers)
      : rows;

  const baseRows = filtered.length > 0 ? filtered : rows;
  const cleanedRows = baseRows.filter(
    (business) => business?.is_system !== true && business?.name !== 'Sayso System'
  );
  const transformed = cleanedRows
    .map(transformBusinessForCard)
    .filter((business) => {
      if (!requireCoordinates) return true;
      return (
        typeof business.lat === 'number' &&
        typeof business.lng === 'number' &&
        isValidLatitude(business.lat) &&
        isValidLongitude(business.lng)
      );
    });
  const businessesForResponse = diversifyByBucket(transformed, getCardBusinessBucket, {
    requestId,
    source: requireCoordinates ? 'for_you_fallback_coords' : 'for_you_fallback',
  });
  const pagedBusinesses = businessesForResponse.slice(cursorOffset, cursorOffset + limit);
  const nextCursor =
    businessesForResponse.length > cursorOffset + limit
      ? encodeFeedCursor({
          kind: 'offset',
          offset: cursorOffset + limit,
        })
      : null;

  const response = NextResponse.json({
    items: pagedBusinesses,
    businesses: pagedBusinesses,
    nextCursor,
    cursorId: null,
    meta: {
      fallback: 'top_picks',
      reason: details.reason,
      details: details.details ?? null,
      requestId: requestId ?? null,
      seed: seed ?? null,
      offset: cursorOffset,
      durationMs: Date.now() - start,
    },
  });

  response.headers.set('X-For-You-Results-Count', String(pagedBusinesses.length));
  return applySharedResponseHeaders(response);
}
