import type { getServerSupabase } from "@/app/lib/supabase/server";
import type { BusinessImage } from "@/app/lib/utils/businessImages";

export type SupabaseClientInstance = Awaited<ReturnType<typeof getServerSupabase>>;

export type ForYouErrorDetails = {
  code: string | null;
  message: string;
  details: string | null;
  hint: string | null;
};

export type ForYouErrorStatus = 401 | 403 | 422 | 500;

export type PreferenceReadError = {
  source: "user_interests" | "user_subcategories" | "user_dealbreakers";
  details: ForYouErrorDetails;
};

export type EncodedFeedCursor =
  | {
      kind: "business-keyset";
      cursor_id: string;
      cursor_created_at: string;
    }
  | {
      kind: "offset";
      offset: number;
    };

// Type for the RPC response
export interface BusinessRPCResult {
  id: string;
  name: string;
  is_system?: boolean | null;
  description: string | null;
  category: string;
  category_label?: string | null;
  interest_id?: string | null;
  sub_interest_id?: string | null;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours?: unknown | null;
  image_url: string | null;
  uploaded_images: string[] | null;
  verified: boolean;
  price_range: string;
  badge: string | null;
  slug: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  total_reviews: number;
  average_rating: number;
  percentiles: Record<string, number> | null;
  distance_km: number | null;
  cursor_id: string;
  cursor_created_at: string;
  personalization_score?: number;
  diversity_rank?: number;
}

export type DatabaseBusinessRow = {
  id: string;
  name: string;
  description: string | null;
  primary_subcategory_slug: string | null;
  primary_subcategory_label: string | null;
  primary_category_slug: string | null;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours?: unknown | null;
  image_url: string | null;
  business_images?: BusinessImage[] | null;
  verified: boolean;
  price_range: string;
  badge: string | null;
  slug: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  business_stats?: Array<{
    total_reviews: number | null;
    average_rating: number | null;
    percentiles: Record<string, number> | null;
  }>;
};

export type MixedFeedOptions = {
  supabase: SupabaseClientInstance;
  limit: number;
  cursorOffset?: number;
  category: string | null;
  badge: string | null;
  verified: boolean | null;
  priceRange: string | null;
  preferredPriceRanges: string[];
  location: string | null;
  minRating: number | null;
  interestIds: string[];
  subInterestIds: string[];
  dealbreakerIds: string[];
  sortBy: string;
  sortOrder: string;
  latitude: number | null;
  longitude: number | null;
  requireCoordinates?: boolean;
  userId?: string | null;
  requestId?: string;
  seed?: string;
  seedExpiresAtMs?: number;
  cacheEtag?: string;
};
