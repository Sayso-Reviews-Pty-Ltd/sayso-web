"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useBellAnimation } from "./hooks/useBellAnimation";
import { getNavStyles, isPathActive } from "./parts/DesktopNavStyles";
import { DesktopNavCenter } from "./parts/DesktopNavCenter";
import { DesktopNavIcons } from "./parts/DesktopNavIcons";
import { type DesktopNavProps, type NavLink } from "./DesktopNav.types";

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
    sf,
    mode = "full",
  } = props;

  const pathname = usePathname();

  const [hoveredNavKey, setHoveredNavKey] = useState<string | null>(null);
  const bellControls = useBellAnimation(unreadCount);

  const messagesHref = isGuest
    ? "/onboarding"
    : isBusinessAccountUser
      ? "/my-businesses/messages"
      : "/dm";

  const navStyles = getNavStyles(whiteText);

  // Keep runtime stable if account type isn't ready yet
  if (typeof isBusinessAccountUser === "undefined") return null;
  const centerNav = (
    <DesktopNavCenter
      pathname={pathname}
      isGuest={isGuest}
      isBusinessAccountUser={isBusinessAccountUser}
      isClaimBusinessActive={isClaimBusinessActive}
      isDiscoverActive={isDiscoverActive}
      hoveredNavKey={hoveredNavKey}
      setHoveredNavKey={setHoveredNavKey}
      handleNavClick={handleNavClick}
      sf={sf}
      styles={navStyles}
      primaryLinks={primaryLinks}
      discoverLinks={discoverLinks}
      businessLinks={businessLinks}
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
    return <div className="w-full flex items-center justify-center">{centerNav}</div>;
  }

  return (
    // 3-zone layout so Home / Discover / Leaderboard sit centered
    // Equal gap-2 lg:gap-4 matches Header for visual symmetry
    <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 lg:gap-4">
      {/* Left spacer (matches right icons section width for symmetry) */}
      <div className="min-w-0" />
      {centerNav}
      {icons}
    </div>
  );
}

// Re-export types for external use
export type { NavLink };
