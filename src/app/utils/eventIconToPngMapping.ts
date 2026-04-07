/**
 * Maps event icon names to their corresponding PNG icon files
 */

const EVENT_ICON_TO_PNG: Record<string, string> = {
  // Art & Creative
  "paint-brush-outline": "/png/019-art-gallery.png",
  brush: "/png/019-art-gallery.png",
  art: "/png/019-art-gallery.png",

  // Food & Drink
  "pizza-outline": "/png/031-fast-food.png",
  pizza: "/png/031-fast-food.png",
  "wine-outline": "/png/008-wine-bottle.png",
  wine: "/png/008-wine-bottle.png",
  cocktail: "/png/003-cocktail.png",

  // Beauty & Wellness
  "cut-outline": "/png/009-salon.png",
  scissors: "/png/009-salon.png",
  hair: "/png/009-salon.png",

  // Music & Entertainment
  "musical-notes-outline": "/png/022-party-people.png",
  music: "/png/022-party-people.png",
  party: "/png/022-party-people.png",

  // Fitness
  "body-outline": "/png/015-yoga.png",
  dumbbell: "/png/014-dumbbell.png",
  yoga: "/png/015-yoga.png",
  fitness: "/png/014-dumbbell.png",

  // Default
  calendar: "/png/022-party-people.png",
};

/**
 * Get the PNG icon path for a given event icon name
 * @param iconName - The event icon identifier
 * @returns The PNG icon path or default party icon if icon not found
 */
export function getEventIconPng(iconName: string | undefined | null): string {
  if (!iconName || typeof iconName !== "string") {
    return "/png/022-party-people.png"; // Default fallback
  }

  const normalizedIcon = iconName.trim().toLowerCase();

  // Exact match first
  if (EVENT_ICON_TO_PNG[normalizedIcon]) {
    return EVENT_ICON_TO_PNG[normalizedIcon];
  }

  // Partial match - check if icon name contains keywords
  const partialMatch = Object.entries(EVENT_ICON_TO_PNG).find(
    ([key]) =>
      normalizedIcon.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedIcon)
  );

  if (partialMatch) {
    return partialMatch[1];
  }

  // Final fallback
  return "/png/022-party-people.png";
}
