import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";

export const metadata: Metadata = PageMetadata.eventsSpecials();

const schema = generateWebPageSchema({
  name: "Events & Specials in Cape Town | Sayso",
  path: "/events-specials",
  description:
    "Seasonal happenings, limited-time deals, and special events across Cape Town — curated by the Sayso community.",
  breadcrumbs: [
    { name: "Home", path: "/home" },
    { name: "Events & Specials", path: "/events-specials" },
  ],
});

export default function EventsSpecialsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="sr-only">Cape Town events and specials | Sayso</h1>
      {children}
    </>
  );
}
