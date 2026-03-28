"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../../components/Footer/Footer";
import BusinessCard from "../../../components/BusinessCard/BusinessCard";
import { useBusinesses } from "../../../hooks/useBusinesses";
import { Loader } from "../../../components/Loader/Loader";
import BusinessGridSkeleton from "../../../components/Explore/BusinessGridSkeleton";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { ChevronLeft, ChevronRight } from "@/app/lib/icons";
import { H1, H2, P, Muted } from "@/app/components/ui/typography";

function CategoryDetailContent() {
  const params = useParams();
  const router = useRouter();
  // Normalize categoryId to ensure it's always a string
  const categoryId = String(params?.id ?? "");
  const { interests, loadInterests, subInterests, loadSubInterests } = useOnboarding();
  // ✅ ACTIVE FILTERS: User-initiated subcategory filtering (starts empty)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  // ✅ Track if subcategory filtering is active (for better empty state messaging)
  const hasSubcategoryFilter = selectedSubcategories.length > 0;

  // ✅ Load interests and subcategories (GLOBAL taxonomy, not user preferences)
  useEffect(() => {
    if (interests.length === 0) {
      loadInterests();
    }
  }, [interests.length, loadInterests]);

  useEffect(() => {
    // ✅ Load subcategories for this category (global taxonomy)
    if (categoryId && interests.length > 0) {
      console.log("[CategoryDetail] Loading subcategories for category:", categoryId);
      loadSubInterests([categoryId]);
    }
  }, [categoryId, interests.length, loadSubInterests]);

  // Find the category
  const category = useMemo(() => {
    return interests.find((i) => i.id === categoryId);
  }, [interests, categoryId]);

  // Guard: ensure subInterests is always an array
  const safeSubcategories = useMemo(
    () => (Array.isArray(subInterests) ? subInterests : []),
    [subInterests]
  );

  // Get subcategories for this interest
  const categorySubcategories = useMemo(() => {
    if (!categoryId) return [];
    const id = String(categoryId ?? "").trim();
    const filtered = safeSubcategories.filter((sub) => {
      const subInterestId = String(sub.interest_id ?? "").trim();
      return subInterestId === id;
    });

    // Debug logging
    console.log("🔍 [CategoryDetail] Filtering subcategories:", {
      categoryId: id,
      subcategoriesLength: safeSubcategories.length,
      subcategoriesSample: safeSubcategories[0],
      filteredLength: filtered.length,
      filteredSample: filtered[0],
    });

    return filtered;
  }, [safeSubcategories, categoryId]);

  // Convert subcategory IDs to category names for filtering
  const subcategoryNames = useMemo(() => {
    return selectedSubcategories.length > 0
      ? categorySubcategories
          .filter((sub) => selectedSubcategories.includes(sub.id))
          .map((sub) => sub.label)
      : categorySubcategories.map((sub) => sub.label);
  }, [selectedSubcategories, categorySubcategories]);

  // Build interest IDs for filtering - EXACT same pattern as home page
  const activeInterestIds = useMemo(() => {
    // Use category ID if available (same pattern as home page uses selectedInterestIds)
    if (!categoryId) return undefined;
    return [categoryId];
  }, [categoryId]);

  // Build sub-interest IDs for API filtering (same pattern as activeInterestIds)
  const activeSubInterestIds = useMemo(() => {
    if (selectedSubcategories.length > 0) {
      return selectedSubcategories;
    }
    return undefined;
  }, [selectedSubcategories]);

  // ✅ Determine if we should skip fetching (only skip if categoryId is missing)
  // Don't skip based on loading - that causes double fetches
  const shouldSkip = !categoryId;

  // Fetch businesses filtered by this category
  // EXACT same approach as home page: pass interestIds to API, let API handle filtering
  // Also pass subInterestIds for server-side filtering by sub_interest_id
  const { businesses, loading, error, refetch } = useBusinesses({
    limit: 100,
    sortBy: "created_at",
    sortOrder: "desc",
    feedStrategy: "standard", // No personalization
    interestIds: activeInterestIds, // API will filter by interest_id (same as home page)
    subInterestIds: activeSubInterestIds, // API will filter by sub_interest_id
    skip: shouldSkip, // ✅ Only skip if categoryId is missing
  });

  // Visibility-based refresh - refetch when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && refetch) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  // Client-side filter by subcategory (defensive fallback if API filtering doesn't match)
  // This handles ID mismatches (UUID vs slug) and provides fallback filtering
  const filteredBusinesses = useMemo(() => {
    const list = Array.isArray(businesses) ? businesses : [];

    // If no subcategories selected, return all businesses (already filtered by API by interest_id)
    if (selectedSubcategories.length === 0) {
      return list;
    }

    // Defensive filtering: handle both UUID and slug formats
    const set = new Set(selectedSubcategories.map(String));

    return list.filter((b) => {
      // Try multiple field names and formats for sub_interest_id
      const businessSubInterestId = String(
        (b as any).subInterestId ?? (b as any).sub_interest_id ?? ""
      ).trim();

      // STRICT filtering: Only include businesses whose sub_interest_id matches
      // one of the selected subcategories. No fallback to show all category businesses.
      // This ensures users see only businesses matching their selected filter types.
      return businessSubInterestId && set.has(businessSubInterestId);
    });
  }, [businesses, selectedSubcategories, categoryId]);

  // Comprehensive debug logging for API requests and responses
  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 [CategoryDetail] API Request/Response Debug");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📤 [REQUEST] What we're sending to API:", {
      categoryId: String(categoryId ?? "").trim(),
      activeInterestIds,
      activeSubInterestIds,
      selectedSubcategories,
      loading,
    });
    console.log("📥 [RESPONSE] What API returned:", {
      businessesCount: businesses.length,
      filteredBusinessesCount: filteredBusinesses.length,
      error,
      loading,
    });

    // ✅ Critical: Log if businesses table might not have interest_id populated
    if (
      activeInterestIds &&
      activeInterestIds.length > 0 &&
      businesses.length === 0 &&
      !loading &&
      !error
    ) {
      console.warn(
        "⚠️ [CategoryDetail] WARNING: No businesses returned for interest_ids:",
        activeInterestIds
      );
      console.warn("⚠️ This could mean:");
      console.warn("   1. Businesses table doesn't have interest_id =", activeInterestIds[0]);
      console.warn("   2. All businesses with this interest_id have status != 'active'");
      console.warn("   3. RLS policies are blocking the results");
      console.warn(
        "   → Run this SQL to check: SELECT COUNT(*) FROM businesses WHERE interest_id =",
        activeInterestIds[0]
      );
    }

    if (businesses.length > 0) {
      console.log(
        "📊 [SAMPLE BUSINESSES] First 3 businesses from API:",
        businesses.slice(0, 3).map((b) => ({
          id: b.id,
          name: b.name,
          interestId: b.interestId,
          subInterestId: b.subInterestId,
          category: b.category,
          // Check all possible field names
          sub_interest_id: (b as any).sub_interest_id,
          interest_id: (b as any).interest_id,
        }))
      );
    }

    if (categorySubcategories.length > 0) {
      console.log(
        "📋 [SUBCATEGORIES] Available subcategories:",
        categorySubcategories.map((sub) => ({
          id: sub.id,
          label: sub.label,
          interest_id: sub.interest_id,
        }))
      );
    }

    // Critical: Check ID format mismatch
    if (categorySubcategories.length > 0 && businesses.length > 0) {
      const subId = categorySubcategories[0].id;
      const businessSubId = businesses[0].subInterestId || (businesses[0] as any).sub_interest_id;
      console.log("⚠️ [ID FORMAT CHECK] Potential mismatch:", {
        subcategoryId: subId,
        subcategoryIdType: typeof subId,
        businessSubInterestId: businessSubId,
        businessSubInterestIdType: typeof businessSubId,
        match: String(subId) === String(businessSubId),
        selectedSubcategories,
      });
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }, [
    loading,
    businesses,
    filteredBusinesses,
    categoryId,
    activeInterestIds,
    activeSubInterestIds,
    category,
    safeSubcategories,
    categorySubcategories,
    selectedSubcategories,
    error,
  ]);

  const handleSubcategoryToggle = (subcategoryId: string) => {
    // ✅ User explicitly toggled subcategory filter
    setSelectedSubcategories((prev) => {
      const newIds = prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId];

      // Immediately trigger refetch when subcategory changes (same pattern as home page)
      setTimeout(() => {
        refetch();
      }, 0);

      return newIds;
    });
  };

  if (!category && interests.length > 0) {
    return (
      <div className="min-h-dvh bg-off-white">
        <main className="">
          <div className="mx-auto w-full max-w-[2000px] px-4 sm:px-6 text-center py-20">
            <H1 className="text-h2 font-semibold text-charcoal mb-4">Category not found</H1>
            <Link
              href="/home"
              className="font-urbanist text-sage hover:text-sage/80 font-semibold transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-off-white relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)] pointer-events-none" />

      <main className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-off-white to-coral/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(157,171,155,0.15)_0%,_transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(114,47,55,0.08)_0%,_transparent_50%)] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-[2000px] px-2 sm:px-4">
          {/* Breadcrumb */}
          <nav className="pb-1" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm sm:text-base">
              <li>
                <Link
                  href="/explore"
                  className="font-urbanist text-charcoal/70 hover:text-charcoal transition-colors duration-200 font-medium"
                >
                  Explore
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 text-charcoal/60" />
              </li>
              <li>
                <span className="font-urbanist text-charcoal font-semibold">
                  {category?.name || "Category"}
                </span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4 relative">
              <Link
                href="/home"
                className="absolute left-0 w-10 h-10 rounded-full bg-card-bg hover:bg-card-bg/90 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </Link>
              <div className="text-center">
                <H1
                  className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.2] tracking-tight text-charcoal"
                  style={{ fontWeight: 800 }}
                >
                  {category?.name || "Category"}
                </H1>
                {category?.description && <Muted className="mt-2">{category.description}</Muted>}
              </div>
            </div>

            {/* Subcategory filters */}
            {categorySubcategories.length > 0 && (
              <div className="mt-6">
                <P className="text-body-sm font-semibold text-charcoal mb-3">Filter by type:</P>
                <div className="flex flex-wrap gap-2">
                  {categorySubcategories.map((sub) => {
                    const isSelected = selectedSubcategories.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategoryToggle(sub.id)}
                        className={`px-4 py-2 rounded-full font-urbanist font-600 text-body-sm transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "bg-coral text-white shadow-lg"
                            : "bg-card-bg/10 text-charcoal/70 hover:bg-card-bg/20 hover:text-sage border border-sage/30"
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Businesses Grid */}
          {loading && (
            <div className="py-8">
              <BusinessGridSkeleton />
            </div>
          )}

          {!loading && error && (
            <div className="bg-white border border-sage/20 rounded-3xl shadow-sm px-6 py-10 text-center space-y-4">
              <P className="text-charcoal font-semibold text-h2">
                We couldn't load businesses right now.
              </P>
              <Muted className="max-w-[70ch]" style={{ fontWeight: 500 }}>
                {error}
              </Muted>
              <button
                onClick={refetch}
                className="font-urbanist inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-card-bg text-white hover:bg-card-bg/90 transition-colors text-body font-semibold"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !loading && !error && (
            <>
              {filteredBusinesses.length === 0 ? (
                <div className="bg-white border border-sage/20 rounded-3xl shadow-sm px-6 py-16 text-center space-y-3">
                  <H2 className="text-h2 font-semibold text-charcoal">
                    {hasSubcategoryFilter
                      ? "No businesses match your filters"
                      : "No businesses yet"}
                  </H2>
                  <Muted className="max-w-[70ch] mx-auto" style={{ fontWeight: 500 }}>
                    {hasSubcategoryFilter
                      ? "Try adjusting your subcategory filters or check back soon as new businesses join this category."
                      : "Check back soon as new businesses join this category."}
                  </Muted>
                  {hasSubcategoryFilter && (
                    <button
                      onClick={() => setSelectedSubcategories([])}
                      className="font-urbanist mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-card-bg text-white hover:bg-card-bg/90 transition-colors text-body font-semibold"
                    >
                      Clear subcategory filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="font-urbanist mb-4 text-body-sm text-charcoal/60">
                    {filteredBusinesses.length}{" "}
                    {filteredBusinesses.length === 1 ? "place" : "places"} found
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-3">
                    {filteredBusinesses.map((business) => (
                      <div key={business.id} className="list-none">
                        <BusinessCard business={business} compact inGrid={true} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CategoryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center bg-off-white">
          <Loader size="lg" variant="wavy" color="sage" />
        </div>
      }
    >
      <CategoryDetailContent />
    </Suspense>
  );
}
