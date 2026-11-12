import { FILING_SENTENCE, TEMPLATE_NAMES } from "@/config/whatsapp-templates";
import {
  badFileMessage,
  documentNudgeMessage,
  greetingMessage,
  handoffAckMessage,
  inPrepMessage,
  mediaAckMessage,
  noFileYetMessage,
  paidRestartMessage,
  payFirstMessage,
  paymentPendingMessage,
  quoteMessage,
  speedMessage,
  statusMessage,
  templateParams,
  thanksMessage,
  yearListMessage,
} from "@/lib/whatsapp/copy";
import { extractMessage } from "@/lib/whatsapp/extract";
import { quoteAnnualReturn } from "@/lib/pricing/quote";
import type { Conversation, Effect, MachineEvent, Outbound, StepResult } from "@/lib/whatsapp/types";
import { yearFromId, sortYears } from "@/lib/whatsapp/years";

const PAID_STATES = new Set<Conversation["state"]>(["collect_documents", "in_prep", "pack_sent", "completed"]);

export function customerText(body: string, at = "2026-11-12T00:00:00.000Z"): MachineEvent {
  return { type: "text", body, at, extraction: extractMessage(body) };
}

export function reduceConversation(input: Conversation, event: MachineEvent): StepResult {
  let conversation = withInboundTime(copyConversation(input), event);

  if (event.type === "echo") {
    if (conversation.state === "needs_leon") {
      return hold(conversation);
    }
    return handoff(conversation, "Replied from the WhatsApp Business app", false);
  }

  if (event.type === "admin_clear") return clearHandoff(conversation);
  if (event.type === "admin_pack_ready") return markPackReady(conversation);
  if (event.type === "admin_complete") return markComplete(conversation);
  if (event.type === "payment_succeeded") return onPaid(conversation);
  if (event.type === "payment_failed") return onPaymentFailed(conversation);

  if (conversation.state === "needs_leon") return whilePaused(conversation, event);

  if (event.type === "text") {
    conversation = applyIdentity(conversation, event);
    if (event.extraction.handoffReason) {
      return handoff(conversation, event.extraction.handoffReason, true);
    }
    if (event.extraction.restart) return restart(conversation);
  }

  switch (conversation.state) {
    case "greeting":
      return onGreeting(conversation, event);
    case "collect_years":
      return onYears(conversation, event);
    case "collect_speed":
      return onSpeed(conversation, event);
    case "confirm_quote":
      return onConfirm(conversation, event);
    case "awaiting_payment":
      return onAwaitingPayment(conversation, event);
    case "collect_documents":
      return onDocuments(conversation, event);
    case "in_prep":
    case "pack_sent":
    case "completed":
      return onLater(conversation, event);
    default:
      return handoff(conversation, "Message needs a person", true);
  }
}

function onGreeting(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "text" && (conversation.companyName || conversation.uen)) {
    const who = conversation.companyName ?? conversation.uen;
    return {
      conversation: { ...conversation, state: "collect_years" },
      outbound: [text(`Thanks, I have ${who}.\n\n${FILING_SENTENCE}`), yearList(conversation)],
      effects: [],
    };
  }
  return { conversation, outbound: [text(greetingMessage())], effects: [] };
}

function onYears(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "interactive") {
    if (event.id === "years_clear") {
      const cleared = { ...conversation, years: [] };
      return { conversation: cleared, outbound: [yearList(cleared, "Years cleared. Choose the overdue years.")], effects: [] };
    }
    if (event.id === "years_done") return finishYears(conversation);
    const year = yearFromId(event.id);
    if (!year) return { conversation, outbound: [yearList(conversation)], effects: [] };
    const next = { ...conversation, years: sortYears([...conversation.years, year]) };
    return { conversation: next, outbound: [yearList(next)], effects: [] };
  }

  if (event.type === "text") {
    const next = conversation;
    if (event.extraction.donePhrase) return finishYears(next);
    if (event.extraction.years.length > 0) {
      return { conversation: next, outbound: [yearList(next)], effects: [] };
    }
    if (event.body.trim().length > 280) return handoff(next, "Message needs a person", true);
    return { conversation: next, outbound: [yearList(next)], effects: [] };
  }

  return { conversation, outbound: [yearList(conversation, "Choose the overdue years here, then send the files after payment.")], effects: [] };
}

function onSpeed(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "interactive") {
    if (event.id === "speed_rush") return chooseSpeed(conversation, true);
    if (event.id === "speed_standard") return chooseSpeed(conversation, false);
    return { conversation, outbound: [speedList()], effects: [] };
  }
  if (event.type === "text") {
    if (event.extraction.speed === "rush") return chooseSpeed(conversation, true);
    if (event.extraction.speed === "standard") return chooseSpeed(conversation, false);
    if (event.body.trim().length > 280) return handoff(conversation, "Message needs a person", true);
  }
  return { conversation, outbound: [speedList()], effects: [] };
}

function onConfirm(conversation: Conversation, event: MachineEvent): StepResult {
  if (conversation.years.length < 1) {
    return { conversation: { ...conversation, state: "collect_years" }, outbound: [yearList(conversation)], effects: [] };
  }
  if (event.type === "interactive") {
    if (event.id === "quote_yes") return acceptQuote(conversation);
    if (event.id === "quote_change_years") {
      return { conversation: { ...conversation, state: "collect_years" }, outbound: [yearList(conversation)], effects: [] };
    }
    if (event.id === "quote_change_speed") {
      return { conversation: { ...conversation, state: "collect_speed" }, outbound: [speedList()], effects: [] };
    }
  }
  if (event.type === "text") {
    if (event.extraction.confirm === "yes") return acceptQuote(conversation);
    if (event.extraction.confirm === "change_years") {
      return { conversation: { ...conversation, state: "collect_years" }, outbound: [yearList(conversation)], effects: [] };
    }
    if (event.extraction.confirm === "change_speed") {
      return { conversation: { ...conversation, state: "collect_speed" }, outbound: [speedList()], effects: [] };
    }
    if (event.body.trim().length > 280) return handoff(conversation, "Message needs a person", true);
  }
  return { conversation, outbound: [quoteButtons(conversation)], effects: [] };
}

function onAwaitingPayment(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "media") {
    return { conversation, outbound: [text(payFirstMessage())], effects: [] };
  }
  if (event.type === "interactive" && event.id === "quote_yes") {
    return { conversation, outbound: [], effects: [{ type: "resend_checkout" }] };
  }
  if (event.type === "text") {
    if (event.extraction.paidClaim) {
      return { conversation, outbound: [text(paymentPendingMessage())], effects: [] };
    }
    if (event.extraction.wantsLink || event.extraction.confirm === "yes") {
      return { conversation, outbound: [], effects: [{ type: "resend_checkout" }] };
    }
    if (event.extraction.thanks) return { conversation, outbound: [text(thanksMessage())], effects: [] };
    if (event.body.trim().length > 280) return handoff(conversation, "Message needs a person", true);
  }
  return { conversation, outbound: [text(paymentPendingMessage())], effects: [] };
}

function onDocuments(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "media") return acceptMedia(conversation, event);
  if (event.type !== "text") {
    return { conversation, outbound: [text(documentNudgeMessage())], effects: [] };
  }
  if (event.extraction.donePhrase) {
    if (conversation.fileCount > 0 || conversation.doneConfirmPending) {
      return {
        conversation: { ...conversation, state: "in_prep", doneConfirmPending: false },
        outbound: [text(inPrepMessage())],
        effects: [{ type: "mark_in_prep" }],
      };
    }
    return {
      conversation: { ...conversation, doneConfirmPending: true },
      outbound: [text(noFileYetMessage())],
      effects: [],
    };
  }
  if (event.extraction.statusAsk) return { conversation, outbound: [text(statusMessage(conversation.state))], effects: [] };
  if (event.extraction.thanks) return { conversation, outbound: [text(thanksMessage())], effects: [] };
  if (event.body.trim().length > 280) return handoff(conversation, "Message needs a person", true);
  return { conversation, outbound: [text(documentNudgeMessage())], effects: [] };
}

function onLater(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "media") return acceptMedia(conversation, event);
  if (event.type === "text") {
    if (event.extraction.statusAsk) return { conversation, outbound: [text(statusMessage(conversation.state))], effects: [] };
    if (event.extraction.thanks) return { conversation, outbound: [text(thanksMessage())], effects: [] };
    if (event.extraction.donePhrase && conversation.state === "in_prep") {
      return { conversation, outbound: [text(inPrepMessage())], effects: [] };
    }
    return handoff(conversation, "Message needs a person", true);
  }
  return { conversation, outbound: [text(statusMessage(conversation.state))], effects: [] };
}

function whilePaused(conversation: Conversation, event: MachineEvent): StepResult {
  if (event.type === "media" && canAcceptFiles(conversation)) {
    if (!isAllowedDocument(event.mimeType, event.filename)) return hold(conversation);
    return {
      conversation: { ...conversation, fileCount: conversation.fileCount + 1 },
      outbound: [],
      effects: [{ type: "store_media" }],
    };
  }
  return hold(conversation);
}

function acceptMedia(conversation: Conversation, event: Extract<MachineEvent, { type: "media" }>): StepResult {
  if (!isAllowedDocument(event.mimeType, event.filename)) {
    return { conversation, outbound: [text(badFileMessage())], effects: [] };
  }
  return {
    conversation: { ...conversation, fileCount: conversation.fileCount + 1, doneConfirmPending: false },
    outbound: [text(mediaAckMessage())],
    effects: [{ type: "store_media" }],
  };
}

function finishYears(conversation: Conversation): StepResult {
  if (conversation.years.length < 1) {
    return {
      conversation,
      outbound: [yearList(conversation, "Please choose at least one financial year.")],
      effects: [],
    };
  }
  return {
    conversation: { ...conversation, state: "collect_speed" },
    outbound: [speedList()],
    effects: [],
  };
}

function chooseSpeed(conversation: Conversation, rush: boolean): StepResult {
  const next = withQuote({ ...conversation, rush, state: "confirm_quote" });
  return { conversation: next, outbound: [quoteButtons(next)], effects: [] };
}

function acceptQuote(conversation: Conversation): StepResult {
  const next = withQuote({ ...conversation, state: "awaiting_payment" });
  return { conversation: next, outbound: [], effects: [{ type: "create_checkout" }] };
}

function onPaid(conversation: Conversation): StepResult {
  if (conversation.state === "needs_leon") {
    return {
      conversation: { ...conversation, stateBeforeHandoff: "collect_documents" },
      outbound: [],
      effects: [
        { type: "mark_paid" },
        { type: "notify_handoff", reason: "Payment received while auto replies are paused" },
      ],
    };
  }
  if (conversation.checklistSent && PAID_STATES.has(conversation.state)) {
    return { conversation, outbound: [], effects: [{ type: "mark_paid" }] };
  }
  return {
    conversation: { ...conversation, state: "collect_documents", checklistSent: true },
    outbound: [{ kind: "checklist" }],
    effects: [{ type: "mark_paid" }],
  };
}

function onPaymentFailed(conversation: Conversation): StepResult {
  if (conversation.state === "needs_leon") {
    return {
      conversation,
      outbound: [],
      effects: [{ type: "notify_handoff", reason: "Payment did not go through" }],
    };
  }
  if (conversation.checklistSent || PAID_STATES.has(conversation.state)) {
    return hold(conversation);
  }
  const next = withQuote({ ...conversation, state: "confirm_quote" });
  const quote = quoteButtons(next, "The payment did not go through. Tap Yes and I will send a fresh link.");
  return { conversation: next, outbound: [quote], effects: [] };
}

function clearHandoff(conversation: Conversation): StepResult {
  if (conversation.state !== "needs_leon") {
    return {
      conversation: { ...conversation, handoffReason: null, stateBeforeHandoff: null },
      outbound: [],
      effects: [],
    };
  }
  const restored = conversation.stateBeforeHandoff ?? "greeting";
  const next: Conversation = {
    ...conversation,
    state: restored,
    stateBeforeHandoff: null,
    handoffReason: null,
  };
  if (restored === "collect_documents" && !conversation.checklistSent) {
    return {
      conversation: { ...next, checklistSent: true },
      outbound: [{ kind: "checklist" }],
      effects: [],
    };
  }
  return { conversation: next, outbound: [], effects: [] };
}

function markPackReady(conversation: Conversation): StepResult {
  const outbound: Outbound[] = [
    { kind: "template", name: TEMPLATE_NAMES.packReady, bodyParams: templateParams(conversation) },
  ];
  if (conversation.state === "needs_leon") {
    return {
      conversation: { ...conversation, stateBeforeHandoff: "pack_sent" },
      outbound,
      effects: [{ type: "mark_pack_sent" }],
    };
  }
  return {
    conversation: { ...conversation, state: "pack_sent", stateBeforeHandoff: null, handoffReason: null },
    outbound,
    effects: [{ type: "mark_pack_sent" }],
  };
}

function markComplete(conversation: Conversation): StepResult {
  const outbound: Outbound[] = [
    { kind: "template", name: TEMPLATE_NAMES.doneReminder, bodyParams: templateParams(conversation) },
  ];
  if (conversation.state === "needs_leon") {
    return {
      conversation: { ...conversation, stateBeforeHandoff: "completed" },
      outbound,
      effects: [{ type: "mark_completed" }],
    };
  }
  return {
    conversation: { ...conversation, state: "completed", stateBeforeHandoff: null, handoffReason: null },
    outbound,
    effects: [{ type: "mark_completed" }],
  };
}

function restart(conversation: Conversation): StepResult {
  if (conversation.checklistSent || PAID_STATES.has(conversation.state)) {
    return { conversation, outbound: [text(paidRestartMessage())], effects: [] };
  }
  const effects: Effect[] = [];
  if (conversation.state === "awaiting_payment" || conversation.state === "confirm_quote") {
    effects.push({ type: "abandon_checkout" });
  }
  return {
    conversation: {
      ...conversation,
      state: "greeting",
      stateBeforeHandoff: null,
      companyName: null,
      uen: null,
      years: [],
      rush: false,
      quoteCents: null,
      fileCount: 0,
      doneConfirmPending: false,
      checklistSent: false,
      handoffReason: null,
    },
    outbound: [text(greetingMessage())],
    effects,
  };
}

function handoff(conversation: Conversation, reason: string, acknowledge: boolean): StepResult {
  if (conversation.state === "needs_leon") return hold(conversation);
  return {
    conversation: {
      ...conversation,
      stateBeforeHandoff: conversation.state,
      state: "needs_leon",
      handoffReason: reason,
    },
    outbound: acknowledge ? [text(handoffAckMessage())] : [],
    effects: [{ type: "notify_handoff", reason }],
  };
}

function canAcceptFiles(conversation: Conversation): boolean {
  const stage = conversation.state === "needs_leon" ? conversation.stateBeforeHandoff : conversation.state;
  return (
    conversation.checklistSent ||
    stage === "collect_documents" ||
    stage === "in_prep" ||
    stage === "pack_sent" ||
    stage === "completed"
  );
}

export function isAllowedDocument(mimeType: string, filename?: string): boolean {
  const mime = mimeType.toLowerCase();
  if (
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    mime === "image/png" ||
    mime === "image/webp" ||
    mime === "image/heic" ||
    mime === "image/heif" ||
    mime === "application/pdf"
  ) {
    return true;
  }
  if (mime === "application/octet-stream" && filename && /\.pdf$/i.test(filename)) return true;
  return false;
}

function applyIdentity(conversation: Conversation, event: Extract<MachineEvent, { type: "text" }>): Conversation {
  const extraction = event.extraction;
  return {
    ...conversation,
    companyName: conversation.companyName ?? extraction.companyName,
    uen: conversation.uen ?? extraction.uen,
    years: sortYears([...conversation.years, ...extraction.years]),
  };
}

function withQuote(conversation: Conversation): Conversation {
  if (conversation.years.length < 1) return { ...conversation, quoteCents: null };
  return {
    ...conversation,
    quoteCents: quoteAnnualReturn(conversation.years.length, conversation.rush).totalCents,
  };
}

function withInboundTime(conversation: Conversation, event: MachineEvent): Conversation {
  if (event.type === "text" || event.type === "interactive" || event.type === "media") {
    return { ...conversation, lastCustomerMessageAt: event.at };
  }
  return conversation;
}

function copyConversation(conversation: Conversation): Conversation {
  return { ...conversation, years: [...conversation.years] };
}

function hold(conversation: Conversation): StepResult {
  return { conversation, outbound: [], effects: [] };
}

function text(body: string): Outbound {
  return { kind: "text", body };
}

function yearList(conversation: Conversation, lead?: string): Outbound {
  const list = yearListMessage(conversation, lead);
  return { kind: "list", body: list.body, button: list.button, rows: list.rows };
}

function speedList(): Outbound {
  const speed = speedMessage();
  return { kind: "buttons", body: speed.body, buttons: speed.buttons };
}

function quoteButtons(conversation: Conversation, lead?: string): Outbound {
  const quote = quoteMessage(conversation, lead);
  return { kind: "buttons", body: quote.body, buttons: quote.buttons };
}
