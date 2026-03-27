"use client";

import Image from "next/image";
import { Badge as BadgeData } from "./BadgeCard";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

interface BadgeModalProps {
  badge: BadgeData | null;
  onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  const isLocked = !badge?.earned;

  return (
    <Dialog
      open={!!badge}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md p-6 gap-0">
        <DialogTitle className="sr-only">{badge?.name ?? "Badge"}</DialogTitle>
        <DialogDescription className="sr-only">{badge?.description ?? ""}</DialogDescription>

        {badge && (
          <>
            {/* Badge Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <Image
                  src={badge.icon_path}
                  alt={badge.name}
                  fill
                  className={`object-contain ${isLocked ? "grayscale opacity-40" : "filter-none"}`}
                  unoptimized
                />
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-charcoal/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Badge Details */}
            <div className="text-center mb-4">
              <h2 className="font-urbanist font-800 text-2xl text-charcoal mb-2">{badge.name}</h2>
              <p className="font-urbanist text-base text-charcoal/70 mb-4">{badge.description}</p>
              <Badge
                size="sm"
                className={`uppercase font-700 ${
                  badge.badge_group === "explorer"
                    ? "bg-blue-100   text-blue-700   border-blue-200"
                    : badge.badge_group === "specialist"
                      ? "bg-purple-100 text-purple-700 border-purple-200"
                      : badge.badge_group === "milestone"
                        ? "bg-coral/10   text-coral      border-coral/20"
                        : "bg-card-bg/10 text-sage        border-sage/20"
                }`}
              >
                {badge.badge_group}
              </Badge>
            </div>

            {/* Status */}
            {isLocked ? (
              <div className="text-center p-4 bg-charcoal/5 rounded-xl">
                <p className="font-urbanist text-sm text-charcoal/60">
                  🔒 Keep exploring to unlock this badge!
                </p>
              </div>
            ) : (
              <div className="text-center p-4 bg-gradient-to-br from-sage/10 to-coral/10 rounded-xl">
                <p className="font-urbanist text-sm font-700 text-sage mb-1">✨ Badge Earned!</p>
                {badge.awarded_at && (
                  <p className="font-urbanist text-xs text-charcoal/60">
                    {new Date(badge.awarded_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
