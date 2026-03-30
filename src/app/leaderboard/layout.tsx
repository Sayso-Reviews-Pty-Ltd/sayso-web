import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";
import { generateWebPageSchema } from "../lib/utils/sitelinkSchema";

export const metadata: Metadata = PageMetadata.leaderboard();

const schema = generateWebPageSchema({
  name: "Leaderboard | Sayso",
  path: "/leaderboard",
  description:
    "Top-rated places and top contributors on Sayso — Cape Town's most trusted community reviewers.",
  breadcrumbs: [
    { name: "Home", path: "/home" },
    { name: "Leaderboard", path: "/leaderboard" },
  ],
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
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
