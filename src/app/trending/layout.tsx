import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";

export const metadata: Metadata = PageMetadata.trending();

const schema = generateWebPageSchema({
  name: "Trending in Cape Town | Sayso",
  path: "/trending",
  description:
    "See what's hot right now — the most-reviewed and highest-rated spots across Cape Town.",
  breadcrumbs: [
    { name: "Home", path: "/home" },
    { name: "Trending", path: "/trending" },
  ],
});

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
