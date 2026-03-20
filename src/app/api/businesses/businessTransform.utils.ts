import type { getServerSupabase } from "@/app/lib/supabase/server";
import { calculateContactRankingBoost } from "@/app/lib/utils/contactCompleteness";
import {
  getSubcategoryLabel,
  getCategoryLabelFromBusiness,
} from "@/app/utils/subcategoryPlaceholders";
import type { BusinessRPCResult, SupabaseClientInstance } from "./route.types";
import { ONE_DAY_MS } from "./route.constants";
import { resolveInterestId } from "./route.utils";

// ── Scoring ──────────────────────────────────────────────────────────────────

export function calculateRecencyBoost(dateString: string | null, multiplier = 1) {
  if (!dateString) return 0;
  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) return 0;
  const days = Math.max((Date.now() - timestamp) / ONE_DAY_MS, 1);
  return multiplier / days;
}

export function scorePersonal(business: BusinessRPCResult) {
  const rating = business.average_rating || 0;
  const reviews = Math.log(Math.max(business.total_reviews || 0, 1) + 1);
  const recency = calculateRecencyBoost(business.created_at, 1.2);
  const verifiedBonus = business.verified ? 0.4 : 0;
  const photoBonus = business.image_url || (business.uploaded_images && business.uploaded_images.length > 0) ? 0.2 : 0;
  const contactBoost = calculateContactRankingBoost(business, 1.0);
  return rating * 2.2 + reviews + recency + verifiedBonus + photoBonus + contactBoost;
}

export function scoreTopRated(business: BusinessRPCResult) {
  const rating = business.average_rating || 0;
  const reviews = Math.log(Math.max(business.total_reviews || 0, 1) + 1.5);
  const verifiedBonus = business.verified ? 0.5 : 0;
  const contactBoost = calculateContactRankingBoost(business, 0.9);
  return rating * 2.5 + reviews + verifiedBonus + contactBoost;
}

export function scoreExplore(business: BusinessRPCResult) {
  const recency = calculateRecencyBoost(business.created_at, 2.5);
  const lowReviewBoost = (business.total_reviews || 0) < 10 ? 1.2 : 0;
  const ratingSupport = (business.average_rating || 0) * 0.8;
  const photoBonus = business.image_url || (business.uploaded_images && business.uploaded_images.length > 0) ? 0.4 : 0;
  const verifiedBonus = business.verified ? 0.3 : 0;
  const contactBoost = calculateContactRankingBoost(business, 0.8);
  return recency + lowReviewBoost + ratingSupport + photoBonus + verifiedBonus + contactBoost;
}

// ── Transformation ───────────────────────────────────────────────────────────

export function transformBusinessForCard(business: BusinessRPCResult) {
  const hasRating = business.average_rating && business.average_rating > 0;
  const hasReviews = business.total_reviews && business.total_reviews > 0;
  const shouldShowBadge = business.verified && business.badge;
  const subInterestLabel = business.sub_interest_id ? getSubcategoryLabel(business.sub_interest_id) : undefined;

  const firstUploadedImage = business.uploaded_images && business.uploaded_images.length > 0
    ? business.uploaded_images[0]
    : null;
  const displayImage = firstUploadedImage || business.image_url;

  const transformLog = {
    businessId: business.id,
    businessName: business.name,
    hasRating,
    hasReviews,
    shouldShowBadge,
    hasFirstUploadedImage: !!firstUploadedImage,
    hasImageUrl: !!business.image_url,
    hasDisplayImage: !!displayImage,
    uploadedImagesCount: business.uploaded_images?.length || 0,
    category: business.category,
    status: 'transforming',
  };

  const wouldBeDropped = !business.id || !business.name;
  if (wouldBeDropped) {
    transformLog.status = 'dropped';
    console.warn('[BUSINESSES API] transformBusinessForCard: Business would be dropped:', transformLog);
  } else {
    transformLog.status = 'transformed';
  }

  const resolvedInterestId = resolveInterestId(business);
  const displayLabel = getCategoryLabelFromBusiness({
    category: business.category,
    category_label: (business as { category_label?: string | null }).category_label,
    sub_interest_id: business.sub_interest_id,
    interest_id: resolvedInterestId ?? business.interest_id,
  });

  const transformed = {
    id: business.id,
    name: business.name,
    image: displayImage,
    uploaded_images: business.uploaded_images || [],
    image_url: business.image_url || undefined,
    category: business.category ?? undefined,
    category_label: displayLabel,
    sub_interest_id: business.sub_interest_id ?? undefined,
    subInterestId: business.sub_interest_id ?? undefined,
    subInterestLabel: subInterestLabel ?? (displayLabel !== "Miscellaneous" ? displayLabel : undefined),
    interest_id: resolvedInterestId ?? business.interest_id ?? undefined,
    interestId: resolvedInterestId ?? business.interest_id ?? undefined,
    location: business.location,
    address: business.address ?? undefined,
    phone: business.phone ?? undefined,
    website: business.website ?? undefined,
    description: business.description ?? undefined,
    slug: business.slug || undefined,
    lat: business.lat,
    lng: business.lng,
    rating: hasRating ? Math.round(business.average_rating * 2) / 2 : undefined,
    totalRating: hasRating ? business.average_rating : undefined,
    reviews: hasReviews ? business.total_reviews : 0,
    badge: shouldShowBadge ? business.badge : undefined,
    href: `/business/${business.id}`,
    verified: business.verified || false,
    priceRange: business.price_range || '$$',
    distance: business.distance_km,
    hasRating,
    percentiles: hasReviews && business.percentiles
      ? {
          punctuality: business.percentiles.punctuality ?? 0,
          friendliness: business.percentiles.friendliness ?? 0,
          trustworthiness: business.percentiles.trustworthiness ?? 0,
          'cost-effectiveness': business.percentiles['cost-effectiveness'] ?? 0,
        }
      : undefined,
  };

  if (!wouldBeDropped) {
    console.log('[BUSINESSES API] transformBusinessForCard: Successfully transformed:', {
      ...transformLog,
      finalImage: transformed.image ? 'present' : 'missing',
      uploadedImagesArray: transformed.uploaded_images?.length || 0,
      uploadedImagesSample: transformed.uploaded_images?.slice(0, 2) || [],
    });
  }

  return transformed;
}

export async function excludeAlreadyReviewedBusinesses(
  supabase: SupabaseClientInstance,
  userId: string,
  businesses: BusinessRPCResult[]
): Promise<BusinessRPCResult[]> {
  if (!businesses?.length) return businesses;
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('business_id')
      .eq('user_id', userId);
    if (error || !reviews?.length) return businesses;
    const reviewedIds = new Set(reviews.map((r) => r.business_id));
    return businesses.filter((b) => !reviewedIds.has(b.id) && !reviewedIds.has(b.slug));
  } catch (e) {
    console.warn('[BUSINESSES API] excludeAlreadyReviewedBusinesses error:', e);
    return businesses;
  }
}

export async function prioritizeRecentlyReviewedBusinesses(
  supabase: SupabaseClientInstance,
  businesses: BusinessRPCResult[]
): Promise<BusinessRPCResult[]> {
  if (!businesses || businesses.length === 0) {
    return businesses;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return businesses;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentReviews, error } = await supabase
      .from('reviews')
      .select('business_id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error || !recentReviews || recentReviews.length === 0) {
      return businesses;
    }

    const reviewedBusinessIds = [...new Set(recentReviews.map(r => r.business_id))];

    if (reviewedBusinessIds.length === 0) {
      return businesses;
    }

    const reviewedBusinesses: BusinessRPCResult[] = [];
    const nonReviewedBusinesses: BusinessRPCResult[] = [];

    for (const business of businesses) {
      const isRecentlyReviewed = reviewedBusinessIds.some(reviewedId =>
        reviewedId === business.id || reviewedId === business.slug
      );

      if (isRecentlyReviewed) {
        reviewedBusinesses.push(business);
      } else {
        nonReviewedBusinesses.push(business);
      }
    }

    reviewedBusinesses.sort((a, b) => {
      const aReview = recentReviews.find(r => r.business_id === a.id || r.business_id === a.slug);
      const bReview = recentReviews.find(r => r.business_id === b.id || r.business_id === b.slug);

      if (!aReview) return 1;
      if (!bReview) return -1;

      return new Date(bReview.created_at).getTime() - new Date(aReview.created_at).getTime();
    });

    return [...reviewedBusinesses, ...nonReviewedBusinesses];
  } catch (error) {
    console.error('[BUSINESSES API] Error prioritizing recently reviewed businesses:', error);
    return businesses;
  }
}

export async function findSimilarBusinesses(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  category: string,
  name: string,
  location?: string | null,
  excludeBusinessId?: string,
  limit: number = 5
): Promise<any[]> {
  try {
    const isValidUUID = excludeBusinessId
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(excludeBusinessId)
      : false;

    let query = supabase
      .from('businesses')
      .select(`
        id,
        name,
        primary_subcategory_slug,
        location,
        address,
        slug,
        image_url,
        verified,
        business_stats (
          total_reviews,
          average_rating
        )
      `)
      .eq('primary_subcategory_slug', category)
      .eq('status', 'active')
      .or('is_system.is.null,is_system.eq.false')
      .limit(limit + 1);

    if (excludeBusinessId && isValidUUID) {
      query = query.neq('id', excludeBusinessId);
    }

    const { data: businesses, error } = await query;

    if (error) {
      console.error('[API] Error finding similar businesses:', error);
      return [];
    }

    if (!businesses || businesses.length === 0) {
      return [];
    }

    const scoredBusinesses = businesses.map(business => {
      let score = 0;

      const businessNameLower = business.name?.toLowerCase() || '';
      const searchNameLower = name.toLowerCase();

      if (businessNameLower.includes(searchNameLower) || searchNameLower.includes(businessNameLower)) {
        score += 10;
      }

      if (location && business.location) {
        const businessLocationLower = business.location.toLowerCase();
        const searchLocationLower = location.toLowerCase();
        if (businessLocationLower.includes(searchLocationLower) || searchLocationLower.includes(businessLocationLower)) {
          score += 5;
        }
      }

      if (business.verified) {
        score += 2;
      }

      const avgRating = business.business_stats?.[0]?.average_rating || 0;
      score += avgRating;

      return { ...business, relevanceScore: score };
    });

    return scoredBusinesses
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(({ relevanceScore, ...business }) => business);
  } catch (error) {
    console.error('[API] Error in findSimilarBusinesses:', error);
    return [];
  }
}
