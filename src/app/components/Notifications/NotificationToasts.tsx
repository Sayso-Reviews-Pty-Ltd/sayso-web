"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNotifications } from "../../contexts/NotificationsContext";
import ToastNotification from "../ToastNotification/ToastNotification";

export default function NotificationToasts() {
  const { toastQueue, dismissToast } = useNotifications();
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    toastQueue.forEach((notification) => {
      if (shownRef.current.has(notification.id)) return;
      shownRef.current.add(notification.id);

      const handleClose = () => {
        dismissToast(notification.id);
        toast.dismiss(notification.id);
        shownRef.current.delete(notification.id);
      };

      toast.custom(
        () => (
          <ToastNotification
            notification={notification as Parameters<typeof ToastNotification>[0]["notification"]}
            onClose={handleClose}
            duration={6000}
          />
        ),
        {
          id: notification.id,
          duration: Infinity,
          position: "bottom-right",
        }
      );
    });
  }, [toastQueue, dismissToast]);

  return null;
}
