"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { m } from "framer-motion";
import {
  Bell,
  BellOutline,
  MessageSquare,
  MessageSquareOutline,
  User,
  UserOutline,
  Settings,
  SettingsOutline,
  Bookmark,
  BookmarkOutline,
} from "@/app/lib/icons";
import OptimizedLink from "../../Navigation/OptimizedLink";
import type { DesktopNavStyles } from "../DesktopNav.types";
import type { useBellAnimation } from "../hooks/useBellAnimation";

interface DesktopNavIconsProps {
  pathname: string;
  whiteText: boolean;
  isGuest: boolean;
  isBusinessAccountUser: boolean;
  isNotificationsActive: boolean;
  isMessagesActive: boolean;
  isProfileActive: boolean;
  isSettingsActive: boolean;
  savedCount: number;
  unreadCount: number;
  messageUnreadCount: number;
  messagesHref: string;
  handleNavClick: (href: string, e?: ReactMouseEvent) => void;
  bellControls: ReturnType<typeof useBellAnimation>;
  styles: DesktopNavStyles;
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] leading-none font-extrabold tracking-tight rounded-full bg-coral text-white ring-[1.5px] ring-white/85 shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function DesktopNavIcons({
  pathname,
  whiteText,
  isGuest,
  isBusinessAccountUser,
  isNotificationsActive,
  isMessagesActive,
  isProfileActive,
  isSettingsActive,
  savedCount,
  unreadCount,
  messageUnreadCount,
  messagesHref,
  handleNavClick,
  bellControls,
  styles,
}: DesktopNavIconsProps) {
  const isSavedActive = pathname === "/saved";
  const { iconWrapClass, iconClass } = styles;

  return (
    <div className="flex items-center justify-end gap-2 min-w-0">
      {!isBusinessAccountUser ? (
        <>
          {isGuest ? (
            <OptimizedLink
              href="/onboarding"
              className={`${iconWrapClass(false)} cursor-pointer pointer-events-auto select-none relative z-[2]`}
              aria-label="Sign in for notifications"
            >
              <m.span className="inline-flex" animate={bellControls}>
                <BellOutline className={`${iconClass(false)} pointer-events-none`} />
              </m.span>
            </OptimizedLink>
          ) : (
            <div className="relative">
              <OptimizedLink
                href="/notifications"
                onClick={(e) => handleNavClick("/notifications", e)}
                className={`${iconWrapClass(isNotificationsActive)} cursor-pointer pointer-events-auto select-none z-[2]`}
                aria-label="Notifications"
              >
                <m.span className="inline-flex" animate={bellControls}>
                  {isNotificationsActive ? (
                    <Bell className={`${iconClass(true)} pointer-events-none`} />
                  ) : (
                    <BellOutline className={`${iconClass(false)} pointer-events-none`} />
                  )}
                </m.span>
              </OptimizedLink>
              <CountBadge count={unreadCount} />
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isGuest && (
              <div className="relative">
                <OptimizedLink
                  href="/saved"
                  className={`group flex w-10 h-10 items-center justify-center rounded-full transition-[color,transform] duration-200 ease-in-out lg:hover:scale-105 lg:focus-visible:scale-105 ${
                    isSavedActive
                      ? "text-sage"
                      : whiteText
                        ? "text-white hover:text-white/85"
                        : "text-charcoal/80 hover:text-sage"
                  }`}
                  aria-label="Saved"
                >
                  {isSavedActive ? (
                    <Bookmark className={iconClass(true)} />
                  ) : (
                    <BookmarkOutline className={iconClass(false)} />
                  )}
                </OptimizedLink>
                <CountBadge count={savedCount} />
              </div>
            )}

            <div className="relative">
              <OptimizedLink
                href={messagesHref}
                onClick={(e) => {
                  if (!isGuest) {
                    handleNavClick(messagesHref, e);
                  }
                }}
                className={`${iconWrapClass(isMessagesActive)} cursor-pointer pointer-events-auto select-none z-[2]`}
                aria-label={isGuest ? "Sign in for messages" : "Messages"}
              >
                {isMessagesActive ? (
                  <MessageSquare className={`${iconClass(true)} pointer-events-none`} />
                ) : (
                  <MessageSquareOutline className={`${iconClass(false)} pointer-events-none`} />
                )}
              </OptimizedLink>
              <CountBadge count={messageUnreadCount} />
            </div>

            <div className="relative">
              <OptimizedLink
                href={isGuest ? "/onboarding" : "/profile"}
                className={iconWrapClass(isProfileActive)}
                aria-label={isGuest ? "Sign in" : "Profile"}
              >
                {isProfileActive ? (
                  <User className={iconClass(true)} />
                ) : (
                  <UserOutline className={iconClass(false)} />
                )}
              </OptimizedLink>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative">
            <OptimizedLink
              href={messagesHref}
              onClick={(e) => {
                if (!isGuest) {
                  handleNavClick(messagesHref, e);
                }
              }}
              className={`${iconWrapClass(isMessagesActive)} cursor-pointer pointer-events-auto select-none z-[2]`}
              aria-label={isGuest ? "Sign in for messages" : "Messages"}
            >
              {isMessagesActive ? (
                <MessageSquare className={`${iconClass(true)} pointer-events-none`} />
              ) : (
                <MessageSquareOutline className={`${iconClass(false)} pointer-events-none`} />
              )}
            </OptimizedLink>
            <CountBadge count={messageUnreadCount} />
          </div>

          <div className="relative">
            <OptimizedLink
              href={isGuest ? "/onboarding" : "/settings"}
              className={iconWrapClass(isSettingsActive)}
              aria-label={isGuest ? "Sign in" : "Settings"}
            >
              {isSettingsActive ? (
                <Settings className={iconClass(true)} />
              ) : (
                <SettingsOutline className={iconClass(false)} />
              )}
            </OptimizedLink>
          </div>
        </>
      )}
    </div>
  );
}
