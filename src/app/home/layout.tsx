import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";

export const metadata: Metadata = PageMetadata.home();

const schema = generateWebPageSchema({
  name: "Home | Sayso",
  path: "/home",
  description:
    "Discover the best restaurants, salons, gyms and more in Cape Town with real community reviews.",
  breadcrumbs: [{ name: "Home", path: "/home" }],
});

export default function HomeLayout({ children }: { children: React.ReactNode }) {
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
