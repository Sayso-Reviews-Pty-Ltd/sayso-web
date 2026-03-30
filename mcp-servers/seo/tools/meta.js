import { z } from "zod";

const SITE_URL = "https://www.sayso.co.za";
const SITE_NAME = "Sayso";
const SITE_TAGLINE = "Less Guessing, More Confessing.";

const TEMPLATES = {
  business: {
    title: (name) => `${name} reviews in Cape Town | ${SITE_NAME}`,
    desc: (name) =>
      `${name} on Sayso: hyper-local reviews, ratings, photos, and business details for Cape Town discovery.`,
    keywords: (name) => [
      name,
      "sayso reviews",
      "cape town business reviews",
      "hyper-local reviews",
    ],
  },
  event: {
    title: (name) => `${name} in Cape Town | ${SITE_NAME}`,
    desc: (name) =>
      `${name} on Sayso: discover dates, details, and community insights for Cape Town events.`,
    keywords: (name) => [name, "cape town events", "sayso events"],
  },
  category: {
    title: (name) => `${name} in Cape Town | ${SITE_NAME}`,
    desc: (name) =>
      `Discover top-rated ${name.toLowerCase()} in Cape Town with hyper-local community reviews on Sayso.`,
    keywords: (name) => [name, `best ${name.toLowerCase()} cape town`, "sayso", "cape town"],
  },
  city: {
    title: (name) => `${name} business reviews | ${SITE_NAME}`,
    desc: (name) => `Explore hyper-local reviews and discovery guides for ${name} on Sayso.`,
    keywords: (name) => [name, "business reviews", "sayso"],
  },
};

const RECOMMENDATIONS = {
  business: [
    "1. **AggregateRating schema** — single biggest win; unlocks star ratings in Google SERPs",
    '2. **FAQPage schema** — add 3–5 questions like "Is [business] open on Sundays?" for expandable rich results',
    "3. **Review schema** — embed top 3 review JSON-LD blocks for review snippets",
    "4. **OpeningHoursSpecification** — include in LocalBusiness schema for knowledge panel hours",
    "5. **Geo coordinates** — latitude/longitude in schema boosts Local Pack ranking",
    "6. **BreadcrumbList** — Home > [Category] > [Business Name] — breadcrumbs show in SERPs",
    '7. **Title formula** — keep under 60 chars: "[Business Name] reviews in Cape Town | Sayso"',
    "8. **priceRange** — include in schema (R / RR / RRR) for quick consumer signals",
    "9. **Canonical** — must be https://www.sayso.co.za/business/[slug] (no trailing slash issues)",
    "10. **Image alt text** — all business photos need descriptive alt text with business name + city",
  ],
  event: [
    "1. **Event schema with Offer** — required for Google Events carousel (massive visibility)",
    "2. **startDate + endDate** in ISO 8601 — Google rejects events without these",
    "3. **High-quality image** (1200×630 min) — events with images get priority in the carousel",
    '4. **Title with date** — e.g. "Cape Town Jazz Festival April 2025 | Sayso" improves CTR',
    '5. **FAQPage schema** — "How much are tickets?", "Where is the venue?" etc.',
    "6. **BreadcrumbList** — Home > Events & Specials > [Event Name]",
    "7. **eventStatus + eventAttendanceMode** — both required for eligibility",
  ],
  category: [
    "1. **ItemList schema** — list top 10 businesses in the category; enables list rich results",
    "2. **CollectionPage schema** — wrap ItemList in CollectionPage for context",
    '3. **H1 formula** — "Best [Category] in Cape Town" — high-intent keyword',
    '4. **Long-tail targeting** — "best restaurants near me cape town" patterns in body copy',
    "5. **Internal linking** — link to top 5–10 business pages for PageRank flow",
    "6. **BreadcrumbList** — Home > Categories > [Category Name]",
    '7. **Review count in meta description** — "1,200+ community reviews" increases CTR',
  ],
  home: [
    "1. **WebSite schema SearchAction** — verify target URL matches /search?q={search_term_string}",
    "2. **Organization schema sameAs** — ensure Instagram, Facebook, TikTok are all listed",
    '3. **H1 with primary keyword** — "Cape Town Reviews" or "Discover Cape Town"',
    '4. **LCP under 2.5s** — hero image must be preloaded; use fetchpriority="high"',
    "5. **Internal linking** — feature links to top categories, trending, and events pages",
  ],
  search: [
    "1. **noindex paginated results** — only page 1 of search results should be indexed",
    "2. **Canonical on filtered pages** — /search?category=food canonical to /search",
    "3. **Static discovery pages** — create /restaurants-cape-town, /salons-cape-town etc. for SEO value",
    "4. **Avoid parameter duplication** — use canonical or URL normalisation to prevent thin content",
  ],
  profile: [
    "1. **Person + ProfilePage schema** — Google supports ProfilePage as a rich result type",
    "2. **Indexable public profiles** — ensure reviewer profiles with 10+ reviews are crawlable",
    "3. **Unique meta description** — use reviewer name + review count + top category",
  ],
  general: [
    "1. **Submit sitemap** — https://www.sayso.co.za/sitemap.xml to Google Search Console",
    "2. **Core Web Vitals** — LCP < 2.5s, INP < 200ms, CLS < 0.1 — monitor in GSC",
    "3. **Unique titles + descriptions** — audit with audit_page_seo on all key pages",
    "4. **No orphan pages** — every page needs ≥1 internal link pointing to it",
    '5. **Image filenames** — use descriptive names: "kfc-cape-town-menu.webp" not "img_001.webp"',
    "6. **Backlink building** — target Cape Town food blogs, SA travel sites, local directories",
    "7. **hreflang for expansion** — add when launching Joburg or Durban pages",
    "8. **Fix 404s in sitemap** — run audit_page_seo on each sitemap URL periodically",
  ],
};

export function registerMetaTools(server) {
  server.tool(
    "generate_page_meta",
    "Generate an optimised Next.js Metadata object for a Sayso page. Returns ready-to-paste TypeScript with title, description, OG, Twitter, and canonical.",
    {
      pageType: z.enum(["business", "event", "category", "city", "custom"]),
      name: z.string().describe("Primary entity name (business name, event title, category, etc.)"),
      description: z.string().optional().describe("Custom description override"),
      url: z.string().describe("Canonical page path, e.g. /business/kfc-cape-town"),
      image: z.string().optional().describe("Absolute URL of the OG image"),
    },
    async ({ pageType, name, description, url, image }) => {
      const tpl = pageType !== "custom" ? TEMPLATES[pageType] : null;
      const title = tpl ? tpl.title(name) : `${name} | ${SITE_NAME}`;
      const desc =
        description ??
        (tpl
          ? tpl.desc(name)
          : `${name} on Sayso — Cape Town's hyper-local review and discovery platform.`);
      const keywords = tpl ? tpl.keywords(name) : [name, "sayso", "cape town"];
      const canonical = url.startsWith("http") ? url : `${SITE_URL}${url}`;
      const ogImage = image ?? `${SITE_URL}/opengraph-image`;
      const ogType = pageType === "business" || pageType === "event" ? "article" : "website";

      const metadata = {
        title,
        description: desc,
        keywords: keywords.join(", "),
        alternates: { canonical },
        openGraph: {
          title: `${title} | ${SITE_TAGLINE}`,
          description: desc,
          url: canonical,
          siteName: SITE_NAME,
          images: [{ url: ogImage, width: 1200, height: 630, alt: `${name} on ${SITE_NAME}` }],
          locale: "en_ZA",
          type: ogType,
        },
        twitter: { card: "summary_large_image", title, description: desc, images: [ogImage] },
      };

      const titleStatus =
        title.length > 60 ? `⚠️ Too long (${title.length})` : `✅ ${title.length} chars`;
      const descStatus =
        desc.length > 160
          ? `⚠️ Too long (${desc.length})`
          : desc.length < 120
            ? `⚠️ Too short (${desc.length})`
            : `✅ ${desc.length} chars`;

      const output = [
        "## Generated Metadata",
        "```typescript",
        `export const metadata: Metadata = ${JSON.stringify(metadata, null, 2)};`,
        "```",
        "",
        `**Title:** ${titleStatus}`,
        `**Description:** ${descStatus}`,
      ].join("\n");

      return { content: [{ type: "text", text: output }] };
    }
  );

  server.tool(
    "seo_recommendations",
    "Get prioritised, Sayso-specific SEO recommendations for a given page type. Covers schema, metadata, content, and link strategy.",
    {
      pageType: z.enum(["business", "event", "category", "home", "search", "profile", "general"]),
    },
    async ({ pageType }) => {
      const recs = RECOMMENDATIONS[pageType] ?? RECOMMENDATIONS.general;
      const output = [
        `## SEO Recommendations: ${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Pages`,
        "",
        recs.join("\n"),
      ].join("\n");
      return { content: [{ type: "text", text: output }] };
    }
  );

  server.tool(
    "keyword_check",
    "Check how well a target keyword is used in page HTML or text. Checks title, H1, meta description, and keyword density.",
    {
      content: z.string().describe("Page HTML or text content to analyse"),
      targetKeyword: z.string().describe('Primary keyword to check, e.g. "cape town restaurants"'),
    },
    async ({ content, targetKeyword }) => {
      const text = content.replace(/<[^>]+>/g, " ").toLowerCase();
      const kw = targetKeyword.toLowerCase();
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const kwRegex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      const count = (text.match(kwRegex) ?? []).length;
      const density = wordCount > 0 ? ((count / wordCount) * 100).toFixed(2) : "0.00";

      const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
      const inTitle = titleMatch ? titleMatch[1].toLowerCase().includes(kw) : false;
      const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const inH1 = h1Match ? h1Match[1].toLowerCase().includes(kw) : false;
      const descMatch = content.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
      );
      const inDesc = descMatch ? descMatch[1].toLowerCase().includes(kw) : false;

      const densityFlag =
        parseFloat(density) > 3
          ? "⚠️ Over-optimised (may trigger spam filters)"
          : parseFloat(density) < 0.5
            ? "⚠️ Keyword barely present"
            : "✅";

      const lines = [
        `## Keyword Check: "${targetKeyword}"`,
        `- **Occurrences:** ${count} in ${wordCount} words`,
        `- **Density:** ${density}% ${densityFlag}`,
        `- **In <title>:** ${inTitle ? "✅" : "❌ Missing — add keyword to title"}`,
        `- **In <h1>:** ${inH1 ? "✅" : "❌ Missing — add keyword to H1"}`,
        `- **In meta description:** ${inDesc ? "✅" : "❌ Missing — mention keyword in description"}`,
      ];

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
