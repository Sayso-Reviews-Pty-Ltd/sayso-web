import * as React from "react";

import { cn } from "@/app/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[12px] border border-charcoal/20 bg-off-white px-4 py-3 text-sm text-charcoal",
          "placeholder:text-charcoal/60",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/30 focus-visible:border-sage",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
