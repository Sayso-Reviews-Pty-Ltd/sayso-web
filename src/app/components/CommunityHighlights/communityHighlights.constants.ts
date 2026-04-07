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
