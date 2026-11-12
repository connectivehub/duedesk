"use client";

import type { WhatsAppMessageKey } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  messageKey: WhatsAppMessageKey;
  label?: string;
};

export function StickyWhatsApp({ messageKey, label = "WhatsApp" }: Props) {
  return (
    <a
      href={whatsappUrl(messageKey)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-sm border border-ink bg-ink px-4 py-3 text-sm font-medium text-paper shadow-md sm:bottom-6 sm:right-6"
      aria-label="Contact us on WhatsApp"
    >
      <span aria-hidden className="text-base">
        ✉
      </span>
      {label}
    </a>
  );
}
