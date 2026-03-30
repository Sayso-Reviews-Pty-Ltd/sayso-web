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
  title: "Best Coffee Shops in Cape Town | Sayso Reviews",
  description:
    "Discover Cape Town's best coffee shops and cafes — community reviewed. Find your next favourite spot for a flat white or filter brew.",
  keywords: [
    "coffee shops cape town",
    "cafes cape town",
    "best coffee cape town",
    "flat white cape town",
    "sayso",
  ],
  url: "/coffee-shops-cape-town",
  type: "website",
});

export default async function CoffeeShopsCapeTown() {
  const supabase = await getServerSupabase();
  const { data: businesses } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, image_url, location, primary_category_slug, average_rating:business_stats(average_rating), business_images(id, url, type, sort_order, is_primary)"
    )
    .eq("primary_subcategory_slug", "cafes-coffee")
    .eq("status", "active")
    .or("is_system.is.null,is_system.eq.false")
    .order("created_at", { ascending: false })
    .limit(50);

  const normalized = (businesses || []).map((b: any) => ({
    ...b,
    uploaded_images: normalizeBusinessImages(b).uploaded_images,
  }));

  const canonicalUrl = `${SITE_URL}/coffee-shops-cape-town`;

  const schemas = [
    generateCollectionPageSchema({
      name: "Best Coffee Shops in Cape Town",
      description: "Discover the best coffee shops and cafes in Cape Town on Sayso.",
      url: canonicalUrl,
    }),
    generateItemListSchema(
      "Best Coffee Shops in Cape Town",
      "Top-rated coffee shops and cafes in Cape Town — ranked by Sayso community reviews.",
      normalized.map((b: any) => ({
        name: b.name,
        url: `${SITE_URL}/business/${b.slug || b.id}`,
        image: normalized[0]?.uploaded_images?.[0] || b.image_url,
        rating: b.average_rating?.[0]?.average_rating || 0,
      }))
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Coffee Shops in Cape Town", url: canonicalUrl },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <nav aria-label="Coffee shop links" className="sr-only">
        <ul>
          {normalized.slice(0, 30).map((b: any) => (
            <li key={b.id}>
              <a href={`/business/${b.slug || b.id}`}>{b.name}</a>
            </li>
          ))}
        </ul>
      </nav>
      <CategoryPageClient
        categoryName="Cafes & Coffee"
        categorySlug="food-drink"
        businesses={normalized}
      />
    </>
  );
}
