"use client";

import React from "react";

interface CardRailProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderCard: (item: T, index: number) => React.ReactNode;
  cardClassName?: string;
  disableAnimations?: boolean;
  containerClassName?: string;
  mobileFullBleedClassName?: string;
}

export default function CardRail<T>({
  items,
  getKey,
  renderCard,
  cardClassName = "",
  disableAnimations: _disableAnimations = false,
  containerClassName = "",
  mobileFullBleedClassName: _mobileFullBleedClassName = "",
}: CardRailProps<T>) {
  return (
    <div className={`flex gap-2.5 sm:gap-3 ${containerClassName}`}>
      {items.map((item, index) => (
        <div
          key={getKey(item, index)}
          className={cardClassName}
        >
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}
