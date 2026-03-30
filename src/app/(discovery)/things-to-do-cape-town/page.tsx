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
  title: "Things To Do in Cape Town | Sayso Reviews",
  description:
    "The best things to do in Cape Town — community-reviewed experiences, entertainment, and activities. No tourist traps, just real recommendations.",
  keywords: [
    "things to do cape town",
    "activities cape town",
    "entertainment cape town",
    "experiences cape town",
    "sayso",
  ],
  url: "/things-to-do-cape-town",
  type: "website",
});

export default async function ThingsToDoCapeTown() {
  const supabase = await getServerSupabase();
  const { data: businesses } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, description, image_url, location, primary_category_slug, average_rating:business_stats(average_rating), business_images(id, url, type, sort_order, is_primary)"
    )
    .eq("primary_category_slug", "experiences-entertainment")
    .eq("status", "active")
    .or("is_system.is.null,is_system.eq.false")
    .order("created_at", { ascending: false })
    .limit(50);

  const normalized = (businesses || []).map((b: any) => ({
    ...b,
    uploaded_images: normalizeBusinessImages(b).uploaded_images,
  }));

  const canonicalUrl = `${SITE_URL}/things-to-do-cape-town`;

  const schemas = [
    generateCollectionPageSchema({
      name: "Things To Do in Cape Town",
      description: "Discover the best experiences and entertainment in Cape Town on Sayso.",
      url: canonicalUrl,
    }),
    generateItemListSchema(
      "Things To Do in Cape Town",
      "Top-rated experiences and entertainment in Cape Town — ranked by Sayso community reviews.",
      normalized.map((b: any) => ({
        name: b.name,
        url: `${SITE_URL}/business/${b.slug || b.id}`,
        image: normalized[0]?.uploaded_images?.[0] || b.image_url,
        rating: b.average_rating?.[0]?.average_rating || 0,
      }))
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Things To Do in Cape Town", url: canonicalUrl },
    ]),
  ];

  return (
    <>
      <SchemaMarkup schemas={schemas} />
      <nav aria-label="Activity links" className="sr-only">
        <ul>
          {normalized.slice(0, 30).map((b: any) => (
            <li key={b.id}>
              <a href={`/business/${b.slug || b.id}`}>{b.name}</a>
            </li>
          ))}
        </ul>
      </nav>
      <CategoryPageClient
        categoryName="Entertainment & Experiences"
        categorySlug="experiences-entertainment"
        businesses={normalized}
      />
    </>
  );
}
