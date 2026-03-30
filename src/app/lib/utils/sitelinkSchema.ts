/**
 * Sitelinks Schema Utilities
 * Generates WebPage JSON-LD for the six pages targeted as Google sitelinks.
 * Each schema declares isPartOf the root WebSite so Google can infer hierarchy.
 */

import { SITE_URL } from "./seoMetadata";

/**
 * Generate a WebPage schema that references the main WebSite via isPartOf.
 * Call from each sitelink-target layout so the schema is SSR'd per page.
 *
 * @param path   Route path, e.g. '/home' or '/trending'
 */
export function generateWebPageSchema({
  name,
  path,
  description,
  breadcrumbs,
}: {
  name: string;
  path: string;
  description: string;
  breadcrumbs: Array<{ name: string; path: string }>;
}): object {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name,
    url,
    description,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path}`,
      })),
    },
  };
}
