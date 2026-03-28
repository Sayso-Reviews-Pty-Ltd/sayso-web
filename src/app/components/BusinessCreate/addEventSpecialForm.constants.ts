import { Urbanist } from "next/font/google";
import type { ContentType } from "./addEventSpecialForm.types";

export const urbanist = Urbanist({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const CTA_SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "quicket", label: "Quicket" },
  { value: "webtickets", label: "Webtickets" },
  { value: "other", label: "Other" },
] as const;

export const COPY: Record<
  ContentType,
  {
    pageTitle: string;
    heroTitle: string;
    heroSubtitle: string;
    submitLabel: string;
    successLabel: string;
    emptyBusinessesCopy: string;
  }
> = {
  event: {
    pageTitle: "Add Event",
    heroTitle: "Create Event",
    heroSubtitle: "Publish a business-linked event or a community-hosted event",
    submitLabel: "Publish Event",
    successLabel: "Event published successfully",
    emptyBusinessesCopy:
      "No linked businesses found. You can still publish a community-hosted event.",
  },
  special: {
    pageTitle: "Add Special",
    heroTitle: "Create Special",
    heroSubtitle: "Publish a new special offer for your business audience",
    submitLabel: "Publish Special",
    successLabel: "Special published successfully",
    emptyBusinessesCopy: "You need at least one business before you can publish a special.",
  },
};

export const sectionClassName =
  "relative bg-white rounded-[12px] overflow-hidden border border-charcoal/10 shadow-md px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-10 xl:px-16 xl:py-12 font-urbanist";

export const inputClassName =
  "w-full bg-white border pl-4 pr-4 py-3 sm:py-4 md:py-5 text-body font-semibold font-urbanist text-charcoal placeholder-charcoal/50 placeholder:font-normal focus:outline-none focus:ring-2 transition-all duration-300 hover:border-sage/50 input-mobile rounded-full border-charcoal/15 focus:ring-navbar-bg/30 focus:border-navbar-bg";

export const textareaClassName =
  "w-full bg-white border pl-4 pr-4 py-3 sm:py-4 md:py-5 text-body font-semibold font-urbanist text-charcoal placeholder-charcoal/50 placeholder:font-normal focus:outline-none focus:ring-2 transition-all duration-300 hover:border-sage/50 input-mobile rounded-[12px] border-charcoal/15 focus:ring-navbar-bg/30 focus:border-navbar-bg resize-none";

export const ICON_CHIP_CLASS =
  "grid h-10 w-10 place-items-center rounded-full bg-off-white/70 text-charcoal/85 transition-colors duration-200 hover:bg-off-white/90";

export const SMALL_ICON_CHIP_CLASS =
  "inline-flex h-6 w-6 items-center justify-center rounded-full bg-off-white/80 text-charcoal/85";

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
