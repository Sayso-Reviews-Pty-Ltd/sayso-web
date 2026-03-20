import type { Event } from "../../lib/types/Event";

const normalizeEventKeyPart = (value: string | null | undefined): string =>
  (value ?? "").trim().toLowerCase();

export const getStableEventRailKey = (event: Event): string => {
  if (event.id?.trim()) {
    return event.id;
  }

  return [
    normalizeEventKeyPart(event.type),
    normalizeEventKeyPart(event.title),
    normalizeEventKeyPart(event.startDateISO || event.startDate),
    normalizeEventKeyPart(event.endDateISO || event.endDate),
    normalizeEventKeyPart(event.location),
    normalizeEventKeyPart(event.businessId),
    normalizeEventKeyPart(event.href),
    normalizeEventKeyPart(event.canonicalKey),
  ].join("|");
};

export const formatCtaLabel = (cta: string): string =>
  cta
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
