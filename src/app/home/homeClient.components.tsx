"use client";

import { memo } from "react";
import nextDynamic from "next/dynamic";
import BusinessRow from "../components/BusinessRow/BusinessRow";
import CommunityHighlightsSkeleton from "../components/CommunityHighlights/CommunityHighlightsSkeleton";
import EventsSpecialsSkeleton from "../components/EventsSpecials/EventsSpecialsSkeleton";
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
    loading: () => (
      <EventsSpecialsSkeleton
        title="Events & Specials"
        containerClass="mx-auto w-full max-w-[2000px] relative z-10"
        showHeaderCta
        enableMobilePeek
      />
    ),
  }
);

export const CommunityHighlights = nextDynamic(
  () => import("../components/CommunityHighlights/CommunityHighlights"),
  {
    loading: () => <CommunityHighlightsSkeleton reviewerCount={12} businessCount={4} />,
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
