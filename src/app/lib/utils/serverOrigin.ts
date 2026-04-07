import { headers } from "next/headers";

const DEFAULT_BASE_URL = "http://localhost:3000";

function readForwardedValue(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function toAbsoluteBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  if (/^https?:\/\//i.test(trimmed)) {
    return normalizeBaseUrl(trimmed);
  }
  return normalizeBaseUrl(`https://${trimmed}`);
}

export function resolveServerBaseUrl(
  headerList: Pick<Headers, "get">,
  fallbackBaseUrl?: string
): string {
  const host =
    readForwardedValue(headerList.get("x-forwarded-host")) ??
    readForwardedValue(headerList.get("host"));
  if (host) {
    const protocol = readForwardedValue(headerList.get("x-forwarded-proto")) || "http";
    return `${protocol}://${host}`;
  }

  const envFallback =
    fallbackBaseUrl?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    DEFAULT_BASE_URL;

  return toAbsoluteBaseUrl(envFallback);
}

export async function getServerBaseUrl(fallbackBaseUrl?: string): Promise<string> {
  const headerList = await headers();
  return resolveServerBaseUrl(headerList, fallbackBaseUrl);
}
