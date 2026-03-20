import type { CSSProperties, MouseEvent as ReactMouseEvent, RefObject } from "react";

export type NavLink = {
  key: string;
  label: string;
  href: string;
  requiresAuth: boolean;
  description?: string;
};

export interface DesktopNavStyles {
  baseLinkClass: string;
  navLabelHoverClass: string;
  activeTextClass: string;
  idleTextClass: string;
  businessPalette: string;
  iconWrapClass: (isActive: boolean) => string;
  iconClass: (isActive: boolean) => string;
  pillClass: string;
  pillTransition: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass: number;
  };
}

export interface DesktopNavProps {
  whiteText: boolean;
  isGuest: boolean;
  isBusinessAccountUser: boolean;
  isClaimBusinessActive: boolean;
  isDiscoverActive: boolean;
  primaryLinks: readonly NavLink[];
  discoverLinks: readonly NavLink[];
  businessLinks: readonly NavLink[];
  isNotificationsActive: boolean;
  isMessagesActive: boolean;
  isProfileActive: boolean;
  isSettingsActive: boolean;
  savedCount: number;
  unreadCount: number;
  messageUnreadCount: number;
  handleNavClick: (href: string, e?: ReactMouseEvent) => void;

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

  sf: CSSProperties;
  mode?: "full" | "navOnly" | "iconsOnly";
}

export const ADD_MENU_ITEMS: readonly NavLink[] = [
  { key: "add-business", label: "Add New Business", href: "/add-business", requiresAuth: true },
  { key: "add-special", label: "Add Special", href: "/add-special", requiresAuth: true },
  { key: "add-event", label: "Add Event", href: "/add-event", requiresAuth: true },
] as const;
