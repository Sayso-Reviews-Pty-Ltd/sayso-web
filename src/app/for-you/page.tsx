import { cookies, headers } from "next/headers";
import ForYouClient from "./ForYouClient";
import type { Business } from "../components/BusinessCard/BusinessCard";
import type { UserPreferences } from "../hooks/useUserPreferences";
import { buildForYouQueryParams, buildForYouRequestContract } from "../lib/swrKeys";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const EMPTY_PREFERENCES: UserPreferences = {
  interests: [],
  subcategories: [],
  dealbreakers: [],
};

type BusinessesFetchResult = {
  businesses: Business[];
  error: string | null;
};
type PreferencesFetchResult = {
  preferences: UserPreferences;
  ok: boolean;
};

async function fetchJsonWithTimeout<T>(
  url: string,
  options: { cookieHeader: string; timeoutMs: number }
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number; error: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, options.timeoutMs));

  try {
    const response = await fetch(url, {
      headers: options.cookieHeader ? { cookie: options.cookieHeader } : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, status: response.status, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as T;
    return { ok: true, status: response.status, data };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? `Timeout after ${options.timeoutMs}ms`
          : error.message
        : "Fetch failed";
    return { ok: false, status: 0, error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function getBaseUrl() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (host) {
    const protocol = headerList.get("x-forwarded-proto") ?? "http";
    return `${protocol}://${host}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

async function buildCookieHeader() {
  const cookieStore = await cookies();
  const cookiePairs = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`);
  return cookiePairs.join("; ");
}

async function fetchPreferences(baseUrl: string, cookieHeader: string): Promise<PreferencesFetchResult> {
  try {
    const res = await fetchJsonWithTimeout<{
      interests?: Array<{ id: string; name: string }>;
      subcategories?: Array<{ id: string; name: string }>;
      dealbreakers?: Array<{ id: string; name: string }>;
    }>(`${baseUrl}/api/user/preferences`, {
      cookieHeader,
      // If this times out, we can still render and let /api/businesses resolve prefs server-side.
      timeoutMs: 5000,
    });

    if (!res.ok) {
      return { preferences: EMPTY_PREFERENCES, ok: false };
    }

    const data = res.data;
    return {
      preferences: {
        interests: data?.interests ?? [],
        subcategories: data?.subcategories ?? [],
        dealbreakers: data?.dealbreakers ?? [],
      },
      ok: true,
    };
  } catch {
    return { preferences: EMPTY_PREFERENCES, ok: false };
  }
}

// If this page ever fetches multiple APIs in parallel (e.g. featured + trending),
// use Promise.allSettled() so one timeout doesn't make all sections empty.
export default async function ForYouPage() {
  const baseUrl = await getBaseUrl();
  const cookieHeader = await buildCookieHeader();

  const preferencesResult = await fetchPreferences(baseUrl, cookieHeader);
  const hasAnyPreferences =
    preferencesResult.preferences.interests.length > 0 ||
    preferencesResult.preferences.subcategories.length > 0 ||
    preferencesResult.preferences.dealbreakers.length > 0;

  const contract = buildForYouRequestContract({
    limit: 120,
    interestIds: preferencesResult.preferences?.interests?.map((i) => i.id).filter(Boolean) ?? [],
    subInterestIds: preferencesResult.preferences?.subcategories?.map((s) => s.id).filter(Boolean) ?? [],
    dealbreakerIds: preferencesResult.preferences?.dealbreakers?.map((d) => d.id).filter(Boolean) ?? [],
    preferredPriceRanges:
      (preferencesResult.preferences?.dealbreakers?.map((d) => d.id).includes("value-for-money") ?? false)
        ? ["$", "$$"]
        : [],
  });
  const params = buildForYouQueryParams(contract);

  const businessesResult = await (async (): Promise<BusinessesFetchResult> => {
    if (preferencesResult.ok && !hasAnyPreferences) {
      return { businesses: [], error: null };
    }

    try {
      const res = await fetchJsonWithTimeout<{
        businesses?: Business[];
        data?: Business[];
      }>(`${baseUrl}/api/businesses?${params.toString()}`, {
        cookieHeader,
        // Stabilize SSR: 8s+ renders are common; short timeouts caused empty sections (TimeoutError).
        timeoutMs: 18000,
      });

      if (!res.ok) {
        return { businesses: [], error: `Failed to load businesses (${res.status || "fetch"})` };
      }

      const data = res.data;
      const businesses = data?.businesses ?? data?.data ?? [];
      return { businesses, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load businesses";
      return { businesses: [], error: message };
    }
  })();

  return (
    <ForYouClient
      initialBusinesses={businessesResult.businesses}
      initialPreferences={preferencesResult.preferences}
      initialPreferencesLoaded={preferencesResult.ok}
      initialOnboardingEmpty={preferencesResult.ok && !hasAnyPreferences}
      initialError={businessesResult.error}
    />
  );
}
