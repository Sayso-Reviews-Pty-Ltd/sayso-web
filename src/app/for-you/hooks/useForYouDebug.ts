"use client";

import { useEffect, useRef } from 'react';

export function useForYouDebug(
  showDebugInfo: boolean,
  totalCount: number,
  loading: boolean,
  prefsLoading: boolean,
  simpleSearchLoading: boolean,
  combinedError: string | null,
  shouldShowSkeleton: boolean,
  canRenderResults: boolean,
  canShowError: boolean,
  isMapMode: boolean,
  resultsContainerRef: React.RefObject<HTMLDivElement>,
  isPaginationLoading: boolean
) {
  useEffect(() => {
    if (!showDebugInfo) return;
    console.info("[FOR_YOU UI]", {
      items: totalCount,
      loading,
      prefsLoading,
      simpleSearchLoading,
      error: combinedError,
      shouldShowSkeleton,
      canRenderResults,
      canShowError,
      isMapMode,
    });
  }, [
    canRenderResults,
    canShowError,
    combinedError,
    isMapMode,
    loading,
    prefsLoading,
    showDebugInfo,
    shouldShowSkeleton,
    simpleSearchLoading,
    totalCount,
  ]);

  useEffect(() => {
    if (!showDebugInfo) return;
    const el = resultsContainerRef.current;
    if (!el) return;

    const styles = window.getComputedStyle(el);
    console.info("[FOR_YOU UI CONTAINER]", {
      height: Math.round(el.getBoundingClientRect().height),
      overflow: styles.overflow,
      overflowY: styles.overflowY,
      transform: styles.transform,
      opacity: styles.opacity,
      visibility: styles.visibility,
      zIndex: styles.zIndex,
      isPaginationLoading,
    });
  }, [canRenderResults, canShowError, isMapMode, showDebugInfo, shouldShowSkeleton, totalCount, isPaginationLoading, resultsContainerRef]);
}
