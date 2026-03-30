import { z } from "zod";

const SITE_URL = "https://www.sayso.co.za";
const SITE_NAME = "Sayso";

const BUSINESS_TYPE_MAP = {
  Restaurant: "Restaurant",
  Cafe: "CafeOrCoffeeShop",
  Bar: "BarOrPub",
  Beauty: "BeautySalon",
  Spa: "HealthAndBeautyBusiness",
  Gym: "ExerciseGym",
  Salon: "BeautySalon",
  Store: "Store",
  Service: "LocalBusiness",
};

export function registerSchemaTools(server) {
  server.tool(
    "generate_local_business_schema",
    "Generate a complete LocalBusiness JSON-LD schema for a Sayso business page. Includes AggregateRating for star ratings in Google SERPs.",
    {
      name: z.string().describe("Business name"),
      description: z.string().describe("Business description"),
      url: z.string().describe("Full business page URL"),
      telephone: z.string().optional(),
      streetAddress: z.string().optional(),
      city: z.string().default("Cape Town"),
      postalCode: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      ratingValue: z.number().min(1).max(5).optional().describe("Average rating 1–5"),
      reviewCount: z.number().optional(),
      category: z
        .enum(["Restaurant", "Cafe", "Bar", "Beauty", "Spa", "Gym", "Salon", "Store", "Service"])
        .optional(),
      priceRange: z.string().optional().describe('e.g. "R" or "RR" or "RRR"'),
      image: z.string().optional(),
    },
    async (input) => {
      const schema = {
        "@context": "https://schema.org",
        "@type": BUSINESS_TYPE_MAP[input.category] ?? "LocalBusiness",
        name: input.name,
        description: input.description,
        url: input.url,
        ...(input.image && { image: input.image }),
        ...(input.telephone && { telephone: input.telephone }),
        ...(input.priceRange && { priceRange: input.priceRange }),
        address: {
          "@type": "PostalAddress",
          streetAddress: input.streetAddress ?? "",
          addressLocality: input.city,
          addressCountry: "ZA",
          ...(input.postalCode && { postalCode: input.postalCode }),
        },
        ...(input.latitude != null &&
          input.longitude != null && {
            geo: {
              "@type": "GeoCoordinates",
              latitude: input.latitude,
              longitude: input.longitude,
            },
          }),
        ...(input.ratingValue != null &&
          input.reviewCount != null && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: input.ratingValue,
              reviewCount: input.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }),
      };
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
    }
  );

  server.tool(
    "generate_faq_schema",
    "Generate FAQPage JSON-LD schema. FAQ schema unlocks expandable Q&A rich results in Google, increasing CTR significantly.",
    {
      faqs: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .min(1)
        .describe("Array of question/answer pairs"),
    },
    async ({ faqs }) => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      };
      const note = `\n\n// Add this to your page's <script type="application/ld+json"> block.\n// Good questions for business pages: "Is [name] open on Sundays?", "How do I book at [name]?", "Does [name] have parking?"`;
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) + note }] };
    }
  );

  server.tool(
    "generate_event_schema",
    "Generate Event JSON-LD schema. Enables Google Events carousel and rich result cards with date, location, and ticket info.",
    {
      name: z.string(),
      description: z.string().optional(),
      startDate: z.string().describe('ISO 8601 datetime e.g. "2025-04-01T19:00"'),
      endDate: z.string().optional(),
      location: z.string().default("Cape Town"),
      image: z.string().optional(),
      url: z.string(),
      price: z.number().optional().describe("Ticket price in ZAR (0 for free)"),
    },
    async (input) => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: input.name,
        startDate: input.startDate,
        ...(input.endDate && { endDate: input.endDate }),
        ...(input.description && { description: input.description }),
        ...(input.image && { image: input.image }),
        url: input.url,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: input.location,
          address: `${input.location}, South Africa`,
        },
        organizer: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        ...(input.price != null && {
          offers: {
            "@type": "Offer",
            price: input.price,
            priceCurrency: "ZAR",
            availability: "https://schema.org/InStock",
            url: input.url,
          },
        }),
      };
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
    }
  );

  server.tool(
    "generate_breadcrumb_schema",
    "Generate BreadcrumbList JSON-LD schema. Breadcrumbs appear in Google search results under the URL, improving CTR.",
    {
      items: z
        .array(z.object({ name: z.string(), url: z.string() }))
        .min(2)
        .describe("Ordered breadcrumb items from root to current page"),
    },
    async ({ items }) => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
        })),
      };
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
    }
  );

  server.tool(
    "validate_json_ld",
    "Validate a JSON-LD schema string for common structural issues before deploying. Returns issues and a link to Google Rich Results Test.",
    { schema: z.string().describe("Raw JSON-LD string to validate") },
    async ({ schema: schemaStr }) => {
      let parsed;
      try {
        parsed = JSON.parse(schemaStr);
      } catch (e) {
        return { content: [{ type: "text", text: `❌ Invalid JSON: ${e.message}` }] };
      }

      const issues = [];
      const schemas = Array.isArray(parsed) ? parsed : [parsed];
      for (const s of schemas) {
        if (!s["@context"]) issues.push('Missing @context (must be "https://schema.org")');
        if (!s["@type"]) issues.push("Missing @type");
        if (s["@context"] && !String(s["@context"]).includes("schema.org")) {
          issues.push("@context must reference schema.org");
        }
        if (
          [
            "LocalBusiness",
            "Restaurant",
            "CafeOrCoffeeShop",
            "BarOrPub",
            "BeautySalon",
            "ExerciseGym",
          ].includes(s["@type"])
        ) {
          if (!s.name) issues.push(`${s["@type"]}: missing required field "name"`);
          if (!s.address) issues.push(`${s["@type"]}: missing recommended field "address"`);
          if (!s.aggregateRating)
            issues.push(
              `${s["@type"]}: missing "aggregateRating" — required for star ratings in SERPs`
            );
        }
        if (s["@type"] === "FAQPage") {
          if (!Array.isArray(s.mainEntity) || s.mainEntity.length === 0) {
            issues.push("FAQPage: mainEntity must be a non-empty array of Question objects");
          }
        }
        if (s["@type"] === "Event") {
          if (!s.startDate) issues.push('Event: missing required field "startDate"');
          if (!s.location) issues.push('Event: missing required field "location"');
          if (!s.organizer) issues.push('Event: missing recommended field "organizer"');
        }
      }

      const output =
        issues.length === 0
          ? "✅ Schema is structurally valid.\n\nTest at: https://search.google.com/test/rich-results"
          : `⚠️ ${issues.length} issue(s) found:\n${issues.map((i) => `- ${i}`).join("\n")}\n\nFix and test at: https://search.google.com/test/rich-results`;
      return { content: [{ type: "text", text: output }] };
    }
  );
}
