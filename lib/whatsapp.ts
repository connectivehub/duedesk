import { WHATSAPP_MESSAGES, WHATSAPP_NUMBER } from "@/config/site";
import type { WhatsAppMessageKey } from "@/config/site";

export function whatsappUrl(messageKey: WhatsAppMessageKey): string {
  const text = encodeURIComponent(WHATSAPP_MESSAGES[messageKey]);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
