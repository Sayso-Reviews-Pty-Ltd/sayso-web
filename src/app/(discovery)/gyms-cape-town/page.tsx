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
  title: "Best Gyms & Fitness in Cape Town | Sayso Reviews",
  description:
    "Find the best gyms, CrossFit boxes, yoga studios, and fitness centres in Cape Town. Community-reviewed — no ads, just real ratings.",
  keywords: [
    "gyms cape town",
    "fitness cape town",
    "gym reviews cape town",
    "crossfit cape town",
    "yoga cape town",
    "sayso",
  ],
  url: "/gyms-cape-town",
  type: "website",
});

export default async function GymsCapeTown() {
  const supabase = await getServerSupabase();
  const { data: businesses } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, image_url, location, primary_category_slug, average_rating:business_stats(average_rating), business_images(id, url, type, sort_order, is_primary)"
    )
    .eq("primary_category_slug", "beauty-wellness")
    .eq("status", "active")
    .or("is_system.is.null,is_system.eq.false")
    .order("created_at", { ascending: false })
    .limit(50);

  const normalized = (businesses || []).map((b: any) => ({
    ...b,
    uploaded_images: normalizeBusinessImages(b).uploaded_images,
  }));

  const canonicalUrl = `${SITE_URL}/gyms-cape-town`;

  const schemas = [
    generateCollectionPageSchema({
      name: "Best Gyms & Fitness in Cape Town",
      description: "Discover the best gyms and fitness studios in Cape Town on Sayso.",
      url: canonicalUrl,
    }),
    generateItemListSchema(
      "Best Gyms & Fitness in Cape Town",
      "Top-rated gyms and fitness centres in Cape Town — ranked by Sayso community reviews.",
      normalized.map((b: any) => ({
        name: b.name,
        url: `${SITE_URL}/business/${b.slug || b.id}`,
        image: normalized[0]?.uploaded_images?.[0] || b.image_url,
        rating: b.average_rating?.[0]?.average_rating || 0,
      }))
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Gyms & Fitness in Cape Town", url: canonicalUrl },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <nav aria-label="Gym links" className="sr-only">
        <ul>
          {normalized.slice(0, 30).map((b: any) => (
            <li key={b.id}>
              <a href={`/business/${b.slug || b.id}`}>{b.name}</a>
            </li>
          ))}
        </ul>
      </nav>
      <CategoryPageClient
        categoryName="Beauty & Wellness"
        categorySlug="beauty-wellness"
        businesses={normalized}
      />
    </>
  );
}
