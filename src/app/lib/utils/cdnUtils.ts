/**
 * CDN and Image Optimization Utilities
 * Provides optimized image URLs and CDN configuration
 */

/**
 * Check if a URL is from Supabase storage (which has CDN built-in)
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes("supabase.co/storage");
}

/**
 * Get optimized image URL with CDN parameters
 * Supabase Storage already has CDN, but we can add optimization params
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
  } = {}
): string {
  if (!url || typeof url !== "string") {
    return url;
  }

  // For Supabase storage URLs, they're already CDN-optimized
  // Next.js Image component will handle format conversion
  // But we can add size hints if needed
  if (isSupabaseStorageUrl(url)) {
    // Supabase Storage CDN doesn't support query params for transformation
    // But Next.js Image will handle optimization
    return url;
  }

  // For external URLs, return as-is (Next.js will optimize)
  return url;
}

/**
 * Generate responsive image sizes for Next.js Image component
 */
export function getResponsiveSizes(breakpoints?: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}): string {
  const { mobile = 640, tablet = 1024, desktop = 1920 } = breakpoints || {};

  return `(max-width: ${mobile}px) 100vw, (max-width: ${tablet}px) 50vw, ${desktop}px`;
}

/**
 * Get optimal image quality based on use case
 */
export function getOptimalQuality(
  useCase: "hero" | "thumbnail" | "gallery" | "avatar" | "icon"
): number {
  const qualityMap: Record<string, number> = {
    hero: 90, // High quality for hero images
    gallery: 85, // Good quality for galleries
    thumbnail: 75, // Balanced for thumbnails
    avatar: 80, // Good quality for avatars
    icon: 60, // Lower quality for icons (smaller files)
  };

  return qualityMap[useCase] || 75;
}

/**
 * Preload image for faster loading
 */
export function preloadImage(src: string, as: "image" = "image"): void {
  if (typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = as;
  link.href = src;
  link.fetchPriority = "high";
  document.head.appendChild(link);
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
): () => void {
  if (typeof window === "undefined") return () => {};

  const { rootMargin = "50px", threshold = 0.01 } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const imgElement = entry.target as HTMLImageElement;
          imgElement.src = src;
          imgElement.classList.add("loaded");
          observer.unobserve(imgElement);
        }
      });
    },
    {
      rootMargin,
      threshold,
    }
  );

  observer.observe(img);

  return () => observer.disconnect();
}
