"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "@/app/lib/utils";

/**
 * Root — adds `relative z-10` so the viewport stays above page content.
 * `delayDuration={100}` keeps hover feel snappy without being jumpy.
 * The `<NavigationMenuViewport />` is co-located here so callers never
 * forget to add it.
 */
const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    delayDuration={100}
    className={cn("relative z-10 flex items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex list-none items-center justify-center gap-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

/**
 * Trigger — no built-in chevron; callers supply their own icon children.
 * `data-[state=open]` is available for callers to rotate a chevron via CSS.
 */
const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn("group select-none outline-none", className)}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

/**
 * Content — slides left/right when switching between triggers.
 * Appears inside `NavigationMenuViewport`.
 */
const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full",
      "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",
      "data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
      "data-[motion=from-end]:slide-in-from-right-4 data-[motion=from-start]:slide-in-from-left-4",
      "data-[motion=to-end]:slide-out-to-right-4 data-[motion=to-start]:slide-out-to-left-4",
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

/** Thin wrapper around Radix Link — supports `asChild` for Next.js Link. */
const NavigationMenuLink = NavigationMenuPrimitive.Link;

/**
 * Viewport — the shared animated panel that houses all Content panels.
 * Positioned `absolute top-full` below the NavigationMenu Root.
 */
const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className="absolute left-0 top-full flex justify-center">
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      className={cn(
        "relative mt-2 overflow-hidden rounded-[12px] bg-off-white",
        "border border-charcoal/10",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]",
        "h-[var(--radix-navigation-menu-viewport-height)]",
        "w-full md:w-[var(--radix-navigation-menu-viewport-width)]",
        "origin-top",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        "data-[state=open]:[animation-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[state=open]:[animation-duration:250ms]",
        "data-[state=closed]:[animation-duration:180ms]",
        className
      )}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
};
