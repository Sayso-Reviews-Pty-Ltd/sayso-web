export type ContentType = "event" | "special";

export interface OwnedBusinessOption {
  id: string;
  name: string;
  location: string;
}

export interface FormState {
  businessId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  icon: string;
  image: string;
  price: string;
  ctaSource: string;
  ctaLabel: string;
  ctaUrl: string;
  whatsappNumber: string;
  whatsappPrefillTemplate: string;
}
