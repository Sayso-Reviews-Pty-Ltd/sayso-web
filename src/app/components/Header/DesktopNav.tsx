"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAddDropdownLogic } from "./hooks/useAddDropdownLogic";
import { useBellAnimation } from "./hooks/useBellAnimation";
import { getNavStyles, isPathActive } from "./parts/DesktopNavStyles";
import { DesktopNavCenter } from "./parts/DesktopNavCenter";
import { DesktopNavIcons } from "./parts/DesktopNavIcons";
import { ADD_MENU_ITEMS, type DesktopNavProps, type NavLink } from "./DesktopNav.types";

export default function DesktopNav(props: DesktopNavProps) {
  const {
    whiteText,
    isGuest,
    isBusinessAccountUser,
    isClaimBusinessActive,
    isDiscoverActive,
    primaryLinks,
    discoverLinks,
    businessLinks,
    isNotificationsActive,
    isMessagesActive,
    isProfileActive,
    isSettingsActive,
    savedCount,
    unreadCount,
    messageUnreadCount,
    handleNavClick,
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
    sf,
    mode = "full",
  } = props;

  const pathname = usePathname();

  const [mounted] = useState(() => {
    if (typeof window === "undefined") return false;
    return true;
  });

  const [hoveredNavKey, setHoveredNavKey] = useState<string | null>(null);
  const bellControls = useBellAnimation(unreadCount);

  const {
    addDropdownRef,
    isAddDropdownOpen,
    isAddDropdownClosing,
    openAddDropdown,
    closeAddDropdown,
    scheduleAddDropdownClose,
    clearAddHoverTimeout,
  } = useAddDropdownLogic();

  const messagesHref = isGuest
    ? "/onboarding"
    : isBusinessAccountUser
      ? "/my-businesses/messages"
      : "/dm";

  const navStyles = getNavStyles(whiteText);

  const isAddGroupActive = ADD_MENU_ITEMS.some((item) => isPathActive(item.href, pathname));

  // Keep runtime stable if account type isn't ready yet
  if (typeof isBusinessAccountUser === "undefined") return null;
  const centerNav = (
    <DesktopNavCenter
      pathname={pathname}
      isGuest={isGuest}
      isBusinessAccountUser={isBusinessAccountUser}
      isClaimBusinessActive={isClaimBusinessActive}
      isDiscoverActive={isDiscoverActive}
      mounted={mounted}
      hoveredNavKey={hoveredNavKey}
      setHoveredNavKey={setHoveredNavKey}
      handleNavClick={handleNavClick}
      sf={sf}
      styles={navStyles}
      primaryLinks={primaryLinks}
      discoverLinks={discoverLinks}
      businessLinks={businessLinks}
      discoverDropdownRef={discoverDropdownRef}
      discoverMenuPortalRef={discoverMenuPortalRef}
      discoverBtnRef={discoverBtnRef}
      discoverMenuPos={discoverMenuPos}
      isDiscoverDropdownOpen={isDiscoverDropdownOpen}
      isDiscoverDropdownClosing={isDiscoverDropdownClosing}
      clearDiscoverHoverTimeout={clearDiscoverHoverTimeout}
      openDiscoverDropdown={openDiscoverDropdown}
      closeDiscoverDropdown={closeDiscoverDropdown}
      scheduleDiscoverDropdownClose={scheduleDiscoverDropdownClose}
      addDropdownRef={addDropdownRef}
      isAddDropdownOpen={isAddDropdownOpen}
      isAddDropdownClosing={isAddDropdownClosing}
      isAddGroupActive={isAddGroupActive}
      openAddDropdown={openAddDropdown}
      closeAddDropdown={closeAddDropdown}
      scheduleAddDropdownClose={scheduleAddDropdownClose}
      clearAddHoverTimeout={clearAddHoverTimeout}
      addMenuItems={ADD_MENU_ITEMS}
    />
  );
  const icons = (
    <DesktopNavIcons
      pathname={pathname}
      whiteText={whiteText}
      isGuest={isGuest}
      isBusinessAccountUser={isBusinessAccountUser}
      isNotificationsActive={isNotificationsActive}
      isMessagesActive={isMessagesActive}
      isProfileActive={isProfileActive}
      isSettingsActive={isSettingsActive}
      savedCount={savedCount}
      unreadCount={unreadCount}
      messageUnreadCount={messageUnreadCount}
      messagesHref={messagesHref}
      handleNavClick={handleNavClick}
      bellControls={bellControls}
      styles={navStyles}
    />
  );

  if (mode === "iconsOnly") {
    return icons;
  }

  if (mode === "navOnly") {
    return (
      <nav className="w-full flex items-center justify-center">
        {centerNav}
      </nav>
    );
  }

  return (
    // ??? 3-zone layout so Home / Discover / Leaderboard sit centered
    // Equal gap-2 lg:gap-4 matches Header for visual symmetry
    <nav className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-4">
      {/* Left spacer (matches right icons section width for symmetry) */}
      <div className="min-w-0" />
      {centerNav}
      {icons}
    </nav>
  );
}

// Re-export types for external use
export type { NavLink };
