import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { TEMPLATE_NAMES } from "@/config/whatsapp-templates";
import { concreteOutbound } from "@/lib/whatsapp/deliver";
import { isSilentAction, parseWebhook } from "@/lib/whatsapp/parse";
import { toGraphPayload } from "@/lib/whatsapp/payload";
import { readWebhookChallenge, verifyMetaSignature } from "@/lib/whatsapp/signature";
import { blankConversation } from "@/lib/whatsapp/types";
import { isCustomerWindowOpen } from "@/lib/whatsapp/window";

describe("WhatsApp webhook", () => {
  it("verifies the hub challenge and the payload signature", () => {
    const params = new URLSearchParams({
      "hub.mode": "subscribe",
      "hub.verify_token": "desk-token",
      "hub.challenge": "12345",
    });
    expect(readWebhookChallenge(params, "desk-token")).toBe("12345");
    expect(readWebhookChallenge(params, "other")).toBeNull();

    const raw = '{"ok":true}';
    const signature = `sha256=${createHmac("sha256", "app-secret").update(raw).digest("hex")}`;
    expect(verifyMetaSignature(raw, signature, "app-secret")).toBe(true);
    expect(verifyMetaSignature(raw, signature, "wrong")).toBe(false);
    expect(verifyMetaSignature(raw, null, "app-secret")).toBe(false);
  });

  it("records history and unsupported messages without a customer reply action", () => {
    const history = parseWebhook({
      entry: [
        {
          changes: [
            {
              field: "history",
              value: {
                metadata: { phone_number_id: "123" },
                history: [
                  {
                    metadata: { phase: 1, chunk_order: 1, progress: 50 },
                    threads: [
                      {
                        id: "6591234567",
                        messages: [{ from: "6591234567", id: "wamid.1", timestamp: "1730000000", type: "text", text: { body: "old" } }],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(history.phoneNumberId).toBe("123");
    expect(history.actions).toHaveLength(1);
    expect(history.actions[0]).toMatchObject({ type: "history", declined: false });
    expect(isSilentAction(history.actions[0])).toBe(true);
    if (history.actions[0]?.type === "history") {
      expect(history.actions[0].threads[0]?.messages[0]?.body).toBe("old");
    }

    const declined = parseWebhook({
      entry: [
        {
          changes: [
            {
              field: "history",
              value: {
                history: [{ errors: [{ code: 2593109, title: "History sync is turned off by the business" }] }],
              },
            },
          ],
        },
      ],
    });
    expect(declined.actions[0]).toMatchObject({ type: "history", declined: true });

    const sync = parseWebhook({ entry: [{ changes: [{ field: "smb_app_state_sync", value: { state_sync: [] } }] }] });
    expect(sync.actions[0]).toMatchObject({ type: "record", field: "smb_app_state_sync" });
    expect(isSilentAction(sync.actions[0])).toBe(true);

    const unsupported = parseWebhook({
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                messages: [{ from: "6591234567", id: "wamid.x", type: "unsupported", errors: [{ code: 131060, title: "Unsupported" }] }],
              },
            },
          ],
        },
      ],
    });
    expect(unsupported.actions[0]).toMatchObject({ type: "unsupported", code: 131060 });
    expect(isSilentAction(unsupported.actions[0])).toBe(true);
  });

  it("treats a Business app echo as the customer's chat, using the to field", () => {
    const parsed = parseWebhook({
      entry: [
        {
          changes: [
            {
              field: "smb_message_echoes",
              value: {
                message_echoes: [
                  {
                    from: "6583778712",
                    to: "6591234567",
                    id: "wamid.echo",
                    timestamp: "1730000001",
                    type: "text",
                    text: { body: "I will take this one." },
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(parsed.actions[0]).toMatchObject({
      type: "echo",
      customerPhone: "6591234567",
      body: "I will take this one.",
    });
  });

  it("uses a template once the 24-hour window has closed", () => {
    const now = new Date("2026-11-12T12:00:00.000Z");
    const open = blankConversation("6591234567");
    open.lastCustomerMessageAt = "2026-11-11T13:00:00.000Z";
    expect(isCustomerWindowOpen(open.lastCustomerMessageAt, now)).toBe(true);
    expect(concreteOutbound(open, { kind: "checklist" }, now)).toMatchObject({ kind: "text" });

    const closed = { ...open, lastCustomerMessageAt: "2026-11-10T12:00:00.000Z" };
    expect(isCustomerWindowOpen(closed.lastCustomerMessageAt, now)).toBe(false);
    expect(concreteOutbound(closed, { kind: "text", body: "hello" }, now)).toBeNull();
    expect(concreteOutbound(closed, { kind: "checklist" }, now)).toMatchObject({
      kind: "template",
      name: TEMPLATE_NAMES.paymentReceived,
    });
  });

  it("builds an interactive payload with at most three buttons", () => {
    const payload = toGraphPayload("6591234567", {
      kind: "buttons",
      body: "Which do you want?",
      buttons: [
        { id: "speed_standard", title: "3 working days" },
        { id: "speed_rush", title: "24-hour rush" },
        { id: "extra", title: "this title is definitely too long" },
        { id: "ignored", title: "nope" },
      ],
    });
    const buttons = (payload.interactive as { action: { buttons: { reply: { title: string } }[] } }).action.buttons;
    expect(buttons).toHaveLength(3);
    expect(buttons[2]?.reply.title.length).toBeLessThanOrEqual(20);
  });
});
