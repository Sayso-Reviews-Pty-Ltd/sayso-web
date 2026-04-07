import { Metadata } from "next";
import { PageMetadata } from "../lib/utils/seoMetadata";

export const metadata: Metadata = PageMetadata.register();

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
