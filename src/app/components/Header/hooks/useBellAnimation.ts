"use client";

import { useEffect, useRef } from "react";
import { useAnimation } from "framer-motion";

export function useBellAnimation(unreadCount: number) {
  const bellControls = useAnimation();
  const prevUnreadRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > 0 && prevUnreadRef.current === 0) {
      void bellControls.start({
        rotate: [0, 14, -10, 6, -3, 0],
        transition: { duration: 0.55, ease: "easeOut" },
      });
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, bellControls]);

  return bellControls;
}
