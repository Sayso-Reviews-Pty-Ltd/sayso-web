'use client';

import { m, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from "@/app/lib/icons";

interface ReviewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => Promise<void>;
  message: string;
  onMessageChange: (value: string) => void;
  isSending: boolean;
  customerName: string;
  reviewUserId: string;
  businessId: string;
}

export function ReviewMessageModal({
  isOpen,
  onClose,
  onSend,
  message,
  onMessageChange,
  isSending,
  customerName,
  reviewUserId,
  businessId,
}: ReviewMessageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            key="message-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <m.div
            key="message-modal-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto bg-white rounded-t-[20px] sm:rounded-[16px] p-6 w-full sm:max-w-md shadow-2xl"
              style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-charcoal">
                  Message {customerName}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-charcoal/50 hover:bg-charcoal/[0.06] hover:text-charcoal transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                rows={4}
                placeholder="Write your message..."
                disabled={isSending}
                className="w-full rounded-[12px] border border-charcoal/15 bg-off-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-navbar-bg/30 focus:border-navbar-bg resize-none disabled:opacity-70 transition-colors"
                style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}
              />
              <div className="flex items-center justify-between mt-4 gap-3">
                <a
                  href={`/my-businesses/messages?user_id=${reviewUserId}&business_id=${businessId}`}
                  className="text-xs text-navbar-bg font-semibold hover:underline flex-shrink-0"
                >
                  Open in inbox
                </a>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-charcoal/20 text-sm font-semibold text-charcoal/70 hover:bg-charcoal/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void onSend()}
                    disabled={isSending || !message.trim()}
                    className="px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
