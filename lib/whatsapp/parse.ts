export type HistoryThread = {
  phone: string;
  messages: {
    id: string | null;
    from: string | null;
    to: string | null;
    messageType: string | null;
    body: string | null;
    timestamp: string | null;
  }[];
};

export type WebhookAction =
  | { type: "record"; field: string; summary: string; phone: string | null; payload: unknown }
  | { type: "history"; summary: string; phoneNumberId: string | null; declined: boolean; threads: HistoryThread[]; payload: unknown }
  | {
      type: "echo";
      customerPhone: string;
      messageId: string;
      messageType: string;
      body: string | null;
      timestamp: string;
    }
  | {
      type: "message";
      customerPhone: string;
      messageId: string;
      messageType: string;
      timestamp: string;
      profileName: string | null;
      text: string | null;
      interactiveId: string | null;
      mediaId: string | null;
      mimeType: string | null;
      filename: string | null;
      caption: string | null;
    }
  | { type: "unsupported"; customerPhone: string | null; messageId: string | null; code: number | null; summary: string; payload: unknown };

export type ParsedWebhook = {
  phoneNumberId: string | null;
  actions: WebhookAction[];
};

export function parseWebhook(payload: unknown): ParsedWebhook {
  const actions: WebhookAction[] = [];
  let phoneNumberId: string | null = null;
  if (!payload || typeof payload !== "object") {
    return { phoneNumberId, actions };
  }
  const entries = asArray((payload as { entry?: unknown }).entry);
  for (const entry of entries) {
    const changes = asArray(asRecord(entry)?.changes);
    for (const change of changes) {
      const record = asRecord(change);
      const field = typeof record?.field === "string" ? record.field : "unknown";
      const value = asRecord(record?.value) ?? {};
      const metadata = asRecord(value.metadata);
      const currentPhoneNumberId = stringOrNull(metadata?.phone_number_id);
      if (currentPhoneNumberId) phoneNumberId = currentPhoneNumberId;
      actions.push(...actionsForChange(field, value));
    }
  }
  return { phoneNumberId, actions };
}

export function isSilentAction(action: WebhookAction): boolean {
  return action.type === "record" || action.type === "history" || action.type === "unsupported";
}

function actionsForChange(field: string, value: Record<string, unknown>): WebhookAction[] {
  if (field === "history") return [historyAction(value)];
  if (field === "smb_message_echoes") return echoActions(value);
  if (field === "messages") return messageActions(value);
  if (field === "statuses") return [];
  if (field === "smb_app_state_sync" || field === "account_update") {
    return [{ type: "record", field, summary: field, phone: null, payload: value }];
  }
  return [{ type: "record", field, summary: `Unhandled field ${field}`, phone: null, payload: value }];
}

function historyAction(value: Record<string, unknown>): WebhookAction {
  const chunks = asArray(value.history);
  const threads: HistoryThread[] = [];
  let declined = false;
  for (const chunk of chunks) {
    const record = asRecord(chunk);
    if (!record) continue;
    const errors = asArray(record.errors);
    if (errors.some((error) => asRecord(error)?.code === 2593109)) declined = true;
    for (const thread of asArray(record.threads)) {
      const threadRecord = asRecord(thread);
      const phone = stringOrNull(threadRecord?.id);
      if (!phone) continue;
      const messages = asArray(threadRecord?.messages).map((message) => {
        const item = asRecord(message);
        return {
          id: stringOrNull(item?.id),
          from: stringOrNull(item?.from),
          to: stringOrNull(item?.to),
          messageType: stringOrNull(item?.type),
          body: messageBody(item),
          timestamp: stringOrNull(item?.timestamp),
        };
      });
      threads.push({ phone, messages });
    }
  }
  const summary = declined ? "History sharing declined" : `History sync (${threads.length} chats)`;
  return {
    type: "history",
    summary,
    phoneNumberId: stringOrNull(asRecord(value.metadata)?.phone_number_id),
    declined,
    threads,
    payload: value,
  };
}

function echoActions(value: Record<string, unknown>): WebhookAction[] {
  return asArray(value.message_echoes).flatMap((item) => {
    const message = asRecord(item);
    const customerPhone = stringOrNull(message?.to);
    const messageId = stringOrNull(message?.id);
    if (!customerPhone || !messageId) return [];
    return [
      {
        type: "echo" as const,
        customerPhone,
        messageId,
        messageType: stringOrNull(message?.type) ?? "unknown",
        body: messageBody(message),
        timestamp: stringOrNull(message?.timestamp) ?? "",
      },
    ];
  });
}

function messageActions(value: Record<string, unknown>): WebhookAction[] {
  const names = new Map<string, string>();
  for (const contact of asArray(value.contacts)) {
    const record = asRecord(contact);
    const waId = stringOrNull(record?.wa_id);
    const name = stringOrNull(asRecord(record?.profile)?.name);
    if (waId && name) names.set(waId, name);
  }

  return asArray(value.messages).flatMap((item): WebhookAction[] => {
    const message = asRecord(item);
    if (!message) return [];
    const customerPhone = stringOrNull(message.from);
    const messageId = stringOrNull(message.id);
    const messageType = stringOrNull(message.type) ?? "unknown";
    const errors = asArray(message.errors);
    const errorCode = numberOrNull(asRecord(errors[0])?.code);
    if (messageType === "unsupported" || errorCode === 131060) {
      return [
        {
          type: "unsupported" as const,
          customerPhone,
          messageId,
          code: errorCode,
          summary: stringOrNull(asRecord(errors[0])?.title) ?? "Unsupported WhatsApp message",
          payload: message,
        },
      ];
    }
    if (!customerPhone || !messageId) return [];
    const interactive = asRecord(message.interactive);
    const buttonReply = asRecord(interactive?.button_reply);
    const listReply = asRecord(interactive?.list_reply);
    const legacyButton = asRecord(message.button);
    const media = asRecord(message[messageType]);
    return [
      {
        type: "message" as const,
        customerPhone,
        messageId,
        messageType,
        timestamp: stringOrNull(message.timestamp) ?? "",
        profileName: names.get(customerPhone) ?? null,
        text: stringOrNull(asRecord(message.text)?.body),
        interactiveId:
          stringOrNull(buttonReply?.id) ?? stringOrNull(listReply?.id) ?? stringOrNull(legacyButton?.payload),
        mediaId: stringOrNull(media?.id),
        mimeType: stringOrNull(media?.mime_type),
        filename: stringOrNull(media?.filename),
        caption: stringOrNull(media?.caption),
      },
    ];
  });
}

function messageBody(message: Record<string, unknown> | null): string | null {
  if (!message) return null;
  const text = stringOrNull(asRecord(message.text)?.body);
  if (text) return text;
  const type = stringOrNull(message.type);
  if (!type) return null;
  const media = asRecord(message[type]);
  return stringOrNull(media?.caption) ?? stringOrNull(media?.filename);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringOrNull(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number") return String(value);
  return null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}
