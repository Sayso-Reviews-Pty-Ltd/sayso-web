"use client";

import { memo } from "react";
import nextDynamic from "next/dynamic";
import BusinessRow from "../components/BusinessRow/BusinessRow";
import FeaturedBusinessesSkeleton from "../components/CommunityHighlights/FeaturedBusinessesSkeleton";
import HeroSkeleton from "../components/Hero/HeroSkeleton";
import MobileHeroSkeleton from "../components/Hero/MobileHeroSkeleton";

export const HeroCarousel = nextDynamic(
  () => import("../components/Hero/HeroCarousel"),
  {
    loading: () => <HeroSkeleton />,
  }
);

export const EventsSpecials = nextDynamic(
  () => import("../components/EventsSpecials/EventsSpecials"),
  {
    loading: () => <div className="h-96 bg-off-white/50" />,
  }
);

export const CommunityHighlights = nextDynamic(
  () => import("../components/CommunityHighlights/CommunityHighlights"),
  {
    loading: () => <FeaturedBusinessesSkeleton count={4} />,
  }
);

export const Footer = nextDynamic(() => import("../components/Footer/Footer"), {
  loading: () => <div className="h-64 bg-charcoal" />,
});

export const SearchResultsPanel = nextDynamic(
  () => import("../components/SearchResultsPanel/SearchResultsPanel"),
  {
    loading: () => <div className="min-h-[40vh] w-full" />,
  }
);

export const MemoizedBusinessRow = memo(BusinessRow);

export { HeroSkeleton, MobileHeroSkeleton };
