import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Conversation, FlowState } from "@/lib/whatsapp/types";
import { blankConversation } from "@/lib/whatsapp/types";

const ORDER_RANK: Record<string, number> = {
  cancelled: 0,
  awaiting_payment: 1,
  paid: 2,
  in_prep: 3,
  pack_sent: 4,
  completed: 5,
};

export type StoredConversation = Conversation & {
  id: string;
  profileName: string | null;
  orderId: string | null;
  stripeCheckoutSessionId: string | null;
};

type ConversationRow = {
  id: string;
  phone: string;
  profile_name: string | null;
  state: FlowState;
  state_before_handoff: FlowState | null;
  company_name: string | null;
  uen: string | null;
  years: string[] | null;
  rush: boolean;
  quote_cents: number | null;
  stripe_checkout_session_id: string | null;
  order_id: string | null;
  file_count: number;
  done_confirm_pending: boolean;
  checklist_sent: boolean;
  handoff_reason: string | null;
  last_customer_message_at: string | null;
  updated_at: string;
};

export type AdminFile = {
  id: string;
  filename: string | null;
  mimeType: string | null;
  url: string | null;
};

export type AdminOrder = {
  id: string;
  conversationId: string;
  phone: string;
  companyName: string | null;
  uen: string | null;
  years: string[];
  rush: boolean;
  amountCents: number;
  status: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  updatedAt: string;
  conversationState: string | null;
  handoffReason: string | null;
  files: AdminFile[];
};

export type AdminMessage = {
  direction: string;
  body: string | null;
  createdAt: string;
};

export type AdminPaused = {
  id: string;
  phone: string;
  companyName: string | null;
  profileName: string | null;
  stateBefore: string | null;
  reason: string | null;
  updatedAt: string;
  recent: AdminMessage[];
};

export function toMachine(row: StoredConversation): Conversation {
  return {
    phone: row.phone,
    state: row.state,
    stateBeforeHandoff: row.stateBeforeHandoff,
    companyName: row.companyName,
    uen: row.uen,
    years: [...row.years],
    rush: row.rush,
    quoteCents: row.quoteCents,
    fileCount: row.fileCount,
    doneConfirmPending: row.doneConfirmPending,
    checklistSent: row.checklistSent,
    handoffReason: row.handoffReason,
    lastCustomerMessageAt: row.lastCustomerMessageAt,
  };
}

export function applyMachine(row: StoredConversation, conversation: Conversation): StoredConversation {
  return {
    ...row,
    ...conversation,
    years: [...conversation.years],
  };
}

export async function loadOrCreateConversation(phone: string, profileName: string | null): Promise<StoredConversation> {
  const supabase = getSupabaseAdmin();
  const existing = await supabase.from("whatsapp_conversations").select("*").eq("phone", phone).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) {
    const stored = mapConversation(existing.data as ConversationRow);
    if (profileName && stored.profileName !== profileName) {
      stored.profileName = profileName;
      await saveConversation(stored);
    }
    return stored;
  }

  const inserted = await supabase
    .from("whatsapp_conversations")
    .insert({ phone, state: "greeting", profile_name: profileName })
    .select("*")
    .single();
  if (inserted.error?.code === "23505") {
    return loadOrCreateConversation(phone, profileName);
  }
  if (inserted.error) throw new Error(inserted.error.message);
  return mapConversation(inserted.data as ConversationRow);
}

export async function getConversationById(id: string): Promise<StoredConversation | null> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("whatsapp_conversations").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data ? mapConversation(result.data as ConversationRow) : null;
}

export async function saveConversation(row: StoredConversation): Promise<void> {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from("whatsapp_conversations")
    .update({
      profile_name: row.profileName,
      state: row.state,
      state_before_handoff: row.stateBeforeHandoff,
      company_name: row.companyName,
      uen: row.uen,
      years: row.years,
      rush: row.rush,
      quote_cents: row.quoteCents,
      stripe_checkout_session_id: row.stripeCheckoutSessionId,
      order_id: row.orderId,
      file_count: row.fileCount,
      done_confirm_pending: row.doneConfirmPending,
      checklist_sent: row.checklistSent,
      handoff_reason: row.handoffReason,
      last_customer_message_at: row.lastCustomerMessageAt,
    })
    .eq("id", row.id);
  if (result.error) throw new Error(result.error.message);
}

export async function claimMessage(input: {
  conversationId: string | null;
  phone: string | null;
  waMessageId: string;
  direction: "inbound" | "outbound" | "echo" | "history";
  messageType: string | null;
  body: string | null;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("whatsapp_messages").insert({
    conversation_id: input.conversationId,
    phone: input.phone,
    wa_message_id: input.waMessageId,
    direction: input.direction,
    message_type: input.messageType,
    body: input.body,
  });
  if (result.error?.code === "23505") return false;
  if (result.error) throw new Error(result.error.message);
  return true;
}

export async function linkMessage(waMessageId: string, conversationId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("whatsapp_messages").update({ conversation_id: conversationId }).eq("wa_message_id", waMessageId);
  if (result.error) throw new Error(result.error.message);
}

export async function releaseMessage(waMessageId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("whatsapp_messages").delete().eq("wa_message_id", waMessageId);
}

export async function recordWebhookEvent(input: {
  field: string;
  phone: string | null;
  summary: string;
  payload: unknown;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("whatsapp_webhook_events").insert({
    field: input.field,
    phone: input.phone,
    summary: input.summary,
    payload: input.payload,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function recordHistoryMessages(threads: { phone: string; messages: { id: string | null; from: string | null; messageType: string | null; body: string | null }[] }[]): Promise<void> {
  const rows = threads.flatMap((thread) =>
    thread.messages
      .filter((message) => message.id)
      .map((message) => ({
        phone: thread.phone,
        wa_message_id: message.id,
        direction: "history",
        message_type: message.messageType,
        body: message.body,
      })),
  );
  if (rows.length === 0) return;
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("whatsapp_messages").upsert(rows, {
    onConflict: "wa_message_id",
    ignoreDuplicates: true,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function saveCheckoutOrder(input: {
  conversationId: string;
  phone: string;
  companyName: string | null;
  uen: string | null;
  years: string[];
  rush: boolean;
  amountCents: number;
  sessionId: string;
  checkoutUrl: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const latest = await latestOrder(input.conversationId);
  if (latest && latest.status !== "cancelled" && latest.status !== "awaiting_payment") {
    return latest.id;
  }
  if (latest && latest.status === "awaiting_payment") {
    const result = await supabase
      .from("orders")
      .update({
        company_name: input.companyName,
        uen: input.uen,
        years: input.years,
        rush: input.rush,
        amount_cents: input.amountCents,
        stripe_checkout_session_id: input.sessionId,
        checkout_url: input.checkoutUrl,
        phone: input.phone,
      })
      .eq("id", latest.id);
    if (result.error) throw new Error(result.error.message);
    return latest.id;
  }

  const inserted = await supabase
    .from("orders")
    .insert({
      conversation_id: input.conversationId,
      phone: input.phone,
      company_name: input.companyName,
      uen: input.uen,
      years: input.years,
      rush: input.rush,
      amount_cents: input.amountCents,
      stripe_checkout_session_id: input.sessionId,
      checkout_url: input.checkoutUrl,
      status: "awaiting_payment",
      currency: "sgd",
    })
    .select("id")
    .single();
  if (inserted.error) throw new Error(inserted.error.message);
  return (inserted.data as { id: string }).id;
}

export async function cancelOpenOrder(conversationId: string): Promise<void> {
  await markOrder(conversationId, "cancelled", {});
}

export async function markOrder(
  conversationId: string,
  status: string,
  extra: { paymentIntentId?: string | null; paidAt?: string | null },
): Promise<void> {
  const latest = await latestOrder(conversationId);
  if (!latest) return;
  if (status === "cancelled" && latest.status !== "awaiting_payment") return;
  if (status !== "cancelled" && (ORDER_RANK[status] ?? 0) < (ORDER_RANK[latest.status] ?? 0)) return;

  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from("orders")
    .update({
      status,
      stripe_payment_intent_id: extra.paymentIntentId ?? undefined,
      paid_at: extra.paidAt ?? undefined,
    })
    .eq("id", latest.id);
  if (result.error) throw new Error(result.error.message);
}

export async function findConversationIdBySession(sessionId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("orders").select("conversation_id").eq("stripe_checkout_session_id", sessionId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return (result.data as { conversation_id: string } | null)?.conversation_id ?? null;
}

export async function claimStripeEvent(id: string, eventType: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from("stripe_events").insert({ id, event_type: eventType });
  if (result.error?.code === "23505") return false;
  if (result.error) throw new Error(result.error.message);
  return true;
}

export async function releaseStripeEvent(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("stripe_events").delete().eq("id", id);
}

export async function storeOrderFile(input: {
  conversationId: string;
  orderId: string | null;
  bytes: Buffer;
  mimeType: string;
  filename: string | null;
  waMediaId: string;
  waMessageId: string;
}): Promise<void> {
  const safeName = (input.filename ?? "file").split(/[/\\]/).pop()?.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80) || "file";
  const folder = input.orderId ?? input.conversationId;
  const path = `${folder}/${input.waMessageId}-${safeName}`;
  const supabase = getSupabaseAdmin();
  const uploaded = await supabase.storage.from("order-documents").upload(path, input.bytes, {
    contentType: input.mimeType,
    upsert: false,
  });
  if (uploaded.error) throw new Error(uploaded.error.message);
  const recorded = await supabase.from("order_files").insert({
    order_id: input.orderId,
    conversation_id: input.conversationId,
    storage_path: path,
    mime_type: input.mimeType,
    filename: input.filename ?? safeName,
    wa_media_id: input.waMediaId,
    bytes: input.bytes.length,
  });
  if (recorded.error) throw new Error(recorded.error.message);
}

export async function listAdmin(): Promise<{ orders: AdminOrder[]; paused: AdminPaused[] }> {
  const supabase = getSupabaseAdmin();
  const ordersResult = await supabase.from("orders").select("*").order("updated_at", { ascending: false }).limit(100);
  if (ordersResult.error) throw new Error(ordersResult.error.message);
  const orderRows = (ordersResult.data ?? []) as OrderRow[];
  const conversationIds = [...new Set(orderRows.map((order) => order.conversation_id))];

  const pausedResult = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("state", "needs_leon")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (pausedResult.error) throw new Error(pausedResult.error.message);
  const pausedRows = (pausedResult.data ?? []) as ConversationRow[];

  const knownIds = new Set(conversationIds);
  for (const row of pausedRows) knownIds.add(row.id);
  const conversations = new Map<string, ConversationRow>();
  if (knownIds.size > 0) {
    const conversationResult = await supabase.from("whatsapp_conversations").select("*").in("id", [...knownIds]);
    if (conversationResult.error) throw new Error(conversationResult.error.message);
    for (const row of (conversationResult.data ?? []) as ConversationRow[]) conversations.set(row.id, row);
  }

  const orderIds = orderRows.map((order) => order.id);
  const filesByOrder = new Map<string, AdminFile[]>();
  if (orderIds.length > 0) {
    const filesResult = await supabase.from("order_files").select("*").in("order_id", orderIds);
    if (filesResult.error) throw new Error(filesResult.error.message);
    for (const file of (filesResult.data ?? []) as FileRow[]) {
      const url = await signedUrl(file.storage_path);
      const item = { id: file.id, filename: file.filename, mimeType: file.mime_type, url };
      const list = filesByOrder.get(file.order_id ?? "") ?? [];
      list.push(item);
      if (file.order_id) filesByOrder.set(file.order_id, list);
    }
  }

  const pausedIds = pausedRows.map((row) => row.id);
  const messagesByConversation = new Map<string, AdminMessage[]>();
  if (pausedIds.length > 0) {
    const messageResult = await supabase
      .from("whatsapp_messages")
      .select("conversation_id, direction, body, created_at")
      .in("conversation_id", pausedIds)
      .order("created_at", { ascending: false })
      .limit(200);
    if (messageResult.error) throw new Error(messageResult.error.message);
    for (const message of (messageResult.data ?? []) as MessageRow[]) {
      if (!message.conversation_id) continue;
      const list = messagesByConversation.get(message.conversation_id) ?? [];
      if (list.length >= 8) continue;
      list.push({ direction: message.direction, body: message.body, createdAt: message.created_at });
      messagesByConversation.set(message.conversation_id, list);
    }
  }

  return {
    orders: orderRows.map((order) => {
      const conversation = conversations.get(order.conversation_id);
      return {
        id: order.id,
        conversationId: order.conversation_id,
        phone: order.phone,
        companyName: order.company_name,
        uen: order.uen,
        years: order.years ?? [],
        rush: order.rush,
        amountCents: order.amount_cents,
        status: order.status,
        checkoutUrl: order.checkout_url,
        paidAt: order.paid_at,
        updatedAt: order.updated_at,
        conversationState: conversation?.state ?? null,
        handoffReason: conversation?.handoff_reason ?? null,
        files: filesByOrder.get(order.id) ?? [],
      };
    }),
    paused: pausedRows.map((row) => ({
      id: row.id,
      phone: row.phone,
      companyName: row.company_name,
      profileName: row.profile_name,
      stateBefore: row.state_before_handoff,
      reason: row.handoff_reason,
      updatedAt: row.updated_at,
      recent: messagesByConversation.get(row.id) ?? [],
    })),
  };
}

async function signedUrl(path: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const result = await supabase.storage.from("order-documents").createSignedUrl(path, 60 * 60);
  if (result.error) return null;
  return result.data.signedUrl;
}

async function latestOrder(conversationId: string): Promise<{ id: string; status: string } | null> {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from("orders")
    .select("id, status")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return (result.data as { id: string; status: string } | null) ?? null;
}

function mapConversation(row: ConversationRow): StoredConversation {
  const base = blankConversation(row.phone);
  return {
    ...base,
    id: row.id,
    profileName: row.profile_name,
    orderId: row.order_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    state: row.state,
    stateBeforeHandoff: row.state_before_handoff,
    companyName: row.company_name,
    uen: row.uen,
    years: row.years ?? [],
    rush: row.rush,
    quoteCents: row.quote_cents,
    fileCount: row.file_count,
    doneConfirmPending: row.done_confirm_pending,
    checklistSent: row.checklist_sent,
    handoffReason: row.handoff_reason,
    lastCustomerMessageAt: row.last_customer_message_at,
  };
}

type OrderRow = {
  id: string;
  conversation_id: string;
  phone: string;
  company_name: string | null;
  uen: string | null;
  years: string[] | null;
  rush: boolean;
  amount_cents: number;
  status: string;
  checkout_url: string | null;
  paid_at: string | null;
  updated_at: string;
};

type FileRow = {
  id: string;
  order_id: string | null;
  storage_path: string;
  mime_type: string | null;
  filename: string | null;
};

type MessageRow = {
  conversation_id: string | null;
  direction: string;
  body: string | null;
  created_at: string;
};
