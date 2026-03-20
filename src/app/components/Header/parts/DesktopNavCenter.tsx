"use client";

import { Fragment } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, RefObject } from "react";
import { createPortal } from "react-dom";
import { m } from "framer-motion";
import { ChevronDown } from "@/app/lib/icons";
import OptimizedLink from "../../Navigation/OptimizedLink";
import { getLinkHref } from "../headerActionsConfig";
import { isPathActive, getShowPill } from "./DesktopNavStyles";
import type { DesktopNavStyles, NavLink } from "../DesktopNav.types";

interface DesktopNavCenterProps {
  pathname: string;
  isGuest: boolean;
  isBusinessAccountUser: boolean;
  isClaimBusinessActive: boolean;
  isDiscoverActive: boolean;
  mounted: boolean;
  hoveredNavKey: string | null;
  setHoveredNavKey: (key: string | null) => void;
  handleNavClick: (href: string, e?: ReactMouseEvent) => void;
  sf: CSSProperties;
  styles: DesktopNavStyles;
  primaryLinks: readonly NavLink[];
  discoverLinks: readonly NavLink[];
  businessLinks: readonly NavLink[];
  discoverDropdownRef: RefObject<HTMLDivElement>;
  discoverMenuPortalRef: RefObject<HTMLDivElement>;
  discoverBtnRef: RefObject<HTMLButtonElement>;
  discoverMenuPos: { left: number; top: number } | null;
  isDiscoverDropdownOpen: boolean;
  isDiscoverDropdownClosing: boolean;
  clearDiscoverHoverTimeout: () => void;
  openDiscoverDropdown: () => void;
  closeDiscoverDropdown: () => void;
  scheduleDiscoverDropdownClose: () => void;
  addDropdownRef: RefObject<HTMLDivElement>;
  isAddDropdownOpen: boolean;
  isAddDropdownClosing: boolean;
  isAddGroupActive: boolean;
  openAddDropdown: () => void;
  closeAddDropdown: () => void;
  scheduleAddDropdownClose: () => void;
  clearAddHoverTimeout: () => void;
  addMenuItems: readonly NavLink[];
}

export function DesktopNavCenter({
  pathname,
  isGuest,
  isBusinessAccountUser,
  isClaimBusinessActive,
  isDiscoverActive,
  mounted,
  hoveredNavKey,
  setHoveredNavKey,
  handleNavClick,
  sf,
  styles,
  primaryLinks,
  discoverLinks,
  businessLinks,
  discoverDropdownRef,
  discoverMenuPortalRef,
  discoverBtnRef,
  discoverMenuPos,
  isDiscoverDropdownOpen,
  isDiscoverDropdownClosing,
  clearDiscoverHoverTimeout,
  openDiscoverDropdown,
  closeDiscoverDropdown,
  scheduleDiscoverDropdownClose,
  addDropdownRef,
  isAddDropdownOpen,
  isAddDropdownClosing,
  isAddGroupActive,
  openAddDropdown,
  closeAddDropdown,
  scheduleAddDropdownClose,
  clearAddHoverTimeout,
  addMenuItems,
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

  return (
    <div className="flex items-center justify-center gap-2 lg:gap-3 min-w-0">
      {isBusinessAccountUser &&
        businessLinks.map(({ key, label, href, requiresAuth }) => {
          const targetHref = getLinkHref(href, requiresAuth, isGuest);
          const isActive =
            isPathActive(href, pathname) ||
            (isClaimBusinessActive && href === "/for-businesses");

          if (key === "add-business") {
            return (
              <div
                key="add-dropdown"
                ref={addDropdownRef}
                className="relative"
                onMouseEnter={() => {
                  openAddDropdown();
                  setHoveredNavKey("add");
                }}
                onMouseLeave={() => {
                  scheduleAddDropdownClose();
                  setHoveredNavKey(null);
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isAddDropdownOpen) closeAddDropdown();
                    else openAddDropdown();
                  }}
                  className={`${baseLinkClass} ${
                    isAddGroupActive ? activeTextClass : businessPalette
                  }`}
                  style={sf}
                  aria-haspopup="true"
                  aria-expanded={isAddDropdownOpen}
                >
                  {getShowPill("add", isAddGroupActive, hoveredNavKey) && (
                    <m.span
                      layoutId="nav-pill"
                      className={pillClass}
                      transition={pillTransition}
                    />
                  )}
                  <span className={navLabelHoverClass}>Add</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                      isAddDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mounted && (isAddDropdownOpen || isAddDropdownClosing) && (
                  <div
                    className={`absolute left-0 top-full mt-2 z-[900] bg-off-white rounded-[12px] border-none shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden min-w-[250px] backdrop-blur-xl transition-all duration-150 ease-out ${
                      isAddDropdownClosing
                        ? "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                        : "opacity-100 scale-100 translate-y-0"
                    }`}
                    style={{
                      fontFamily:
                        "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                      transformOrigin: "top left",
                    }}
                    onMouseEnter={openAddDropdown}
                    onMouseLeave={scheduleAddDropdownClose}
                  >
                    <div className="px-4 pt-3 pb-2 border-b border-charcoal/10 bg-off-white">
                      <h3 className="text-sm font-semibold text-charcoal" style={sf}>
                        Add
                      </h3>
                    </div>
                    <div className="py-2">
                      {addMenuItems.map((item) => {
                        const itemActive = isPathActive(item.href, pathname);
                        return (
                          <OptimizedLink
                            key={item.key}
                            href={getLinkHref(item.href, item.requiresAuth, isGuest)}
                            onClick={(e) => {
                              handleNavClick(item.href, e);
                              clearAddHoverTimeout();
                              closeAddDropdown();
                            }}
                            className={`block px-4 py-2.5 text-sm font-semibold transition-all duration-200 mx-2 rounded-lg ${
                              itemActive
                                ? "text-sage bg-gradient-to-r from-sage/10 to-sage/5"
                                : "text-charcoal hover:text-coral lg:hover:scale-[1.02]"
                            }`}
                            style={sf}
                          >
                            {item.label}
                          </OptimizedLink>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <OptimizedLink
              key={key}
              href={targetHref}
              onClick={(e) => handleNavClick(href, e)}
              onMouseEnter={() => setHoveredNavKey(key)}
              onMouseLeave={() => setHoveredNavKey(null)}
              className={`${baseLinkClass} ${isActive ? activeTextClass : businessPalette}`}
              style={sf}
            >
              {getShowPill(key, isActive, hoveredNavKey) && (
                <m.span layoutId="nav-pill" className={pillClass} transition={pillTransition} />
              )}
              <span className={navLabelHoverClass}>{label}</span>
            </OptimizedLink>
          );
        })}

      {!isBusinessAccountUser &&
        primaryLinks.map(({ key, label, href, requiresAuth }, index) => {
          const isActive = isPathActive(href, pathname);
          return (
            <Fragment key={key}>
              <OptimizedLink
                href={getLinkHref(href, requiresAuth, isGuest)}
                onClick={(e) => handleNavClick(href, e)}
                onMouseEnter={() => setHoveredNavKey(key)}
                onMouseLeave={() => setHoveredNavKey(null)}
                className={`${baseLinkClass} ${isActive ? activeTextClass : idleTextClass}`}
                style={sf}
              >
                {getShowPill(key, isActive, hoveredNavKey) && (
                  <m.span layoutId="nav-pill" className={pillClass} transition={pillTransition} />
                )}
                <span className={navLabelHoverClass}>{label}</span>
              </OptimizedLink>

              {index === 0 && (
                <div
                  ref={discoverDropdownRef}
                  className="relative"
                  onMouseEnter={() => {
                    openDiscoverDropdown();
                    setHoveredNavKey("discover");
                  }}
                  onMouseLeave={() => {
                    scheduleDiscoverDropdownClose();
                    setHoveredNavKey(null);
                  }}
                >
                  <button
                    ref={discoverBtnRef}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isDiscoverDropdownOpen) closeDiscoverDropdown();
                      else openDiscoverDropdown();
                    }}
                    className={`${baseLinkClass} ${
                      isDiscoverActive ? activeTextClass : idleTextClass
                    }`}
                    style={sf}
                    aria-expanded={isDiscoverDropdownOpen}
                    aria-haspopup="true"
                  >
                    {getShowPill("discover", isDiscoverActive, hoveredNavKey) && (
                      <m.span
                        layoutId="nav-pill"
                        className={pillClass}
                        transition={pillTransition}
                      />
                    )}
                    <span className={navLabelHoverClass}>Discover</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 relative z-10 ${
                        isDiscoverDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {mounted &&
                    isDiscoverDropdownOpen &&
                    discoverMenuPos &&
                    createPortal(
                      <div
                        ref={discoverMenuPortalRef}
                        className={`fixed z-[1000] bg-off-white rounded-[12px] border-none shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden min-w-[320px] transition-all duration-300 ease-out backdrop-blur-xl ${
                          isDiscoverDropdownClosing
                            ? "opacity-0 scale-95 translate-y-[-8px]"
                            : "opacity-100 scale-100 translate-y-0"
                        }`}
                        style={{
                          left: discoverMenuPos.left,
                          top: discoverMenuPos.top,
                          fontFamily:
                            "Urbanist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                          transformOrigin: "top center",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={clearDiscoverHoverTimeout}
                        onMouseLeave={scheduleDiscoverDropdownClose}
                      >
                        <div className="px-5 pt-4 pb-3 border-b border-charcoal/10 bg-off-white flex items-center gap-2">
                          <h3
                            className="text-sm md:text-base font-semibold text-charcoal"
                            style={sf}
                          >
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
                              const target = getLinkHref(subHref ?? "", subAuth, isGuest);

                              return (
                                <OptimizedLink
                                  key={subKey}
                                  href={target}
                                  onClick={(e) => {
                                    handleNavClick(subHref ?? "", e);
                                    clearDiscoverHoverTimeout();
                                    closeDiscoverDropdown();
                                  }}
                                  className={`group flex items-start gap-3 px-5 py-3 transition-[color,transform] duration-200 rounded-lg mx-2 lg:hover:scale-[1.02] ${
                                    subIsActive ? "bg-gradient-to-r from-sage/10 to-sage/5" : ""
                                  }`}
                                  style={sf}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`text-sm font-semibold flex items-center gap-1.5 ${
                                        subIsActive
                                          ? "text-sage"
                                          : "text-charcoal group-hover:text-coral"
                                      }`}
                                    >
                                      <span className="truncate">{subLabel}</span>
                                    </div>
                                    <div className="text-sm sm:text-xs text-charcoal/60 mt-0.5">
                                      {isLocked
                                        ? "Sign in for personalised picks"
                                        : description}
                                    </div>
                                  </div>
                                </OptimizedLink>
                              );
                            }
                          )}
                        </div>
                      </div>,
                      document.body
                    )}
                </div>
              )}
            </Fragment>
          );
        })}
    </div>
  );
}
