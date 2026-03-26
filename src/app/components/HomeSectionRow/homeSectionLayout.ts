export const HOME_SECTION_CONTAINER_INSET_CLASS =
  "pl-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] sm:px-4";

// Reusable section wrapper: max-width + page gutter in one primitive.
export const SECTION_WRAPPER_CLASS =
  `mx-auto w-full max-w-[2000px] relative z-10 ${HOME_SECTION_CONTAINER_INSET_CLASS}`;

export const HOME_SECTION_RAIL_CLASS = "items-stretch py-2";

// Matches Allbirds category-row spacing: slide `margin-right: 10px` → Tailwind gap-2.5.
export const HOME_SECTION_RAIL_GAP_CLASS =
  "gap-2.5 sm:gap-3 md:gap-3 lg:gap-2 xl:gap-2 2xl:gap-2";

// Allbirds mobile slides use ~312px width; cap with min() so narrow phones still fit.
export const HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS =
  "w-[min(19.5rem,calc(100vw-3rem))]";

export const HOME_SECTION_CARD_MIN_WIDTH_CLASS = "min-w-[clamp(200px,16vw,300px)]";

export const HOME_SECTION_CARD_BASE_CLASS =
  `snap-start snap-always flex-shrink-0 ${HOME_SECTION_MOBILE_PEEK_CARD_WIDTH_CLASS} sm:w-auto ${HOME_SECTION_CARD_MIN_WIDTH_CLASS} list-none flex justify-center h-full`;
