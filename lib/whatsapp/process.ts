import { WHATSAPP_NUMBER } from "@/config/site";
import { formatSgd } from "@/lib/pricing/quote";
import { ensureCheckoutSession } from "@/lib/stripe/checkout";
import { notifyHandoff } from "@/lib/notify";
import { downloadWhatsAppMedia, sendWhatsApp } from "@/lib/whatsapp/client";
import { checkoutRetryMessage, fileSaveFailedMessage, paymentLinkMessage } from "@/lib/whatsapp/copy";
import { concreteOutbound } from "@/lib/whatsapp/deliver";
import { extractMessage } from "@/lib/whatsapp/extract";
import { enrichExtraction } from "@/lib/whatsapp/llm";
import { customerText, reduceConversation } from "@/lib/whatsapp/machine";
import { isSilentAction, parseWebhook, type WebhookAction } from "@/lib/whatsapp/parse";
import { normalizePhone } from "@/lib/phone";
import {
  applyMachine,
  cancelOpenOrder,
  claimMessage,
  findConversationIdBySession,
  getConversationById,
  linkMessage,
  loadOrCreateConversation,
  markOrder,
  recordHistoryMessages,
  recordWebhookEvent,
  releaseMessage,
  saveCheckoutOrder,
  saveConversation,
  storeOrderFile,
  toMachine,
  type StoredConversation,
} from "@/lib/whatsapp/repository";
import type { MachineEvent, Outbound, StepResult } from "@/lib/whatsapp/types";

type CommitContext = {
  waMessageId?: string;
  mediaId?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  paymentIntentId?: string | null;
  throwOnSendFailure?: boolean;
};

export async function processWebhookPayload(payload: unknown): Promise<void> {
  const parsed = parseWebhook(payload);
  const expectedPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (expectedPhoneNumberId && parsed.phoneNumberId && parsed.phoneNumberId !== expectedPhoneNumberId) {
    await recordWebhookEvent({
      field: "ignored",
      phone: null,
      summary: "Webhook was for a different phone number id",
      payload: { phoneNumberId: parsed.phoneNumberId },
    });
    return;
  }

  for (const action of parsed.actions) {
    if (action.type === "history") {
      await recordWebhookEvent({
        field: "history",
        phone: null,
        summary: action.summary,
        payload: action.payload,
      });
      await recordHistoryMessages(action.threads);
      continue;
    }
    if (isSilentAction(action) && action.type === "record") {
      await recordWebhookEvent({
        field: action.field,
        phone: action.phone,
        summary: action.summary,
        payload: action.payload,
      });
      continue;
    }
    if (action.type === "unsupported") {
      await recordWebhookEvent({
        field: "unsupported",
        phone: action.customerPhone,
        summary: action.summary,
        payload: action.payload,
      });
      continue;
    }
    if (action.type === "echo") {
      await handleEcho(action);
      continue;
    }
    if (action.type === "message") {
      await handleMessage(action);
    }
  }
}

export async function applyPaymentEvent(
  conversationId: string,
  kind: "payment_succeeded" | "payment_failed",
  paymentIntentId: string | null,
): Promise<void> {
  const row = await getConversationById(conversationId);
  if (!row) return;
  const result = reduceConversation(toMachine(row), { type: kind });
  await commit(row, result, { paymentIntentId, throwOnSendFailure: true });
}

export async function adminClear(conversationId: string): Promise<void> {
  await runAdmin(conversationId, { type: "admin_clear" });
}

export async function adminPackReady(conversationId: string): Promise<void> {
  await runAdmin(conversationId, { type: "admin_pack_ready" });
}

export async function adminComplete(conversationId: string): Promise<void> {
  await runAdmin(conversationId, { type: "admin_complete" });
}

async function runAdmin(conversationId: string, event: MachineEvent): Promise<void> {
  const row = await getConversationById(conversationId);
  if (!row) throw new Error("Conversation not found");
  const result = reduceConversation(toMachine(row), event);
  await commit(row, result, { throwOnSendFailure: true });
}

async function handleEcho(action: Extract<WebhookAction, { type: "echo" }>): Promise<void> {
  const phone = normalizePhone(action.customerPhone);
  if (!phone || phone === WHATSAPP_NUMBER) return;
  const claimed = await claimMessage({
    conversationId: null,
    phone,
    waMessageId: action.messageId,
    direction: "echo",
    messageType: action.messageType,
    body: action.body,
  });
  if (!claimed) return;

  try {
    const row = await loadOrCreateConversation(phone, null);
    await linkMessage(action.messageId, row.id);
    const result = reduceConversation(toMachine(row), { type: "echo", at: isoFromUnix(action.timestamp) });
    await commit(row, result, {});
  } catch (error) {
    await releaseMessage(action.messageId);
    throw error;
  }
}

async function handleMessage(action: Extract<WebhookAction, { type: "message" }>): Promise<void> {
  const phone = normalizePhone(action.customerPhone);
  if (!phone || phone === WHATSAPP_NUMBER) return;
  const at = isoFromUnix(action.timestamp);
  const claimed = await claimMessage({
    conversationId: null,
    phone,
    waMessageId: action.messageId,
    direction: "inbound",
    messageType: action.messageType,
    body: action.text ?? action.caption ?? action.filename,
  });
  if (!claimed) return;

  try {
    const row = await loadOrCreateConversation(phone, action.profileName);
    await linkMessage(action.messageId, row.id);
    const event = await toMachineEvent(action, at);
    const result = reduceConversation(toMachine(row), event);
    const saved = await commit(row, result, {
      waMessageId: action.messageId,
      mediaId: action.mediaId,
      filename: action.filename,
      mimeType: action.mimeType,
    });
    if (action.caption && event.type === "media") {
      const caption = extractMessage(action.caption);
      if (caption.donePhrase) {
        const followUp = reduceConversation(toMachine(saved), customerText(action.caption, at));
        await commit(saved, followUp, {});
      }
    }
  } catch (error) {
    await releaseMessage(action.messageId);
    throw error;
  }
}

async function toMachineEvent(action: Extract<WebhookAction, { type: "message" }>, at: string): Promise<MachineEvent> {
  if (action.interactiveId) return { type: "interactive", id: action.interactiveId, at };
  if (action.mediaId) {
    return {
      type: "media",
      mimeType: action.mimeType ?? "application/octet-stream",
      filename: action.filename ?? undefined,
      at,
    };
  }
  const body = action.text ?? "";
  const extraction = await enrichExtraction(body, extractMessage(body));
  return { type: "text", body, at, extraction };
}

async function commit(
  row: StoredConversation,
  result: StepResult,
  context: CommitContext,
  depth = 0,
): Promise<StoredConversation> {
  let next = applyMachine(row, result.conversation);
  const outbound: Outbound[] = [...result.outbound];

  for (const effect of result.effects) {
    if (effect.type === "store_media" && context.mediaId && context.waMessageId) {
      try {
        const file = await downloadWhatsAppMedia(context.mediaId);
        await storeOrderFile({
          conversationId: next.id,
          orderId: next.orderId,
          bytes: file.bytes,
          mimeType: context.mimeType ?? file.mimeType,
          filename: context.filename ?? null,
          waMediaId: context.mediaId,
          waMessageId: context.waMessageId,
        });
      } catch (error) {
        console.error("file store failed", error instanceof Error ? error.message : "error");
        next = { ...next, fileCount: Math.max(0, next.fileCount - 1) };
        if (next.state !== "needs_leon") {
          outbound.splice(0, outbound.length, { kind: "text", body: fileSaveFailedMessage() });
        } else {
          outbound.splice(0, outbound.length);
        }
      }
    }

    if (effect.type === "abandon_checkout") {
      await cancelOpenOrder(next.id);
      next = { ...next, stripeCheckoutSessionId: null };
    }

    if (effect.type === "create_checkout" || effect.type === "resend_checkout") {
      try {
        const amount = next.quoteCents ?? 0;
        const session = await ensureCheckoutSession({
          conversationId: next.id,
          phone: next.phone,
          companyName: next.companyName,
          uen: next.uen,
          years: next.years,
          rush: next.rush,
          quoteCents: next.quoteCents,
          existingSessionId: next.stripeCheckoutSessionId,
        });
        const orderId = await saveCheckoutOrder({
          conversationId: next.id,
          phone: next.phone,
          companyName: next.companyName,
          uen: next.uen,
          years: next.years,
          rush: next.rush,
          amountCents: amount,
          sessionId: session.sessionId,
          checkoutUrl: session.url,
        });
        next = { ...next, orderId, stripeCheckoutSessionId: session.sessionId };
        if (session.alreadyPaid) {
          if (depth > 1) throw new Error("Payment follow-up loop");
          const paid = reduceConversation(toMachine(next), { type: "payment_succeeded" });
          return commit(next, paid, { ...context, throwOnSendFailure: true }, depth + 1);
        }
        outbound.push({ kind: "text", body: paymentLinkMessage(session.url, formatSgd(amount)) });
      } catch (error) {
        console.error("checkout failed", error instanceof Error ? error.message : "error");
        next = { ...next, state: "confirm_quote" };
        outbound.splice(0, outbound.length, { kind: "text", body: checkoutRetryMessage() });
      }
    }

    if (effect.type === "mark_paid") {
      await markOrder(next.id, "paid", {
        paymentIntentId: context.paymentIntentId ?? null,
        paidAt: new Date().toISOString(),
      });
    }
    if (effect.type === "mark_in_prep") await markOrder(next.id, "in_prep", {});
    if (effect.type === "mark_pack_sent") await markOrder(next.id, "pack_sent", {});
    if (effect.type === "mark_completed") await markOrder(next.id, "completed", {});
    if (effect.type === "notify_handoff") {
      await notifyHandoff({ phone: next.phone, reason: effect.reason, companyName: next.companyName });
    }
  }

  const checklistPending = outbound.some((item) => item.kind === "checklist");
  if (checklistPending) next = { ...next, checklistSent: false };
  await saveConversation(next);
  const sent = await deliver(next, outbound);
  if (checklistPending && sent) {
    next = { ...next, checklistSent: true };
    await saveConversation(next);
  }
  if (!sent && context.throwOnSendFailure) {
    throw new Error("WhatsApp send failed");
  }
  return next;
}

async function deliver(row: StoredConversation, items: Outbound[]): Promise<boolean> {
  const conversation = toMachine(row);
  let ok = true;
  for (const item of items) {
    const message = concreteOutbound(conversation, item);
    if (!message || message.kind === "checklist") {
      console.log(JSON.stringify({ event: "outside_service_window", phone: row.phone, kind: item.kind }));
      ok = false;
      continue;
    }
    try {
      await sendWhatsApp(row.phone, message);
      const body = message.kind === "text" ? message.body : message.kind === "template" ? message.name : message.body;
      await claimMessage({
        conversationId: row.id,
        phone: row.phone,
        waMessageId: `out:${row.id}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
        direction: "outbound",
        messageType: message.kind,
        body: body.slice(0, 4000),
      });
    } catch (error) {
      console.error("whatsapp send failed", error instanceof Error ? error.message : "error");
      ok = false;
    }
  }
  return ok;
}

async function resolveConversationId(session: { id: string; metadata: { conversation_id?: string } | null }): Promise<string | null> {
  const fromMetadata = session.metadata?.conversation_id;
  if (fromMetadata) return fromMetadata;
  return findConversationIdBySession(session.id);
}

export async function conversationIdForSession(session: { id: string; metadata: { conversation_id?: string } | null }): Promise<string | null> {
  return resolveConversationId(session);
}

function isoFromUnix(timestamp: string): string {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || seconds <= 0) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}
