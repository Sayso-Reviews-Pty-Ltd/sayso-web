"use client";

import { X, Phone, Globe, MapPin, Mail, CheckCircle, DollarSign } from "@/app/lib/icons";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

type Description = string | { raw: string; friendly: string } | null | undefined;

export interface BusinessInfo {
  name?: string;
  description?: Description;
  category?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  verified?: boolean;
}

interface BusinessInfoModalProps {
  businessInfo: BusinessInfo;
  buttonRef: React.RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
}

const formatPriceRangeDisplay = (priceRange?: string | null): string => {
  if (!priceRange) return "";
  return priceRange.includes("$") ? priceRange.replace(/\$/g, "R") : priceRange;
};

const fontStyle = { fontFamily: "'Urbanist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" };

export default function BusinessInfoModal({ businessInfo, isOpen, onClose }: BusinessInfoModalProps) {
  const displayPriceRange = formatPriceRangeDisplay(businessInfo.price_range);

  const getDescription = () => {
    const desc = businessInfo.description;
    if (!desc) return 'No description available';
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc !== null) {
      const descObj = desc as { friendly?: string; raw?: string };
      return descObj.friendly || descObj.raw || 'No description available';
    }
    return 'No description available';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[680px] p-0 gap-0 max-h-[90vh] overflow-y-auto items-start sm:top-[50%]">
        <DialogTitle className="sr-only">Business Information</DialogTitle>
        <DialogDescription className="sr-only">{businessInfo.name}</DialogDescription>

        <div className="sticky top-0 bg-off-white border-b border-charcoal/10 px-5 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-charcoal" style={fontStyle}>Business Information</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-charcoal/10 bg-off-white/70 hover:bg-card-bg/10 hover:text-sage text-charcoal/80 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-sage/30 min-h-[44px] min-w-[44px]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-4 pb-6 space-y-4" style={fontStyle}>
          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-2" style={fontStyle}>
              {businessInfo.name || 'Business Name Not Available'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-sm text-charcoal/70" style={fontStyle}>
            <span className="font-medium text-charcoal/60">Category:</span>
            <span className={!businessInfo.category ? 'italic text-charcoal/60' : ''}>{businessInfo.category || 'Not specified'}</span>
          </div>

          <div className="text-sm text-charcoal/70" style={fontStyle}>
            <p className="font-medium text-charcoal/60 mb-1">Description</p>
            <p className={`leading-relaxed ${!businessInfo.description ? 'italic text-charcoal/60' : ''}`}>{getDescription()}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-charcoal/70" style={fontStyle}>
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70">
              <DollarSign className="w-3 h-3 text-charcoal/85" />
            </span>
            <span className="font-medium text-charcoal/60">Price Range:</span>
            <span className={!businessInfo.price_range ? 'italic text-charcoal/60' : ''}>{displayPriceRange || 'Not specified'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm" style={fontStyle}>
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70">
              <CheckCircle className="w-3 h-3 text-charcoal/85" />
            </span>
            <span className={`font-medium ${businessInfo.verified ? 'text-sage' : 'text-charcoal/60'}`}>
              {businessInfo.verified ? 'Verified Business' : 'Not Verified'}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 mt-0.5">
              <MapPin className="w-3 h-3 text-charcoal/85" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal mb-0.5" style={fontStyle}>Location</p>
              <p className={`text-sm ${businessInfo.location ? 'text-charcoal/70' : 'italic text-charcoal/60'}`} style={fontStyle}>
                {businessInfo.location || 'Location not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${businessInfo.address ? 'text-sage' : 'text-charcoal/30'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal mb-0.5" style={fontStyle}>Address</p>
              <p className={`text-sm ${businessInfo.address ? 'text-charcoal/70' : 'italic text-charcoal/60'}`} style={fontStyle}>
                {businessInfo.address || 'Address not provided'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 mt-0.5">
              <Phone className="w-3 h-3 text-charcoal/85" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal mb-0.5" style={fontStyle}>Phone</p>
              {businessInfo.phone ? (
                <a href={`tel:${businessInfo.phone}`} className="text-sm text-sage hover:text-coral transition-colors" style={fontStyle}>{businessInfo.phone}</a>
              ) : (
                <p className="text-sm italic text-charcoal/60" style={fontStyle}>Phone number not provided</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 mt-0.5">
              <Mail className="w-3 h-3 text-charcoal/85" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal mb-0.5" style={fontStyle}>Email</p>
              {businessInfo.email ? (
                <a href={`mailto:${businessInfo.email}`} className="text-sm text-sage hover:text-coral transition-colors break-all" style={fontStyle}>{businessInfo.email}</a>
              ) : (
                <p className="text-sm italic text-charcoal/60" style={fontStyle}>Email not provided</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-off-white/70 mt-0.5">
              <Globe className="w-3 h-3 text-charcoal/85" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal mb-0.5" style={fontStyle}>Website</p>
              {businessInfo.website ? (
                <a
                  href={businessInfo.website.startsWith('http') ? businessInfo.website : `https://${businessInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-navbar-bg px-3 py-1.5 text-sm text-white hover:bg-navbar-bg/90 transition-colors font-urbanist"
                  aria-label="View business website (opens in a new tab)"
                >
                  View Website
                </a>
              ) : (
                <p className="text-sm italic text-charcoal/60" style={fontStyle}>Website not provided</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
