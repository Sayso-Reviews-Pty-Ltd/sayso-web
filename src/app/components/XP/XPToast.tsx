"use client";

import { useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { LEVEL_PERKS } from "@/app/lib/xp/levels";
import { fireBadgeCelebration } from "@/app/lib/celebration/badgeCelebration";

export interface XPToastPayload {
  xpAwarded: number;
  newTotal: number;
  leveledUp: boolean;
  newLevel?: number;
}

interface XPToastProps {
  payload: XPToastPayload | null;
  onDismiss: () => void;
}

export default function XPToast({ payload, onDismiss }: XPToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!payload) return;

    if (payload.leveledUp && payload.newLevel) {
      void fireBadgeCelebration(`level-up-${payload.newLevel}`);
    }

    timerRef.current = setTimeout(onDismiss, payload.leveledUp ? 4000 : 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [payload, onDismiss]);

  const perk =
    payload?.leveledUp && payload.newLevel ? (LEVEL_PERKS[payload.newLevel] ?? null) : null;

  return (
    <AnimatePresence>
      {payload && (
        <m.div
          key="xp-toast"
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-20 right-4 z-[9998] flex flex-col items-end gap-1 pointer-events-none"
        >
          {/* XP pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-navbar-bg text-white px-3 py-1.5 shadow-lg text-sm font-700 font-urbanist">
            <span>+{payload.xpAwarded} XP</span>
          </div>

          {/* Level-up card */}
          {payload.leveledUp && payload.newLevel && (
            <m.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", damping: 18, stiffness: 280 }}
              className="rounded-xl bg-charcoal text-white px-4 py-3 shadow-xl font-urbanist text-center min-w-[160px]"
            >
              <p className="text-base font-800 leading-tight">⬆ Level {payload.newLevel}!</p>
              {perk && <p className="text-[11px] text-white/70 mt-0.5">{perk} unlocked</p>}
            </m.div>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
