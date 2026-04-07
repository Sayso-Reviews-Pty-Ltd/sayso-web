"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useSavedItems } from "@/app/contexts/SavedItemsContext";
import { useBusinessDistanceLocation } from "@/app/hooks/useBusinessDistanceLocation";
import { useReviewSubmission } from "@/app/hooks/useReviews";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { useUserStats } from "@/app/hooks/useUserStats";
import { useUserReviews } from "@/app/hooks/useUserReviews";
import { useUserBadges } from "@/app/hooks/useUserBadges";
import { useSavedBusinessesPreview } from "@/app/hooks/useSavedBusinessesDetails";
import { getBrowserSupabase } from "@/app/lib/supabase/client";
import { useProfileSave } from "./useProfileSave";
import type { UserProfile } from "../profile.types";

function formatMemberSince(d: string) {
  const date = new Date(d);
  const year = date.getFullYear().toString().slice(-2);
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} '${year}`;
}

export function useProfilePage() {
  const { user, updateUser, isLoading, logout } = useAuth();
  const { savedItems } = useSavedItems();
  const { deleteReview } = useReviewSubmission();
  const router = useRouter();
  const { status: locationStatus, requestLocation } = useBusinessDistanceLocation();
  const supabase = getBrowserSupabase();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const {
    profile: enhancedProfile,
    loading: profileLoading,
    mutate: profileMutate,
  } = useUserProfile();
  const { stats: userStats, loading: statsLoading } = useUserStats();
  const { reviews: userReviews, loading: reviewsLoading, mutate: reviewsMutate } = useUserReviews();
  const { achievements, loading: achievementsLoading, mutate: badgesMutate } = useUserBadges();
  const { businesses: savedBusinesses } = useSavedBusinessesPreview();

  const profile = useMemo((): UserProfile => {
    const rawProfile: any = user?.profile || {};
    const enhanced: any = enhancedProfile || {};
    return {
      user_id: user?.id || "",
      username: (enhanced.username ??
        rawProfile.username ??
        (user?.email ? user.email.split("@")[0] : "user")) as string | null,
      display_name: (enhanced.display_name ?? rawProfile.display_name ?? null) as string | null,
      avatar_url: (enhanced.avatar_url ?? rawProfile.avatar_url ?? null) as string | null,
      locale: (rawProfile.locale || "en") as string,
      onboarding_step: (rawProfile.onboarding_step || "interests") as string,
      is_top_reviewer: rawProfile.is_top_reviewer ?? false,
      reviews_count: rawProfile.reviews_count ?? 0,
      badges_count: rawProfile.badges_count ?? 0,
      interests_count: rawProfile.interests_count ?? 0,
      last_interests_updated: (rawProfile.last_interests_updated ?? null) as string | null,
      created_at: (enhanced.created_at ??
        rawProfile.created_at ??
        user?.created_at ??
        new Date().toISOString()) as string,
      updated_at: (enhanced.updated_at ??
        rawProfile.updated_at ??
        new Date().toISOString()) as string,
      bio: enhanced.bio as string | undefined,
      location: enhanced.location as string | undefined,
      website_url: enhanced.website_url as string | undefined,
      social_links: (enhanced.social_links || {}) as Record<string, string> | undefined,
      privacy_settings: enhanced.privacy_settings as
        | { showActivity?: boolean; showStats?: boolean; showSavedBusinesses?: boolean }
        | undefined,
      last_active_at: enhanced.last_active_at as string | undefined,
    };
  }, [user?.profile, enhancedProfile, user?.email, user?.created_at, user?.id]);

  const saveHook = useProfileSave({
    user,
    supabase,
    profile,
    profileMutate,
    updateUser,
    onSaveSuccess: () => setIsEditOpen(false),
  });

  useEffect(() => {
    if (isEditOpen) saveHook.setError(null);
  }, [isEditOpen]);

  useEffect(() => {
    if (!user?.id) return;
    const THROTTLE_MS = 3000;
    let lastRefresh = 0;

    const badgesChannel = supabase
      .channel(`profile-badges-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_badges",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          const now = Date.now();
          if (now - lastRefresh < THROTTLE_MS) return;
          lastRefresh = now;
          badgesMutate();
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    const reviewsChannel = supabase
      .channel(`profile-reviews-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews", filter: `user_id=eq.${user.id}` },
        () => {
          reviewsMutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(badgesChannel);
      supabase.removeChannel(reviewsChannel);
      setIsRealtimeConnected(false);
    };
  }, [user?.id, supabase, badgesMutate, reviewsMutate]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const handleDeactivate = () => {
    setIsDeactivateDialogOpen(true);
  };

  const confirmDeactivateAccount = async () => {
    setIsDeactivating(true);
    setDeactivateError(null);
    try {
      const response = await fetch("/api/user/deactivate-account", {
        method: "POST",
        cache: "no-store",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to deactivate account");
      }
      setIsDeactivateDialogOpen(false);
      window.location.href = "/login?message=Account deactivated. Log in to reactivate.";
    } catch (error: any) {
      console.error("Error deactivating account:", error);
      setIsDeactivating(false);
      setDeactivateError(`Failed to deactivate account: ${error.message}`);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountDialogOpen(true);
  };

  const confirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        cache: "no-store",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }
      setIsDeleteAccountDialogOpen(false);
      window.location.href = "/onboarding";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setIsDeletingAccount(false);
      setDeleteAccountError(`Failed to delete account: ${error.message}`);
    }
  };

  const handleEditReview = (reviewId: string, businessSlug: string) => {
    router.push(`/business/${businessSlug}/review?edit=${reviewId}`);
  };

  const handleDeleteReviewClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const success = await deleteReview(reviewToDelete);
      if (success) {
        reviewsMutate((prev) => (prev ?? []).filter((r) => r.id !== reviewToDelete), {
          revalidate: true,
        });
        badgesMutate();
        setIsDeleteDialogOpen(false);
        setReviewToDelete(null);
      } else {
        setDeleteError("Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      setDeleteError("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayLabel =
    profile.display_name?.trim() ||
    profile.username ||
    user?.email?.split("@")[0] ||
    "Your Profile";
  const rawProfileLocation = enhancedProfile?.location || profile.location || "";
  const profileLocation = (() => {
    const n = rawProfileLocation.trim();
    if (!n) return "Location not set";
    if (/^[a-z]{2}(?:-[A-Z]{2})?$/.test(n)) return "Location not set";
    return n;
  })();

  const reviewsCount =
    userReviews.length > 0
      ? userReviews.length
      : (userStats?.totalReviewsWritten ?? profile.reviews_count ?? 0);
  const badgesCount = achievements.length;
  const interestsCount = profile.interests_count ?? 0;
  const helpfulVotesCount = userStats?.helpfulVotesReceived ?? 0;
  const savedBusinessesCount =
    savedItems.length > 0 ? savedItems.length : (userStats?.totalBusinessesSaved ?? 0);
  const totalSavedCount = savedBusinessesCount;
  const memberSinceLabel = userStats?.accountCreationDate
    ? formatMemberSince(userStats.accountCreationDate)
    : profile.created_at
      ? formatMemberSince(profile.created_at)
      : "—";

  const reviewsData = userReviews.map((review) => {
    const businessSlug = (review as any).business_slug || review.id;
    return {
      businessName: review.business_name,
      businessImageUrl: review.business_image_url,
      rating: review.rating,
      reviewText: review.review_text,
      isFeatured: review.is_featured,
      createdAt: review.created_at,
      onViewClick: () => {
        if (businessSlug) window.location.href = `/business/${businessSlug}`;
      },
      onEdit: () => handleEditReview(review.id, businessSlug),
      onDelete: () => handleDeleteReviewClick(review.id),
    };
  });

  return {
    user,
    isLoading,
    profile,
    enhancedProfile,
    profileLoading,
    statsLoading,
    achievementsLoading,
    reviewsLoading,
    userStats,
    achievements,
    savedBusinesses,
    userReviews,
    reviewsData,
    displayLabel,
    profileLocation,
    memberSinceLabel,
    reviewsCount,
    badgesCount,
    interestsCount,
    helpfulVotesCount,
    savedBusinessesCount,
    totalSavedCount,
    avatarKey: saveHook.avatarKey,
    imgError,
    setImgError,
    isRealtimeConnected,
    locationStatus,
    requestLocation,
    isEditOpen,
    setIsEditOpen,
    saving: saveHook.saving,
    error: saveHook.error,
    handleSaveProfile: saveHook.handleSaveProfile,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    reviewToDelete,
    setReviewToDelete,
    isDeleting,
    deleteError,
    setDeleteError,
    handleConfirmDeleteReview,
    isDeleteAccountDialogOpen,
    setIsDeleteAccountDialogOpen,
    isDeletingAccount,
    deleteAccountError,
    setDeleteAccountError,
    confirmDeleteAccount,
    handleLogout,
    handleDeleteAccount,
  };
}
