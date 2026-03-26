import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from './lib/utils/seoMetadata';
import { getServiceSupabase } from './lib/admin';

export const revalidate = 3600;

const QUERY_PAGE_SIZE = 1000;

const SITE_LAUNCH_DATE = new Date('2024-06-01');

const now = new Date();

const staticPublicPages: Array<{
  url: string;
  lastModified: Date;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
  { url: '/home', lastModified: now, priority: 1.0, changeFrequency: 'daily' },
  { url: '/for-you', lastModified: now, priority: 0.95, changeFrequency: 'daily' },
  { url: '/search', lastModified: now, priority: 0.9, changeFrequency: 'daily' },
  { url: '/events-specials', lastModified: now, priority: 0.9, changeFrequency: 'daily' },
  { url: '/trending', lastModified: now, priority: 0.85, changeFrequency: 'daily' },
  { url: '/leaderboard', lastModified: now, priority: 0.8, changeFrequency: 'daily' },
  { url: '/discover/reviews', lastModified: now, priority: 0.7, changeFrequency: 'daily' },
  { url: '/about', lastModified: SITE_LAUNCH_DATE, priority: 0.6, changeFrequency: 'monthly' },
  { url: '/terms', lastModified: SITE_LAUNCH_DATE, priority: 0.3, changeFrequency: 'yearly' },
  { url: '/privacy', lastModified: SITE_LAUNCH_DATE, priority: 0.3, changeFrequency: 'yearly' },
];

function getSitemapSupabase() {
  try {
    return getServiceSupabase();
  } catch {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const to = from + QUERY_PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);

    if (error) throw error;

    const page = data || [];
    if (page.length === 0) break;

    rows.push(...page);

    if (page.length < QUERY_PAGE_SIZE) break;
    from += QUERY_PAGE_SIZE;
  }

  return rows;
}

type BusinessRow = {
  slug: string | null;
  primary_category_slug: string | null;
  primary_subcategory_slug: string | null;
  location: string | null;
  primary_subcategory_label: string | null;
  updated_at: string | null;
  created_at: string | null;
};

async function getAllBusinessData(): Promise<BusinessRow[]> {
  try {
    const supabase = getSitemapSupabase();

    return await fetchAllRows<BusinessRow>((from, to) =>
      supabase
        .from('businesses')
        .select('slug, primary_category_slug, primary_subcategory_slug, location, primary_subcategory_label, updated_at, created_at')
        .eq('status', 'active')
        .or('is_system.is.null,is_system.eq.false')
        .range(from, to)
    );
  } catch (error) {
    console.error('[Sitemap] Error fetching business data:', error);
    return [];
  }
}

async function getEvents(): Promise<Array<{ id: string; updated_at: string | null; created_at: string | null }>> {
  try {
    const supabase = getSitemapSupabase();
    const today = new Date().toISOString().split('T')[0];

    return await fetchAllRows<{ id: string; updated_at: string | null; created_at: string | null }>((from, to) =>
      supabase
        .from('events_and_specials')
        .select('id, updated_at, created_at')
        .eq('type', 'event')
        .or(`end_date.gte.${today},and(end_date.is.null,start_date.gte.${today})`)
        .range(from, to)
    );
  } catch (error) {
    console.error('[Sitemap] Error fetching events:', error);
    return [];
  }
}

async function getSpecials(): Promise<Array<{ id: string; updated_at: string | null; created_at: string | null }>> {
  try {
    const supabase = getSitemapSupabase();

    return await fetchAllRows<{ id: string; updated_at: string | null; created_at: string | null }>((from, to) =>
      supabase
        .from('events_and_specials')
        .select('id, updated_at, created_at')
        .eq('type', 'special')
        .range(from, to)
    );
  } catch (error) {
    console.error('[Sitemap] Error fetching specials:', error);
    return [];
  }
}

async function getPublicProfiles(): Promise<Array<{ user_id: string; updated_at: string | null; created_at: string | null }>> {
  try {
    const supabase = getSitemapSupabase();

    const rows = await fetchAllRows<any>((from, to) =>
      supabase
        .from('profiles')
        .select('user_id, updated_at, created_at, reviews_count')
        .not('user_id', 'is', null)
        .gt('reviews_count', 0)
        .range(from, to)
    );

    return rows
      .filter((row: any) => typeof row.user_id === 'string' && row.user_id.trim().length > 0)
      .map((row: any) => ({
        user_id: String(row.user_id),
        updated_at: row.updated_at || null,
        created_at: row.created_at || null,
      }));
  } catch (error) {
    console.error('[Sitemap] Error fetching public profiles:', error);
    return [];
  }
}

function toDate(value?: string | null): Date {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function toUniqueSitemapEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const entry of entries) {
    if (!entry?.url || typeof entry.url !== 'string') continue;
    const existing = byUrl.get(entry.url);

    if (!existing || new Date(entry.lastModified ?? 0) > new Date(existing.lastModified ?? 0)) {
      byUrl.set(entry.url, entry);
    }
  }

  return Array.from(byUrl.values()).sort((a, b) => a.url.localeCompare(b.url));
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businessRows, events, specials, profiles] = await Promise.all([
    getAllBusinessData(),
    getEvents(),
    getSpecials(),
    getPublicProfiles(),
  ]);

  const staticUrls: MetadataRoute.Sitemap = staticPublicPages.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const businessUrls: MetadataRoute.Sitemap = businessRows
    .filter((row) => typeof row.slug === 'string' && row.slug.trim().length > 0)
    .map((row) => ({
      url: `${SITE_URL}/business/${String(row.slug).trim()}`,
      lastModified: toDate(row.updated_at || row.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const categoryMap = new Map<string, Date>();
  const subcategoryMap = new Map<string, Date>();

  for (const row of businessRows) {
    const lastModified = toDate(row.updated_at || row.created_at);

    if (row.primary_category_slug) {
      const categoryPath = `/categories/${row.primary_category_slug}`;
      const existing = categoryMap.get(categoryPath);
      if (!existing || existing < lastModified) {
        categoryMap.set(categoryPath, lastModified);
      }
    }

    if (row.primary_category_slug && row.primary_subcategory_slug) {
      const subcategoryPath = `/categories/${row.primary_category_slug}/${row.primary_subcategory_slug}`;
      const existing = subcategoryMap.get(subcategoryPath);
      if (!existing || existing < lastModified) {
        subcategoryMap.set(subcategoryPath, lastModified);
      }
    }
  }

  const categoryUrls: MetadataRoute.Sitemap = Array.from(categoryMap.entries()).map(([path, lastModified]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }));

  const subcategoryUrls: MetadataRoute.Sitemap = Array.from(subcategoryMap.entries()).map(([path, lastModified]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const citySlugMap = new Map<string, { updated_at: string | null; created_at: string | null }>();

  for (const row of businessRows) {
    const location = typeof row.location === 'string' ? row.location : '';
    const category = typeof row.primary_subcategory_label === 'string' ? row.primary_subcategory_label : '';
    const city = location.split(',')[0]?.trim();

    if (!city || !category) continue;

    const citySlug = toSlug(city);
    const categorySlug = toSlug(category);
    if (!citySlug || !categorySlug) continue;

    const slug = `${citySlug}-${categorySlug}`;
    if (!citySlugMap.has(slug)) {
      citySlugMap.set(slug, { updated_at: row.updated_at || null, created_at: row.created_at || null });
    }
  }

  const cityUrls: MetadataRoute.Sitemap = Array.from(citySlugMap.entries()).map(([slug, dates]) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: toDate(dates.updated_at || dates.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.65,
  }));

  const eventUrls: MetadataRoute.Sitemap = events
    .filter((event) => typeof event.id === 'string' && event.id.trim().length > 0)
    .map((event) => ({
      url: `${SITE_URL}/event/${String(event.id).trim()}`,
      lastModified: toDate(event.updated_at || event.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const specialUrls: MetadataRoute.Sitemap = specials
    .filter((special) => typeof special.id === 'string' && special.id.trim().length > 0)
    .map((special) => ({
      url: `${SITE_URL}/special/${String(special.id).trim()}`,
      lastModified: toDate(special.updated_at || special.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const profileUrls: MetadataRoute.Sitemap = profiles
    .filter((profile) => typeof profile.user_id === 'string' && profile.user_id.trim().length > 0)
    .map((profile) => ({
      url: `${SITE_URL}/reviewer/${String(profile.user_id).trim()}`,
      lastModified: toDate(profile.updated_at || profile.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return toUniqueSitemapEntries([
    ...staticUrls,
    ...categoryUrls,
    ...subcategoryUrls,
    ...businessUrls,
    ...eventUrls,
    ...specialUrls,
    ...cityUrls,
    ...profileUrls,
  ]);
}
