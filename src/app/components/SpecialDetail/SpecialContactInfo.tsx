// src/components/SpecialDetail/SpecialContactInfo.tsx
"use client";

import { Phone, Globe, MapPin } from "@/app/lib/icons";
import { m } from "framer-motion";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/atoms/Button";

interface SpecialContactInfoProps {
  phone?: string | null;
  website?: string | null;
  location?: string;
  onViewMap?: () => void;
  showMapLink?: boolean;
}

export default function SpecialContactInfo({
  phone,
  website,
  location,
  onViewMap,
  showMapLink = false,
}: SpecialContactInfoProps) {
  // Don't render if no contact info available
  if (!phone && !website && !location) {
    return null;
  }

  return (
    <Card asChild variant="detail" className="p-5 sm:p-6">
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="text-lg font-bold text-charcoal mb-4 font-urbanist">Venue Information</h3>

        <div className="space-y-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 text-charcoal/80 hover:text-coral transition-colors duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-coral/10 group-hover:bg-coral/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                <Phone className="w-4 h-4 text-coral" />
              </div>
              <span className="text-sm font-medium font-urbanist">{phone}</span>
            </a>
          )}

          {website && (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-charcoal/80 hover:text-sage transition-colors duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-card-bg/10 group-hover:bg-card-bg/20 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                <Globe className="w-4 h-4 text-sage" />
              </div>
              <span className="text-sm font-medium truncate font-urbanist">
                {website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}

          {location && (
            <div className="flex items-center gap-3 text-charcoal/80">
              <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-coral" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words font-urbanist">{location}</p>
                {showMapLink && onViewMap && (
                  <Button
                    variant="bare"
                    onClick={onViewMap}
                    className="text-xs text-sage hover:text-sage/80 font-medium mt-1 font-urbanist min-h-0 p-0 h-auto"
                  >
                    View on map
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </m.div>
    </Card>
  );
}
