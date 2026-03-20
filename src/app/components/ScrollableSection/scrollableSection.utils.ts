export const syncMobileSnapTargets = (container: HTMLDivElement | null): void => {
  if (!container) return;

  const snapTargets = Array.from(container.querySelectorAll<HTMLElement>(".snap-start"));
  if (snapTargets.length === 0) return;

  for (const target of snapTargets) {
    target.removeAttribute("data-mobile-snap-target");
  }
  for (const target of snapTargets) {
    const ancestorSnapTarget = target.parentElement?.closest(".snap-start");
    const isTopLevel = !ancestorSnapTarget || !container.contains(ancestorSnapTarget);
    if (isTopLevel) {
      target.setAttribute("data-mobile-snap-target", "true");
    }
  }
};

interface ComputeScrollGeometryParams {
  container: HTMLDivElement | null;
  leading: HTMLDivElement | null;
  trailing: HTMLDivElement | null;
  shouldEnableMobilePeek: boolean;
}

export const computeScrollGeometry = ({
  container,
  leading,
  trailing,
  shouldEnableMobilePeek,
}: ComputeScrollGeometryParams): void => {
  if (!container || !shouldEnableMobilePeek || window.innerWidth >= 640) {
    if (leading) leading.style.width = "0px";
    if (trailing) trailing.style.width = "0px";
    return;
  }

  const firstTarget = container.querySelector<HTMLElement>('[data-mobile-snap-target="true"]');
  if (!firstTarget) return;

  const gap = 8; // gap-2 = 8px on mobile
  const sideSpace = Math.max(0, Math.round((container.clientWidth - firstTarget.offsetWidth) / 2) - gap);

  if (leading) leading.style.width = `${sideSpace}px`;
  if (trailing) trailing.style.width = `${sideSpace}px`;
};

interface UpdateCardScaleOpacityParams {
  container: HTMLDivElement | null;
  shouldEnableMobilePeek: boolean;
}

export const updateCardScaleOpacity = ({
  container,
  shouldEnableMobilePeek,
}: UpdateCardScaleOpacityParams): void => {
  // Off-mobile or non-peek rows: clear any previously applied styles.
  if (!container || !shouldEnableMobilePeek || window.innerWidth >= 640) {
    if (container) {
      container
        .querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]')
        .forEach((el) => {
          el.style.transform = "";
          el.style.opacity = "";
        });
    }
    return;
  }

  const snapTargets = Array.from(container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]'));
  if (snapTargets.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Use getBoundingClientRect for both container and cards so the positions
  // are always relative to the actual rendered layout — offsetLeft is
  // relative to offsetParent which breaks when any ancestor (e.g. a Framer
  // Motion wrapper) has position: relative between the card and this container.
  const containerRect = container.getBoundingClientRect();
  const containerCenter = container.scrollLeft + container.clientWidth / 2;
  const maxDistance = container.clientWidth * 0.55;

  for (const el of snapTargets) {
    const elRect = el.getBoundingClientRect();
    const cardLeft = elRect.left - containerRect.left + container.scrollLeft;
    const cardCenter = cardLeft + elRect.width / 2;
    const distance = Math.abs(cardCenter - containerCenter);
    const progress = Math.max(0, 1 - distance / maxDistance);

    if (reducedMotion) {
      el.style.transform = "";
      el.style.opacity = progress > 0.5 ? "1" : "0.75";
    } else {
      el.style.transform = `scale(${(0.92 + progress * 0.08).toFixed(3)})`;
      el.style.opacity = (0.7 + progress * 0.3).toFixed(3);
    }
  }
};

interface ScrollPositionState {
  canScrollRight: boolean;
  canScrollLeft: boolean;
  showRightArrow: boolean;
  showLeftArrow: boolean;
}

export const getScrollPositionState = (
  container: HTMLDivElement | null
): ScrollPositionState | null => {
  if (!container) return null;
  const { scrollLeft, scrollWidth, clientWidth } = container;
  const maxScrollLeft = scrollWidth - clientWidth;
  return {
    canScrollRight: maxScrollLeft > 5,
    canScrollLeft: scrollLeft > 5,
    showRightArrow: scrollLeft < maxScrollLeft - 10,
    showLeftArrow: scrollLeft > 10,
  };
};

export const scrollContainer = (container: HTMLDivElement | null, direction: "left" | "right"): void => {
  if (!container) return;
  const isMobile = window.innerWidth < 640;
  if (isMobile) {
    container.scrollBy({
      left: direction === "right" ? container.clientWidth * 0.85 : -(container.clientWidth * 0.85),
      behavior: "smooth",
    });
    return;
  }

  const cardWidth = container.clientWidth * 0.25;
  const gap = 12;
  container.scrollLeft += direction === "right" ? cardWidth + gap : -(cardWidth + gap);
};

interface PositionAtSecondCardParams {
  container: HTMLDivElement | null;
  shouldEnableMobilePeek: boolean;
  hasInitialPositionRef: { current: boolean };
}

export const positionAtSecondCard = ({
  container,
  shouldEnableMobilePeek,
  hasInitialPositionRef,
}: PositionAtSecondCardParams): void => {
  if (!shouldEnableMobilePeek || hasInitialPositionRef.current) return;
  if (typeof window === "undefined" || window.innerWidth >= 640) return;
  if (!container) return;

  const targets = container.querySelectorAll<HTMLElement>('[data-mobile-snap-target="true"]');
  if (targets.length < 2) return;

  hasInitialPositionRef.current = true;
  const second = targets[1];
  const cRect = container.getBoundingClientRect();
  const tRect = second.getBoundingClientRect();
  const center = tRect.left - cRect.left + container.scrollLeft + tRect.width / 2;
  container.scrollLeft = center - container.clientWidth / 2;
};
