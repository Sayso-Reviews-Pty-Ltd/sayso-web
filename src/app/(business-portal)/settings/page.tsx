"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Trash2, UserRound, Mail, ShieldAlert } from "@/app/lib/icons";
import { animations } from "../add-business/components";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Button } from "@/app/components/atoms/Button";
import { Card } from "@/app/components/ui/card";

const ICON_CHIP_CLASS =
  "inline-flex items-center justify-center rounded-full bg-off-white/80 text-charcoal/85 transition-colors duration-200 hover:bg-off-white/90";
const SMALL_ICON_CHIP_CLASS = `${ICON_CHIP_CLASS} h-6 w-6`;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Edit Profile state
  const [displayName, setDisplayName] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({ reviews: true, messages: true, bookings: true });
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    const initial = user?.profile?.display_name || user?.profile?.username || "";
    setDisplayName(initial);
    setSavedDisplayName(initial);
  }, [user?.profile?.display_name, user?.profile?.username]);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const prefs = data?.data?.notification_preferences;
        if (prefs && typeof prefs === "object") {
          setNotifPrefs({
            reviews: prefs.reviews !== false,
            messages: prefs.messages !== false,
            bookings: prefs.bookings !== false,
          });
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Account successfully deleted
      setIsDeleteConfirmOpen(false);
      window.location.href = "/onboarding";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setIsDeletingAccount(false);
      setDeleteError(`Failed to delete account: ${error.message}`);
    }
  };

  const handleSaveName = async () => {
    if (displayName === savedDisplayName || isSavingName) return;
    setIsSavingName(true);
    setNameError(null);
    setNameSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to save");
      }
      setSavedDisplayName(displayName);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleToggleNotif = async (key: "reviews" | "messages" | "bookings") => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setNotifSaved(false);
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    } catch {
      setNotifPrefs(notifPrefs);
    }
  };

  const username =
    user?.profile?.username || user?.profile?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animations }} />
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-6">
        <Breadcrumb className="pt-4 sm:pt-6 pb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/my-businesses">My Businesses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="space-y-5">
          {/* Account Summary */}
          <Card className="bg-white border-charcoal/10 shadow-sm p-5 sm:p-6">
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal font-bold text-base shadow-sm font-urbanist">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-charcoal/55 uppercase tracking-wide mb-2 font-urbanist">
                  Account Profile
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-charcoal">
                    <span className={SMALL_ICON_CHIP_CLASS}>
                      <UserRound className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm sm:text-base font-semibold truncate font-urbanist">
                      {username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-charcoal/75">
                    <span className={SMALL_ICON_CHIP_CLASS}>
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm truncate font-urbanist">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Profile */}
          <Card className="bg-white border-charcoal/10 shadow-sm p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-charcoal mb-4 font-urbanist">
              Edit Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-charcoal/55 uppercase tracking-wide block mb-2 font-urbanist">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setNameSuccess(false);
                    setNameError(null);
                  }}
                  placeholder="Your display name"
                  className="rounded-full border border-charcoal/15 px-4 py-3 text-sm font-semibold text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-navbar-bg/30 w-full font-urbanist"
                />
              </div>
              {nameError && <p className="text-xs text-coral font-urbanist">{nameError}</p>}
              {nameSuccess && (
                <p className="text-xs font-semibold text-emerald-600 font-urbanist">Name saved</p>
              )}
              <Button
                variant="bare"
                type="button"
                onClick={handleSaveName}
                disabled={displayName === savedDisplayName || isSavingName}
                className="px-5 py-2.5 bg-charcoal text-white text-sm font-semibold rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-charcoal/90 font-urbanist"
              >
                {isSavingName ? "Saving…" : "Save"}
              </Button>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-white border-charcoal/10 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-charcoal font-urbanist">
                Notifications
              </h2>
              {notifSaved && (
                <span className="text-xs font-semibold text-emerald-600 font-urbanist">Saved</span>
              )}
            </div>
            <div className="space-y-4">
              {(
                [
                  { key: "reviews", label: "New reviews" },
                  { key: "messages", label: "New messages" },
                  { key: "bookings", label: "Booking enquiries" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal font-urbanist">{label}</span>
                  <button
                    role="switch"
                    aria-checked={notifPrefs[key]}
                    onClick={() => handleToggleNotif(key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navbar-bg/30 focus:ring-offset-1 ${notifPrefs[key] ? "bg-charcoal" : "bg-charcoal/20"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${notifPrefs[key] ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Session Actions */}
          <Card className="bg-white border-charcoal/10 shadow-sm p-5 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-charcoal mb-4 font-urbanist">
              Session
            </h2>
            <Button
              variant="bare"
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-charcoal/5 hover:bg-charcoal/10 border border-charcoal/15 hover:border-charcoal/25 rounded-full text-charcoal font-semibold transition-all duration-200 text-sm font-urbanist"
            >
              <span className={SMALL_ICON_CHIP_CLASS}>
                <LogOut className="w-3.5 h-3.5" />
              </span>
              Log Out
            </Button>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white border-coral/30 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className={SMALL_ICON_CHIP_CLASS}>
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-charcoal font-urbanist">
                Danger Zone
              </h2>
            </div>

            <p className="text-sm text-charcoal/75 mb-4 font-urbanist">
              Deleting your account permanently removes your profile, businesses, and activity data.
            </p>

            {!isDeleteConfirmOpen ? (
              <Button
                variant="bare"
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-coral/5 border border-coral/40 hover:border-coral/55 rounded-full text-coral font-semibold transition-all duration-200 text-sm font-urbanist"
              >
                <span className={SMALL_ICON_CHIP_CLASS}>
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
                Delete Account
              </Button>
            ) : (
              <div className="bg-white border border-coral/35 rounded-[12px] shadow-sm p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-charcoal mb-2 font-urbanist">Delete Account</h3>
                  <p className="text-sm text-charcoal/75 mb-3 font-urbanist">
                    This action cannot be undone. All your data, including your businesses, will be
                    permanently deleted.
                  </p>
                  {deleteError && (
                    <p className="text-sm text-coral mb-3 font-urbanist">{deleteError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="bare"
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    disabled={isDeletingAccount}
                    className="flex-1 px-4 py-2.5 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal font-medium rounded-full text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-urbanist"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="bare"
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex-1 px-4 py-2.5 bg-coral hover:bg-coral/90 text-white font-medium rounded-full text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-urbanist"
                  >
                    {isDeletingAccount ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
