interface ScrollArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  arrowVisibilityClass: string;
}

export default function ScrollArrowButton({
  direction,
  onClick,
  arrowVisibilityClass,
}: ScrollArrowButtonProps) {
  const isLeft = direction === "left";
  const sideClass = isLeft ? "scroll-arrow-left absolute left-2" : "scroll-arrow-right absolute right-2";
  const label = isLeft ? "Scroll left" : "Scroll right";
  const arrowSvgClass = isLeft ? "w-5 h-5 sm:w-5 sm:h-5 rotate-180 arrow-bounce" : "w-5 h-5 sm:w-5 sm:h-5 arrow-bounce";

  return (
    <button
      onClick={onClick}
      className={`
        scroll-arrow ${sideClass}
        top-1/2 -translate-y-1/2 z-40
        w-14 h-14 sm:w-12 sm:h-12
        bg-navbar-bg
        rounded-full
        ${arrowVisibilityClass} items-center justify-center
        transition-all duration-300 ease-out
        active:scale-95
        text-white
        touch-manipulation
        shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(139,176,138,0.3)]
        sm:shadow-lg
        hover:bg-card-bg hover:shadow-[6px_6px_12px_rgba(0,0,0,0.12),-6px_-6px_12px_rgba(139,176,138,0.4)]
        sm:hover:shadow-xl
        active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(139,176,138,0.3)]
        sm:active:shadow-lg
        border border-sage/20
      `}
      aria-label={label}
    >
      <svg
        className={arrowSvgClass}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
