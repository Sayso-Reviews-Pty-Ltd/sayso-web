/**
 * Business ID mapping to handle legacy static data that references
 * old numeric IDs vs new slug-based IDs in the database
 */

export const BUSINESS_ID_MAPPING: Record<string, string> = {
  // Legacy numeric IDs to database slugs (from old businessData.ts)
  "1": "the-green-table",
  "2": "artisan-coffee-co",
  "3": "bloom-yoga-studio",
  "4": "zen-wellness-center", // Note: This might conflict with '23', using first occurrence
  "5": "sunset-ceramics-studio",
  "6": "morning-glory-bakery",
  "7": "mama-rosa-italian",
  "8": "sakura-sushi",
  "9": "roasted-dreams",
  "10": "copper-mule",
  "11": "modern-arts-gallery",
  "12": "grand-theater",

  // More legacy mappings from businessData.ts
  "21": "ocean-view-bistro",
  "22": "urban-roastery",
  "23": "zen-wellness-center",
  "24": "the-literary-corner",
  "25": "creative-canvas-studio",
  "26": "fresh-start-bakehouse",
  "27": "fitness-first-gym",
  "28": "metro-brew-house",
  "29": "harmony-spa-wellness",
  "30": "serenity-spa",
  "31": "fitcore-gym",
  "32": "luna-rooftop",
  "33": "elite-home",
  "34": "adventure-gear",
  "35": "happy-tails",
  "36": "vintage-threads",
  "37": "moonlight-cruise",
  "38": "food-truck-festival",
  "39": "burger-bliss",
  "40": "the-green-table", // Duplicate, using same as '1'

  // Community highlights mappings (from communityHighlightsData.ts)
  "artisan-coffee": "artisan-coffee-co",
  "lunas-garden": "luna-rooftop", // Luna's Garden -> Luna Rooftop Lounge
  "book-and-brew": "metro-brew-house", // Book and Brew -> Metro Brew House
  "green-valley-yoga": "bloom-yoga-studio", // Green Valley Yoga -> Bloom Yoga Studio
};

/**
 * Resolves a business ID/slug to the correct database identifier
 * @param id - The ID or slug from static data or URL
 * @returns The correct slug to use with the database API
 */
export function resolveBusinessId(id: string): string {
  // Check if there's a mapping for this ID
  if (BUSINESS_ID_MAPPING[id]) {
    return BUSINESS_ID_MAPPING[id];
  }

  // Return the ID as-is if no mapping exists (assume it's already correct)
  return id;
}

/**
 * Updates a business href to use the correct slug
 * @param href - Original href like "/business/1" or "/business/old-slug"
 * @returns Updated href with correct slug
 */
export function resolveBusinessHref(href: string): string {
  const match = href.match(/^\/business\/(.+)$/);
  if (!match) return href;

  const [, id] = match;
  const resolvedId = resolveBusinessId(id);
  return `/business/${resolvedId}`;
}
