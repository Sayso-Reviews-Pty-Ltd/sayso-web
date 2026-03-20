"use client";

import { useMemo } from 'react';
import type { Business } from '../../components/BusinessCard/BusinessCard';
import type { BusinessMapItem } from '../../components/maps/BusinessesMap';
import { sortBusinessesByPriority } from '../../utils/businessPrioritization';
import { getCategoryLabelFromBusiness } from '../../utils/subcategoryPlaceholders';

export function useForYouMapData(
  activeBusinesses: Business[],
  coordinateFallbackBusinesses: Business[]
) {
  const primaryMapBusinesses = useMemo((): BusinessMapItem[] => {
    return activeBusinesses
      .map((b) => {
        const lat = (b as any).lat ?? (b as any).latitude ?? null;
        const lng = (b as any).lng ?? (b as any).longitude ?? null;
        return { b, lat, lng };
      })
      .filter(({ lat, lng }) => lat != null && lng != null)
      .map(({ b, lat, lng }) => ({
        id: b.id,
        name: b.name,
        lat: lat as number,
        lng: lng as number,
        category: getCategoryLabelFromBusiness(b),
        image_url: b.image_url,
        slug: b.slug,
      }));
  }, [activeBusinesses]);

  const coordinateFallbackMapBusinesses = useMemo((): BusinessMapItem[] => {
    return sortBusinessesByPriority(coordinateFallbackBusinesses)
      .map((b) => {
        const lat = (b as any).lat ?? (b as any).latitude ?? null;
        const lng = (b as any).lng ?? (b as any).longitude ?? null;
        return { b, lat, lng };
      })
      .filter(({ lat, lng }) => lat != null && lng != null)
      .map(({ b, lat, lng }) => ({
        id: b.id,
        name: b.name,
        lat: lat as number,
        lng: lng as number,
        category: getCategoryLabelFromBusiness(b),
        image_url: b.image_url,
        slug: b.slug,
      }));
  }, [coordinateFallbackBusinesses]);

  const mapBusinesses = useMemo(() => {
    if (primaryMapBusinesses.length > 0) return primaryMapBusinesses;
    return coordinateFallbackMapBusinesses;
  }, [primaryMapBusinesses, coordinateFallbackMapBusinesses]);

  const usingCoordinateFallback = primaryMapBusinesses.length === 0 && mapBusinesses.length > 0;

  return {
    primaryMapBusinesses,
    coordinateFallbackMapBusinesses,
    mapBusinesses,
    usingCoordinateFallback,
  };
}
