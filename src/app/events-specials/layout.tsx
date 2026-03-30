import { Metadata } from "next";
import { PageMetadata, SITE_URL } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";
import { generateEventSchema } from "../lib/utils/schemaMarkup";
import { getServerSupabase } from "../lib/supabase/server";

export const metadata: Metadata = PageMetadata.eventsSpecials();

const webPageSchema = generateWebPageSchema({
  name: "Events & Specials in Cape Town | Sayso",
  path: "/events-specials",
  description:
    "Seasonal happenings, limited-time deals, and special events across Cape Town — curated by the Sayso community.",
  breadcrumbs: [
    { name: "Home", path: "/home" },
    { name: "Events & Specials", path: "/events-specials" },
  ],
});

export default async function EventsSpecialsLayout({ children }: { children: React.ReactNode }) {
  // Fetch upcoming events for Event structured data (Google Events carousel eligibility)
  let eventSchemas: object[] = [];
  try {
    const supabase = await getServerSupabase();
    const { data: upcomingEvents } = await supabase
      .from("events_and_specials")
      .select(
        "id, title, description, start_date, end_date, location, image, type, businesses(name, slug)"
      )
      .eq("type", "event")
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(10);

    if (upcomingEvents && upcomingEvents.length > 0) {
      eventSchemas = upcomingEvents.map((ev: any) =>
        generateEventSchema({
          name: ev.title,
          description: ev.description || undefined,
          startDate: ev.start_date,
          endDate: ev.end_date || undefined,
          location:
            ev.location || (ev.businesses?.name ? `${ev.businesses.name}, Cape Town` : "Cape Town"),
          image: ev.image || undefined,
          url: `${SITE_URL}/events-specials`,
        })
      );
    }
  } catch {
    // Non-critical — schema generation failure must never break the page render
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema).replace(/</g, "\u003c") }}
      />
      {eventSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }}
        />
      ))}
      <h1 className="sr-only">Cape Town events and specials | Sayso</h1>
      {children}
    </>
  );
}
