export const revalidate = 300;
// Allow on-demand ISR for slugs not returned by generateStaticParams.
export const dynamicParams = true;

import BusinessClient from "./BusinessClient";

// Pre-build top businesses at build time; all other slugs use on-demand ISR.
// Returning [] is the safe minimum — it prevents "slug not found at runtime" errors
// while allowing any slug to be generated and cached on first request.
export async function generateStaticParams() {
  return [];
}

export default function BusinessPage() {
  return <BusinessClient />;
}
