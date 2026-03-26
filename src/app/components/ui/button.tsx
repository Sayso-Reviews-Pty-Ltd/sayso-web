import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:     "bg-card-bg text-white shadow-md hover:shadow-lg active:scale-[0.98]",
        secondary:   "bg-charcoal text-white hover:bg-charcoal/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        outline:     "border-2 border-sage text-sage hover:bg-card-bg hover:text-white shadow-md active:scale-[0.98]",
        ghost:       "text-sage hover:bg-card-bg/10 active:scale-[0.98]",
        danger:      "bg-coral text-white hover:bg-coral/90 shadow-md hover:shadow-lg active:scale-[0.98]",
        // No colour — use className to supply custom colours (for animated/specialised buttons)
        bare:        "",
      },
      size: {
        sm:  "px-4 py-2 text-sm min-h-[40px]",
        md:  "px-6 py-3 text-base min-h-[48px]",
        lg:  "px-8 py-4 text-lg min-h-[56px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
