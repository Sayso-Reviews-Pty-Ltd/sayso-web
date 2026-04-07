"use client";

import { useEffect, useState } from "react";
import type { Event } from "../../../lib/types/Event";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  show: boolean;
  status: "upcoming" | "live" | "ended" | "unknown";
}

export function useEventCountdown(event: Event) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    show: true,
    status: "unknown",
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const startDate = event.startDateISO || event.startDate;
      const endDate = event.endDateISO || event.endDate;

      if (!startDate) {
        setCountdown({ days: 0, hours: 0, minutes: 0, show: true, status: "unknown" });
        return;
      }

      const now = new Date().getTime();
      const eventStartTime = new Date(startDate).getTime();
      if (!Number.isFinite(eventStartTime)) {
        setCountdown({ days: 0, hours: 0, minutes: 0, show: true, status: "unknown" });
        return;
      }

      let eventEndTime = endDate
        ? new Date(endDate).getTime()
        : eventStartTime + 24 * 60 * 60 * 1000;
      if (!Number.isFinite(eventEndTime)) {
        eventEndTime = eventStartTime + 24 * 60 * 60 * 1000;
      }

      // Event has ended
      if (now > eventEndTime) {
        setCountdown({ days: 0, hours: 0, minutes: 0, show: true, status: "ended" });
        return;
      }

      // Event is currently happening
      if (now >= eventStartTime && now <= eventEndTime) {
        setCountdown({ days: 0, hours: 0, minutes: 0, show: true, status: "live" });
        return;
      }

      // Event is upcoming
      const diff = eventStartTime - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setCountdown({ days, hours, minutes, show: true, status: "upcoming" });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, show: true, status: "live" });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);

    return () => clearInterval(interval);
  }, [event.startDateISO, event.startDate, event.endDateISO, event.endDate]);

  return countdown;
}
