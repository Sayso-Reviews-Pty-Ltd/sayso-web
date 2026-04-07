import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";

export const metadata: Metadata = PageMetadata.dealBreakers();

export default function DealBreakersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
