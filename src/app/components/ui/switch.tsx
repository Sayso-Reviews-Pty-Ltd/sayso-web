"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/app/lib/utils";

export type SwitchSize = "sm" | "md" | "lg";

const rootSizeClasses: Record<SwitchSize, string> = {
  sm: "w-9 h-5",
  md: "w-11 h-6",
  lg: "w-14 h-7",
};

const thumbSizeClasses: Record<SwitchSize, string> = {
  sm: "h-4 w-4 data-[state=checked]:translate-x-4",
  md: "h-5 w-5 data-[state=checked]:translate-x-5",
  lg: "h-6 w-6 data-[state=checked]:translate-x-7",
};

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: SwitchSize;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size = "md", ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors duration-300 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-coral data-[state=unchecked]:bg-charcoal/20",
        rootSizeClasses[size],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0",
          "transition-transform duration-300 ease-in-out",
          "data-[state=unchecked]:translate-x-0",
          thumbSizeClasses[size]
        )}
      />
    </SwitchPrimitives.Root>
  )
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
