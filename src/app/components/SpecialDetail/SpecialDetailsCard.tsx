// src/components/SpecialDetail/SpecialDetailsCard.tsx
"use client";

import { Calendar, Percent, Clock, Users } from "@/app/lib/icons";
import { m } from "framer-motion";
import { Card } from "@/app/components/ui/card";

interface SpecialDetailsCardProps {
  special: {
    startDate?: string;
    endDate?: string;
    price?: string | null;
  };
}

export default function SpecialDetailsCard({ special }: SpecialDetailsCardProps) {
  return (
    <Card asChild variant="detail" className="p-5 sm:p-6">
      <m.div
        className="font-urbanist"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h2 className="text-lg font-bold text-charcoal mb-4">Special Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {special.startDate && (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="text-coral w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-charcoal/60">Valid From</p>
                <p className="text-sm font-semibold text-charcoal">{special.startDate}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-card-bg/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Percent className="text-sage w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60">Discount</p>
              <p className="text-sm font-semibold text-charcoal">
                {special.price || "Special Price"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="text-coral w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60">Available</p>
              <p className="text-sm font-semibold text-charcoal">Limited Time</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-card-bg/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="text-sage w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-charcoal/60">Terms</p>
              <p className="text-sm font-semibold text-charcoal">See venue for details</p>
            </div>
          </div>
        </div>
      </m.div>
    </Card>
  );
}
