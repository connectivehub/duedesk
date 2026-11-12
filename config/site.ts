export const SITE_URL = "https://duedesk.connective-labs.com";

export const SITE_NAME = "DueDesk";

export const SITE_DESCRIPTION =
  "Urgent business paperwork for Singapore companies. Fixed-price document preparation when deadlines have slipped.";

export const WHATSAPP_NUMBER = "6583778712";

export const WHATSAPP_MESSAGES = {
  annualReturn: "Hi, I need help with an overdue annual return",
  books: "Hi, I need help catching up my books for Form C-S",
  tender: "Hi, I need help preparing a tender submission",
  grantClaim: "Hi, I need help with a grant claim (EDG/PSG)",
  general: "Hi, I need help with urgent company paperwork",
} as const;

export type WhatsAppMessageKey = keyof typeof WHATSAPP_MESSAGES;
