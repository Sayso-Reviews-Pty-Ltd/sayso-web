"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { getChoreoItemMotion } from "../../lib/motion/choreography";
import { ChevronRight } from "@/app/lib/icons";

interface ForYouHeaderProps {
  choreoEnabled: boolean;
  prefsLoading: boolean;
  hasInitialBusinesses: boolean;
}

export function ForYouHeader({ choreoEnabled, prefsLoading, hasInitialBusinesses }: ForYouHeaderProps) {
  return (
    <>
      <m.nav
        className="relative z-10 pb-1"
        aria-label="Breadcrumb"
        {...getChoreoItemMotion({ order: 0, intent: "inline", enabled: choreoEnabled })}
      >
        <ol className="flex items-center gap-2 text-sm sm:text-base">
          <li>
            <Link href="/home" className="text-charcoal/70 hover:text-charcoal transition-colors duration-200 font-medium" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 text-charcoal/60" />
          </li>
          <li>
            <span className="text-charcoal font-semibold" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              For You
            </span>
          </li>
        </ol>
      </m.nav>

      <m.div
        className="relative z-10 mb-6 sm:mb-8 px-4 sm:px-6 text-center pt-4"
        {...getChoreoItemMotion({ order: 1, intent: "heading", enabled: choreoEnabled })}
      >
        <div className="my-4">
          <h1
            className="font-urbanist text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.2] tracking-tight text-charcoal mx-auto"
            style={{
              fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              hyphens: 'none',
            }}
          >
            <span className="inline-block font-bold" style={{
              fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              hyphens: 'none',
            }}>Curated Just For You</span>
          </h1>
        </div>
        <p className="text-sm sm:text-base text-charcoal/70 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          Discover personalised recommendations tailored to your interests and preferences.
          We've handpicked the best local businesses just for you.
        </p>
        {prefsLoading && hasInitialBusinesses && (
          <div
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs text-charcoal/70 shadow-sm border border-sage/20"
            aria-live="polite"
          >
            <span
              className="inline-block h-2 w-6 rounded-full bg-charcoal/20"
              aria-hidden
            />
            <span>Personalizing...</span>
          </div>
        )}
      </m.div>
    </>
  );
}
