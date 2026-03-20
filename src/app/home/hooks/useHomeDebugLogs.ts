import { useEffect } from "react";

interface UseHomePreferencesDebugParams {
  interests: Array<any>;
  subcategories: Array<any>;
  dealbreakers: Array<any>;
  isDev: boolean;
}

export function useHomePreferencesDebug({
  interests,
  subcategories,
  dealbreakers,
  isDev,
}: UseHomePreferencesDebugParams) {
  useEffect(() => {
    if (!isDev) return;
    console.log("[Home] user prefs:", {
      interestsLen: interests.length,
      interests,
      subcategoriesLen: subcategories.length,
      dealbreakersLen: dealbreakers.length,
    });
  }, [interests, subcategories, dealbreakers, isDev]);
}

interface UseHomeBusinessCountsDebugParams {
  forYouBusinesses: Array<any>;
  trendingBusinesses: Array<any>;
  forYouLoading: boolean;
  trendingLoading: boolean;
  forYouError: string | null;
  trendingError: string | null;
  featuredByCategory: Array<any>;
  featuredLoading: boolean;
  isDev: boolean;
}

export function useHomeBusinessCountsDebug({
  forYouBusinesses,
  trendingBusinesses,
  forYouLoading,
  trendingLoading,
  forYouError,
  trendingError,
  featuredByCategory,
  featuredLoading,
  isDev,
}: UseHomeBusinessCountsDebugParams) {
  useEffect(() => {
    if (!isDev) return;
    console.log("Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â");
    console.log("Ã°Å¸â€œÅ  [Home Page] Business Counts Summary");
    console.log("Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â");
    console.log("[Home Page] For You:", {
      count: forYouBusinesses.length,
      loading: forYouLoading,
      error: forYouError,
    });
    console.log("[Home Page] Trending:", {
      count: trendingBusinesses.length,
      loading: trendingLoading,
      error: trendingError,
    });
    const safeFeatured = Array.isArray(featuredByCategory) ? featuredByCategory : [];
    console.log("[Home Page] Featured by Category:", {
      count: safeFeatured.length,
      loading: featuredLoading,
      categories: safeFeatured.map((f) => f.category),
    });
    console.log("Ã¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€ÂÃ¢â€Â");
  }, [forYouBusinesses, trendingBusinesses, forYouLoading, trendingLoading, featuredByCategory, featuredLoading, isDev, forYouError, trendingError]);
}
