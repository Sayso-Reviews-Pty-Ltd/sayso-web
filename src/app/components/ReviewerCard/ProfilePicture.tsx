import React from "react";
import { User, Trophy, CheckCircle, MapPin } from "@/app/lib/icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";

interface ProfilePictureProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  badge?: "top" | "verified" | "local";
}

const sizeClasses = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizeClasses = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

function getBadgeIcon(badgeType: string) {
  switch (badgeType) {
    case "top":
      return Trophy;
    case "verified":
      return CheckCircle;
    case "local":
      return MapPin;
    default:
      return User;
  }
}

/** Deterministic color from user identifier — 12-colour palette */
function getUniqueBadgeColor(userIdentifier: string, badgeType: string): string {
  const combined = `${userIdentifier}-${badgeType}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const colorPalette = [
    "from-coral/20 to-coral/10",
    "from-sage/20 to-sage/10",
    "from-purple-400/20 to-purple-400/10",
    "from-blue-400/20 to-blue-400/10",
    "from-pink-400/20 to-pink-400/10",
    "from-yellow-400/20 to-yellow-400/10",
    "from-indigo-400/20 to-indigo-400/10",
    "from-teal-400/20 to-teal-400/10",
    "from-orange-400/20 to-orange-400/10",
    "from-rose-400/20 to-rose-400/10",
    "from-cyan-400/20 to-cyan-400/10",
    "from-emerald-400/20 to-emerald-400/10",
  ];
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export default function ProfilePicture({ src, alt, size = "md", badge }: ProfilePictureProps) {
  const normalizedSrc =
    src && typeof src === "string" && src.trim().length > 0 ? src.trim() : undefined;

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], "border-2 border-white ring-2 ring-white/50")}>
        {normalizedSrc && <AvatarImage src={normalizedSrc} alt={alt} />}
        <AvatarFallback delayMs={normalizedSrc ? 200 : 0} className="bg-card-bg/10">
          <User className={cn(iconSizeClasses[size], "text-sage/70")} />
        </AvatarFallback>
      </Avatar>

      {badge && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br flex items-center justify-center",
            getUniqueBadgeColor(alt, badge)
          )}
        >
          {React.createElement(getBadgeIcon(badge), {
            className: "w-2.5 h-2.5 text-charcoal/70",
            strokeWidth: 2.5,
          })}
        </div>
      )}
    </div>
  );
}
