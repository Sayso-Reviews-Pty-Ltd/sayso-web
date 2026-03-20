"use client";

import { useEffect, useRef } from "react";
import { getBrowserSupabase } from "../../lib/supabase/client";

interface UseHomeRealtimeFeedSyncParams {
  hasUser: boolean;
  refetchTrending: () => void;
  refetchForYou: () => void;
}

export function useHomeRealtimeFeedSync({
  hasUser,
  refetchTrending,
  refetchForYou,
}: UseHomeRealtimeFeedSyncParams) {
  const supabaseHomeRef = useRef(getBrowserSupabase());
  const refetchFeedsRef = useRef<() => void>(() => {});

  refetchFeedsRef.current = () => {
    refetchTrending();
    if (hasUser) refetchForYou();
  };

  useEffect(() => {
    const supabase = supabaseHomeRef.current;
    const channel = supabase
      .channel("home-reviews-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, () => {
        refetchFeedsRef.current();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
