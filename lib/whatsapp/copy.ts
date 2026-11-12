import { pricing } from "@/config/pricing";
import { ACRA_FEE_SENTENCE, FILING_SENTENCE, SIGN_OFF } from "@/config/whatsapp-templates";
import { formatSgd, quoteAnnualReturn } from "@/lib/pricing/quote";
import type { Conversation } from "@/lib/whatsapp/types";
import { yearRows } from "@/lib/whatsapp/years";

export function greetingMessage(): string {
  return [
    "Hi, Leon from DueDesk here.",
    "",
    "We prepare overdue ACRA annual return and AGM catch-up packs for Singapore companies.",
    "",
    FILING_SENTENCE,
    "",
    "What is your company name or UEN?",
  ].join("\n");
}

export function yearListMessage(conversation: Conversation, lead?: string): {
  body: string;
  button: string;
  rows: { id: string; title: string; description: string }[];
} {
  const selected = conversation.years.join(", ");
  const body = [
    lead,
    selected
      ? `Noted ${selected}. Add another year, or tap That's all.`
      : "Which financial years are overdue? Add one, then you can add more.",
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    body,
    button: "Choose year",
    rows: yearRows(conversation.years),
  };
}

export function speedMessage(): { body: string; buttons: { id: string; title: string }[] } {
  const standardDays = pricing.annualReturn.workingDaysTurnaround;
  const rush = formatSgd(pricing.annualReturn.rushSurcharge * 100);
  return {
    body: [
      `Standard is ${standardDays} working days.`,
      `${pricing.annualReturn.rushLabel} is an extra ${rush}.`,
      "",
      "Which do you want?",
      "",
      SIGN_OFF,
    ].join("\n"),
    buttons: [
      { id: "speed_standard", title: `${standardDays} working days`.slice(0, 20) },
      { id: "speed_rush", title: "24-hour rush" },
    ],
  };
}

export function quoteMessage(conversation: Conversation, lead?: string): { body: string; buttons: { id: string; title: string }[] } {
  const quote = quoteAnnualReturn(conversation.years.length, conversation.rush);
  const who = conversation.companyName ?? "your company";
  const uen = conversation.uen ? ` (${conversation.uen})` : "";
  const turnaround = conversation.rush
    ? pricing.annualReturn.rushLabel
    : `Standard, ${pricing.annualReturn.workingDaysTurnaround} working days`;
  const lines = [
    lead,
    `Here is the fee for ${who}${uen}.`,
    "",
    `Years: ${conversation.years.join(", ")}`,
    `Turnaround: ${turnaround}`,
    `Total: ${formatSgd(quote.totalCents)}`,
    "",
    `${formatSgd(quote.firstYearCents)} for the first year.`,
  ];
  if (quote.additionalCount > 0) {
    lines.push(
      `${formatSgd(quote.additionalYearCents)} for each extra year (${quote.additionalCount} extra).`,
    );
  }
  if (quote.rushCents > 0) {
    lines.push(`${pricing.annualReturn.rushLabel} is an extra ${formatSgd(quote.rushCents)}.`);
  }
  lines.push("", ACRA_FEE_SENTENCE, "", "Shall I send the payment link?", "", SIGN_OFF);
  return {
    body: lines.filter((line) => line !== undefined).join("\n"),
    buttons: [
      { id: "quote_yes", title: "Yes, send link" },
      { id: "quote_change_years", title: "Change years" },
      { id: "quote_change_speed", title: "Change speed" },
    ],
  };
}

export function paymentLinkMessage(url: string, totalLabel: string): string {
  return [
    `Please pay ${totalLabel} here:`,
    url,
    "",
    "Card and PayNow are both available. When the payment clears, I will send the document list.",
    "",
    ACRA_FEE_SENTENCE,
    "",
    SIGN_OFF,
  ].join("\n");
}

export function paymentPendingMessage(): string {
  return ["I will send the document list once the payment clears.", "", "Reply link if you need the payment link again.", "", SIGN_OFF].join("\n");
}

export function payFirstMessage(): string {
  return ["Please use the payment link first. After it clears, send the photos or PDFs here.", "", SIGN_OFF].join("\n");
}

export function checklistMessage(conversation: Conversation): string {
  const who = conversation.companyName ?? "your company";
  const years = conversation.years.length > 0 ? conversation.years.join(", ") : "the years you selected";
  return [
    "Payment received, thank you.",
    "",
    `Please send these for ${who} (${years}):`,
    "",
    "1. Financial statements or management accounts",
    "2. Bank statements",
    "3. Director or shareholder changes",
    "4. ACRA letters, if any",
    "",
    "A photo or a PDF is fine. Send them in this chat, then reply done.",
    "",
    FILING_SENTENCE,
    "",
    SIGN_OFF,
  ].join("\n");
}

export function mediaAckMessage(): string {
  return ["Received, thank you. Send the next file, or reply done when that is everything.", "", SIGN_OFF].join("\n");
}

export function badFileMessage(): string {
  return ["Please send a photo or a PDF.", "", SIGN_OFF].join("\n");
}

export function fileSaveFailedMessage(): string {
  return ["I could not keep that file. Please send it once more.", "", SIGN_OFF].join("\n");
}

export function noFileYetMessage(): string {
  return ["I have not received a file yet. Send a photo or PDF, or reply done again if you have nothing to attach.", "", SIGN_OFF].join("\n");
}

export function inPrepMessage(): string {
  return [
    "Thank you. I have what you sent, and the pack is now in preparation.",
    "",
    "I will message you when it is ready.",
    "",
    FILING_SENTENCE,
    "",
    SIGN_OFF,
  ].join("\n");
}

export function handoffAckMessage(): string {
  return ["I will handle this personally and reply shortly.", "", SIGN_OFF].join("\n");
}

export function statusMessage(state: Conversation["state"]): string {
  if (state === "pack_sent") {
    return ["The pack is with you. Reply here if you want me to walk you through Bizfile.", "", SIGN_OFF].join("\n");
  }
  if (state === "completed") {
    return ["This catch-up is complete. Message me when you want the next pack prepared.", "", SIGN_OFF].join("\n");
  }
  return ["Your pack is in preparation. I will message you when it is ready.", "", SIGN_OFF].join("\n");
}

export function thanksMessage(): string {
  return ["Welcome.", "", SIGN_OFF].join("\n");
}

export function paidRestartMessage(): string {
  return ["This order is already paid, so I will keep preparing it. Reply here if something needs a look.", "", SIGN_OFF].join("\n");
}

export function checkoutRetryMessage(): string {
  return ["I could not open the payment page just now. Tap Yes, send link and I will try again.", "", SIGN_OFF].join("\n");
}

export function documentNudgeMessage(): string {
  return ["Send a photo or PDF for each year, then reply done.", "", SIGN_OFF].join("\n");
}

export function templateParams(conversation: Conversation): [string, string] {
  return [
    templateParam(conversation.companyName, "there"),
    templateParam(conversation.years.join(", "), "your years"),
  ];
}

export function templateParam(value: string | null | undefined, fallback: string): string {
  const cleaned = (value ?? "")
    .replace(/[{}\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return cleaned.length > 0 ? cleaned : fallback;
}
