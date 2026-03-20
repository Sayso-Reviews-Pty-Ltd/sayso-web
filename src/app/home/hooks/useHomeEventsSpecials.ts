import { useEffect, useState } from "react";
import useSWR from "swr";
import { swrConfig } from "../../lib/swrConfig";
import type { Event } from "../../lib/types/Event";

export function useHomeEventsSpecials() {
  // Defer below-fold Events fetch to prioritize above-fold content (For You, Trending)
  const [eventsReady, setEventsReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setEventsReady(true), 200);
    return () => clearTimeout(id);
  }, []);

  const { data: eventsData, isLoading: eventsAndSpecialsLoading } = useSWR(
    eventsReady ? "/api/events-and-specials?limit=12&excludeSoldOut=true" : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.items) ? (data.items as Event[]) : [];
    },
    { ...swrConfig, dedupingInterval: 60_000, revalidateOnFocus: false }
  );
  const eventsAndSpecials = eventsData ?? [];

  return { eventsAndSpecials, eventsAndSpecialsLoading };
}
