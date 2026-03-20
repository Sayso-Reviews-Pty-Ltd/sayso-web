export function getNavStyles(whiteText: boolean) {
  const baseLinkClass =
    "group capitalize px-2.5 lg:px-3.5 py-1.5 rounded-full text-sm sm:text-xs md:text-sm font-semibold relative flex items-center gap-1.5 transition-[color,opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hover:scale-105 lg:focus-visible:scale-105";

  const navLabelHoverClass =
    "relative z-10 inline-block whitespace-nowrap transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]";

  const activeTextClass = "text-sage";

  const idleTextClass = whiteText
    ? "text-white/75 hover:text-white"
    : "text-charcoal/70 md:text-charcoal/80 hover:text-charcoal/95";

  const businessPalette = whiteText
    ? "text-white/75 hover:text-white"
    : "text-charcoal/70 md:text-charcoal/80 hover:text-charcoal/95";

  const iconWrapClass = (isActive: boolean) =>
    `mi-tap group w-10 h-10 flex items-center justify-center rounded-full transition-[color,transform] duration-150 ease-in-out active:scale-[0.88] lg:hover:scale-105 lg:focus-visible:scale-105 relative ${
      isActive
        ? "text-sage"
        : whiteText
          ? "text-white hover:text-white/80"
          : "text-charcoal/80 hover:text-sage"
    }`;

  const iconClass = (isActive: boolean) =>
    `w-5 h-5 transition-colors duration-200 ${
      isActive
        ? "text-sage"
        : whiteText
          ? "text-white group-hover:text-white/85"
          : "text-current group-hover:text-sage"
    }`;

  const pillClass = "absolute inset-0 rounded-full bg-transparent";
  const pillTransition = { type: "spring" as const, stiffness: 480, damping: 36, mass: 0.5 };

  return {
    baseLinkClass,
    navLabelHoverClass,
    activeTextClass,
    idleTextClass,
    businessPalette,
    iconWrapClass,
    iconClass,
    pillClass,
    pillTransition,
  };
}

export function isPathActive(href: string | undefined, pathname: string | null): boolean {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || (pathname?.startsWith(href) ?? false);
}

export function getShowPill(key: string, isActive: boolean, hoveredNavKey: string | null): boolean {
  return hoveredNavKey === key || (hoveredNavKey === null && isActive);
}
