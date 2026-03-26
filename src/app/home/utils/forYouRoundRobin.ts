import type { Business } from "@/app/components/BusinessCard/BusinessCard";

function getCategoryKey(business: Business): string {
  const categoryKey =
    business.primary_category_slug ||
    business.interest_id ||
    business.interestId ||
    business.category;
  const normalizedCategory = (categoryKey || "").toString().trim().toLowerCase();
  if (normalizedCategory) return normalizedCategory;
  return "miscellaneous";
}

/**
 * Interleave items by top-level category while preserving each category's
 * original ranking order and avoiding consecutive same-category cards whenever
 * alternatives exist.
 */
export function roundRobinForYouBusinesses(businesses: Business[]): Business[] {
  if (!Array.isArray(businesses) || businesses.length <= 2) return businesses;

  const buckets = new Map<string, Business[]>();
  const categoryOrder: string[] = [];

  for (const business of businesses) {
    const key = getCategoryKey(business);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      categoryOrder.push(key);
    }
    buckets.get(key)!.push(business);
  }

  if (categoryOrder.length <= 1) return businesses;

  const interleaved: Business[] = [];
  let previousCategory = "";
  let cursor = 0;

  while (interleaved.length < businesses.length) {
    let selectedCategory: string | null = null;

    for (let i = 0; i < categoryOrder.length; i += 1) {
      const idx = (cursor + i) % categoryOrder.length;
      const candidate = categoryOrder[idx];
      const bucket = buckets.get(candidate);
      if (!bucket || bucket.length === 0) continue;
      if (candidate === previousCategory) continue;
      selectedCategory = candidate;
      cursor = (idx + 1) % categoryOrder.length;
      break;
    }

    if (!selectedCategory) {
      for (let i = 0; i < categoryOrder.length; i += 1) {
        const idx = (cursor + i) % categoryOrder.length;
        const candidate = categoryOrder[idx];
        const bucket = buckets.get(candidate);
        if (!bucket || bucket.length === 0) continue;
        selectedCategory = candidate;
        cursor = (idx + 1) % categoryOrder.length;
        break;
      }
    }

    if (!selectedCategory) break;

    const selectedBucket = buckets.get(selectedCategory);
    const nextBusiness = selectedBucket?.shift();
    if (!nextBusiness) continue;

    interleaved.push(nextBusiness);
    previousCategory = selectedCategory;
  }

  return interleaved;
}
