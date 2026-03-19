/**
 * Hook to fetch and manage user's interests, subcategories, and deal-breakers
 */

import useSWR, { mutate as globalMutate } from 'swr';
import { useAuth } from '../contexts/AuthContext';
import { swrConfig } from '../lib/swrConfig';
import { swrKeys } from '../lib/swrKeys';
import { authenticatedFetch } from '../lib/api/authenticatedFetch';

export interface UserPreference {
  id: string;
  name: string;
}

export interface UserPreferences {
  interests: UserPreference[];
  subcategories: UserPreference[];
  dealbreakers: UserPreference[];
}

export interface UseUserPreferencesResult extends UserPreferences {
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseUserPreferencesOptions {
  initialData?: UserPreferences;
  skipInitialFetch?: boolean;
}

const EMPTY_PREFS: UserPreferences = { interests: [], subcategories: [], dealbreakers: [] };

async function fetchPreferences([, _userId]: [string, string]): Promise<UserPreferences> {
  const response = await authenticatedFetch('/api/user/preferences', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) return EMPTY_PREFS;
  const data = await response.json();
  return {
    interests: data.interests || [],
    subcategories: data.subcategories || [],
    dealbreakers: data.dealbreakers || [],
  };
}

/**
 * Invalidate the SWR cache for a user's preferences.
 * Call this after saving preferences in onboarding/settings to re-personalize For You.
 */
export function invalidateUserPreferences(userId: string) {
  globalMutate(swrKeys.userPreferences(userId));
}

/**
 * Hook to fetch user's preferences (interests, subcategories, dealbreakers)
 */
export function useUserPreferences(options: UseUserPreferencesOptions = {}): UseUserPreferencesResult {
  const { user, isLoading: authLoading } = useAuth();

  // Don't fetch until auth has resolved
  const swrKey = (!authLoading && user?.id) ? swrKeys.userPreferences(user.id) : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetchPreferences, {
    ...swrConfig,
    dedupingInterval: 60_000,
    // Seed from initialData if provided (avoids a cold-start fetch)
    fallbackData: options.initialData,
  });

  return {
    interests: data?.interests ?? [],
    subcategories: data?.subcategories ?? [],
    dealbreakers: data?.dealbreakers ?? [],
    // Show loading while auth is still resolving or SWR is fetching
    loading: authLoading || isLoading,
    error: error ? (error as Error).message : null,
    refetch: () => mutate(),
  };
}

/**
 * Hook to get user's interest IDs (useful for filtering)
 */
export function useUserInterestIds(): string[] {
  const { interests, subcategories } = useUserPreferences();
  return interests.map(i => i.id).concat(subcategories.map(s => s.id));
}
