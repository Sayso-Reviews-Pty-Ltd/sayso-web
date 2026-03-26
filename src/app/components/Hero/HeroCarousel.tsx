// src/components/Hero/HeroCarousel.tsx
"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import nextDynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FilterState } from "../FilterModal/FilterModal";
import HeroSkeleton from "./HeroSkeleton";
import MobileHeroSkeleton from "./MobileHeroSkeleton";
import { useAuth } from '../../contexts/AuthContext';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description: string;
}

type HeroViewport = "mobile" | "tablet" | "desktop";

const FilterModal = nextDynamic(() => import("../FilterModal/FilterModal"), {
  ssr: false,
});

const HERO_COPY = [
  {
    title: "Cape Town, in your pocket",
    description: "Trusted local gems, rated by real people.",
  },
  {
    title: "Rate the services you love",
    description: "Quick, honest reviews that help your community choose better.",
  },
  {
    title: "Discover events and experiences",
    description: "Find what's happening near you - today, this weekend, and beyond.",
  },
];
const FALLBACK_HERO_TEXT = {
  title: "Cape Town, in your pocket",
  description: "Trusted local gems, rated by real people.",
} as const;

const HERO_SEED_STORAGE_KEY = "sayso.hero.seed.v1";

function getOrCreateSessionSeed(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.sessionStorage.getItem(HERO_SEED_STORAGE_KEY);
    if (existing) return existing;
    const seed =
      typeof window.crypto !== "undefined" && "getRandomValues" in window.crypto
        ? (() => {
            const buf = new Uint32Array(2);
            window.crypto.getRandomValues(buf);
            return `${buf[0].toString(36)}${buf[1].toString(36)}`;
          })()
        : Math.floor(Math.random() * 1e12).toString(36);
    window.sessionStorage.setItem(HERO_SEED_STORAGE_KEY, seed);
    return seed;
  } catch {
    return Math.floor(Math.random() * 1e12).toString(36);
  }
}

function hashSeedToUint32(seed: string): number {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(images: string[], seed: string): string[] {
  const result = [...images];
  const rand = mulberry32(hashSeedToUint32(seed));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function selectStableSubset(images: string[], cap: number, seed: string): string[] {
  const ordered = orderHeroImages(images, seed);
  if (cap >= ordered.length) return ordered;
  return ordered.slice(0, cap);
}

const FONT_STACK = "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

const DEFAULT_HERO_IMAGE = "/hero/devon-janse-van-rensburg-CeI5GZF0MrQ-unsplash.jpg";

function orderHeroImages(images: string[], seed: string): string[] {
  return seededShuffle([...new Set(images)], seed);
}

const buildSlides = (images: string[]): HeroSlide[] => {
  return images.map((image, index) => {
    const copy = HERO_COPY[index % HERO_COPY.length];
    return {
      id: `${index + 1}`,
      image,
      title: copy.title,
      description: copy.description,
    };
  });
};

/** Hero images from /public/hero (local only; no storage bucket).
 *  All 148 available assets are listed; the carousel caps per-viewport:
 *  iOS mobile → 4, mobile → 5, tablet → 14, desktop → unlimited.
 *  The session-seeded shuffle ensures variety across visits. */
const HERO_IMAGES: string[] = [
  "/hero/devon-janse-van-rensburg-CeI5GZF0MrQ-unsplash.jpg",
  "/hero/a-j-A_0C42zmz1Q-unsplash.jpg",
  "/hero/adam-winger-KVVjmb3IIL8-unsplash.jpg",
  "/hero/adam-winger-NuE52ey_cTc-unsplash.jpg",
  "/hero/adriaan-venner-scheepers-Ceq_cYIb8Co-unsplash.jpg",
  "/hero/ahmet-kurt-0xn-8kRWOhE-unsplash.jpg",
  "/hero/aksh-yadav-bY4cqxp7vos-unsplash.jpg",
  "/hero/alex-zamora-FU1KddSIIR4-unsplash.jpg",
  "/hero/alexandr-podvalny-TciuHvwoK0k-unsplash.jpg",
  "/hero/alexey-demidov-0x7wd4w2K5E-unsplash.jpg",
  "/hero/alyona-yankovska-7EbGkOm8pWM-unsplash.jpg",
  "/hero/ambitious-studio-rick-barrett-6J2oD_IBPb0-unsplash.jpg",
  "/hero/anderson-schmig-IayJpfDhj7E-unsplash.jpg",
  "/hero/andy-kelly-P21tYLUo_PI-unsplash.jpg",
  "/hero/anya-richter-V5-OCit5ZF0-unsplash.jpg",
  "/hero/arno-smit-qY_yTu7YBT4-unsplash.jpg",
  "/hero/barbara-froes-Yhsdub0hV1A-unsplash.jpg",
  "/hero/ben-nrHms-os93A-unsplash.jpg",
  "/hero/bernd-m-schell-DoTYfTdbq5w-unsplash.jpg",
  "/hero/boitumelo-vLxXcymERuU-unsplash.jpg",
  "/hero/boney-dHIRbh9En6I-unsplash.jpg",
  "/hero/bruce-mars-gJtDg6WfMlQ-unsplash.jpg",
  "/hero/caleb-williams-Fj5klOSDZxM-unsplash.jpg",
  "/hero/caroline-lm-8BkF0sTC6Uo-unsplash.jpg",
  "/hero/casey-allen-UjpEGHu8uNU-unsplash.jpg",
  "/hero/chris-andrawes-6vTyPMQ8gHk-unsplash.jpg",
  "/hero/christelle-bourgeois-Aq7paIaerrY-unsplash.jpg",
  "/hero/christin-hume-0MoF-Fe0w0A-unsplash.jpg",
  "/hero/cole-keister-rPlYtGgoxho-unsplash.jpg",
  "/hero/connor-gan-iY6iiQKkjcg-unsplash.jpg",
  "/hero/courtney-cook-QYsRxRPygwU-unsplash.jpg",
  "/hero/createasea-b5X9v220Y8M-unsplash.jpg",
  "/hero/dan-duffey-7NaBBaRzfZ4-unsplash.jpg",
  "/hero/dan-gold-E6HjQaB7UEA-unsplash.jpg",
  "/hero/dane-wetton-zdLdgGbi9Ow-unsplash.jpg",
  "/hero/danielle-cerullo-CQfNt66ttZM-unsplash.jpg",
  "/hero/dave-hoefler-a3e7yEtQxJs-unsplash.jpg",
  "/hero/david-henrichs-OKBb9_v-K1I-unsplash.jpg",
  "/hero/devon-janse-van-rensburg-ODZIiIsn490-unsplash.jpg",
  "/hero/devon-janse-van-rensburg-USNt7L36zj0-unsplash.jpg",
  "/hero/devon-janse-van-rensburg-hSfok6PdwgE-unsplash.jpg",
  "/hero/dylan-gillis-V8_s30ttQTk-unsplash.jpg",
  "/hero/dylan-gillis-YJdCZba0TYE-unsplash.jpg",
  "/hero/edward-howell-vvUy1hWVYEA-unsplash.jpg",
  "/hero/eric-ward-ISg37AI2A-s-unsplash.jpg",
  "/hero/farhad-ibrahimzade-Sk6my6_KTK0-unsplash.jpg",
  "/hero/felipe-bustillo-4VDRCoNuvE0-unsplash.jpg",
  "/hero/fitnish-media-mQ2mZMcI1dc-unsplash.jpg",
  "/hero/fitnish-media-pZqyd8p0sP8-unsplash.jpg",
  "/hero/fran-innocenti-I_LxDFIIRIA-unsplash.jpg",
  "/hero/frankie-cordoba-Y8gXPB8Mq98-unsplash.jpg",
  "/hero/gilles-de-muynck-QcN1_o0a0qo-unsplash.jpg",
  "/hero/hayffield-l-ZVdZw2p08y4-unsplash.jpg",
  "/hero/holly-mandarich-UVyOfX3v0Ls-unsplash.jpg",
  "/hero/hu-chen-FZ0qzjVF_-c-unsplash.jpg",
  "/hero/huum-NHLS5hOSH0c-unsplash.jpg",
  "/hero/jakub-kapusnak-4f4YZfDMLeU-unsplash.jpg",
  "/hero/janan-OoW1DMDCV1Y-unsplash.jpg",
  "/hero/janice-lin-yUIN4QWKCTw-unsplash.jpg",
  "/hero/jannik-mY2ZHBU6GRk-unsplash.jpg",
  "/hero/jared-rice-xce530fBHrk-unsplash.jpg",
  "/hero/jason-leung-a6tKN9LfuV8-unsplash.jpg",
  "/hero/jean-van-wyk-gxpWKKZwJa0-unsplash.jpg",
  "/hero/jennifer-deacon-LO63Mh7gv3c-unsplash.jpg",
  "/hero/jens-thekkeveettil-dBWvUqBoOU8-unsplash.jpg",
  "/hero/jessica-pamp-JNTSoyb_bbw-unsplash.jpg",
  "/hero/john-michael-thomson-9m1V6A8Fm-A-unsplash.jpg",
  "/hero/jorik-kleen-DJN1Z0IxueU-unsplash.jpg",
  "/hero/kalisa-veer-gRx74OSJTG8-unsplash.jpg",
  "/hero/karan-bhatia-ib7jwp7m0iA-unsplash.jpg",
  "/hero/karsten-winegeart-0QTcK1JcteQ-unsplash.jpg",
  "/hero/kaylee-garrett-GaprWyIw66o-unsplash.jpg",
  "/hero/kazuo-ota-sbpZBs1qR9k-unsplash.jpg",
  "/hero/kelsey-knight-udj2tD3WKsY-unsplash.jpg",
  "/hero/kevin-ianeselli-ebnlHkqfUHY-unsplash.jpg",
  "/hero/kevin-wolf-IfTKequW2Mk-unsplash.jpg",
  "/hero/kingsley-hemans-51-4BSipn7E-unsplash.jpg",
  "/hero/krista-mangulsone-9gz3wfHr65U-unsplash.jpg",
  "/hero/krists-luhaers-AtPWnYNDJnM-unsplash.jpg",
  "/hero/lance-asper-mNDVSSmMt0Y-unsplash.jpg",
  "/hero/linley-rall-FbPz8UHbKUs-unsplash.jpg",
  "/hero/lo-sarno-QLdp9SGDf5Y-unsplash.jpg",
  "/hero/louis-hansel-wVoP_Q2Bg_A-unsplash.jpg",
  "/hero/madiba-de-african-inspiration-UP1zQfZLyWE-unsplash.jpg",
  "/hero/madiba-de-african-inspiration-XrNKe8VLMRo-unsplash.jpg",
  "/hero/margit-umbach-6jyMHaPtHIs-unsplash.jpg",
  "/hero/margit-umbach-mVBWD1qsTQs-unsplash.jpg",
  "/hero/marina-zvada-lUPCv3ccYhg-unsplash.jpg",
  "/hero/marvin-meyer-SYTO3xs06fU-unsplash.jpg",
  "/hero/matt-halls-oC8S4_19QUk-unsplash.jpg",
  "/hero/matthias-wesselmann-9Jx37xwFX6c-unsplash.jpg",
  "/hero/meritt-thomas-9eLHzqljDyU-unsplash.jpg",
  "/hero/michael-afonso-nZU76qWy-T8-unsplash.jpg",
  "/hero/michael-lee-Noqjeq2XJUk-unsplash.jpg",
  "/hero/miltiadis-fragkidis-BFC_39NfWPI-unsplash.jpg",
  "/hero/nappy-J5UTvRgse7Q-unsplash.jpg",
  "/hero/neom-4AADxUsnufQ-unsplash.jpg",
  "/hero/nick-fewings-MjZwf1PlfaU-unsplash.jpg",
  "/hero/nico-smit-L5CY08WNZ28-unsplash.jpg",
  "/hero/nico-smit-_nZNptJkZg0-unsplash.jpg",
  "/hero/nrd-D6Tu_L3chLE-unsplash.jpg",
  "/hero/omar-eagle-zk_6h5I4T5Q-unsplash.jpg",
  "/hero/online-marketing-hIgeoQjS_iE-unsplash.jpg",
  "/hero/oriol-farre-sSEff9sE2cA-unsplash.jpg",
  "/hero/parker-gibbs-pdUVFX8WglY-unsplash.jpg",
  "/hero/patrick-tomasso-1NTFSnV-KLs-unsplash.jpg",
  "/hero/pauline-loroy-tv8PIPPY3rQ-unsplash.jpg",
  "/hero/photo-nic-xOigCUcFdA8-unsplash.jpg",
  "/hero/polina-miloserdova-1TY6b0RJaQA-unsplash.jpg",
  "/hero/polina-miloserdova-kymJDvqz9dk-unsplash.jpg",
  "/hero/q-u-i-n-g-u-y-e-n-Zrp9b3PMIy8-unsplash.jpg",
  "/hero/quan-nguyen-yDSe7sggb9Q-unsplash.jpg",
  "/hero/r0m0_4-w1UD6PiqgtQ-unsplash.jpg",
  "/hero/rahadiansyah-3yusFdVTtQ8-unsplash.jpg",
  "/hero/raze-solar-GXLPLG3_Vf4-unsplash.jpg",
  "/hero/reba-spike-4y7030O1XPQ-unsplash.jpg",
  "/hero/remy-gieling-H0v6g8FGvFQ-unsplash.jpg",
  "/hero/riccardo-bergamini-O2yNzXdqOu0-unsplash.jpg",
  "/hero/rosa-rafael-Pe9IXUuC6QU-unsplash.jpg",
  "/hero/ryan-cuerden-Ib-UJN06F5s-unsplash.jpg",
  "/hero/sam-mar-OQOKSsj8QME-unsplash.jpg",
  "/hero/sarah-brown-RapDxBSMKzQ-unsplash.jpg",
  "/hero/scott-graham-5fNmWej4tAA-unsplash.jpg",
  "/hero/shaun-meintjes-31qNJWJZzh4-unsplash.jpg",
  "/hero/sheila-c-ySW0RtDJNh4-unsplash.jpg",
  "/hero/shraga-kopstein-K1P_W3JbCpI-unsplash.jpg",
  "/hero/sigmund-TJxotQTUr8o-unsplash.jpg",
  "/hero/siyuan-g_V2rt6iG7A-unsplash.jpg",
  "/hero/tabitha-turner-F0Wd4djYvSA-unsplash.jpg",
  "/hero/tanya-paquet-V3IssFR02qE-unsplash.jpg",
  "/hero/tanya-paquet-q6vDZ48s6iE-unsplash.jpg",
  "/hero/taylor-heery-_TyrA1RUaiI-unsplash.jpg",
  "/hero/thomas-bennie-R1_Rt0Xz1_I-unsplash.jpg",
  "/hero/tijs-van-leur-So6YckShOVA-unsplash.jpg",
  "/hero/tim-b-motivv-OYvjvIANSD0-unsplash.jpg",
  "/hero/trnava-university-BEEyeib-am8-unsplash.jpg",
  "/hero/unseen-histories-zKlmUuc7pBk-unsplash.jpg",
  "/hero/vincenzo-morelli-ZO4pHKtpn4c-unsplash.jpg",
  "/hero/vitaly-gariev-lbOaKbGNcrk-unsplash.jpg",
  "/hero/vitaly-gariev-y1u8bcBPnIU-unsplash.jpg",
  "/hero/vitolda-klein-zxsdbx-af9Y-unsplash (1).jpg",
  "/hero/yada-pongsirirushakun-e5tV8MyOTqI-unsplash.jpg",
  "/hero/yasmin-peyman-6hQAg2FwJhs-unsplash.jpg",
  "/hero/yns-plt-NY1D4Zni7fc-unsplash.jpg",
  "/hero/yuriy-vertikov-bFjTqonnpK4-unsplash.jpg",
  "/hero/yvette-de-wit-NYrVisodQ2M-unsplash.jpg",
  "/hero/zalfa-imani-1xp5VxvyKL0-unsplash.jpg",
  "/hero/zoe-reeve-xjJd9fu9OkM-unsplash.jpg",
];

export default function HeroCarousel() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [heroImages] = useState<string[]>(() => HERO_IMAGES);
  const [heroViewport, setHeroViewport] = useState<HeroViewport>("desktop");
  const [heroSeed, setHeroSeed] = useState<string>("server");
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(new Set());
  const slideTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const currentIndexRef = useRef(currentIndex);
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const isAppleMobile = /iPad|iPhone|iPod/i.test(ua);
    const isIpadOS13Plus =
      navigator.platform === "MacIntel" && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
    return isAppleMobile || isIpadOS13Plus;
  }, []);
  const isIOSMobile = isIOS && heroViewport === "mobile";

  const cappedHeroImages = useMemo(() => {
    // Keep iOS mobile extremely light: fewer slides + fewer image elements prevents Safari tab crashes.
    const cap = isIOSMobile ? 4 : heroViewport === "mobile" ? 5 : heroViewport === "tablet" ? 14 : null;
    const base = Array.isArray(heroImages) ? heroImages : HERO_IMAGES;
    if (!cap) return orderHeroImages(base, heroSeed);
    return selectStableSubset(base, cap, heroSeed);
  }, [heroImages, heroViewport, heroSeed, isIOSMobile]);
  const slides = useMemo(() => buildSlides(cappedHeroImages), [cappedHeroImages]);
  const slidesRef = useRef<HeroSlide[]>(slides);
  const preloadedImagesRef = useRef<Set<string>>(new Set());

  // Set correct viewport before first paint to avoid mobile/desktop image-count flicker.
  useLayoutEffect(() => {
    if (!window.matchMedia) return;
    const mobileMql = window.matchMedia("(max-width: 767px)");
    const tabletMql = window.matchMedia("(min-width: 768px) and (max-width: 1024px)");
    setHeroViewport(mobileMql.matches ? "mobile" : tabletMql.matches ? "tablet" : "desktop");
  }, []);

  // Ongoing resize listener (fires after paint — no flicker risk on resize).
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mobileMql = window.matchMedia("(max-width: 767px)");
    const tabletMql = window.matchMedia("(min-width: 768px) and (max-width: 1024px)");
    const update = () => {
      setHeroViewport(mobileMql.matches ? "mobile" : tabletMql.matches ? "tablet" : "desktop");
    };
    const add = (mql: MediaQueryList) => {
      if ("addEventListener" in mql) {
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
      }
      (mql as any).addListener?.(update);
      return () => (mql as any).removeListener?.(update);
    };
    const removeMobile = add(mobileMql);
    const removeTablet = add(tabletMql);
    return () => {
      removeMobile();
      removeTablet();
    };
  }, []);

  // Run before first paint so the slide order is stable — no post-paint reorder flicker.
  useLayoutEffect(() => {
    setHeroSeed(getOrCreateSessionSeed());
  }, []);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
  }, [currentIndex, slides.length]);

  // Preload first hero image for mobile-first LCP optimization
  useEffect(() => {
    if (typeof window === 'undefined' || slides.length === 0) return;
    
    const firstSlide = slides[0];
    if (!firstSlide?.image) return;

    // Create preload link for first hero image
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = firstSlide.image;
    link.fetchPriority = 'high';
    
    // Add mobile-first media query for better bandwidth management
    if (heroViewport === 'mobile') {
      link.media = '(max-width: 768px)';
    }
    
    document.head.appendChild(link);

    return () => {
      // Cleanup preload link
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [slides[0]?.image, heroViewport]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({ minRating: null, distance: null });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Respect reduced motion for carousel timing and text animation intensity.
  const prefersReduced = useReducedMotion() ?? false;
  const prefersDataSaver =
    typeof navigator !== "undefined" &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);



  // Hide scroll indicator once the user starts scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prefetch a small set of upcoming hero images once first paint settles.
  useEffect(() => {
    if (typeof window === "undefined" || slides.length === 0) return;
    if (heroViewport === "mobile" || isIOS) return;
    const prefetchCount = heroViewport === "tablet" ? 2 : 3;
    const imagesToPrefetch = slides.slice(0, prefetchCount).map((slide) => slide.image);
    imagesToPrefetch.forEach((src) => {
      if (preloadedImagesRef.current.has(src)) return;
      preloadedImagesRef.current.add(src);
      const img = new window.Image();
      img.decoding = "async";
      img.fetchPriority = "low";
      img.src = src;
    });
  }, [slides, heroViewport, isIOS]);

  // When slide changes, preload upcoming slides.
  useEffect(() => {
    if (typeof window === "undefined" || slides.length === 0) return;
    // On mobile/iOS: prefetch just the next slide. On larger screens: next 2.
    const count = heroViewport === "mobile" || isIOS ? 1 : 2;
    for (let i = 1; i <= count; i++) {
      const nextIdx = (currentIndex + i) % slides.length;
      const src = slides[nextIdx].image;
      if (preloadedImagesRef.current.has(src)) continue;
      preloadedImagesRef.current.add(src);
      const img = new window.Image();
      img.decoding = "async";
      img.fetchPriority = "low";
      img.src = src;
    }
  }, [currentIndex, slides, heroViewport, isIOS]);

  const transitionToIndex = useCallback(
    (computeNextIndex: (prev: number) => number) => {
      if (slides.length === 0) return;
      setCurrentIndex((prev) => {
        const nextIndex = computeNextIndex(prev);
        currentIndexRef.current = nextIndex;
        return nextIndex;
      });
    },
    [slides.length],
  );

  const next = useCallback(() => {
    transitionToIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length, transitionToIndex]);
  const prev = useCallback(() => {
    transitionToIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length, transitionToIndex]);

  // Update ref when currentIndex changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Auto-advance slides (avoid frequent state updates on mobile Safari).
  useEffect(() => {
    if (prefersReduced || paused || slides.length === 0) {
      if (slideTimeoutRef.current != null) {
        window.clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = null;
      }
      return;
    }

    // Clear previous timer before scheduling a new one.
    if (slideTimeoutRef.current != null) {
      window.clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }

    const slideDuration = 9000;
    slideTimeoutRef.current = window.setTimeout(() => {
      transitionToIndex((prev) => (prev + 1) % slides.length);
    }, slideDuration);

    return () => {
      if (slideTimeoutRef.current != null) {
        window.clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = null;
      }
    };
  }, [prefersReduced, paused, currentIndex, slides.length, transitionToIndex]);

  // pause when tab is hidden
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // keyboard navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setPaused(true);
        next();
      } else if (e.key === "ArrowLeft") {
        setPaused(true);
        prev();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // swipe gestures (mobile)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startX = 0;
    let deltaX = 0;
    const threshold = 40;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      deltaX = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      deltaX = e.touches[0].clientX - startX;
    };
    const onTouchEnd = () => {
      if (Math.abs(deltaX) > threshold) {
        setPaused(true);
        if (deltaX < 0) next();
        else prev();
      }
      startX = 0;
      deltaX = 0;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [next, prev]);

  const closeFilters = () => {
    setIsFilterOpen(false);
    setTimeout(() => setIsFilterVisible(false), 150);
  };

  const handleFiltersChange = (f: FilterState) => {
    const params = new URLSearchParams();
    if (f.categories && f.categories.length > 0) {
      params.set('categories', f.categories.join(','));
    }
    if (f.minRating !== null) {
      params.set('min_rating', f.minRating.toString());
    }
    if (f.distance) {
      params.set('distance', f.distance);
    }
    const queryString = params.toString();
    const exploreUrl = queryString ? `/explore?${queryString}` : '/explore';
    router.push(exploreUrl);
    closeFilters();
  };

  if (slides.length === 0) {
    return (
      <div suppressHydrationWarning>
        {heroViewport === "mobile" ? <MobileHeroSkeleton /> : <HeroSkeleton />}
      </div>
    );
  }

  // Render all capped slides simultaneously — no mount/unmount cycles, no flicker.
  // Opacity is controlled purely via the animate prop keyed to currentIndex.

  const currentTextSlide = slides[currentIndex % slides.length] ?? slides[0];
  const currentTitle =
    typeof currentTextSlide?.title === "string" && currentTextSlide.title.trim().length > 0
      ? currentTextSlide.title.trim()
      : FALLBACK_HERO_TEXT.title;
  const textTransitionClass = prefersReduced ? "duration-200" : "duration-500";

  return (
    <>
      {/* Hero Container with padding */}
      <div className="relative w-full px-0 py-0">
        {/* Hero Section - full viewport height */}
        <section
          ref={containerRef as React.RefObject<HTMLElement>}
          className="relative h-[100vh] w-full overflow-hidden outline-none rounded-none"
          aria-label="Hero carousel"
          tabIndex={0}
          style={{
            fontFamily: FONT_STACK,
            // Allow native vertical page scrolling on mobile while preserving
            // horizontal swipe interactions for the carousel.
            touchAction: "pan-y",
          }}
        >
          {/* Liquid Glass Ambient Lighting */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 via-transparent to-sage/10 pointer-events-none rounded-none"
      />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)] pointer-events-none rounded-none" />
      <div className="absolute inset-0 z-0 backdrop-blur-[1px] bg-off-white/5 mix-blend-overlay pointer-events-none rounded-none" />
      {/* Image layers — previous slide sits beneath as a static backdrop so the
          grey section background never flashes during the incoming image load. */}
      {(() => {
        const activeIdx = currentIndex % slides.length;
        const activeSlide = slides[activeIdx] ?? slides[0];
        const activeSrc = failedImageUrls.has(activeSlide.image)
          ? HERO_IMAGES[activeIdx % HERO_IMAGES.length]
          : activeSlide.image;

        const prevIdx = (activeIdx - 1 + slides.length) % slides.length;
        const prevSlide = slides[prevIdx];
        const prevSrc = prevSlide
          ? (failedImageUrls.has(prevSlide.image)
              ? HERO_IMAGES[prevIdx % HERO_IMAGES.length]
              : prevSlide.image)
          : null;

        return (
          <>
            {/* Previous slide — static backdrop, loaded and cached, fills the gap
                between when the active slide unmounts and the new image renders. */}
            {prevSrc && (
              <div
                aria-hidden
                className="absolute inset-0 overflow-hidden rounded-none z-[9]"
              >
                <Image
                  src={prevSrc}
                  alt=""
                  fill
                  quality={heroViewport === "mobile" ? 75 : 85}
                  className="object-cover object-center"
                  style={{ filter: "brightness(0.95) contrast(1.05) saturate(1.1)" }}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "hsla(0,0%,0%,0.3)" }} />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/40" />
                <div className="absolute inset-0 pointer-events-none bg-black/20" />
              </div>
            )}

            {/* Active slide — src updates in place; no unmount/remount to avoid Chrome compositor flicker. */}
            <div
              aria-hidden={false}
              className="absolute inset-0 overflow-hidden transform-gpu rounded-none z-10"
            >
              <div className="absolute inset-0 rounded-none overflow-hidden transform-gpu [backface-visibility:hidden] will-change-transform">
                <Image
                  src={activeSrc}
                  alt={activeSlide.title?.trim() || FALLBACK_HERO_TEXT.title}
                  fill
                  priority={activeIdx === 0}
                  loading={activeIdx === 0 ? "eager" : "lazy"}
                  fetchPriority={activeIdx === 0 ? "high" : "auto"}
                  quality={heroViewport === "mobile" ? 75 : 85}
                  className="transform-gpu [backface-visibility:hidden] object-cover object-center"
                  style={{ filter: "brightness(0.95) contrast(1.05) saturate(1.1)" }}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                  onError={() => {
                    setFailedImageUrls((prev) => new Set(prev).add(activeSlide.image));
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "hsla(0, 0%, 0%, 0.3)" }}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/40" />
                <div className="absolute inset-0 pointer-events-none bg-black/20" />
              </div>
            </div>
          </>
        );
      })()}

      {/* Hero Text - tied directly to the active slide with simple transitions. */}
      <div data-testid="hero-text" className="absolute inset-0 z-30 flex items-center justify-center w-full pt-[var(--safe-area-top)] sm:pt-[var(--header-height)] translate-y-0 sm:-translate-y-4 px-6 sm:px-10 pointer-events-none">
          <div
            className="w-full max-w-3xl flex flex-col items-center justify-center text-center pb-12 sm:pb-20"
          >
            <h2
              key={`hero-title-${currentTextSlide?.id ?? currentIndex}`}
              className={`text-[2rem] sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-off-white drop-shadow-lg mb-3 sm:mb-4 leading-[1.1] tracking-[-0.02em] whitespace-pre-line [word-break:normal] [overflow-wrap:normal] [hyphens:none] transition-opacity ease-out ${textTransitionClass}`}
              style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}
            >
              {currentTitle}
            </h2>
            {/* Conditional CTA Button */}
            <div
              className="w-full flex justify-center pointer-events-auto"
            >
              {!user ? (
                <Link
                  href="/login"
                  className="mi-tap group relative inline-flex items-center justify-center rounded-full min-h-[48px] py-3 px-10 sm:px-12 text-base font-semibold text-white text-center bg-gradient-to-r from-coral to-coral/80 hover:from-sage hover:to-sage transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/30 focus-visible:ring-offset-2 w-full max-w-[320px] sm:w-auto sm:min-w-[180px]"
                  style={{
                    fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <span className="relative z-10">Sign In</span>
                </Link>
              ) : (
                <Link
                  href="/trending"
                  className="mi-tap group relative inline-flex items-center justify-center rounded-full min-h-[48px] py-3 px-10 sm:px-12 text-base font-semibold text-white text-center bg-gradient-to-r from-coral to-coral/80 hover:from-sage hover:to-sage transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sage/30 focus-visible:ring-offset-2 w-full max-w-[320px] sm:w-auto sm:min-w-[180px]"
                  style={{
                    fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <span className="relative z-10">Discover</span>
                </Link>
              )}
            </div>
          </div>
      </div>

      {/* Accessible live region (announces slide title) */}
      <div className="sr-only" aria-live="polite">
        {slides[currentIndex]?.title}
      </div>

      {/* Scroll-down indicator — fades out once user scrolls */}
      <m.div
        aria-hidden="true"
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none"
      >
        <m.div
          animate={prefersReduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/70 drop-shadow"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </m.div>
      </m.div>

        </section>
      </div>

      {/* Filter Modal Portal */}
      {isFilterVisible && (
        <div className="fixed inset-0 z-50">
          <FilterModal
            isOpen={isFilterOpen}
            isVisible={isFilterVisible}
            onClose={closeFilters}
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>
      )}
    </>
  );
}
