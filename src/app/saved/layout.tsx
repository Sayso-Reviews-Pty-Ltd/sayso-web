import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";

export const metadata: Metadata = PageMetadata.saved();

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
