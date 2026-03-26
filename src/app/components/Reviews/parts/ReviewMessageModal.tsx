'use client';

import { Loader2 } from "@/app/lib/icons";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="p-0 gap-0 w-full max-w-none translate-x-0 translate-y-0 left-0 right-0 bottom-0 top-auto rounded-t-[20px] sm:rounded-[16px] sm:max-w-md sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:bottom-auto">
        <DialogTitle className="sr-only">Message {customerName}</DialogTitle>
        <DialogDescription className="sr-only">Send a message to {customerName}</DialogDescription>

        <div className="p-6" style={{ fontFamily: 'Urbanist, system-ui, sans-serif' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-charcoal">Message {customerName}</h3>
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
              <button type="button" onClick={onClose}
                className="px-4 py-2 rounded-full border border-charcoal/20 text-sm font-semibold text-charcoal/70 hover:bg-charcoal/5 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => void onSend()} disabled={isSending || !message.trim()}
                className="px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Send Message
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
