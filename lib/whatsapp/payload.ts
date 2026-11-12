import type { Outbound } from "@/lib/whatsapp/types";

export type GraphPayload = Record<string, unknown>;

export function toGraphPayload(to: string, message: Exclude<Outbound, { kind: "checklist" }>): GraphPayload {
  const base = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
  };

  if (message.kind === "text") {
    return {
      ...base,
      type: "text",
      text: { preview_url: message.body.includes("https://"), body: message.body },
    };
  }

  if (message.kind === "buttons") {
    return {
      ...base,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: message.body.slice(0, 1024) },
        action: {
          buttons: message.buttons.slice(0, 3).map((button) => ({
            type: "reply",
            reply: { id: button.id.slice(0, 256), title: button.title.slice(0, 20) },
          })),
        },
      },
    };
  }

  if (message.kind === "list") {
    return {
      ...base,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: message.body.slice(0, 1024) },
        action: {
          button: message.button.slice(0, 20),
          sections: [
            {
              title: "Years",
              rows: message.rows.slice(0, 10).map((row) => ({
                id: row.id.slice(0, 200),
                title: row.title.slice(0, 24),
                description: row.description?.slice(0, 72),
              })),
            },
          ],
        },
      },
    };
  }

  return {
    ...base,
    type: "template",
    template: {
      name: message.name,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: message.bodyParams.map((value) => ({ type: "text", text: value })),
        },
      ],
    },
  };
}
