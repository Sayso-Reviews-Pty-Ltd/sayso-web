"use client";

import { Check, Navigation } from "@/app/lib/icons";

interface Props {
  locationStatus: string;
  requestLocation: () => void;
}

export function ProfilePreferences({ locationStatus, requestLocation }: Props) {
  return (
    <section
      className="bg-gradient-to-br from-card-bg via-card-bg to-card-bg/95 backdrop-blur-xl border-none rounded-[12px] shadow-md p-6 sm:p-8 space-y-4 profile-load-item profile-load-delay-6"
      aria-label="Preferences"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-off-white/70 hover:bg-off-white/90 transition-colors">
          <Navigation className="w-4 h-4 text-charcoal/85" />
        </span>
        <h3 className="text-base font-semibold text-charcoal">Preferences</h3>
      </div>

      <div className="flex items-center justify-between gap-4 py-3 border-t border-white/40">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-charcoal">Location Distance</p>
          <p className="text-xs text-charcoal/60 mt-0.5">
            {locationStatus === "granted"
              ? "Enabled — distances are shown on business cards"
              : locationStatus === "denied"
                ? "Blocked — update in your browser settings, then tap retry"
                : "Allow location to see how far businesses are from you"}
          </p>
        </div>

        {locationStatus === "granted" ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage/15 text-sage text-xs font-semibold whitespace-nowrap border border-sage/20">
            <Check size={14} strokeWidth={2.5} />
            Enabled
          </span>
        ) : (
          <button
            onClick={requestLocation}
            disabled={locationStatus === "loading"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-coral/90 hover:bg-coral text-white text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {locationStatus === "loading" ? (
              "Requesting..."
            ) : locationStatus === "denied" ? (
              <>
                <Navigation size={14} />
                Retry
              </>
            ) : (
              <>
                <Navigation size={14} />
                Allow
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
