"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, m } from "framer-motion";
import { List, Map as MapIcon } from "@/app/lib/icons";
import type { BusinessMapItem } from "../../components/maps/BusinessesMap";

const BusinessesMap = dynamic(() => import("../../components/maps/BusinessesMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-off-white/60 animate-pulse" />,
});

interface ForYouMapDisplayProps {
  isMapMode: boolean;
  onMapModeChange: (mode: boolean) => void;
  isMapFallbackLoading: boolean;
  mapBusinesses: BusinessMapItem[];
  usingCoordinateFallback: boolean;
  currentPage: number;
  isSearchActive: boolean;
  isPaginationLoading: boolean;
  isDesktop: boolean;
}

export function ForYouMapDisplay({
  isMapMode,
  onMapModeChange,
  isMapFallbackLoading,
  mapBusinesses,
  usingCoordinateFallback,
  currentPage,
  isSearchActive,
  isPaginationLoading,
  isDesktop,
}: ForYouMapDisplayProps) {
  return (
    <>
      <div className="mb-4 px-2 flex items-center justify-end">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-white/30 shadow-sm">
          <button
            onClick={() => {
              console.log('[ForYou] Switching to List mode');
              onMapModeChange(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              !isMapMode
                ? 'bg-card-bg text-white shadow-sm'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
            style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => {
              console.log('[ForYou] Switching to Map mode, businesses:', mapBusinesses.length);
              onMapModeChange(true);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isMapMode
                ? 'bg-coral text-white shadow-sm'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
            style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Map
          </button>
        </div>
      </div>

      {isMapMode && usingCoordinateFallback && (
        <p
          className="mb-3 px-2 text-right text-xs text-charcoal/60"
          style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
        >
          Showing map-ready recommendations.
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {isMapMode ? (
          <m.div
            key="map-view"
            initial={isDesktop ? { opacity: 0 } : false}
            animate={isDesktop ? { opacity: 1 } : {}}
            exit={isDesktop ? { opacity: 0 } : {}}
            transition={isDesktop ? { duration: 0.2 } : undefined}
            className="w-full h-[calc(100vh-300px)] min-h-[500px] rounded-[12px] overflow-hidden border border-white/30 shadow-lg"
          >
            {isMapFallbackLoading ? (
              <div
                className="w-full h-full flex items-center justify-center bg-off-white/70 text-charcoal/60 text-sm"
                style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              >
                Loading map-ready recommendations...
              </div>
            ) : (
              <BusinessesMap
                businesses={mapBusinesses}
                className="w-full h-full"
              />
            )}
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
