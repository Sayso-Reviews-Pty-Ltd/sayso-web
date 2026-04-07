export type NullableSWRKey<T> = T | null;

export interface ForYouKeyInput {
  limit: number;
  interestIds?: string[];
  subInterestIds?: string[];
  dealbreakerIds?: string[];
  preferredPriceRanges?: string[];
  latitude?: number | null;
  longitude?: number | null;
  requireCoordinates?: boolean;
}

export interface ForYouRequestContract {
  limit: number;
  interestIds: string[];
  subInterestIds: string[];
  dealbreakerIds: string[];
  preferredPriceRanges: string[];
  latitude: number | null;
  longitude: number | null;
  requireCoordinates: boolean;
}

function normalizeIds(values?: string[] | null): string[] {
  if (!values || values.length === 0) return [];
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => `"${key}":${stableStringify(val)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function buildForYouRequestContract(input: ForYouKeyInput): ForYouRequestContract {
  return {
    limit: input.limit,
    interestIds: normalizeIds(input.interestIds),
    subInterestIds: normalizeIds(input.subInterestIds),
    dealbreakerIds: normalizeIds(input.dealbreakerIds),
    preferredPriceRanges: normalizeIds(input.preferredPriceRanges),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    requireCoordinates: Boolean(input.requireCoordinates),
  };
}

export function buildForYouQueryParams(contract: ForYouRequestContract): URLSearchParams {
  const params = new URLSearchParams();
  params.set("limit", String(contract.limit));
  params.set("feed_strategy", "mixed");
  if (contract.interestIds.length > 0) params.set("interest_ids", contract.interestIds.join(","));
  if (contract.subInterestIds.length > 0)
    params.set("sub_interest_ids", contract.subInterestIds.join(","));
  if (contract.dealbreakerIds.length > 0)
    params.set("dealbreakers", contract.dealbreakerIds.join(","));
  if (contract.preferredPriceRanges.length > 0) {
    params.set("preferred_price_ranges", contract.preferredPriceRanges.join(","));
  }
  if (contract.requireCoordinates) params.set("require_coordinates", "true");
  if (contract.latitude !== null && contract.longitude !== null) {
    params.set("lat", String(contract.latitude));
    params.set("lng", String(contract.longitude));
  }
  return params;
}

export const swrKeys = {
  userPreferences(userId: string | null | undefined): NullableSWRKey<readonly [string, string]> {
    return userId ? (["/api/user/preferences", userId] as const) : null;
  },
  businessDetail(businessId: string | null | undefined): NullableSWRKey<readonly [string, string]> {
    return businessId ? (["/api/businesses/detail", businessId] as const) : null;
  },
  eventDetail(eventId: string | null | undefined): NullableSWRKey<readonly [string, string]> {
    return eventId ? (["/api/events-and-specials", eventId] as const) : null;
  },
  forYou(input: ForYouKeyInput): readonly [string, string] {
    const contract = buildForYouRequestContract(input);
    return ["for-you", stableStringify(contract)] as const;
  },
};
