"use client";

import { pillBase, pillSize, pillInactive, pillActive } from "./filterPillTokens";

export type PillValue = string | number | null;

export interface PillOption<T extends PillValue> {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface FilterPillGroupProps<T extends PillValue> {
  options: PillOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  ariaLabel: string;
  size?: keyof typeof pillSize;
  tone?: "default";
  showCounts?: boolean;
  wrap?: boolean;
  scrollable?: boolean;
  className?: string;
  activeClassName?: string;
}

export default function FilterPillGroup<T extends PillValue>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  showCounts = false,
  wrap = false,
  scrollable = true,
  className = "",
  activeClassName,
}: FilterPillGroupProps<T>) {
  const containerClass = [
    "flex items-center gap-2",
    scrollable ? "overflow-x-auto scrollbar-hide" : "",
    wrap ? "flex-wrap" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={containerClass}
      style={scrollable ? { WebkitOverflowScrolling: "touch" } : undefined}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(isActive ? null : option.value)}
            aria-pressed={isActive}
            className={[
              pillBase,
              pillSize[size],
              isActive ? (activeClassName ?? pillActive) : pillInactive,
              option.disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:-translate-y-px active:scale-[0.98]",
              "font-urbanist transition-transform duration-150 ease-out motion-reduce:transform-none",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {option.icon && <span aria-hidden>{option.icon}</span>}
            {option.label}
            {showCounts && option.count !== undefined && option.count > 0 && (
              <span className={`ml-0.5 ${isActive ? "opacity-80" : "opacity-60"}`}>
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
