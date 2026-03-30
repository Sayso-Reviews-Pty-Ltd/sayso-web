import { Metadata } from "next";
import { generateSEOMetadata, SITE_URL } from "../../lib/utils/seoMetadata";
import { getServerSupabase } from "../../lib/supabase/server";
import {
  generateBreadcrumbSchema,
  generateCollectionPageSchema,
  generateItemListSchema,
} from "../../lib/utils/schemaMarkup";
import { normalizeBusinessImages } from "../../lib/utils/businessImages";
import CategoryPageClient from "../../category/[slug]/CategoryPageClient";
import SchemaMarkup from "../../components/SEO/SchemaMarkup";

export const metadata: Metadata = generateSEOMetadata({
  title: "Best Restaurants in Cape Town | Sayso Reviews",
  description:
    "Discover the best restaurants in Cape Town with 1,000+ community reviews. From fine dining to street food — find where Cape Town actually eats.",
  keywords: [
    "restaurants cape town",
    "best restaurants cape town",
    "cape town food",
    "where to eat cape town",
    "sayso",
  ],
  url: "/restaurants-cape-town",
  type: "website",
});

export default async function RestaurantsCapeTown() {
  const supabase = await getServerSupabase();
  const { data: businesses } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, image_url, location, primary_category_slug, average_rating:business_stats(average_rating), business_images(id, url, type, sort_order, is_primary)"
    )
    .eq("primary_category_slug", "food-drink")
    .eq("status", "active")
    .or("is_system.is.null,is_system.eq.false")
    .order("created_at", { ascending: false })
    .limit(50);

  const normalized = (businesses || []).map((b: any) => ({
    ...b,
    uploaded_images: normalizeBusinessImages(b).uploaded_images,
  }));

  const canonicalUrl = `${SITE_URL}/restaurants-cape-town`;

  const schemas = [
    generateCollectionPageSchema({
      name: "Best Restaurants in Cape Town",
      description: "Discover the best restaurants in Cape Town with community reviews on Sayso.",
      url: canonicalUrl,
    }),
    generateItemListSchema(
      "Best Restaurants in Cape Town",
      "Top-rated restaurants in Cape Town — ranked by Sayso community reviews.",
      normalized.map((b: any) => ({
        name: b.name,
        url: `${SITE_URL}/business/${b.slug || b.id}`,
        image: normalized[0]?.uploaded_images?.[0] || b.image_url,
        rating: b.average_rating?.[0]?.average_rating || 0,
      }))
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Restaurants in Cape Town", url: canonicalUrl },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <nav aria-label="Restaurant links" className="sr-only">
        <ul>
          {normalized.slice(0, 30).map((b: any) => (
            <li key={b.id}>
              <a href={`/business/${b.slug || b.id}`}>{b.name}</a>
            </li>
          ))}
        </ul>
      </nav>
      <CategoryPageClient
        categoryName="Food & Drink"
        categorySlug="food-drink"
        businesses={normalized}
      />
    </>
  );
}
