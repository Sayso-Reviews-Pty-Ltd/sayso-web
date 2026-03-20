import { resolveServerBaseUrl } from "./serverOrigin";

function makeHeaderReader(values: Record<string, string | undefined>): Pick<Headers, "get"> {
  const normalized = Object.entries(values).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  return {
    get: (key: string) => normalized[key.toLowerCase()] ?? null,
  };
}

describe("resolveServerBaseUrl", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "";
    process.env.NEXT_PUBLIC_BASE_URL = "";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
  });

  it("uses x-forwarded host and proto when present", () => {
    const url = resolveServerBaseUrl(
      makeHeaderReader({
        "x-forwarded-host": "www.sayso.co.za",
        "x-forwarded-proto": "https",
        host: "localhost:3000",
      })
    );

    expect(url).toBe("https://www.sayso.co.za");
  });

  it("falls back to host header when forwarded host is missing", () => {
    const url = resolveServerBaseUrl(
      makeHeaderReader({
        host: "app.internal:4000",
      })
    );

    expect(url).toBe("http://app.internal:4000");
  });

  it("falls back to configured environment URL when headers are missing", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://staging.sayso.co.za";

    const url = resolveServerBaseUrl(makeHeaderReader({}));

    expect(url).toBe("https://staging.sayso.co.za");
  });
});
