import { NextResponse } from "next/server";
import { getServerSupabase } from "@/app/lib/supabase/server";
import { getServiceSupabase } from "@/app/lib/admin";
import {
  applyFeedCachingHeaders,
  createFeedSeedWindow,
  createRequestId,
  createWeakEtagFromKey,
  maybeNotModified,
} from "@/app/lib/utils/feedCaching";
import { isValidLatitude, isValidLongitude } from "@/app/lib/utils/searchHelpers";
import { getCategoryLabelFromBusiness } from "@/app/utils/subcategoryPlaceholders";
import { INTEREST_TO_SUBCATEGORIES } from "./route.constants";
import {
  parseEncodedFeedCursor,
  expandSearchWithSynonyms,
  fetchUserPreferencesWithDiagnostics,
  isRlsOrPermissionError,
  createForYouErrorResponse,
  resolveInterestId,
  excludeSystemBusinesses,
} from "./route.utils";
import { handleForYouFeed } from "./forYouFeed";
import { handleStandardFeed } from "./standardFeed";
import { handleBusinessCreation } from "./businessCreate";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime to avoid Edge Runtime warnings with Supabase

export async function GET(req: Request) {
  const requestStart = Date.now();
  console.log('[BUSINESSES API] GET start at', new Date().toISOString());
  const withDuration = (response: NextResponse) => {
    const totalMs = Date.now() - requestStart;
    response.headers.set('X-Duration-Ms', String(totalMs));
    console.log('[BUSINESSES API] GET end total ms:', totalMs);
    return response;
  };

  try {
    const supabase = await getServerSupabase(req);
    let serviceSupabase: Awaited<ReturnType<typeof getServerSupabase>> | null = null;
    try {
      serviceSupabase = getServiceSupabase() as unknown as Awaited<ReturnType<typeof getServerSupabase>>;
    } catch {
      serviceSupabase = null;
    }

    const authStart = Date.now();
    const { data: { user: serverUser }, error: authError } = await supabase.auth.getUser();
    console.log('[BUSINESSES API] Auth duration ms:', Date.now() - authStart);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [BUSINESSES API] Server Auth Check');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[BUSINESSES API] Server user:', {
      userId: serverUser?.id ?? null,
      email: serverUser?.email ?? null,
      hasUser: !!serverUser,
      authError: authError ? { message: authError.message, status: authError.status } : null,
    });

    const requestUrl = req?.url ?? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/businesses`;
    const { searchParams } = new URL(requestUrl);
    const encodedCursor = parseEncodedFeedCursor(searchParams.get('cursor'));

    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const cursorId =
      searchParams.get('cursor_id') ||
      (encodedCursor?.kind === 'business-keyset' ? encodedCursor.cursor_id : null);
    const cursorCreatedAt =
      searchParams.get('cursor_created_at') ||
      (encodedCursor?.kind === 'business-keyset' ? encodedCursor.cursor_created_at : null);
    const cursorOffset =
      encodedCursor?.kind === 'offset'
        ? encodedCursor.offset
        : Math.max(0, parseInt(searchParams.get('cursor_offset') || '0', 10) || 0);

    const category = searchParams.get('category') || null;
    const badge = searchParams.get('badge') || null;
    const verified = searchParams.get('verified') === 'true' ? true : null;
    const priceRange = searchParams.get('price_range') || null;
    const location = searchParams.get('location') || null;
    const minRating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : null;
    const requireCoordinates = searchParams.get('require_coordinates') === 'true';

    const interestIdsParam = searchParams.get('interest_ids');
    const interestIds = interestIdsParam
      ? interestIdsParam.split(',').map(id => id.trim()).filter(Boolean)
      : [];

    const subInterestIdsParam = searchParams.get('sub_interest_ids');
    const subInterestIds = subInterestIdsParam
      ? subInterestIdsParam.split(',').map(id => id.trim()).filter(Boolean)
      : [];

    const rawQuery = searchParams.get('q') || searchParams.get('search') || null;
    const expandedQuery = rawQuery ? expandSearchWithSynonyms(rawQuery) : null;
    const q = expandedQuery;
    const search = expandedQuery;

    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = searchParams.get('radius_km') ? parseFloat(searchParams.get('radius_km')!) : null;

    const sortParam = searchParams.get('sort');
    let sortBy = searchParams.get('sort_by') || 'created_at';
    let sortOrder = searchParams.get('sort_order') || 'desc';

    if (sortParam) {
      switch (sortParam) {
        case 'relevance':
          sortBy = q ? 'relevance' : 'rating';
          sortOrder = 'desc';
          break;
        case 'distance':
          if (lat !== null && lng !== null) {
            sortBy = 'distance';
            sortOrder = 'asc';
          }
          break;
        case 'rating_desc':
          sortBy = 'rating';
          sortOrder = 'desc';
          break;
        case 'price_asc':
          sortBy = 'price';
          sortOrder = 'asc';
          break;
        case 'combo':
          if (lat !== null && lng !== null) {
            sortBy = 'combo';
            sortOrder = 'desc';
          }
          break;
      }
    } else if (q && !sortParam) {
      sortBy = 'relevance';
      sortOrder = 'desc';
    }

    const userId = serverUser?.id || null;
    const preferredPriceRanges = searchParams.get('preferred_price_ranges')
      ? searchParams.get('preferred_price_ranges')!.split(',').map(range => range.trim()).filter(Boolean)
      : [];
    const dealbreakerIds = searchParams.get('dealbreakers')
      ? searchParams.get('dealbreakers')!.split(',').map(id => id.trim()).filter(Boolean)
      : [];

    const feedParam = searchParams.get('feed');
    let feedStrategy: 'mixed' | 'standard' =
      (searchParams.get('feed_strategy') as 'mixed' | 'standard' | null) ||
      (feedParam === 'for-you' ? 'mixed' : null) ||
      'standard';

    const feedSupabase = userId ? (serviceSupabase ?? supabase) : supabase;

    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : (radiusKm || 10);

    const subcategoriesToFilter: string[] = [];
    if (interestIds.length > 0) {
      for (const interestId of interestIds) {
        const subcats = INTEREST_TO_SUBCATEGORIES[interestId];
        if (subcats) {
          subcategoriesToFilter.push(...subcats);
        }
      }
    }

    if (feedStrategy === 'mixed' && !userId) {
      console.log('FOR_YOU GUEST FALLBACK', { message: 'No user — falling back to standard feed.' });
      feedStrategy = 'standard';
    }

    // ── Mixed / For You feed ──────────────────────────────────────────────
    if (feedStrategy === 'mixed') {
      const requestId = searchParams.get('rid') || createRequestId();
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';
      const regionKey =
        location ? `loc:${location}` :
        (lat !== null && lng !== null && isValidLatitude(lat) && isValidLongitude(lng))
          ? `geo:${lat.toFixed(2)},${lng.toFixed(2)}`
          : 'global';
      const explicitSeed = searchParams.get('seed');
      const seedWindowMinutesEnv = Number(process.env.FEED_SEED_WINDOW_MINUTES || 15);
      const seedWindowMinutes = Number.isFinite(seedWindowMinutesEnv) ? seedWindowMinutesEnv : 15;
      const seedWindow = explicitSeed
        ? { seed: explicitSeed, expiresAtMs: Date.now() + seedWindowMinutes * 60_000, windowMinutes: seedWindowMinutes }
        : createFeedSeedWindow({
            userKey: userId ? `user:${userId}` : `anon:${ip}`,
            regionKey,
            windowMinutes: seedWindowMinutes,
          });
      const preferenceSource =
        interestIds.length > 0 || subInterestIds.length > 0
          ? 'client'
          : userId
            ? 'server'
            : 'none';

      const etagKey = JSON.stringify({
        v: 1, strategy: 'mixed', preferenceSource, regionKey, seed: seedWindow.seed,
        limit, category, badge, verified, priceRange, preferredPriceRanges, minRating,
        requireCoordinates, sortBy, sortOrder, interestIds, subInterestIds, dealbreakerIds,
      });
      const etag = createWeakEtagFromKey(etagKey);

      const notModified = maybeNotModified(req, {
        etag, ttlSeconds: 90, swrSeconds: 30, requestId,
        seed: seedWindow.seed, seedExpiresAtMs: seedWindow.expiresAtMs, feedPath: 'mixed',
      });
      if (notModified) {
        return withDuration(notModified);
      }

      let resolvedInterestIds = interestIds;
      let resolvedSubInterestIds = subInterestIds.length > 0 ? subInterestIds : subcategoriesToFilter;
      let resolvedDealbreakerIds = dealbreakerIds;

      if (interestIds.length === 0 && subInterestIds.length === 0) {
        const prefsStart = Date.now();
        const userPrefsResult = await fetchUserPreferencesWithDiagnostics(supabase, userId!);
        console.log('[BUSINESSES API] Server-side prefs fetch ms:', Date.now() - prefsStart);
        if (userPrefsResult.error) {
          const status = isRlsOrPermissionError(userPrefsResult.error.details) ? 403 : 500;
          const code = status === 403 ? 'FOR_YOU_RLS_BLOCKED' : 'FOR_YOU_PREFS_QUERY_FAILED';
          const message = status === 403
            ? 'For You preferences are blocked by RLS or account mismatch.'
            : 'Failed to load For You preferences.';
          console.error('FOR_YOU ERROR', { status, code, requestId, source: userPrefsResult.error.source, ...userPrefsResult.error.details });
          return withDuration(createForYouErrorResponse({
            status: status as 403 | 500, code, message, requestId,
            details: userPrefsResult.error.details,
          }));
        }

        const userPrefs = userPrefsResult.preferences;
        resolvedInterestIds = userPrefs.interestIds;
        resolvedDealbreakerIds = dealbreakerIds.length > 0 ? dealbreakerIds : userPrefs.dealbreakerIds;

        const mappedSubcategories: string[] = [];
        for (const iid of resolvedInterestIds) {
          const subcats = INTEREST_TO_SUBCATEGORIES[iid];
          if (subcats) mappedSubcategories.push(...subcats);
        }
        resolvedSubInterestIds = userPrefs.subcategoryIds.length > 0
          ? userPrefs.subcategoryIds
          : mappedSubcategories;
      }

      console.log('FOR_YOU PREFS COUNT', { requestId, interests: resolvedInterestIds.length, subcategories: resolvedSubInterestIds.length, dealbreakers: resolvedDealbreakerIds.length });

      if (resolvedInterestIds.length === 0 && resolvedSubInterestIds.length === 0) {
        console.error('FOR_YOU ERROR', { status: 422, code: 'FOR_YOU_PREFS_MISSING', requestId, message: 'No interest or subcategory preferences available for this user.' });
        return withDuration(createForYouErrorResponse({
          status: 422, code: 'FOR_YOU_PREFS_MISSING',
          message: 'No onboarding preferences found. Please complete onboarding to personalize For You.',
          requestId,
        }));
      }

      console.log('FOR_YOU QUERY FILTERS', { requestId, categorySlugs: resolvedInterestIds, subcategorySlugs: resolvedSubInterestIds, dealbreakerIds: resolvedDealbreakerIds, category, badge, verified, priceRange, preferredPriceRanges, minRating, requireCoordinates, latitude: lat, longitude: lng });

      const response = await handleForYouFeed({
        supabase: feedSupabase, limit, cursorOffset, category, badge, verified, priceRange,
        preferredPriceRanges, location, minRating, interestIds: resolvedInterestIds,
        subInterestIds: resolvedSubInterestIds, dealbreakerIds: resolvedDealbreakerIds,
        sortBy, sortOrder, latitude: lat, longitude: lng, requireCoordinates,
        userId, requestId, seed: seedWindow.seed, seedExpiresAtMs: seedWindow.expiresAtMs, cacheEtag: etag,
      });

      if (!response.ok) {
        return withDuration(response);
      }

      const resultsCount = Number(response.headers.get('X-For-You-Results-Count') ?? '0');
      console.log('FOR_YOU RESULTS COUNT', { requestId, count: Number.isFinite(resultsCount) ? resultsCount : 0 });

      applyFeedCachingHeaders(response, { etag, ttlSeconds: 90, swrSeconds: 30, requestId, seed: seedWindow.seed, seedExpiresAtMs: seedWindow.expiresAtMs });

      return withDuration(response);
    }

    // ── Standard feed ─────────────────────────────────────────────────────
    return withDuration(await handleStandardFeed({
      supabase, limit, cursorId, cursorCreatedAt, cursorOffset,
      category, badge, verified, priceRange, location, minRating,
      requireCoordinates, interestIds, subInterestIds, subcategoriesToFilter,
      q, search, lat, lng, radiusKm, radius,
      sortBy, sortOrder, sortParam: sortParam || null, userId, feedStrategy,
    }));

  } catch (error: any) {
    const totalMs = Date.now() - requestStart;
    const isTimeoutOrAbort =
      error?.name === 'AbortError' ||
      /timeout|timed out|abort/i.test(String(error?.message ?? ''));
    if (isTimeoutOrAbort) {
      console.warn('[BUSINESSES API] GET timed out / aborted:', error?.message ?? error, 'total ms:', totalMs);
    }
    console.error('[BUSINESSES API] GET end (error) total ms:', totalMs);
    console.error('[BUSINESSES API] Unexpected error:', error);
    console.error('[BUSINESSES API] Error stack:', error?.stack);
    console.error('[BUSINESSES API] Error details:', { message: error?.message, name: error?.name, code: error?.code });
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || String(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET endpoint for trending/top businesses (uses materialized views)
export async function HEAD(req: Request) {
  try {
    const requestUrl = req?.url ?? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/businesses`;
    const { searchParams } = new URL(requestUrl);
    const type = searchParams.get('type');
    const category = searchParams.get('category') || null;
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const supabase = await getServerSupabase(req);

    let data, error;

    switch (type) {
      case 'trending':
        ({ data, error } = await supabase.rpc('get_trending_businesses', { p_limit: limit, p_category: category }));
        break;
      case 'top':
        ({ data, error } = await supabase.rpc('get_top_rated_businesses', { p_limit: limit, p_category: category }));
        break;
      case 'new':
        ({ data, error } = await supabase.rpc('get_new_businesses', { p_limit: limit, p_category: category }));
        break;
      default:
        return GET(req);
    }

    if (error) {
      console.error('[BUSINESSES API] Error fetching special list:', error);
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
    }

    const transformedBusinesses = excludeSystemBusinesses((data || []) as any[]).map((business: any) => {
      const resolvedInterestId = resolveInterestId(business);
      return {
        id: business.id,
        name: business.name,
        image: business.image_url || (business.uploaded_images && business.uploaded_images.length > 0 ? business.uploaded_images[0] : null),
        category: business.category ?? undefined,
        category_label: business.category_label ?? getCategoryLabelFromBusiness({ category: business.category, category_label: business.category_label, sub_interest_id: business.sub_interest_id, interest_id: resolvedInterestId ?? business.interest_id }),
        sub_interest_id: business.sub_interest_id ?? undefined,
        subInterestId: business.sub_interest_id ?? undefined,
        interest_id: resolvedInterestId ?? business.interest_id ?? undefined,
        interestId: resolvedInterestId ?? business.interest_id ?? undefined,
        location: business.location,
        rating: business.average_rating > 0 ? Math.round(business.average_rating * 2) / 2 : undefined,
        totalRating: business.average_rating > 0 ? business.average_rating : undefined,
        reviews: business.total_reviews || 0,
        badge: business.verified && business.badge ? business.badge : undefined,
        href: `/business/${business.id}`,
        verified: business.verified || false,
        priceRange: business.price_range || '$$',
        hasRating: business.average_rating > 0,
        percentiles: business.percentiles,
      };
    });

    const response = NextResponse.json({
      data: transformedBusinesses,
      meta: { count: transformedBusinesses.length, type, category },
    });

    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
    return response;

  } catch (error) {
    console.error('Error in special businesses list API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/businesses
 * Create a new business (requires authentication)
 */
export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase(req);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'You need to be logged in to create a business listing. Please sign in and try again.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    return await handleBusinessCreation(req, supabase, user);
  } catch (error: any) {
    console.error('[API] Error creating business:', error);

    let errorMessage = 'We encountered an unexpected error while creating your business listing. Please try again in a moment.';
    let errorCode = 'INTERNAL_ERROR';

    if (error.message?.includes('JSON')) {
      errorMessage = 'There was an issue processing your business hours. Please check the format and try again.';
      errorCode = 'INVALID_HOURS_FORMAT';
    } else if (error.message) {
      errorMessage = `Unable to create business: ${error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message, code: errorCode },
      { status: 500 }
    );
  }
}
