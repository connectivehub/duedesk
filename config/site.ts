export const SITE_URL = "https://duedesk.connective-labs.com";

export const SITE_NAME = "DueDesk";

export const SITE_DESCRIPTION =
  "Fixed-price help for Singapore companies behind on ACRA annual returns and AGMs. From S$199, ready in 3 working days. We prepare your pack, you file on Bizfile.";

export const WHATSAPP_NUMBER = "6583778712";

export const WHATSAPP_DISPLAY = "+65 8377 8712";

export const WHATSAPP_MESSAGES = {
  general:
    "Hi DueDesk, I'd like a fixed quote. My company is behind on its ACRA filings.",
  annualReturn:
    "Hi DueDesk, I need help with an overdue annual return / AGM. Company name or UEN: ___. Years I think are overdue: ___.",
  books:
    "Hi DueDesk, I'd like a quote for year-end books before Form C-S. Company name or UEN: ___.",
  tender:
    "Hi DueDesk, I'd like a quote for tender submission prep. Tender and deadline: ___.",
  grantClaim:
    "Hi DueDesk, I'd like a quote for a grant claim pack (EDG/PSG). Grant type: ___.",
  esg: "Hi DueDesk, I'd like a fixed quote for an ESG pack. Company name: ___.",
} as const;

export type WhatsAppMessageKey = keyof typeof WHATSAPP_MESSAGES;
