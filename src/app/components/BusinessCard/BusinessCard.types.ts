type Percentiles = {
  punctuality?: number;
  'cost-effectiveness'?: number;
  friendliness?: number;
  trustworthiness?: number;
};

type Business = {
  id: string;
  slug?: string;
  name: string;
  image?: string;
  image_url?: string;
  uploaded_images?: string[]; // Array of image URLs from uploaded_images field
  business_images?: Array<{ url: string; is_primary?: boolean; sort_order?: number }>; // Array of image objects with metadata
  alt: string;
  /** Canonical slug (e.g. restaurants). Used for placeholder resolution. */
  category?: string;
  /** Display label (e.g. "Restaurants"). Prefer this for UI text. */
  category_label?: string;
  /** New schema (20260210): DB primary taxonomy columns. Prefer when present. */
  primary_subcategory_slug?: string | null;
  primary_subcategory_label?: string | null;
  primary_category_slug?: string | null;
  sub_interest_id?: string | null;
  subInterestId?: string;
  subInterestLabel?: string;
  interest_id?: string | null;
  interestId?: string;
  location: string;
  rating?: number;
  totalRating?: number;
  reviews: number;
  badge?: string;
  href?: string;
  percentiles?: Percentiles;
  verified?: boolean;
  distance?: number | string;
  priceRange?: string;
  hasRating?: boolean;
  stats?: {
    average_rating: number;
  };
  description?: string;
  phone?: string;
  website?: string;
  address?: string;
  amenity?: string;
  tags?: string[];
  /** DB status: active | pending_approval; used for owner dashboard badge */
  status?: string;
  lat?: number; // Latitude for map display
  lng?: number; // Longitude for map display
  top_review_preview?: {
    content: string;
    rating?: number | null;
    createdAt?: string | null;
  } | null;
};

export type { Percentiles, Business };
