"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useAddDropdownLogic() {
  const pathname = usePathname();
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isAddDropdownClosing, setIsAddDropdownClosing] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);
  const addCloseTimeoutRef = useRef<number | null>(null);
  const addCloseAnimationTimeoutRef = useRef<number | null>(null);

  const clearAddHoverTimeout = useCallback(() => {
    if (addCloseTimeoutRef.current) {
      clearTimeout(addCloseTimeoutRef.current);
      addCloseTimeoutRef.current = null;
    }
  }, []);

  const clearAddCloseAnimationTimeout = useCallback(() => {
    if (addCloseAnimationTimeoutRef.current) {
      clearTimeout(addCloseAnimationTimeoutRef.current);
      addCloseAnimationTimeoutRef.current = null;
    }
  }, []);

  const openAddDropdown = useCallback(() => {
    clearAddHoverTimeout();
    clearAddCloseAnimationTimeout();
    setIsAddDropdownClosing(false);
    setIsAddDropdownOpen(true);
  }, [clearAddHoverTimeout, clearAddCloseAnimationTimeout]);

  const closeAddDropdown = useCallback(() => {
    clearAddHoverTimeout();
    clearAddCloseAnimationTimeout();
    setIsAddDropdownClosing(true);
    addCloseAnimationTimeoutRef.current = window.setTimeout(() => {
      setIsAddDropdownOpen(false);
      setIsAddDropdownClosing(false);
      addCloseAnimationTimeoutRef.current = null;
    }, 150);
  }, [clearAddHoverTimeout, clearAddCloseAnimationTimeout]);

  const scheduleAddDropdownClose = useCallback(() => {
    clearAddHoverTimeout();
    addCloseTimeoutRef.current = window.setTimeout(() => {
      closeAddDropdown();
    }, 120);
  }, [clearAddHoverTimeout, closeAddDropdown]);

  useEffect(() => {
    return () => {
      clearAddHoverTimeout();
      clearAddCloseAnimationTimeout();
    };
  }, [clearAddHoverTimeout, clearAddCloseAnimationTimeout]);

  useEffect(() => {
    clearAddHoverTimeout();
    clearAddCloseAnimationTimeout();
    setIsAddDropdownOpen(false);
    setIsAddDropdownClosing(false);
  }, [pathname, clearAddHoverTimeout, clearAddCloseAnimationTimeout]);

  useEffect(() => {
    if (!isAddDropdownOpen) return;

    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (!addDropdownRef.current?.contains(target)) {
        closeAddDropdown();
      }
    };

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handleOutsideClick);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isAddDropdownOpen, closeAddDropdown]);

  return {
    addDropdownRef,
    isAddDropdownOpen,
    isAddDropdownClosing,
    openAddDropdown,
    closeAddDropdown,
    scheduleAddDropdownClose,
    clearAddHoverTimeout,
    clearAddCloseAnimationTimeout,
  };
}
