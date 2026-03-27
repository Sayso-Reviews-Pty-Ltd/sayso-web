import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/app/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full border font-medium", {
  variants: {
    variant: {
      sage: "bg-card-bg/10 text-sage border-sage/20",
      coral: "bg-coral/10 text-coral border-coral/20",
      success: "bg-green-50 text-green-700 border-green-200",
      warning: "bg-orange-50 text-orange-700 border-orange-200",
      error: "bg-red-50 text-red-700 border-red-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
      neutral: "bg-light-gray text-charcoal border-light-gray",
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    },
  },
  defaultVariants: {
    variant: "neutral",
    size: "md",
  },
});

const dotVariants: Record<string, string> = {
  sage: "bg-sage",
  coral: "bg-coral",
  success: "bg-green-500",
  warning: "bg-orange-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-charcoal",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, asChild = false, dot = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {dot && (
          <span className={cn("w-1.5 h-1.5 rounded-full", dotVariants[variant ?? "neutral"])} />
        )}
        {children}
      </Comp>
    );
  }
);
Badge.displayName = "Badge";

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export { Badge, badgeVariants };
