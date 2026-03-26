import type { Business } from "@/app/components/BusinessCard/BusinessCard";

function getBucketKey(business: Business): string {
  const subcategoryKey =
    business.primary_subcategory_slug ||
    business.sub_interest_id ||
    business.subInterestId ||
    business.category;

  const categoryKey = business.primary_category_slug || business.interest_id || business.interestId;
  const normalizedSubcategory = (subcategoryKey || "").toString().trim().toLowerCase();
  const normalizedCategory = (categoryKey || "").toString().trim().toLowerCase();

  if (normalizedSubcategory) return normalizedSubcategory;
  if (normalizedCategory) return normalizedCategory;
  return "miscellaneous";
}

/**
 * Interleave items by subcategory/category while preserving each bucket's
 * original ranking order.
 */
export function roundRobinForYouBusinesses(businesses: Business[]): Business[] {
  if (!Array.isArray(businesses) || businesses.length <= 2) return businesses;

  const buckets = new Map<string, Business[]>();
  const bucketOrder: string[] = [];

  for (const business of businesses) {
    const key = getBucketKey(business);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      bucketOrder.push(key);
    }
    buckets.get(key)!.push(business);
  }

  const interleaved: Business[] = [];
  let hasRemaining = true;

  while (hasRemaining) {
    hasRemaining = false;
    for (const key of bucketOrder) {
      const bucket = buckets.get(key);
      if (!bucket || bucket.length === 0) continue;
      const next = bucket.shift();
      if (next) {
        interleaved.push(next);
        hasRemaining = true;
      }
    }
  }

  return interleaved;
}
