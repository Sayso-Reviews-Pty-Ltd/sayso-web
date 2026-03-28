import { CSSProperties, MouseEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "@/app/lib/icons";
import OptimizedLink from "../Navigation/OptimizedLink";
import { NavLink } from "./DesktopNav";
import MobileMenuToggleIcon from "./MobileMenuToggleIcon";
import { getMobileMenuActions, shouldShowLockIndicator } from "./headerActionsConfig";
import Wordmark from "../Logo/Wordmark";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/app/components/ui/sheet";
import { Button } from "@/app/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isBusinessAccountUser: boolean;
  isGuest: boolean;
  primaryLinks: readonly NavLink[];
  discoverLinks: readonly NavLink[];
  businessLinks: readonly NavLink[];
  handleNavClick: (href: string, e?: MouseEvent) => void;
  sf: CSSProperties;
}

export default function MobileMenu({
  isOpen,
  onClose,
  isBusinessAccountUser,
  isGuest,
  primaryLinks,
  discoverLinks,
  businessLinks,
  handleNavClick,
  sf,
}: MobileMenuProps) {
  const pathname = usePathname();
  const isSignupNavLink = (href: string) => href === "/register" || href === "/signup";
  const addMenuItems: readonly NavLink[] = [
    { key: "add-business", label: "Add New Business", href: "/add-business", requiresAuth: true },
    { key: "add-special", label: "Add Special", href: "/add-special", requiresAuth: true },
    { key: "add-event", label: "Add Event", href: "/add-event", requiresAuth: true },
  ] as const;
  const businessTopLinks = businessLinks.filter((link) => link.key !== "add-business");
  const isRouteActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isAddRouteActive = addMenuItems.some((item) => isRouteActive(item.href));
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(isAddRouteActive);

  useEffect(() => {
    if (!isOpen) {
      setIsAddSectionOpen(false);
      return;
    }
    if (isAddRouteActive) setIsAddSectionOpen(true);
  }, [isOpen, isAddRouteActive]);

  const actionItems = getMobileMenuActions(isBusinessAccountUser).filter(
    (item) => !isSignupNavLink(item.href)
  );
  const profileAction = actionItems.find((item) => item.href === "/profile");

  const orderedPrimaryLinks: readonly NavLink[] = [
    primaryLinks.find((link) => link.href === "/home"),
    discoverLinks.find((link) => link.href === "/for-you"),
    discoverLinks.find((link) => link.href === "/trending"),
    discoverLinks.find((link) => link.href === "/events-specials"),
  ]
    .filter(Boolean)
    .filter((link) => !isSignupNavLink(link.href)) as NavLink[];

  const orderedSecondaryLinks: readonly NavLink[] = [
    primaryLinks.find((link) => link.href === "/leaderboard"),
    { key: "saved", label: "Saved", href: "/saved", requiresAuth: true },
  ]
    .filter(Boolean)
    .filter((link) => !isSignupNavLink(link.href)) as NavLink[];

  const mobileRevealClass = `transform transition-all duration-500 ease-out ${
    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
  }`;
  const mobileModalRevealClass = `transition-all duration-500 ease-out ${
    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`;
  const mobileTapFeedbackClass =
    "active:scale-[0.98] active:opacity-95 transition-[transform,opacity,color,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]";
  const protectedLabelStyle: CSSProperties = {
    textDecorationLine: "line-through",
    textDecorationColor: "rgba(255,255,255,0.5)",
    textDecorationThickness: "1px",
  };

  // Skeleton shown while auth state is resolving
  const skeletonContent = (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  let menuContent = null;

  if (isBusinessAccountUser) {
    menuContent = (
      <div className="space-y-1">
        {businessTopLinks.map(({ key, label, href }, index) => {
          const isActive = isRouteActive(href);
          return (
            <OptimizedLink
              key={key}
              href={href}
              onClick={(e) => {
                handleNavClick(href, e);
                onClose();
              }}
              className={`px-3 py-2 rounded-[12px] text-base font-normal relative min-h-[44px] flex items-center justify-center ${mobileTapFeedbackClass} ${mobileRevealClass} ${isActive ? "text-sage bg-white/5" : "text-white hover:text-white"}`}
              style={{ ...sf, transitionDelay: `${index * 60}ms` }}
            >
              <span className="text-center uppercase tracking-wide">{label}</span>
            </OptimizedLink>
          );
        })}

        <div
          className={`rounded-[12px] border border-white/10 bg-white/[0.04] transition-all duration-300 ${mobileRevealClass}`}
          style={{ ...sf, transitionDelay: `${businessTopLinks.length * 60}ms` }}
        >
          <Button
            variant="bare"
            size="md"
            onClick={() => setIsAddSectionOpen((prev) => !prev)}
            className={`relative w-full px-3 py-2 min-h-[44px] rounded-[12px] font-normal justify-center ${mobileTapFeedbackClass} ${isAddRouteActive ? "text-sage" : "text-white hover:text-white"}`}
            aria-expanded={isAddSectionOpen}
            aria-controls="mobile-add-nav"
          >
            <span className="text-center uppercase tracking-wide">Add</span>
            <ChevronDown
              className={`absolute right-3 w-4 h-4 transition-transform duration-300 ${isAddSectionOpen ? "rotate-180" : ""}`}
            />
          </Button>

          <div
            id="mobile-add-nav"
            className={`grid transition-all duration-300 ease-out ${isAddSectionOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"}`}
          >
            <div className="overflow-hidden">
              <div className="pl-3 pr-2 pb-2 space-y-1">
                {addMenuItems.map((item) => {
                  const itemActive = isRouteActive(item.href);
                  const targetHref = shouldShowLockIndicator(isGuest, item.requiresAuth)
                    ? "/onboarding"
                    : item.href;
                  return (
                    <OptimizedLink
                      key={item.key}
                      href={targetHref}
                      onClick={(e) => {
                        handleNavClick(item.href, e);
                        onClose();
                      }}
                      className={`block rounded-lg px-3 py-2 text-sm font-semibold ${mobileTapFeedbackClass} ${itemActive ? "text-sage bg-gradient-to-r from-sage/15 to-sage/5" : "text-white/90 hover:text-white"}`}
                      style={sf}
                    >
                      <span className="block text-center uppercase tracking-wide">
                        {item.label}
                      </span>
                    </OptimizedLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-charcoal/10 my-2 mx-3" />
        {actionItems.map((item, idx) => {
          const showLockIndicator = shouldShowLockIndicator(isGuest, item.requiresAuth);
          return (
            <OptimizedLink
              key={item.href}
              href={showLockIndicator ? "/onboarding" : item.href}
              onClick={() => onClose()}
              className={`px-3 py-2 rounded-full text-base font-normal text-white hover:text-white flex items-center justify-center min-h-[44px] ${mobileTapFeedbackClass} ${mobileRevealClass}`}
              style={{
                ...sf,
                transitionDelay: `${(businessTopLinks.length + 1 + (item.delay ?? idx)) * 60}ms`,
              }}
            >
              <span className="text-center uppercase tracking-wide flex items-center gap-1.5">
                {item.label}
              </span>
            </OptimizedLink>
          );
        })}
      </div>
    );
  } else if (!isGuest) {
    menuContent = (
      <>
        <div className="space-y-1">
          {orderedPrimaryLinks.map(({ key, label, href, requiresAuth }, index) => {
            const showLockIndicator = shouldShowLockIndicator(isGuest, requiresAuth);
            return (
              <OptimizedLink
                key={key}
                href={showLockIndicator ? "/onboarding" : href}
                onClick={(e) => {
                  handleNavClick(href, e);
                  onClose();
                }}
                className={`px-3 py-2 rounded-[12px] text-base font-normal text-white hover:text-white relative min-h-[44px] flex items-center justify-center ${mobileTapFeedbackClass} ${mobileRevealClass}`}
                style={{ ...sf, transitionDelay: `${index * 60}ms` }}
                aria-label={
                  showLockIndicator
                    ? `${label.toUpperCase()} (sign in required)`
                    : label.toUpperCase()
                }
              >
                <span
                  className={`text-center uppercase flex items-center gap-1.5 ${showLockIndicator ? "opacity-85" : ""}`}
                  style={showLockIndicator ? protectedLabelStyle : undefined}
                >
                  {label}
                </span>
              </OptimizedLink>
            );
          })}
        </div>
        <div className="h-px bg-charcoal/10 my-2 mx-3" />
        <div className="space-y-1">
          {orderedSecondaryLinks.map(({ key, label, href, requiresAuth }, index) => {
            const showLockIndicator = shouldShowLockIndicator(isGuest, requiresAuth);
            return (
              <OptimizedLink
                key={key}
                href={showLockIndicator ? "/onboarding" : href}
                onClick={(e) => {
                  handleNavClick(href, e);
                  onClose();
                }}
                className={`px-3 py-2 rounded-[12px] text-base font-normal text-white/90 hover:text-white min-h-[44px] flex items-center justify-center ${mobileTapFeedbackClass} ${mobileRevealClass}`}
                style={{ ...sf, transitionDelay: `${(orderedPrimaryLinks.length + index) * 60}ms` }}
                aria-label={
                  showLockIndicator
                    ? `${label.toUpperCase()} (sign in required)`
                    : label.toUpperCase()
                }
              >
                <span
                  className={`text-center uppercase flex items-center gap-1.5 ${showLockIndicator ? "opacity-85" : ""}`}
                  style={showLockIndicator ? protectedLabelStyle : undefined}
                >
                  {label}
                </span>
              </OptimizedLink>
            );
          })}
        </div>
        {profileAction && (
          <>
            <div className="h-px bg-charcoal/10 my-2 mx-3" />
            <div className="space-y-1">
              <OptimizedLink
                href={profileAction.href}
                onClick={() => onClose()}
                className={`px-3 py-2 rounded-lg text-base font-normal text-white hover:text-white flex items-center justify-center min-h-[44px] ${mobileTapFeedbackClass} ${mobileRevealClass}`}
                style={{
                  ...sf,
                  transitionDelay: `${(orderedPrimaryLinks.length + orderedSecondaryLinks.length + 1) * 60}ms`,
                }}
              >
                <span className="text-center uppercase flex items-center gap-1.5">
                  {profileAction.label}
                </span>
              </OptimizedLink>
            </div>
          </>
        )}
      </>
    );
  } else {
    menuContent = (
      <>
        <div className="space-y-1">
          {orderedPrimaryLinks.map(({ key, label, href, requiresAuth }, index) => {
            const showLockIndicator = shouldShowLockIndicator(isGuest, requiresAuth);
            return (
              <OptimizedLink
                key={key}
                href={showLockIndicator ? "/onboarding" : href}
                onClick={(e) => {
                  handleNavClick(href, e);
                  onClose();
                }}
                className={`px-3 py-2 rounded-[12px] text-base font-normal text-white hover:text-white relative min-h-[44px] flex items-center justify-center ${mobileTapFeedbackClass} ${mobileRevealClass}`}
                style={{ ...sf, transitionDelay: `${index * 60}ms` }}
              >
                <span className="text-center uppercase flex items-center gap-1.5">{label}</span>
              </OptimizedLink>
            );
          })}
        </div>
        <div className="h-px bg-charcoal/10 my-2 mx-3" />
        <div className="space-y-1">
          {orderedSecondaryLinks.map(({ key, label, href, requiresAuth }, index) => {
            const showLockIndicator = shouldShowLockIndicator(isGuest, requiresAuth);
            return (
              <OptimizedLink
                key={key}
                href={showLockIndicator ? "/onboarding" : href}
                onClick={(e) => {
                  handleNavClick(href, e);
                  onClose();
                }}
                className={`px-3 py-2 rounded-[12px] text-base font-normal text-white/90 hover:text-white min-h-[44px] flex items-center justify-center ${mobileTapFeedbackClass} ${mobileRevealClass}`}
                style={{ ...sf, transitionDelay: `${(orderedPrimaryLinks.length + index) * 60}ms` }}
              >
                <span className="text-center uppercase flex items-center gap-1.5">{label}</span>
              </OptimizedLink>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" hideClose className="flex flex-col p-0 lg:hidden">
        {/* Accessible title/description (visually hidden) */}
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>

        <div className={`flex flex-col h-full overflow-hidden ${mobileModalRevealClass}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-charcoal/10 flex-shrink-0">
            <Wordmark />
            <Button
              variant="bare"
              size="icon"
              onClick={onClose}
              className="w-12 h-12 sm:w-16 sm:h-16 text-off-white hover:text-off-white/80 transition-colors focus:ring-0 focus:ring-offset-0"
              aria-label="Close menu"
            >
              <MobileMenuToggleIcon isOpen={isOpen} />
            </Button>
          </div>

          {/* Nav */}
          <nav className="px-3 py-2 overflow-y-auto flex-1 min-h-0">
            <div className="flex min-h-full flex-col justify-center">
              {typeof isBusinessAccountUser === "undefined" ? skeletonContent : menuContent}
            </div>
          </nav>

          {/* Guest sign-in footer */}
          {isGuest && (
            <div className="px-3 py-3 border-t border-charcoal/10 flex-shrink-0">
              <OptimizedLink
                href="/onboarding"
                onClick={() => onClose()}
                className={`px-3 py-2 rounded-[12px] text-xs font-normal text-white/80 hover:text-white min-h-[44px] flex items-center justify-center ${mobileTapFeedbackClass} ${mobileRevealClass}`}
                style={{
                  ...sf,
                  transitionDelay: `${(orderedPrimaryLinks.length + orderedSecondaryLinks.length + 1) * 60}ms`,
                }}
              >
                <span className="text-center uppercase tracking-wide">Sign in</span>
              </OptimizedLink>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
