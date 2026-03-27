"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  FileCheck,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  Tag,
  Settings,
} from "@/app/lib/icons";
import Wordmark from "../Logo/Wordmark";
import { useMessageUnreadCount } from "@/app/hooks/messaging";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

const TOP_NAV = [
  { href: "/my-businesses", label: "My Businesses", icon: LayoutDashboard, exact: true },
  { href: "/my-businesses/messages", label: "Inbox", icon: MessageSquare, exact: true },
] as const;

const CREATE_NAV = [
  { href: "/add-business", label: "Add Business", icon: Store, exact: true },
  { href: "/add-event", label: "Add Event", icon: Calendar, exact: true },
  { href: "/add-special", label: "Add Special", icon: Tag, exact: true },
] as const;

const BOTTOM_NAV = [
  { href: "/claim-business", label: "Claim a Business", icon: FileCheck, exact: false },
  { href: "/settings", label: "Settings", icon: Settings, exact: true },
] as const;

export const PORTAL_NAV_ITEMS = [...TOP_NAV, ...CREATE_NAV, ...BOTTOM_NAV];

interface PortalSidebarProps {
  pathname: string;
  onClose?: () => void;
}

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  active,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
        active
          ? "bg-white/15 text-white shadow-sm"
          : "text-white/65 hover:bg-white/8 hover:text-white"
      }`}
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`}
      />
      <span className="flex-1 font-urbanist">{label}</span>
      {badge != null && badge > 0 && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral px-1.5 text-[10px] font-bold text-white shadow-sm">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {active && <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
    </Link>
  );
}

export default function PortalSidebar({ pathname, onClose }: PortalSidebarProps) {
  const { user } = useAuth();
  const { unreadCount } = useMessageUnreadCount({ role: "business", enabled: true });
  const handleMobileLinkClick = onClose ? () => onClose() : undefined;

  const isCreateActive = CREATE_NAV.some(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href)
  );
  const [createOpen, setCreateOpen] = useState(isCreateActive);

  // Auto-open when navigating into a Create route
  useEffect(() => {
    if (isCreateActive) setCreateOpen(true);
  }, [isCreateActive]);

  const email = user?.email ?? user?.profile?.email ?? "";
  const displayName = user?.profile?.display_name ?? user?.profile?.username ?? null;
  const avatarUrl = user?.profile?.avatar_url ?? user?.avatar_url;
  const initials = getInitials(displayName, email || undefined);

  return (
    <aside className="flex flex-col h-full bg-navbar-bg text-off-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link
          href="/my-businesses"
          className="flex items-center gap-2.5"
          onClick={handleMobileLinkClick}
        >
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <Wordmark size="text-base" className="tracking-tight" />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {TOP_NAV.map(({ href, label, icon, exact }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            exact={exact}
            active={exact ? pathname === href : pathname.startsWith(href)}
            badge={href === "/my-businesses/messages" ? unreadCount : undefined}
            onClick={handleMobileLinkClick}
          />
        ))}

        {/* Create — collapsible group */}
        <Collapsible open={createOpen} onOpenChange={setCreateOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isCreateActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              }`}
            >
              <PlusCircle
                className={`w-4 h-4 flex-shrink-0 ${isCreateActive ? "text-white" : "text-white/50 group-hover:text-white/80"}`}
              />
              <span className="flex-1 font-urbanist text-left">Create</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${createOpen ? "rotate-180" : ""} ${isCreateActive ? "text-white/50" : "text-white/30 group-hover:text-white/50"}`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 pl-3 pt-0.5">
            {CREATE_NAV.map(({ href, label, icon, exact }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                exact={exact}
                active={exact ? pathname === href : pathname.startsWith(href)}
                onClick={handleMobileLinkClick}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>

        {BOTTOM_NAV.map(({ href, label, icon, exact }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            exact={exact}
            active={exact ? pathname === href : pathname.startsWith(href)}
            onClick={handleMobileLinkClick}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        {email && (
          <Link
            href="/settings"
            onClick={handleMobileLinkClick}
            className="flex items-center gap-2.5 min-w-0 rounded-lg hover:bg-white/8 transition-colors p-1 -mx-1"
          >
            <Avatar className="w-7 h-7 flex-shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? email} />}
              <AvatarFallback className="text-xs font-semibold bg-white/15 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              {displayName && (
                <span className="text-xs font-medium text-white/80 font-urbanist truncate leading-tight">
                  {displayName}
                </span>
              )}
              <span className="text-[10px] text-white/40 font-urbanist truncate leading-tight">
                {email}
              </span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
