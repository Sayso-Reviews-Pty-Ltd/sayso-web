import { BADGE_MAPPINGS } from "../../lib/badgeMappings";
import type { BadgePreview } from "./CommunityHighlights.types";

const badgePreviewIds = [
  { id: "milestone_new_voice", icon: "✍️" },
  { id: "community_neighbourhood_plug", icon: "🏆" },
  { id: "community_hidden_gem_hunter", icon: "💎" },
  { id: "milestone_helpful_honeybee", icon: "⚡" },
  { id: "milestone_consistency_star", icon: "✅" },
  { id: "explorer_variety_voyager", icon: "🗺️" },
] as const;

export const badgePreviews: BadgePreview[] = badgePreviewIds
  .map(({ id, icon }) => {
    const mapping = BADGE_MAPPINGS[id];
    if (!mapping) return null;
    return {
      label: mapping.name,
      description: mapping.description || mapping.name,
      pngPath: mapping.pngPath,
      fallbackIcon: icon,
    };
  })
  .filter(Boolean) as BadgePreview[];

// Sample review texts for variety
export const sampleReviewTexts = [
  "Absolutely love this place! Great atmosphere and amazing service. Will definitely come back!",
  "The best spot in town! Quality is top-notch and the staff is incredibly friendly.",
  "Hidden gem discovered! Food was incredible and the ambiance is perfect for a relaxed evening.",
  "Outstanding experience! Every detail was perfect, from service to quality. Highly recommend!",
  "Wow, just wow! Exceeded all my expectations. This is my new favorite spot in the area.",
  "Incredible find! Great value for money and the atmosphere is unbeatable. Can't wait to return!",
  "Perfect place for a date night! Romantic ambiance, delicious food, and excellent service.",
  "Top tier quality! The attention to detail here is amazing. Will be a regular customer for sure.",
  "Fantastic experience all around! Staff went above and beyond to make our visit memorable.",
  "This place never disappoints! Consistent quality and friendly service every single time.",
  "Amazing spot with great vibes! The perfect blend of quality, service, and atmosphere.",
  "Exceptional! From the moment we walked in, everything was perfect. Must visit!",
];

// Animation variants for staggered card appearance (matching badge page)
export const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};
