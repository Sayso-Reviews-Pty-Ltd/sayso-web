"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { getInitials } from "../atoms/Avatar/Avatar";

interface MessageBubbleAvatarProps {
  name: string;
  avatarUrl?: string | null;
}

/**
 * Kept for any callers that imported `buildInitials` directly from this module.
 * Delegates to the canonical `getInitials` utility.
 */
export function buildInitials(value: string): string {
  return getInitials(value);
}

export function MessageBubbleAvatar({ name, avatarUrl }: MessageBubbleAvatarProps) {
  const normalizedUrl =
    typeof avatarUrl === "string" && avatarUrl.trim().length > 0 ? avatarUrl.trim() : undefined;

  const initials = getInitials(name);

  return (
    <Avatar className="h-8 w-8 flex-shrink-0 border border-charcoal/15 sm:h-9 sm:w-9">
      {normalizedUrl && <AvatarImage src={normalizedUrl} alt={`${name} avatar`} />}
      <AvatarFallback
        delayMs={normalizedUrl ? 200 : 0}
        className="bg-charcoal/10 text-[11px] font-semibold text-charcoal/70 sm:text-xs"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
