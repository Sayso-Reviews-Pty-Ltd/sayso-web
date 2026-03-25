"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { ArrowRight } from "@/app/lib/icons";

const FONT_STYLE = {
  fontFamily: "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
} as const;

export type HomeSectionRowProps = {
  title: string;
  /** Replaces the default h2 (e.g. WavyTypedTitle). title still used for aria-label. */
  titleSlot?: ReactNode;
  titleFontWeight?: number;
  headingClassName?: string;
  cta?: string;
  ctaFontWeight?: number;
  href?: string;
  /** Set to false to suppress the CTA button entirely. Default true. */
  showHeaderCta?: boolean;
  /** Premium hover animation on the CTA (EventsSpecials home variant). */
  premiumCtaHover?: boolean;
  disableAnimations?: boolean;
  /** Rendered between the header row and children (e.g. filter pills). */
  filterSlot?: ReactNode;
  /** Full-bleed layout: removes max-width constraint and widens padding. */
  fullBleed?: boolean;
  children: ReactNode;
};

const DEFAULT_HEADING_CLASS =
  "font-urbanist text-2xl sm:text-3xl md:text-2xl font-bold text-charcoal hover:text-sage transition-all duration-300 py-1 hover:bg-card-bg/5 rounded-lg cursor-default";

export function HomeSectionRow({
  title,
  titleSlot,
  titleFontWeight = 800,
  headingClassName = DEFAULT_HEADING_CLASS,
  cta,
  ctaFontWeight = 400,
  href,
  showHeaderCta = true,
  premiumCtaHover = false,
  disableAnimations = false,
  filterSlot,
  fullBleed = false,
  children,
}: HomeSectionRowProps) {
  const router = useRouter();
  const showCta = showHeaderCta && Boolean(cta && href);
  const ctaLabel = cta
    ? cta.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    : "";

  const headerPb = filterSlot ? "pb-2 sm:pb-3" : "pb-4 sm:pb-8 md:pb-10";

  const containerClass = fullBleed
    ? "w-full relative z-10"
    : "mx-auto w-full max-w-[2000px] relative z-10";
  const containerStyle = {
    // Keep a single 16px horizontal system while respecting device safe areas.
    paddingLeft: "max(16px, env(safe-area-inset-left))",
    paddingRight: "max(16px, env(safe-area-inset-right))",
  } as const;

  const headingStyle = { ...FONT_STYLE, fontWeight: titleFontWeight } as const;

  const headingNode = titleSlot ?? (
    disableAnimations ? (
      <h2 className={headingClassName} style={headingStyle}>{title}</h2>
    ) : (
      <m.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={headingClassName}
        style={headingStyle}
      >
        {title}
      </m.h2>
    )
  );

  const ctaButtonClass = premiumCtaHover
    ? "group inline-flex items-center gap-1 text-body-sm sm:text-caption font-normal text-charcoal transition-colors duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:text-sage focus:outline-none px-4 py-2 -mx-2 relative no-underline motion-reduce:transition-none"
    : "group inline-flex items-center gap-1 text-body-sm sm:text-caption font-normal text-charcoal transition-colors duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:text-sage focus:outline-none px-4 py-2 -mx-2 relative motion-reduce:transition-none";

  const ctaSpanClass = premiumCtaHover
    ? "relative z-10 transition-[color,transform] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-charcoal group-hover:text-sage group-hover:-translate-x-0.5 no-underline motion-reduce:transition-none"
    : "relative z-10 transition-[color] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-charcoal group-hover:text-sage motion-reduce:transition-none";

  const ctaArrowClass =
    "relative z-10 w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:translate-x-[3px] text-charcoal group-hover:text-sage motion-reduce:transition-none";

  return (
    <section className="relative m-0 w-full" aria-label={title} style={FONT_STYLE}>
      <div className={containerClass} style={containerStyle}>
        <div className={`${headerPb} flex flex-wrap items-center justify-between gap-2`}>
          {headingNode}

          {showCta && (
            <button
              onClick={() => router.push(href!)}
              className={ctaButtonClass}
              aria-label={`${ctaLabel}: ${title}`}
            >
              <span className={ctaSpanClass} style={{ ...FONT_STYLE, fontWeight: ctaFontWeight }}>
                {ctaLabel}
              </span>
              <ArrowRight className={ctaArrowClass} />
            </button>
          )}
        </div>

        {filterSlot && <div className="mb-3">{filterSlot}</div>}

        {children}
      </div>
    </section>
  );
}
