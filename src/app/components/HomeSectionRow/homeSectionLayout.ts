export const HOME_SECTION_CONTAINER_INSET_CLASS =
  "pl-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] sm:px-2";

// Reusable section wrapper: max-width + page gutter in one primitive.
export const SECTION_WRAPPER_CLASS =
  `mx-auto w-full max-w-[2000px] relative z-10 ${HOME_SECTION_CONTAINER_INSET_CLASS}`;

export const HOME_SECTION_RAIL_CLASS = "items-stretch py-2";

// Matches Allbirds category-row spacing: slide `margin-right: 10px` → Tailwind gap-2.5.
export const HOME_SECTION_RAIL_GAP_CLASS =
  "gap-2.5 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2";

// Single centered card on mobile — 16px gutter on each side from viewport edge.
// Section wrapper: 8px each side (16px) + scroll container: 8px each side (16px) = 32px total.
export const HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS =
  "w-[calc(100vw-32px)]";

export const HOME_SECTION_CARD_MIN_WIDTH_CLASS = "min-w-[clamp(200px,16vw,300px)]";

export const HOME_SECTION_CARD_BASE_CLASS =
  `snap-center snap-always flex-shrink-0 ${HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS} sm:w-auto ${HOME_SECTION_CARD_MIN_WIDTH_CLASS} list-none flex justify-center h-full`;
