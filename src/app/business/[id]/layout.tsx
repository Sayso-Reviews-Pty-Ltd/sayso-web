import { Metadata } from 'next';
import { getServerSupabase } from '../../lib/supabase/server';
import { DEFAULT_SITE_DESCRIPTION, generateSEOMetadata, SITE_URL } from '../../lib/utils/seoMetadata';
import SchemaMarkup from '../../components/SEO/SchemaMarkup';
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateReviewSchema } from '../../lib/utils/schemaMarkup';
import Link from 'next/link';

interface BusinessLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Generate dynamic metadata for business pages
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let business: any = null;
  let actualId: string = id;
  
  try {
    const supabase = await getServerSupabase();
    
    // Try slug first, then ID
    // Try by slug
    const { data: slugData } = await supabase
      .from('businesses')
      .select('id, slug')
      .eq('slug', id)
      .eq('status', 'active')
      .or('is_system.is.null,is_system.eq.false')
      .single();
    
    actualId = slugData?.id || id;
    
    // Fetch business data
    const { data } = await supabase
      .from('businesses')
      .select('name, description, image_url, business_images(url, is_primary, sort_order), slug, primary_category_slug, primary_subcategory_label, category_raw, business_stats(average_rating, total_reviews)')
      .eq('id', actualId)
      .eq('status', 'active')
      .or('is_system.is.null,is_system.eq.false')
      .single();
    
    if (data) {
      business = data;
    }
  } catch (error) {
    const digest = (error as any)?.digest;
    if (digest !== 'DYNAMIC_SERVER_USAGE') {
      console.error('[Business Metadata] Error fetching business:', error);
    }
  }

  if (!business) {
    return generateSEOMetadata({
      title: 'Business details | Sayso',
      description: DEFAULT_SITE_DESCRIPTION,
      url: `/business/${id}`,
      noindex: true,
      nofollow: true,
    });
  }

  const businessSlug = business.slug || id;
  const categoryLabel =
    business.primary_subcategory_label || business.category_raw || business.primary_category_slug || '';
  const stats = (business as any).business_stats?.[0] ?? null;
  const rating: number | null = stats?.average_rating ?? null;
  const reviewCount: number = stats?.total_reviews ?? 0;
  const ratingStr = rating !== null
    ? `${rating.toFixed(1)} ★ · ${reviewCount} review${reviewCount !== 1 ? 's' : ''} · `
    : '';
  const description =
    `${ratingStr}${categoryLabel ? `${categoryLabel} in Cape Town. ` : ''}${business.description ?? ''}`.trim() ||
    `${business.name} on Sayso. Hyper-local reviews, ratings, and discovery details for Cape Town locals.`;

  return generateSEOMetadata({
    title: `${business.name} reviews in Cape Town | Sayso`,
    description,
    keywords: [business.name, 'sayso reviews', 'cape town business reviews', categoryLabel],
    image: `${SITE_URL}/api/og/business/${id}`,
    url: `/business/${businessSlug}`,
    type: 'article',
  });
}

export default async function BusinessLayout({
  children,
  params,
}: BusinessLayoutProps) {
  const { id } = await params;
  
  // Fetch business data for schema
  let schemas: any[] = [];
  let relatedLinks: Array<{ href: string; label: string }> = [];
  let businessSummary: {
    name: string;
    description: string;
    category: string;
    location: string;
    rating: number | null;
    reviewCount: number;
  } | null = null;
  try {
    const supabase = await getServerSupabase();
    
    // Try slug first, then ID
    const { data: slugData } = await supabase
      .from('businesses')
      .select('id, slug')
      .eq('slug', id)
      .eq('status', 'active')
      .or('is_system.is.null,is_system.eq.false')
      .single();
    
    const actualId = slugData?.id || id;
    
    const { data: business } = await supabase
      .from('businesses')
      .select(`
        name,
        description,
        image_url,
        business_images(url, is_primary, sort_order),
        slug,
        primary_category_slug,
        primary_subcategory_label,
        category_raw,
        phone,
        email,
        address,
        location,
        lat,
        lng,
        price_range,
        business_stats(average_rating, total_reviews)
      `)
      .eq('id', actualId)
      .eq('status', 'active')
      .or('is_system.is.null,is_system.eq.false')
      .single();

    // Fetch up to 5 most helpful reviews for Review schema (rich results)
    const { data: reviewRows } = await supabase
      .from('reviews')
      .select('rating, content, created_at, profiles(username)')
      .eq('business_id', actualId)
      .not('content', 'is', null)
      .order('helpful_count', { ascending: false })
      .limit(5);

    if (business) {
      const businessSlug = business.slug || id;
      const categoryLabel =
        business.primary_subcategory_label || business.category_raw || business.primary_category_slug || 'Business';
      const categorySlug = business.primary_category_slug || toSlug(categoryLabel);
      const citySlug = business.location
        ? toSlug(String(business.location).split(',')[0])
        : '';
      const businessImages = Array.isArray((business as any).business_images)
        ? [...(business as any).business_images].sort((a: any, b: any) => {
            if (a?.is_primary && !b?.is_primary) return -1;
            if (!a?.is_primary && b?.is_primary) return 1;
            return Number(a?.sort_order || 0) - Number(b?.sort_order || 0);
          })
        : [];
      
      // Generate LocalBusiness schema
      const businessSchema = generateLocalBusinessSchema({
        name: business.name,
        description: business.description || `${categoryLabel} located in ${business.location || 'Cape Town'}`,
        image: businessImages[0]?.url || business.image_url || undefined,
        url: `${SITE_URL}/business/${businessSlug}`,
        telephone: business.phone || undefined,
        email: business.email || undefined,
        address: business.address ? {
          streetAddress: business.address.split(',')[0] || business.address,
          addressLocality: business.location || 'Cape Town',
          addressCountry: 'ZA',
        } : undefined,
        geo: business.lat != null && business.lng != null ? {
          latitude: business.lat,
          longitude: business.lng,
        } : undefined,
        priceRange: business.price_range || undefined,
        aggregateRating: business.business_stats?.[0]?.average_rating && (business.business_stats?.[0]?.total_reviews || 0) > 0 ? {
          ratingValue: business.business_stats[0].average_rating,
          reviewCount: business.business_stats[0].total_reviews || 0,
          bestRating: 5,
          worstRating: 1,
        } : undefined,
        category: categoryLabel || undefined,
      });

      businessSummary = {
        name: business.name,
        description: business.description || `${categoryLabel} located in ${business.location || 'Cape Town'}`,
        category: categoryLabel || 'Business',
        location: business.location || 'Cape Town',
        rating: business.business_stats?.[0]?.average_rating ?? null,
        reviewCount: business.business_stats?.[0]?.total_reviews || 0,
      };
      
      // Generate Breadcrumb schema
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: `${SITE_URL}/` },
        { name: categoryLabel, url: `${SITE_URL}/categories/${categorySlug}` },
        { name: business.name, url: `${SITE_URL}/business/${businessSlug}` },
      ]);
      
      // Generate Review schemas for rich results
      const reviewSchemas = reviewRows && reviewRows.length > 0
        ? generateReviewSchema(
            reviewRows
              .filter((r: any) => r.rating && r.content)
              .map((r: any) => ({
                author: (r.profiles as any)?.username || 'Sayso User',
                ratingValue: r.rating,
                reviewBody: r.content,
                datePublished: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
              }))
          )
        : [];

      schemas = [businessSchema, breadcrumbSchema, ...reviewSchemas];
      relatedLinks = [
        { href: `/categories/${categorySlug}`, label: `More in ${categoryLabel}` },
        ...(citySlug ? [{ href: `/${citySlug}`, label: `More in ${business.location}` }] : []),
      ];
    }
  } catch (error) {
    // DYNAMIC_SERVER_USAGE is expected during ISR background regeneration — suppress it.
    const digest = (error as any)?.digest;
    if (digest !== 'DYNAMIC_SERVER_USAGE') {
      console.error('[Business Layout] Error generating schema:', error);
    }
  }

  return (
    <>
      {schemas.length > 0 && <SchemaMarkup schemas={schemas} />}
      {businessSummary && (
        <article aria-label="Business summary" className="sr-only">
          <h1>{businessSummary.name}</h1>
          <p>{businessSummary.description}</p>
          <p>{businessSummary.category} in {businessSummary.location}</p>
          {businessSummary.rating !== null && (
            <p>
              Rated {businessSummary.rating.toFixed(1)} out of 5 from {businessSummary.reviewCount} review{businessSummary.reviewCount === 1 ? '' : 's'}.
            </p>
          )}
        </article>
      )}
      {relatedLinks.length > 0 && (
        <nav aria-label="Related links" className="sr-only">
          <ul>
            {relatedLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {children}
    </>
  );
}

