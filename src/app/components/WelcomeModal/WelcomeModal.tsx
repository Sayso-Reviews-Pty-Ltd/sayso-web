"use client";

import { useEffect, useState } from "react";
import { MapPin, Star, MessageCircle, Heart } from "@/app/lib/icons";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Welcome to sayso</DialogTitle>
        <DialogDescription className="sr-only">Discover places real locals love</DialogDescription>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-sage/10 via-coral/5 to-sage/10 p-6 sm:p-8 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sage to-coral rounded-lg flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="font-urbanist text-lg sm:text-lg font-700 text-charcoal text-center mb-2">
            Welcome to sayso
          </h2>
          <p className="font-urbanist text-sm sm:text-base font-600 text-charcoal/70 text-center">
            Discover places real locals love
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 pt-6 space-y-6">
          <div>
            <h3 className="font-urbanist text-lg font-600 text-charcoal mb-4">What is sayso?</h3>
            <p className="font-urbanist text-sm text-charcoal/70 leading-relaxed">
              sayso is a community-driven platform where locals share their favorite spots—from
              hidden cafes to trending restaurants. No ads, no sponsored content—just authentic
              recommendations from real people.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-urbanist text-lg font-600 text-charcoal">
              How you can contribute:
            </h3>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-card-bg/10 rounded-[12px] flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-sage" />
              </div>
              <div className="flex-1">
                <h4 className="font-urbanist text-sm font-600 text-charcoal mb-1">Leave Reviews</h4>
                <p className="font-urbanist text-sm sm:text-xs text-charcoal/60 leading-relaxed">
                  Share your experiences and help others discover great places
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-coral/10 rounded-[12px] flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-coral" />
              </div>
              <div className="flex-1">
                <h4 className="font-urbanist text-sm font-600 text-charcoal mb-1">
                  Save Favourites
                </h4>
                <p className="font-urbanist text-sm sm:text-xs text-charcoal/60 leading-relaxed">
                  Create lists of your favourite spots to revisit anytime
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 bg-charcoal/10 rounded-[12px] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-charcoal" />
              </div>
              <div className="flex-1">
                <h4 className="font-urbanist text-sm font-600 text-charcoal mb-1">
                  Join the Community
                </h4>
                <p className="font-urbanist text-sm sm:text-xs text-charcoal/60 leading-relaxed">
                  Connect with fellow locals and share recommendations
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-sage to-sage/90 hover:from-coral hover:to-coral/90 text-white font-urbanist text-base font-600 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sage/20"
          >
            Start Exploring
          </button>

          <p className="text-center font-urbanist text-sm sm:text-xs text-charcoal/70">
            You can always find this info in Settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
