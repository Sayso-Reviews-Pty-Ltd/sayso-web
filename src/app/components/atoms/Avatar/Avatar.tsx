"use client";

import React from "react";
import { Avatar as AvatarRoot, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  /** Override the text used to derive initials. Falls back to `alt`. */
  fallback?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: "w-6 h-6", text: "text-xs" },
  sm: { container: "w-8 h-8", text: "text-sm" },
  md: { container: "w-10 h-10", text: "text-base" },
  lg: { container: "w-16 h-16", text: "text-xl" },
  xl: { container: "w-24 h-24", text: "text-lg" },
};

/**
 * Derives 1–2 uppercase initials from a name/alt string.
 *
 * Edge cases handled:
 * - null / undefined / empty → "U"
 * - whitespace-only → "U"
 * - single word → first two characters ("Alex" → "AL")
 * - multi-word → first char of each of the first two words
 * - leading/trailing non-letter chars are stripped before parsing
 */
export function getInitials(value?: string | null): string {
  if (!value) return "U";
  const stripped = value.trim();
  if (!stripped) return "U";

  // Split on whitespace, keep only segments with at least one alphanumeric char
  const words = stripped.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w));
  if (words.length === 0) return "U";

  if (words.length === 1) {
    // Pick the first two alphanumeric characters from the single word
    const chars = words[0].replace(/[^a-zA-Z0-9]/g, "");
    return chars.slice(0, 2).toUpperCase() || "U";
  }

  const first = words[0].replace(/[^a-zA-Z0-9]/g, "")[0] ?? "";
  const second = words[1].replace(/[^a-zA-Z0-9]/g, "")[0] ?? "";
  return `${first}${second}`.toUpperCase() || "U";
}

/** Returns undefined for null / undefined / whitespace-only src values. */
function normalizeSrc(src?: string | null): string | undefined {
  if (!src || typeof src !== "string") return undefined;
  const trimmed = src.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  size = "md",
  fallback,
  className = "",
}) => {
  const { container, text } = sizeStyles[size];
  const normalizedSrc = normalizeSrc(src);
  const initials = getInitials(fallback ?? alt);

  return (
    <AvatarRoot className={cn(container, className)}>
      {normalizedSrc && <AvatarImage src={normalizedSrc} alt={alt || initials} />}
      {/* delayMs prevents fallback flash while the image is fetching */}
      <AvatarFallback delayMs={normalizedSrc ? 200 : 0} className={cn("font-semibold", text)}>
        {initials}
      </AvatarFallback>
    </AvatarRoot>
  );
};
