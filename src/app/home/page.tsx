import { Suspense, lazy } from 'react';

export const experimental_ppr = true;
import HomePageSkeleton from './HomePageSkeleton';

const HomeClient = lazy(() => import('./HomeClient').then((m) => ({ default: m.default })));
import Link from 'next/link';
import SchemaMarkup from '../components/SEO/SchemaMarkup';
import { generateWebSiteSchema } from '../lib/utils/schemaMarkup';
import { getServerBaseUrl } from '../lib/utils/serverOrigin';
import type { Business } from '../components/BusinessCard/BusinessCard';

// app/home/page.tsx serves /home directly — middleware does not rewrite /home to a
// different page. This function is reachable in production for all authenticated users
// routed to /home by middleware.
async function prefetchTrending(): Promise<Business[]> {
  try {
    const baseUrl = await getServerBaseUrl();
    const res = await fetch(`${baseUrl}/api/trending?limit=20`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.businesses) ? data.businesses : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const initialTrending = await prefetchTrending();
  return (
    <>
      <SchemaMarkup schemas={[generateWebSiteSchema()]} />
      <nav aria-label="Primary discovery links" className="sr-only">
        <ul>
          <li><Link href="/search">Search Cape Town businesses on Sayso</Link></li>
          <li><Link href="/categories/food-drink">Browse Cape Town restaurants and cafes</Link></li>
          <li><Link href="/events-specials">Explore Cape Town events on Sayso</Link></li>
          <li><Link href="/leaderboard">View Sayso community highlights</Link></li>
        </ul>
      </nav>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeClient initialTrending={initialTrending} />
      </Suspense>
    </>
  );
}
