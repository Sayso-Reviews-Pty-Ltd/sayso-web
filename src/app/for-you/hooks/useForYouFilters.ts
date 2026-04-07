"use client";

import { useState, useCallback } from "react";
import { FilterState } from "../../components/FilterModal/FilterModal";

export function useForYouFilters() {
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [hasUserInitiatedFilters, setHasUserInitiatedFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ minRating: null, distance: null });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleClearFilters = useCallback((refetch: () => void) => {
    setHasUserInitiatedFilters(false);
    setSelectedInterestIds([]);
    setFilters({ minRating: null, distance: null });
    setUserLocation(null);
    refetch();
  }, []);

  const handleInlineDistanceChange = useCallback(
    (distance: string, refetch: () => void) => {
      const newFilters = { ...filters, distance };
      setFilters(newFilters);
      setHasUserInitiatedFilters(true);

      if (!userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn("Error getting user location:", error);
            }
          );
        }
      }

      refetch();
    },
    [filters, userLocation]
  );

  const handleInlineRatingChange = useCallback(
    (rating: number, refetch: () => void) => {
      const newFilters = { ...filters, minRating: rating };
      setFilters(newFilters);
      setHasUserInitiatedFilters(true);
      refetch();
    },
    [filters]
  );

  const handleUpdateFilter = useCallback(
    (filterType: "minRating" | "distance", value: number | string | null, refetch: () => void) => {
      const newFilters = { ...filters, [filterType]: value };
      setFilters(newFilters);
      setHasUserInitiatedFilters(true);

      if (filterType === "distance" && value && !userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn("Error getting user location:", error);
            }
          );
        }
      }

      refetch();
    },
    [filters, userLocation]
  );

  const handleToggleInterest = useCallback((interestId: string, refetch: () => void) => {
    setHasUserInitiatedFilters(true);

    setSelectedInterestIds((prev) => {
      const newIds = prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId];

      setTimeout(() => {
        refetch();
      }, 0);

      return newIds;
    });
  }, []);

  return {
    selectedInterestIds,
    hasUserInitiatedFilters,
    filters,
    userLocation,
    handleClearFilters,
    handleInlineDistanceChange,
    handleInlineRatingChange,
    handleUpdateFilter,
    handleToggleInterest,
    setFilters,
  };
}
