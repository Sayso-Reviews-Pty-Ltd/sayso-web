"use client";

import { Fragment } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { m } from "framer-motion";
import { ChevronDown } from "@/app/lib/icons";
import OptimizedLink from "../../Navigation/OptimizedLink";
import { getLinkHref } from "../headerActionsConfig";
import { isPathActive, getShowPill } from "./DesktopNavStyles";
import type { DesktopNavStyles, NavLink } from "../DesktopNav.types";
import { ADD_MENU_ITEMS } from "../DesktopNav.types";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/app/components/ui/navigation-menu";

interface DesktopNavCenterProps {
  pathname: string;
  isGuest: boolean;
  isBusinessAccountUser: boolean;
  isClaimBusinessActive: boolean;
  isDiscoverActive: boolean;
  hoveredNavKey: string | null;
  setHoveredNavKey: (key: string | null) => void;
  handleNavClick: (href: string, e?: ReactMouseEvent) => void;
  sf: CSSProperties;
  styles: DesktopNavStyles;
  primaryLinks: readonly NavLink[];
  discoverLinks: readonly NavLink[];
  businessLinks: readonly NavLink[];
}

export function DesktopNavCenter({
  pathname,
  isGuest,
  isBusinessAccountUser,
  isClaimBusinessActive,
  isDiscoverActive,
  hoveredNavKey,
  setHoveredNavKey,
  handleNavClick,
  sf,
  styles,
  primaryLinks,
  discoverLinks,
  businessLinks,
}: DesktopNavCenterProps) {
  const {
    baseLinkClass,
    navLabelHoverClass,
    activeTextClass,
    idleTextClass,
    businessPalette,
    pillClass,
    pillTransition,
  } = styles;

  const isAddGroupActive = ADD_MENU_ITEMS.some((item) => isPathActive(item.href, pathname));

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0 lg:gap-1">
        {/* ── Business account nav ─────────────────────────────── */}
        {isBusinessAccountUser &&
          businessLinks.map(({ key, label, href, requiresAuth }) => {
            const isActive =
              isPathActive(href, pathname) || (isClaimBusinessActive && href === "/for-businesses");

            if (key === "add-business") {
              return (
                <NavigationMenuItem
                  key="add-dropdown"
                  onMouseEnter={() => setHoveredNavKey("add")}
                  onMouseLeave={() => setHoveredNavKey(null)}
                >
                  <NavigationMenuTrigger
                    className={`${baseLinkClass} ${isAddGroupActive ? activeTextClass : businessPalette}`}
                    style={sf}
                  >
                    {getShowPill("add", isAddGroupActive, hoveredNavKey) && (
                      <m.span
                        layoutId="nav-pill"
                        className={pillClass}
                        transition={pillTransition}
                      />
                    )}
                    <span className={navLabelHoverClass}>Add</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 relative z-10 group-data-[state=open]:rotate-180" />
                  </NavigationMenuTrigger>

                  <NavigationMenuContent className="min-w-[250px] font-urbanist">
                    <div className="px-4 pt-3 pb-2 border-b border-charcoal/10">
                      <h3 className="text-sm font-semibold text-charcoal" style={sf}>
                        Add
                      </h3>
                    </div>
                    <div className="py-2">
                      {ADD_MENU_ITEMS.map((item) => {
                        const itemActive = isPathActive(item.href, pathname);
                        return (
                          <NavigationMenuLink key={item.key} asChild>
                            <OptimizedLink
                              href={getLinkHref(item.href, item.requiresAuth, isGuest)}
                              onClick={(e) => handleNavClick(item.href, e)}
                              className={`block px-4 py-2.5 text-sm font-semibold transition-all duration-200 mx-2 rounded-lg ${
                                itemActive
                                  ? "text-sage bg-gradient-to-r from-sage/10 to-sage/5"
                                  : "text-charcoal hover:text-coral"
                              }`}
                              style={sf}
                            >
                              {item.label}
                            </OptimizedLink>
                          </NavigationMenuLink>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            }

            return (
              <NavigationMenuItem
                key={key}
                onMouseEnter={() => setHoveredNavKey(key)}
                onMouseLeave={() => setHoveredNavKey(null)}
              >
                <NavigationMenuLink asChild>
                  <OptimizedLink
                    href={getLinkHref(href, requiresAuth, isGuest)}
                    onClick={(e) => handleNavClick(href, e)}
                    className={`${baseLinkClass} ${isActive ? activeTextClass : businessPalette}`}
                    style={sf}
                  >
                    {getShowPill(key, isActive, hoveredNavKey) && (
                      <m.span
                        layoutId="nav-pill"
                        className={pillClass}
                        transition={pillTransition}
                      />
                    )}
                    <span className={navLabelHoverClass}>{label}</span>
                  </OptimizedLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}

        {/* ── Personal / consumer nav ───────────────────────────── */}
        {!isBusinessAccountUser &&
          primaryLinks.map(({ key, label, href, requiresAuth }, index) => {
            const isActive = isPathActive(href, pathname);
            return (
              <Fragment key={key}>
                <NavigationMenuItem
                  onMouseEnter={() => setHoveredNavKey(key)}
                  onMouseLeave={() => setHoveredNavKey(null)}
                >
                  <NavigationMenuLink asChild>
                    <OptimizedLink
                      href={getLinkHref(href, requiresAuth, isGuest)}
                      onClick={(e) => handleNavClick(href, e)}
                      className={`${baseLinkClass} ${isActive ? activeTextClass : idleTextClass}`}
                      style={sf}
                    >
                      {getShowPill(key, isActive, hoveredNavKey) && (
                        <m.span
                          layoutId="nav-pill"
                          className={pillClass}
                          transition={pillTransition}
                        />
                      )}
                      <span className={navLabelHoverClass}>{label}</span>
                    </OptimizedLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {index === 0 && (
                  <NavigationMenuItem
                    key="discover"
                    onMouseEnter={() => setHoveredNavKey("discover")}
                    onMouseLeave={() => setHoveredNavKey(null)}
                  >
                    <NavigationMenuTrigger
                      className={`${baseLinkClass} ${isDiscoverActive ? activeTextClass : idleTextClass}`}
                      style={sf}
                    >
                      {getShowPill("discover", isDiscoverActive, hoveredNavKey) && (
                        <m.span
                          layoutId="nav-pill"
                          className={pillClass}
                          transition={pillTransition}
                        />
                      )}
                      <span className={navLabelHoverClass}>Discover</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 relative z-10 group-data-[state=open]:rotate-180" />
                    </NavigationMenuTrigger>

                    <NavigationMenuContent className="min-w-[320px] font-urbanist">
                      <div className="px-5 pt-4 pb-3 border-b border-charcoal/10">
                        <h3 className="text-sm md:text-base font-semibold text-charcoal" style={sf}>
                          Discover
                        </h3>
                      </div>
                      <div className="py-3">
                        {discoverLinks.map(
                          ({
                            key: subKey,
                            label: subLabel,
                            description,
                            href: subHref,
                            requiresAuth: subAuth,
                          }) => {
                            const subIsActive = isPathActive(subHref, pathname);
                            const isLocked = isGuest && subAuth;
                            return (
                              <NavigationMenuLink key={subKey} asChild>
                                <OptimizedLink
                                  href={getLinkHref(subHref ?? "", subAuth, isGuest)}
                                  onClick={(e) => handleNavClick(subHref ?? "", e)}
                                  className={`group flex items-start gap-3 px-5 py-3 transition-colors duration-200 rounded-lg mx-2 ${
                                    subIsActive
                                      ? "bg-gradient-to-r from-sage/10 to-sage/5"
                                      : "hover:bg-charcoal/[0.03]"
                                  }`}
                                  style={sf}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-sm font-semibold ${subIsActive ? "text-sage" : "text-charcoal group-hover:text-coral"}`}
                                    >
                                      <span className="truncate">{subLabel}</span>
                                    </div>
                                    <div className="text-sm sm:text-xs text-charcoal/60 mt-0.5">
                                      {isLocked ? "Sign in for personalised picks" : description}
                                    </div>
                                  </div>
                                </OptimizedLink>
                              </NavigationMenuLink>
                            );
                          }
                        )}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </Fragment>
            );
          })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
