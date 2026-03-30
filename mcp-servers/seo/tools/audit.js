import { z } from "zod";

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "SaysoSEOBot/1.0 (+https://sayso.co.za)" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function auditHtml(html, url) {
  const issues = [];
  const warnings = [];
  const passes = [];

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  if (!title) {
    issues.push("Missing <title> tag");
  } else if (title.length < TITLE_MIN) {
    warnings.push(`Title too short (${title.length} chars, min ${TITLE_MIN}): "${title}"`);
  } else if (title.length > TITLE_MAX) {
    warnings.push(`Title too long (${title.length} chars, max ${TITLE_MAX}): "${title}"`);
  } else {
    passes.push(`Title OK (${title.length} chars): "${title}"`);
  }

  // Meta description
  const descMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const desc = descMatch ? descMatch[1].trim() : null;
  if (!desc) {
    issues.push("Missing meta description");
  } else if (desc.length < DESC_MIN) {
    warnings.push(`Meta description too short (${desc.length} chars, min ${DESC_MIN})`);
  } else if (desc.length > DESC_MAX) {
    warnings.push(`Meta description too long (${desc.length} chars, max ${DESC_MAX})`);
  } else {
    passes.push(`Meta description OK (${desc.length} chars)`);
  }

  // Canonical
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  if (!canonical) {
    warnings.push("No canonical URL — risk of duplicate content");
  } else if (!canonical.startsWith("https://www.")) {
    warnings.push(`Canonical should use https://www. — got: ${canonical}`);
  } else {
    passes.push(`Canonical: ${canonical}`);
  }

  // H1
  const h1Matches = html.match(/<h1[^>]*>[^<]*<\/h1>/gi) || [];
  if (h1Matches.length === 0) {
    issues.push("No <h1> tag — required for topical relevance signals");
  } else if (h1Matches.length > 1) {
    warnings.push(`Multiple <h1> tags (${h1Matches.length}) — use exactly one`);
  } else {
    passes.push("Single <h1> present");
  }

  // OG tags
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (!ogTitle) warnings.push("Missing og:title (affects social sharing CTR)");
  else passes.push("og:title present");
  if (!ogDesc) warnings.push("Missing og:description");
  else passes.push("og:description present");
  if (!ogImage) warnings.push("Missing og:image (social cards will be blank)");
  else passes.push("og:image present");

  // JSON-LD structured data
  const jsonLdBlocks = [
    ...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  if (jsonLdBlocks.length === 0) {
    issues.push("No JSON-LD structured data — required for Google rich results");
  } else {
    const types = [];
    for (const block of jsonLdBlocks) {
      try {
        const data = JSON.parse(block[1]);
        const arr = Array.isArray(data) ? data : [data];
        arr.forEach((d) => d["@type"] && types.push(d["@type"]));
      } catch {}
    }
    passes.push(`Structured data: ${types.join(", ") || "(types unreadable)"}`);
  }

  // Images without alt
  const allImgs = [...html.matchAll(/<img[^>]+>/gi)];
  const missingAlt = allImgs.filter((m) => !/\balt=["'][^"']/i.test(m[0]));
  if (missingAlt.length > 0) {
    warnings.push(
      `${missingAlt.length} image(s) missing alt text (hurts image SEO & accessibility)`
    );
  } else if (allImgs.length > 0) {
    passes.push(`All ${allImgs.length} images have alt text`);
  }

  // Robots noindex check
  const robotsMeta = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (robotsMeta && /noindex/i.test(robotsMeta[1])) {
    warnings.push(`Page is noindex: "${robotsMeta[1]}" — Google will not index this page`);
  }

  const total = issues.length + warnings.length + passes.length;
  const score = total > 0 ? Math.round((passes.length / total) * 100) : 0;

  return { url, title, desc, canonical, score, issues, warnings, passes };
}

export function registerAuditTools(server) {
  server.tool(
    "audit_page_seo",
    "Fetch a live page URL and audit its SEO signals: title, meta description, canonical, H1, OG tags, JSON-LD, and image alt text. Returns a score and actionable issue list.",
    {
      url: z
        .string()
        .url()
        .describe("Full URL of the page to audit (e.g. https://www.sayso.co.za/home)"),
    },
    async ({ url }) => {
      let html;
      try {
        html = await fetchPage(url);
      } catch (err) {
        return { content: [{ type: "text", text: `Failed to fetch page: ${err.message}` }] };
      }
      const result = auditHtml(html, url);
      const lines = [
        `## SEO Audit: ${url}`,
        `**Score: ${result.score}/100**`,
        "",
        result.issues.length > 0
          ? `### ❌ Issues (${result.issues.length})\n${result.issues.map((i) => `- ${i}`).join("\n")}`
          : "",
        result.warnings.length > 0
          ? `### ⚠️ Warnings (${result.warnings.length})\n${result.warnings.map((w) => `- ${w}`).join("\n")}`
          : "",
        result.passes.length > 0
          ? `### ✅ Passing (${result.passes.length})\n${result.passes.map((p) => `- ${p}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      return { content: [{ type: "text", text: lines }] };
    }
  );

  server.tool(
    "extract_structured_data",
    "Extract and pretty-print all JSON-LD structured data blocks from a live page URL.",
    { url: z.string().url().describe("Full URL to extract structured data from") },
    async ({ url }) => {
      let html;
      try {
        html = await fetchPage(url);
      } catch (err) {
        return { content: [{ type: "text", text: `Failed to fetch page: ${err.message}` }] };
      }
      const blocks = [
        ...html.matchAll(
          /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
        ),
      ];
      if (blocks.length === 0) {
        return {
          content: [{ type: "text", text: "No JSON-LD structured data found on this page." }],
        };
      }
      const schemas = blocks
        .map((b) => {
          try {
            return JSON.parse(b[1]);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      return { content: [{ type: "text", text: JSON.stringify(schemas, null, 2) }] };
    }
  );
}
