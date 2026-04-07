"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  Edit,
  ChevronRight,
  Bookmark,
  Home,
  User,
  Search,
  Settings,
  HelpCircle,
} from "@/app/lib/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/app/components/ui/sheet";

interface MenuModalProps {
  isOpen: boolean;
  isVisible: boolean;
  onClose: () => void;
}

// Expo-out cubic-bezier — fast start, silky deceleration into place
const expoOut = [0.32, 0.72, 0, 1] as const;

// Stagger container — delays children so they cascade in after the panel arrives
const navContainer = {
  open: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
  closed: {},
};

// Each nav item fades in and drifts slightly from the left
const navItem = {
  open: { opacity: 1, x: 0, transition: { duration: 0.38, ease: expoOut } },
  closed: { opacity: 0, x: -10 },
};

// Header fades in a touch faster than the items
const headerVariant = {
  open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: expoOut } },
  closed: { opacity: 0, y: -6 },
};

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const { user } = useAuth();
  const { savedCount } = useSavedItems();
  const router = useRouter();
  const pathname = usePathname();

  const isSavedActive = pathname === "/saved" || pathname?.startsWith("/saved");
  const isHomeActive = pathname === "/home" || pathname === "/";
  const isProfileActive = pathname === "/profile" || pathname?.startsWith("/profile");

  const handleNavigation = (href: string) => {
    onClose();
    router.push(href, { scroll: false });
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="left"
        hideClose
        className="w-80 max-w-[80vw] flex flex-col p-0 overflow-y-auto"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>

        {/* Header */}
        <m.div
          initial="closed"
          animate="open"
          variants={headerVariant}
          className="flex items-center justify-between p-6 border-b border-sage/10"
        >
          <div>
            <h2 className="font-urbanist text-xl font-700 text-transparent bg-clip-text bg-gradient-to-r from-sage via-sage/90 to-charcoal">
              sayso Menu
            </h2>
            <p className="font-urbanist text-sm text-charcoal/60 mt-1">Navigate your local world</p>
          </div>
        </m.div>

        {/* Navigation Links */}
        <m.div initial="closed" animate="open" variants={navContainer} className="p-6 space-y-2">
          <m.div variants={navItem} className="mb-4">
            <span className="font-urbanist text-sm font-600 text-charcoal/60 uppercase tracking-wide">
              Discover
            </span>
          </m.div>

          <m.button
            variants={navItem}
            onClick={() => handleNavigation("/business/review")}
            className="w-full flex items-center space-x-4 p-4 rounded-[12px] hover:bg-card-bg/5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center group-hover:bg-coral/20 transition-colors duration-200">
              <Edit className="w-5 h-5 text-coral" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-urbanist text-base font-bold text-charcoal group-hover:text-sage transition-colors duration-200">
                Write Review
              </span>
              <p className="text-sm text-charcoal/60 mt-1">Share your local experiences</p>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
          </m.button>

          <m.div variants={navItem}>
            <Link
              href="/saved"
              onClick={onClose}
              className={`w-full flex items-center space-x-4 p-4 rounded-[12px] transition-all duration-200 group relative ${isSavedActive ? "bg-card-bg/5" : "hover:bg-card-bg/5"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 relative ${isSavedActive ? "bg-card-bg/20" : "bg-card-bg/10 group-hover:bg-card-bg/20"}`}
              >
                <Bookmark
                  className={`w-5 h-5 ${isSavedActive ? "text-sage" : "text-charcoal/60"}`}
                  fill={isSavedActive ? "currentColor" : "none"}
                />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[12px] h-5 px-1.5 bg-card-bg text-white text-[11px] font-semibold rounded-full shadow-md">
                    {savedCount > 99 ? "99+" : savedCount}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <span
                  className={`font-urbanist text-base font-bold transition-colors duration-200 ${isSavedActive ? "text-sage" : "text-charcoal group-hover:text-sage"}`}
                >
                  Saved Places
                </span>
                <p className="text-sm text-charcoal/60 mt-1">Your favorite local gems</p>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
            </Link>
          </m.div>

          <m.div variants={navItem}>
            <Link
              href="/home"
              onClick={onClose}
              className={`w-full flex items-center space-x-4 p-4 rounded-[12px] transition-all duration-200 group ${isHomeActive ? "bg-card-bg/5" : "hover:bg-card-bg/5"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${isHomeActive ? "bg-card-bg/20" : "bg-card-bg/10 group-hover:bg-card-bg/20"}`}
              >
                <Home
                  className={`w-5 h-5 ${isHomeActive ? "text-sage" : "text-charcoal/60"}`}
                  fill={isHomeActive ? "currentColor" : "none"}
                />
              </div>
              <div className="flex-1 text-left">
                <span
                  className={`font-urbanist text-base font-bold transition-colors duration-200 ${isHomeActive ? "text-sage" : "text-charcoal group-hover:text-sage"}`}
                >
                  Home
                </span>
                <p className="text-sm text-charcoal/60 mt-1">Discover local businesses</p>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
            </Link>
          </m.div>

          <m.div variants={navItem}>
            <Link
              href="/profile"
              onClick={onClose}
              className={`w-full flex items-center space-x-4 p-4 rounded-[12px] transition-all duration-200 group ${isProfileActive ? "bg-card-bg/5" : "hover:bg-card-bg/5"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${isProfileActive ? "bg-card-bg/20" : "bg-card-bg/10 group-hover:bg-card-bg/20"}`}
              >
                <User
                  className={`w-5 h-5 ${isProfileActive ? "text-sage" : "text-charcoal/60"}`}
                  fill={isProfileActive ? "currentColor" : "none"}
                />
              </div>
              <div className="flex-1 text-left">
                <span
                  className={`font-urbanist text-base font-bold transition-colors duration-200 ${isProfileActive ? "text-sage" : "text-charcoal group-hover:text-sage"}`}
                >
                  Profile
                </span>
                <p className="text-sm text-charcoal/60 mt-1">Your reviews and settings</p>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
            </Link>
          </m.div>

          <m.button
            variants={navItem}
            onClick={() => {
              onClose();
              const searchInput = document.querySelector(
                'input[placeholder*="Search"]'
              ) as HTMLInputElement;
              if (searchInput) searchInput.focus();
            }}
            className="w-full flex items-center space-x-4 p-4 rounded-[12px] hover:bg-card-bg/5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-card-bg/10 rounded-full flex items-center justify-center group-hover:bg-card-bg/20 transition-colors duration-200">
              <Search className="w-5 h-5 text-sage" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-urbanist text-base font-bold text-charcoal group-hover:text-sage transition-colors duration-200">
                Search
              </span>
              <p className="text-sm text-charcoal/60 mt-1">Find specific businesses</p>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
          </m.button>
        </m.div>

        {/* User Section */}
        {user && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.32, ease: "easeOut" }}
            className="mt-auto p-6 border-t border-sage/10"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-card-bg/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-sage" />
              </div>
              <div>
                <span className="font-urbanist text-base font-600 text-charcoal">
                  {user.name || user.email?.split("@")[0] || "User"}
                </span>
                <p className="text-sm text-charcoal/60">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleNavigation("/settings")}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-card-bg/5 transition-all duration-200 group"
              >
                <Settings className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
                <span className="font-urbanist text-sm font-bold text-charcoal group-hover:text-sage transition-colors duration-200">
                  Settings
                </span>
              </button>
              <button
                onClick={() => handleNavigation("/help")}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-card-bg/5 transition-all duration-200 group"
              >
                <HelpCircle className="w-4 h-4 text-charcoal/60 group-hover:text-sage transition-colors duration-200" />
                <span className="font-urbanist text-sm font-bold text-charcoal group-hover:text-sage transition-colors duration-200">
                  Help & Support
                </span>
              </button>
            </div>
          </m.div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-sage/10">
          <p className="text-sm sm:text-xs text-charcoal/60 text-center">
            sayso - Discover trusted local gems
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
