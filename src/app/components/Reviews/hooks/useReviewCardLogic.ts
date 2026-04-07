"use client";

import { useEffect, useState } from "react";
import type { ReviewWithUser } from "../../../lib/types/database";
import type { AuthUser } from "../../../lib/types/database";

export function useReviewOwnerCheck(review: ReviewWithUser, user: AuthUser | null): boolean {
  if (!user) return false;
  if (user.id === review.user_id) return true;
  if (user.id === review.user?.id) return true;
  if (user.email && review.user?.email && user.email === review.user.email) return true;

  const userIdentifier =
    user.email && user.profile?.display_name ? `${user.email}:${user.profile.display_name}` : null;
  const reviewIdentifier =
    review.user?.email && review.user?.display_name
      ? `${review.user.email}:${review.user.display_name}`
      : null;
  if (userIdentifier && reviewIdentifier && userIdentifier === reviewIdentifier) return true;

  return false;
}

export function useReviewFlagStatus(
  reviewId: string,
  shouldCheck: boolean
): { isFlagged: boolean; isChecking: boolean } {
  const [isFlagged, setIsFlagged] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!shouldCheck) {
      setIsFlagged(false);
      setIsChecking(false);
      return;
    }

    const checkFlagStatus = async () => {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/reviews/${reviewId}/flag`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setIsFlagged(Boolean(data?.flagged));
        }
      } catch (error) {
        console.error("Error checking review flag status:", error);
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    void checkFlagStatus();

    return () => {
      cancelled = true;
    };
  }, [reviewId, shouldCheck]);

  return { isFlagged, isChecking };
}
