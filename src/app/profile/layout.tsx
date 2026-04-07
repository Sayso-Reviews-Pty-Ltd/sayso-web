import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";

export const metadata: Metadata = PageMetadata.profile();

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
