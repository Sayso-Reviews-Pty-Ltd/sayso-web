/**
 * shadcn-style typography primitives built on the sayso semantic scale.
 *
 * All components:
 *  - Apply `font-urbanist` (defined in tailwind.config.js) — no inline fontFamily needed
 *  - Use the project's semantic token sizes: text-hero / text-h1–h3 / text-body / text-body-sm / text-caption / text-micro
 *  - Accept `className` for one-off overrides via `cn()`
 *  - Forward refs so they compose with motion or layout primitives
 */

import * as React from "react";
import { cn } from "@/app/lib/utils";

/** 40px display heading — hero sections and page-level titles. */
const Hero = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn("font-urbanist text-hero font-bold text-charcoal tracking-tight", className)}
      {...props}
    />
  )
);
Hero.displayName = "Hero";

/** 34px primary heading. */
const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn("font-urbanist text-h1 font-bold text-charcoal tracking-tight", className)}
      {...props}
    />
  )
);
H1.displayName = "H1";

/** 28px section heading. */
const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("font-urbanist text-h2 font-semibold text-charcoal tracking-tight", className)}
      {...props}
    />
  )
);
H2.displayName = "H2";

/** 24px subsection heading. */
const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-urbanist text-h3 font-semibold text-charcoal", className)}
      {...props}
    />
  )
);
H3.displayName = "H3";

/** 18px card / field heading. */
const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("font-urbanist text-body font-semibold text-charcoal", className)}
      {...props}
    />
  )
);
H4.displayName = "H4";

/** 18px body paragraph — charcoal/70 for readable contrast. */
const P = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("font-urbanist text-body font-normal text-charcoal/70", className)}
      {...props}
    />
  )
);
P.displayName = "P";

/**
 * 18px lead paragraph — constrained to 70ch for optimal line length.
 * Use for page subtitles and intro copy.
 */
const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("font-urbanist text-body font-normal text-charcoal/70 max-w-[70ch]", className)}
      {...props}
    />
  )
);
Lead.displayName = "Lead";

/** 16px muted secondary text. */
const Muted = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("font-urbanist text-body-sm font-normal text-charcoal/60", className)}
      {...props}
    />
  )
);
Muted.displayName = "Muted";

/** 14px caption — renders as `<small>`. */
const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn("font-urbanist text-caption text-charcoal/60", className)}
      {...props}
    />
  )
);
Small.displayName = "Small";

/**
 * 14px uppercase label — section tags, metadata chips, admin table headers.
 * Renders as `<span>` so it can sit inside block or inline contexts.
 */
const Label = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "font-urbanist text-caption font-semibold text-charcoal/60 uppercase tracking-wider",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

/** 12px micro label — timestamps, fine print, badge counts. */
const Micro = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("font-urbanist text-micro text-charcoal/50", className)}
      {...props}
    />
  )
);
Micro.displayName = "Micro";

export { Hero, H1, H2, H3, H4, P, Lead, Muted, Small, Label, Micro };
