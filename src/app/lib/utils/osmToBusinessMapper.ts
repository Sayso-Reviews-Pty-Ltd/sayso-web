/**
 * Maps Overpass API (OSM) business data to our Business type
 */

import { OverpassBusiness } from "../services/overpassService";
import { Business } from "../../lib/types/database";
import { getCategoryImageUrl } from "./categoryToImageMapper";

/**
 * Maps OSM business data to our database Business type
 */
export function mapOSMToBusiness(
  osmBusiness: OverpassBusiness
): Omit<Business, "id" | "created_at" | "updated_at"> {
  // Generate a deterministic ID from OSM ID
  const businessId = `osm-${osmBusiness.id.replace("osm-", "")}`;

  // Extract suburb/area from address for location field
  const location = extractLocation(osmBusiness.address) || "Cape Town";

  // Determine price range (default to $$ if unknown)
  const priceRange = determinePriceRange(osmBusiness.tags) || "$$";

  // Generate description from category and name
  const description = `${osmBusiness.category} located in ${location}`;

  // Get placeholder image based on category
  const placeholderImage = getCategoryImageUrl(osmBusiness.category);

  return {
    name: osmBusiness.name,
    description,
    category: osmBusiness.category,
    location,
    address: osmBusiness.address || undefined,
    phone: osmBusiness.phone || undefined,
    email: undefined, // OSM doesn't typically have email
    website: osmBusiness.website || undefined,
    image_url: placeholderImage, // Assign placeholder PNG based on category
    verified: false, // New businesses start unverified
    price_range: priceRange as "$" | "$$" | "$$$" | "$$$$",
    owner_id: undefined, // No owner initially
  };
}

/**
 * Extracts location/suburb from address string
 */
function extractLocation(address?: string): string | null {
  if (!address) return null;

  // Try to extract suburb name (common in Cape Town addresses)
  const suburbMatch = address.match(/(?:,|^)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:,|$)/);
  if (suburbMatch && suburbMatch[1]) {
    // Filter out common non-suburb words
    const suburb = suburbMatch[1].trim();
    const skipWords = [
      "Cape",
      "Town",
      "Western",
      "Cape",
      "South",
      "Africa",
      "Street",
      "Road",
      "Avenue",
      "Drive",
    ];
    if (!skipWords.includes(suburb)) {
      return suburb;
    }
  }

  // Fallback: try to get area after city
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length > 1) {
    // Second to last part is often the suburb
    const suburb = parts[parts.length - 2];
    if (suburb && !suburb.match(/^\d{4}$/)) {
      // Skip postcodes
      return suburb;
    }
  }

  return null;
}

/**
 * Determines price range from OSM tags
 */
function determinePriceRange(tags: Record<string, string>): "$" | "$$" | "$$$" | "$$$$" | null {
  // Check for explicit price information
  if (tags["price_range"]) {
    const price = tags["price_range"].trim();
    if (price.startsWith("$")) {
      return price as "$" | "$$" | "$$$" | "$$$$";
    }
  }

  // Infer from business type
  if (tags.amenity === "fast_food" || tags.shop === "supermarket") {
    return "$";
  }

  if (tags.amenity === "restaurant" || tags.amenity === "cafe") {
    // Check cuisine or other indicators
    if (tags.cuisine) {
      // Premium cuisines tend to be pricier
      if (["fine_dining", "french", "italian", "japanese"].includes(tags.cuisine)) {
        return "$$$";
      }
      return "$$";
    }
    return "$$";
  }

  if (tags.amenity === "bar" || tags.amenity === "pub") {
    return "$$";
  }

  if (tags.tourism === "hotel") {
    return "$$$";
  }

  // Default to mid-range
  return "$$";
}

/**
 * Generates random percentile scores for a business
 */
export function generatePercentiles(): {
  service: number;
  price: number;
  ambience: number;
} {
  // Generate realistic percentile scores (70-98 range)
  return {
    service: Math.floor(Math.random() * 28) + 70, // 70-97
    price: Math.floor(Math.random() * 28) + 70,
    ambience: Math.floor(Math.random() * 28) + 70,
  };
}

/**
 * Generates initial stats for a new business
 */
export function generateInitialStats(): {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  percentiles: {
    service: number;
    price: number;
    ambience: number;
  };
} {
  // New businesses start with minimal reviews
  const totalReviews = Math.floor(Math.random() * 5); // 0-4 reviews

  // Generate a realistic average rating (3.5-4.8 for new businesses)
  const averageRating = Math.round((Math.random() * 1.3 + 3.5) * 10) / 10;

  // Generate rating distribution
  const distribution = {
    1: Math.floor(Math.random() * 2),
    2: Math.floor(Math.random() * 2),
    3: Math.floor(Math.random() * 3),
    4: Math.floor(Math.random() * (totalReviews - 1)),
    5: 0,
  };

  // Ensure total matches
  const sum = distribution[1] + distribution[2] + distribution[3] + distribution[4];
  distribution[5] = Math.max(0, totalReviews - sum);

  return {
    total_reviews: totalReviews,
    average_rating: averageRating,
    rating_distribution: distribution,
    percentiles: generatePercentiles(),
  };
}
