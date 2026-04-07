import type { BusinessRPCResult } from "./route.types";
import {
  CANONICAL_SUBCATEGORY_SLUGS,
  SUBCATEGORY_SLUG_TO_LABEL,
} from "@/app/utils/subcategoryPlaceholders";

export const BUSINESS_SELECT = `
  id, name, description, primary_subcategory_slug, primary_subcategory_label, primary_category_slug, location, address,
  phone, email, website, hours, image_url,
  verified, price_range, badge, slug, lat, lng,
  created_at, updated_at,
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
`;

export const BUSINESS_SELECT_FALLBACK = `
  id, name, description, primary_subcategory_slug, primary_subcategory_label, primary_category_slug, location, address,
  phone, email, website, hours, image_url,
  verified, price_range, badge, slug, lat, lng,
  created_at, updated_at
`;

export const CANONICAL_SUBCATEGORY_SET = new Set<string>(
  CANONICAL_SUBCATEGORY_SLUGS as readonly string[]
);

export function normalizeCategoryToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const CATEGORY_LABEL_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SUBCATEGORY_SLUG_TO_LABEL).map(([slug, label]) => [
    normalizeCategoryToken(label),
    slug,
  ])
);

// Mapping of interests to subcategories
export const INTEREST_TO_SUBCATEGORIES: Record<string, string[]> = {
  "food-drink": ["restaurants", "cafes", "bars", "fast-food", "fine-dining"],
  "beauty-wellness": ["gyms", "spas", "salons", "wellness", "nail-salons"],
  "professional-services": [
    "education-learning",
    "transport-travel",
    "finance-insurance",
    "plumbers",
    "electricians",
    "legal-services",
  ],
  travel: ["accommodation", "transport", "travel-services"],
  "outdoors-adventure": ["hiking", "cycling", "water-sports", "camping"],
  "experiences-entertainment": [
    "events-festivals",
    "sports-recreation",
    "nightlife",
    "comedy-clubs",
    "cinemas",
  ],
  "arts-culture": ["museums", "galleries", "theaters", "concerts"],
  "family-pets": ["family-activities", "pet-services", "childcare", "veterinarians"],
  "shopping-lifestyle": ["fashion", "electronics", "home-decor", "books"],
};

export const DEFAULT_SUBCATEGORY_BY_MAIN_CATEGORY: Record<string, string> = {
  "food-drink": "restaurants",
  "beauty-wellness": "salons",
  "professional-services": "finance-insurance",
  travel: "accommodation",
  "outdoors-adventure": "hiking",
  "experiences-entertainment": "events-festivals",
  "arts-culture": "museums",
  "family-pets": "family-activities",
  "shopping-lifestyle": "fashion",
  miscellaneous: "miscellaneous",
};

export const KNOWN_MAIN_CATEGORY_SLUGS = new Set<string>(
  Object.keys(DEFAULT_SUBCATEGORY_BY_MAIN_CATEGORY)
);

/**
 * Search term synonyms mapping
 * Automatically expands search queries to include common variations
 * This makes search flexible and handles spelling variations, regional terms, etc.
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // Coffee & Cafes
  coffee: [
    "cafe",
    "cafes",
    "caffee",
    "caffees",
    "coffee shop",
    "coffee house",
    "coffeehouse",
    "espresso",
  ],
  cafe: ["coffee", "cafes", "caffee", "caffees", "coffee shop", "coffeehouse"],
  cafes: ["coffee", "cafe", "caffee", "caffees", "coffee shop"],

  // Fitness & Gyms
  gym: ["fitness", "workout", "fitness center", "training", "exercise"],
  fitness: ["gym", "workout", "training", "exercise"],

  // Restaurants & Dining
  restaurant: ["dining", "eatery", "diner", "bistro", "brasserie"],
  dining: ["restaurant", "eatery", "diner"],
  eatery: ["restaurant", "dining", "diner"],

  // Bars & Nightlife
  bar: ["pub", "tavern", "lounge", "nightclub"],
  pub: ["bar", "tavern", "lounge"],

  // Beauty & Wellness
  salon: ["beauty salon", "hair salon", "hairdresser", "stylist"],
  spa: ["wellness", "massage", "beauty spa", "day spa"],
  hairdresser: ["hair salon", "salon", "stylist", "barber"],
  barber: ["barbershop", "hairdresser", "hair salon"],

  // Shopping
  shop: ["store", "boutique", "retail"],
  store: ["shop", "boutique", "retail"],
  boutique: ["shop", "store", "retail"],
};

export const DEALBREAKER_RULES: Record<string, (business: BusinessRPCResult) => boolean> = {
  trustworthiness: (business) => business.verified !== false,
  punctuality: (business) => {
    const punctualityScore = business.percentiles?.punctuality ?? 80;
    return punctualityScore >= 70;
  },
  friendliness: (business) => {
    const friendlinessScore = business.percentiles?.friendliness ?? 80;
    return friendlinessScore >= 65;
  },
  "value-for-money": (business) => {
    if (business.price_range) {
      return business.price_range === "$" || business.price_range === "$$";
    }
    const costEffectivenessScore = business.percentiles?.["cost-effectiveness"] ?? 100;
    return costEffectivenessScore >= 75;
  },
  expensive: (business) => business.price_range !== "$$$$" && business.price_range !== "$$$",
};

export const ONE_DAY_MS = 1000 * 60 * 60 * 24;
