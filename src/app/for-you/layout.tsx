import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";

export const metadata: Metadata = PageMetadata.forYou();

const schema = generateWebPageSchema({
  name: "For You | Sayso",
  path: "/for-you",
  description:
    "Your personalised picks — Cape Town businesses and experiences matched to your tastes.",
  breadcrumbs: [
    { name: "Home", path: "/home" },
    { name: "For You", path: "/for-you" },
  ],
});

export default function ForYouLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
