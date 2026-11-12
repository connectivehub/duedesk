/**
 * Utility templates to submit in WhatsApp Manager.
 * Free-form replies only work inside the 24-hour service window.
 * These templates are for messages that may go out later.
 * Keep the wording identical when you submit them for approval.
 */
export const FILING_SENTENCE =
  "We prepare your pack, and you file it on Bizfile with your Singpass (about 15 minutes), or our partner corporate secretary can arrange it.";

export const ACRA_FEE_SENTENCE =
  "ACRA's own fees and late penalties are paid to ACRA directly and are not included.";

export const SELECTABLE_YEARS = ["FY2021", "FY2022", "FY2023", "FY2024", "FY2025"] as const;

export const SIGN_OFF = "Leon, DueDesk";

export const whatsappTemplates = [
  {
    name: "duedesk_payment_received",
    category: "UTILITY",
    language: "en",
    body: [
      "Hi {{1}}, Leon from DueDesk.",
      "",
      "Payment received, thank you. Please send these for {{2}}:",
      "",
      "1. Financial statements or management accounts",
      "2. Bank statements",
      "3. Director or shareholder changes",
      "4. Any ACRA letters",
      "",
      "A photo or a PDF is fine. Send them in this chat, then reply done.",
      "",
      FILING_SENTENCE,
    ].join("\n"),
    exampleParams: ["Acme Pte Ltd", "FY2022, FY2023"],
  },
  {
    name: "duedesk_pack_ready",
    category: "UTILITY",
    language: "en",
    body: [
      "Hi {{1}}, Leon from DueDesk.",
      "",
      "Your annual return pack for {{2}} is ready. Please check this chat for the files.",
      "",
      FILING_SENTENCE,
      "",
      "On Bizfile, sign in with Singpass, open the annual return for each year, upload the documents from the pack, check the figures, and submit. ACRA's own fees and late penalties are paid to ACRA directly and are not included.",
      "",
      "Reply here if you want me to walk you through it.",
    ].join("\n"),
    exampleParams: ["Acme Pte Ltd", "FY2022, FY2023"],
  },
  {
    name: "duedesk_done_reminder",
    category: "UTILITY",
    language: "en",
    body: [
      "Hi {{1}}, Leon from DueDesk.",
      "",
      "The catch-up for {{2}} is complete. Thank you.",
      "",
      "Your next annual return is usually due in the month after your financial year end. Put a reminder in your calendar so it does not slip. Message me here when you want the next pack prepared.",
    ].join("\n"),
    exampleParams: ["Acme Pte Ltd", "FY2022, FY2023"],
  },
] as const;

export const TEMPLATE_NAMES = {
  paymentReceived: whatsappTemplates[0].name,
  packReady: whatsappTemplates[1].name,
  doneReminder: whatsappTemplates[2].name,
} as const;
