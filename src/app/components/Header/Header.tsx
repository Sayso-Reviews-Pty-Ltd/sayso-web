// src/components/Header/Header.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import MobileMenu from "./MobileMenu";
import HeaderSkeleton from "./HeaderSkeleton";
import { useHeaderState } from "./useHeaderState";
import { getLogoHref } from "./headerActionsConfig";
import { usePrefetchRoutes } from "../../hooks/usePrefetchRoutes";
import { AdminHeaderRole } from "./roles/AdminHeaderRole";
import { PersonalHeaderRole } from "./roles/PersonalHeaderRole";
import { BusinessHeaderRole } from "./roles/BusinessHeaderRole";
import { useHeaderSearchController } from "./hooks/useHeaderSearchController";
import {
  renderHeaderDesktopSearchInput,
  renderHeaderMobileSearchInput,
} from "./parts/HeaderSearchRenderers";

export default function Header({
  showSearch = true,
  variant = "white",
  backgroundClassName,
  searchLayout = "floating",
  forceSearchOpen = false,
  forcePersonalMode = false,
  topPosition = "top-6",
  reducedPadding = false,
  whiteText = true,
  heroMode = false,
  heroSearchButton = false,
}: {
  showSearch?: boolean;
  variant?: "white" | "frosty";
  backgroundClassName?: string;
  searchLayout?: "floating" | "stacked";
  forceSearchOpen?: boolean;
  forcePersonalMode?: boolean;
  topPosition?: string;
  reducedPadding?: boolean;
  whiteText?: boolean;
  heroMode?: boolean;
  heroSearchButton?: boolean;
}) {
  const {
    authLoading,
    isGuest,
    isAdminUser,
    isBusinessAccountUser,
    logout,
    unreadCount,
    messageUnreadCount,
    savedCount,
    pathname,
    navLinks,
    isDiscoverActive,
    isNotificationsActive,
    isMessagesActive,
    isProfileActive,
    isSettingsActive,
    isClaimBusinessActive,
    isMobileMenuOpen,
    headerRef,
    handleNavClick,
    setIsMobileMenuOpen,
    fontStyle: sf,
  } = useHeaderState({ searchLayout, forceSearchOpen, forcePersonalMode });

  const router = useRouter();

  // Prefetch critical routes for instant navigation
  usePrefetchRoutes();

  const effectiveIsGuest = isGuest;
  const effectiveIsAdminUser = isAdminUser;
  const effectiveIsBusinessAccountUser = isBusinessAccountUser;
  const effectiveNavLinks = navLinks;

  const isHomePage = pathname === "/" || pathname === "/home";
  const isPersonalLayout = !effectiveIsBusinessAccountUser && !effectiveIsAdminUser;

  const searchController = useHeaderSearchController({
    pathname,
    isHomePage,
    isPersonalLayout,
    isGuest: effectiveIsGuest,
  });

  const isHomepageHeroOverlay = isHomePage && searchController.urlSearchQuery.trim().length === 0;
  const [isHomepageAtTop, setIsHomepageAtTop] = useState(true);

  useEffect(() => {
    if (!isHomepageHeroOverlay) {
      setIsHomepageAtTop(true);
      return;
    }

    let rafId = 0;
    const updateScrollState = () => {
      const nextAtTop = window.scrollY <= 0.5;
      setIsHomepageAtTop((prev) => (prev === nextAtTop ? prev : nextAtTop));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateScrollState();
      });
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHomepageHeroOverlay]);

  const headerClassName = `${
    isHomepageHeroOverlay ? "fixed" : "sticky"
  } top-0 left-0 right-0 w-full z-50 pt-[var(--safe-area-top)] transition-colors duration-300 ease-out`;
  const headerSurfaceClass =
    isHomepageHeroOverlay && isHomepageAtTop
      ? "bg-transparent shadow-none"
      : "bg-navbar-bg shadow-md";

  const logoHref = effectiveIsGuest
    ? "/home?guest=true"
    : getLogoHref(effectiveIsBusinessAccountUser);
  const messagesHref = effectiveIsGuest
    ? "/onboarding"
    : effectiveIsBusinessAccountUser
      ? "/my-businesses/messages"
      : "/dm";

  useEffect(() => {
    if (effectiveIsAdminUser) {
      void router.prefetch("/onboarding");
    }
  }, [effectiveIsAdminUser, router]);

  const handleAdminSignOut = useCallback(() => {
    void logout();
  }, [logout]);

  const renderDesktopSearchInput = (expandedWidth: number = 280) =>
    renderHeaderDesktopSearchInput(searchController, sf, expandedWidth);
  const renderMobileSearchInput = () => renderHeaderMobileSearchInput(searchController, sf);

  const currentPaddingClass = heroMode ? "py-0" : reducedPadding ? "py-1" : "py-4";
  const horizontalPaddingClass = heroMode ? "px-2" : `px-2 ${currentPaddingClass}`;

  const desktopNavProps = {
    whiteText,
    isGuest: effectiveIsGuest,
    isBusinessAccountUser: effectiveIsBusinessAccountUser,
    isClaimBusinessActive,
    isDiscoverActive,
    primaryLinks: effectiveNavLinks.primaryLinks,
    discoverLinks: effectiveNavLinks.discoverLinks,
    businessLinks: effectiveNavLinks.businessLinks,
    isNotificationsActive,
    isMessagesActive,
    isProfileActive,
    isSettingsActive,
    savedCount,
    unreadCount,
    messageUnreadCount,
    handleNavClick,
    sf,
  };

  if (authLoading) {
    return <HeaderSkeleton showSearch={showSearch} />;
  }

  const wrapperSizeClass = "pt-4 min-h-[72px] lg:min-h-[80px]";
  const logoScaleClass = "";

  return (
    <>
      <header
        ref={headerRef}
        className={`${headerClassName} ${headerSurfaceClass} font-urbanist`}
        style={sf}
      >
        <div
          className={`relative z-[1] w-full ${horizontalPaddingClass} flex items-center h-full ${wrapperSizeClass}`}
        >
          {effectiveIsAdminUser ? (
            <AdminHeaderRole
              pathname={pathname}
              logoScaleClass={logoScaleClass}
              sf={sf}
              onSignOut={handleAdminSignOut}
            />
          ) : isPersonalLayout ? (
            <PersonalHeaderRole
              isHomePage={isHomePage}
              logoHref={logoHref}
              logoScaleClass={logoScaleClass}
              showSearch={showSearch}
              desktopSearchExpandedWidth={searchController.desktopSearchExpandedWidth}
              renderDesktopSearchInput={renderDesktopSearchInput}
              isMobileSearchOpen={searchController.isMobileSearchOpen}
              renderMobileSearchInput={renderMobileSearchInput}
              handleMobileSearchToggle={searchController.handleMobileSearchToggle}
              whiteText={whiteText}
              isGuest={effectiveIsGuest}
              isNotificationsActive={isNotificationsActive}
              unreadCount={unreadCount}
              messagesHref={messagesHref}
              isMessagesActive={isMessagesActive}
              messageUnreadCount={messageUnreadCount}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              homeDesktopRowRef={searchController.homeDesktopRowRef}
              homeDesktopNavRef={searchController.homeDesktopNavRef}
              homeDesktopIconsRef={searchController.homeDesktopIconsRef}
              desktopNavProps={desktopNavProps}
            />
          ) : (
            <BusinessHeaderRole
              logoHref={logoHref}
              logoScaleClass={logoScaleClass}
              desktopNavProps={desktopNavProps}
              isMobileSearchOpen={searchController.isMobileSearchOpen}
              messagesHref={messagesHref}
              isMessagesActive={isMessagesActive}
              whiteText={whiteText}
              isGuest={effectiveIsGuest}
              messageUnreadCount={messageUnreadCount}
              isBusinessAccountUser={effectiveIsBusinessAccountUser}
              isSettingsActive={isSettingsActive}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          )}
        </div>
      </header>

      {!effectiveIsAdminUser && (
        <AnimatePresence>
          {searchController.isMobileSearchOpen && searchController.isSuggestionsOpen && (
            <m.div
              key="search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-[2px] lg:hidden"
              onClick={() => {
                searchController.setIsMobileSearchOpen(false);
                searchController.setActiveSuggestionIndex(-1);
              }}
              aria-hidden
            />
          )}
        </AnimatePresence>
      )}

      {!effectiveIsAdminUser && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isBusinessAccountUser={effectiveIsBusinessAccountUser}
          isGuest={effectiveIsGuest}
          primaryLinks={effectiveNavLinks.primaryLinks}
          discoverLinks={effectiveNavLinks.discoverLinks}
          businessLinks={effectiveNavLinks.businessLinks}
          handleNavClick={handleNavClick}
          sf={sf}
        />
      )}
    </>
  );
}
