/**
 * Hook to fetch a single business by ID or slug from the API.
 * Uses SWR for caching, deduplication, and optimistic invalidation.
 */

"use client";

import { useEffect } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { swrConfig } from "../lib/swrConfig";
import { businessUpdateEvents } from "../lib/utils/businessUpdateEvents";
import { authenticatedFetch } from "../lib/api/authenticatedFetch";
import { swrKeys } from "../lib/swrKeys";

async function fetchBusiness([, businessId]: [string, string]): Promise<any> {
  const response = await authenticatedFetch(`/api/businesses/${businessId}`);

  if (!response.ok) {
    const err: any = new Error(`Failed to fetch business: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

interface UseBusinessDetailOptions {
  fallbackBusiness?: any | null;
}

export function useBusinessDetail(
  businessId: string | null | undefined,
  options: UseBusinessDetailOptions = {}
) {
  const swrKey = swrKeys.businessDetail(businessId);

  const AUTH_DEDUP_INTERVAL_MS = 30_000;
  const VISIBILITY_REFETCH_DEBOUNCE_MS = 1_000;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchBusiness, {
    ...swrConfig,
    dedupingInterval: AUTH_DEDUP_INTERVAL_MS,
    fallbackData: options.fallbackBusiness ?? undefined,
  });

  // Visibility-based refetch — debounced to prevent request spam on rapid tab switching
  useEffect(() => {
    if (!swrKey) return;
    let visibilityTimer: ReturnType<typeof setTimeout> | null = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (visibilityTimer) clearTimeout(visibilityTimer);
        visibilityTimer = setTimeout(() => mutate(), VISIBILITY_REFETCH_DEBOUNCE_MS);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      if (visibilityTimer) clearTimeout(visibilityTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [swrKey, mutate]);

  // Invalidate on businessUpdateEvents
  useEffect(() => {
    if (!businessId) return;
    const unsubUpdate = businessUpdateEvents.onUpdate((updatedId) => {
      if (updatedId === businessId) mutate();
    });
    const unsubDelete = businessUpdateEvents.onDelete((deletedId) => {
      if (deletedId === businessId) {
        mutate(undefined, { revalidate: false });
      }
    });
    return () => {
      unsubUpdate();
      unsubDelete();
    };
  }, [businessId, mutate]);

  const err = error as (Error & { status?: number }) | undefined;

  return {
    business: data ?? null,
    loading: isLoading,
    error: err ? err.message : null,
    errorStatus: err?.status ?? null,
    refetch: () => mutate(),
    mutate,
  };
}

/**
 * Globally invalidate a business's cached data.
 */
export function invalidateBusinessDetail(businessId: string) {
  globalMutate(swrKeys.businessDetail(businessId));
}
