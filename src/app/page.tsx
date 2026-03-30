import type { Metadata } from "next";
import {
  BRAND_POSITIONING,
  DEFAULT_SITE_DESCRIPTION,
  generateSEOMetadata,
  SITE_NAME,
} from "./lib/utils/seoMetadata";
import HomePage from "./home/page";

export const metadata: Metadata = generateSEOMetadata({
  title: `${SITE_NAME} | ${BRAND_POSITIONING}`,
  description: DEFAULT_SITE_DESCRIPTION,
  keywords: [
    "sayso",
    "sayso reviews",
    "cape town reviews",
    "cape town restaurants",
    "hyper-local discovery",
  ],
  url: "/",
  type: "website",
});

/**
 * Root page: renders the Home UI when root is allowed through middleware
 * (e.g. authenticated users and crawler traffic for SEO crawlability).
 */
export default function RootPage() {
  return (
    <>
      <h1 className="sr-only">Discover Cape Town businesses, restaurants &amp; events | Sayso</h1>
      <HomePage />
    </>
  );
}
