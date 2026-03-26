import type { Business } from "@/app/components/BusinessCard/BusinessCard";

const MAX_PER_CATEGORY = 3;

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

function getSubcategoryKey(business: Business): string {
  const subcategoryKey =
    business.primary_subcategory_slug ||
    business.sub_interest_id ||
    business.subInterestId ||
    business.category;
  const normalizedSubcategory = (subcategoryKey || "").toString().trim().toLowerCase();
  if (normalizedSubcategory) return normalizedSubcategory;
  return "miscellaneous";
}

/**
 * BOTM-style diversification:
 * 1) subcategory rounds (winner per subcategory, then second-per-subcategory, etc.)
 * 2) parent-category cap on the primary pass
 * 3) overflow appended so we preserve the full list size
 */
export function roundRobinForYouBusinesses(businesses: Business[]): Business[] {
  if (!Array.isArray(businesses) || businesses.length <= 2) return businesses;

  const subcategoryBuckets = new Map<string, Business[]>();
  const subcategoryOrder: string[] = [];

  for (const business of businesses) {
    const key = getSubcategoryKey(business);
    if (!subcategoryBuckets.has(key)) {
      subcategoryBuckets.set(key, []);
      subcategoryOrder.push(key);
    }
    subcategoryBuckets.get(key)!.push(business);
  }

  if (subcategoryOrder.length <= 1) return businesses;

  const maxBucketDepth = subcategoryOrder.reduce((depth, key) => {
    const size = subcategoryBuckets.get(key)?.length ?? 0;
    return Math.max(depth, size);
  }, 0);

  const roundOrdered: Business[] = [];
  for (let rank = 0; rank < maxBucketDepth; rank += 1) {
    for (const key of subcategoryOrder) {
      const bucket = subcategoryBuckets.get(key);
      if (!bucket) continue;
      const candidate = bucket[rank];
      if (candidate) roundOrdered.push(candidate);
    }
  }

  const categoryCounts = new Map<string, number>();
  const primary: Business[] = [];
  const overflow: Business[] = [];

  for (const business of roundOrdered) {
    const category = getCategoryKey(business);
    const used = categoryCounts.get(category) ?? 0;
    if (used < MAX_PER_CATEGORY) {
      primary.push(business);
      categoryCounts.set(category, used + 1);
    } else {
      overflow.push(business);
    }
  }

  return [...primary, ...overflow];
}
