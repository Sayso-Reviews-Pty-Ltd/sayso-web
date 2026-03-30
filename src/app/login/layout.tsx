import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";

export const metadata: Metadata = PageMetadata.login();

const schema = generateWebPageSchema({
  name: "Sign In | Sayso",
  path: "/login",
  description:
    "Sign in to Sayso to access your personalised Cape Town discovery feed, reviews, and saved places.",
  breadcrumbs: [
    { name: "Home", path: "/home" },
    { name: "Sign In", path: "/login" },
  ],
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
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
