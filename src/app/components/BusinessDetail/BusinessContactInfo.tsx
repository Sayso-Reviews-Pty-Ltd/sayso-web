// src/components/BusinessDetail/BusinessContactInfo.tsx
"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Phone, Globe, MapPin, Mail, Copy, Check } from "@/app/lib/icons";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/atoms/Button";

interface BusinessContactInfoProps {
  phone?: string;
  website?: string;
  address?: string;
  email?: string;
  location?: string;
  onViewMap?: () => void;
  showMapLink?: boolean;
}

export default function BusinessContactInfo({
  phone,
  website,
  address,
  email,
  location,
}: BusinessContactInfoProps) {
  const websiteHref = website ? (website.startsWith("http") ? website : `https://${website}`) : "";
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const displayPhone = typeof phone === "string" && phone.trim().length > 0 ? phone.trim() : null;

  const handleCopyPhone = async () => {
    if (!displayPhone) return;
    try {
      await navigator.clipboard.writeText(displayPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      setCopiedPhone(false);
    }
  };

  return (
    <Card asChild variant="detail" className="p-4 sm:p-6 relative">
      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div>
          <h3 className="text-h3 font-semibold text-charcoal mb-3">Contact Information</h3>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
                <Phone className="w-3 h-3 text-charcoal/85" />
              </span>
              {displayPhone ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {!isPhoneVisible ? (
                    <Button
                      variant="bare"
                      type="button"
                      onClick={() => setIsPhoneVisible(true)}
                      className="inline-flex rounded-full bg-navbar-bg px-3 py-1.5 text-body-sm text-white hover:bg-navbar-bg/90 transition-colors min-h-0"
                    >
                      Show Contact Number
                    </Button>
                  ) : (
                    <>
                      <a
                        href={`tel:${displayPhone}`}
                        className="min-w-0 truncate text-body-sm text-charcoal/70 hover:text-charcoal transition-colors"
                      >
                        {displayPhone}
                      </a>
                      <Button
                        variant="bare"
                        type="button"
                        onClick={handleCopyPhone}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors min-h-0 p-0"
                        aria-label="Copy contact number"
                      >
                        {copiedPhone ? (
                          <Check className="w-3.5 h-3.5 text-charcoal/85" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-charcoal/85" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-body-sm text-charcoal/70 italic">
                  Phone number coming soon
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
                <Mail className="w-3 h-3 text-charcoal/85" />
              </span>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-body-sm text-charcoal/70 hover:text-charcoal transition-colors break-all"
                >
                  {email}
                </a>
              ) : (
                <span className="text-body-sm text-charcoal/70 italic">Email coming soon</span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
                <Globe className="w-3 h-3 text-charcoal/85" />
              </span>
              {website ? (
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-navbar-bg px-3 py-1.5 text-body-sm text-white hover:bg-navbar-bg/90 transition-colors"
                  aria-label="View business website (opens in a new tab)"
                >
                  View Website
                </a>
              ) : (
                <span className="text-body-sm text-charcoal/70 italic">Website coming soon</span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
                <MapPin className="w-3 h-3 text-charcoal/85" />
              </span>
              {address || location ? (
                <span className="text-body-sm text-charcoal/70">{address || location}</span>
              ) : (
                <span className="text-body-sm text-charcoal/70 italic">Address coming soon</span>
              )}
            </div>
          </div>
        </div>
      </m.div>
    </Card>
  );
}
