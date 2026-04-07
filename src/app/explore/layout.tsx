import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";

export const metadata: Metadata = PageMetadata.explore();

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
