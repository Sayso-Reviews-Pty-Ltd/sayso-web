"use client";

import React, { useRef, ReactNode, ComponentProps } from "react";

interface MagneticButtonProps extends ComponentProps<"button"> {
  children: ReactNode;
  className?: string;
  magneticStrength?: number;
}

/**
 * MagneticButton component
 * A button with magnetic cursor-following effect
 */
export default function MagneticButton({
  children,
  className = "",
  magneticStrength = 0.3,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px)`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={buttonRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}
