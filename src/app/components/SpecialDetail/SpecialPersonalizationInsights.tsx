// src/components/SpecialDetail/SpecialPersonalizationInsights.tsx
"use client";

import { Sparkles, Star, MapPin, TrendingUp } from "@/app/lib/icons";
import { Card } from "@/app/components/ui/card";

interface SpecialPersonalizationInsightsProps {
  special: {
    id: string;
    category?: string;
    rating?: number;
    totalReviews?: number;
    distanceKm?: number | null;
  };
}

export default function SpecialPersonalizationInsights({
  special,
}: SpecialPersonalizationInsightsProps) {
  const insights = [];

  // High rating insight
  if (special.rating && special.rating >= 4.5) {
    insights.push({
      icon: <Star className="w-4 h-4" />,
      text: "Highly rated special",
      color: "text-amber-500",
    });
  }

  // Popular special insight
  if (special.totalReviews && special.totalReviews >= 30) {
    insights.push({
      icon: <TrendingUp className="w-4 h-4" />,
      text: "Popular with customers",
      color: "text-sage",
    });
  }

  // Nearby insight
  if (special.distanceKm && special.distanceKm < 5) {
    insights.push({
      icon: <MapPin className="w-4 h-4" />,
      text: `Only ${special.distanceKm.toFixed(1)}km away`,
      color: "text-coral",
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card variant="detail" className="p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-card-bg/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-navbar-bg/90" />
        </div>
        <h3 className="text-base font-semibold text-charcoal font-urbanist">
          Why You'll Love This
        </h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2.5">
            <div className={`${insight.color} mt-0.5 flex-shrink-0`}>{insight.icon}</div>
            <p className="text-sm text-charcoal/80 leading-relaxed font-urbanist">{insight.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
