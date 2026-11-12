import { TEMPLATE_NAMES } from "@/config/whatsapp-templates";
import { checklistMessage, templateParams } from "@/lib/whatsapp/copy";
import type { Conversation, Outbound } from "@/lib/whatsapp/types";
import { isCustomerWindowOpen } from "@/lib/whatsapp/window";

export function concreteOutbound(conversation: Conversation, item: Outbound, now: Date = new Date()): Outbound | null {
  if (item.kind === "template") return item;
  const windowOpen = isCustomerWindowOpen(conversation.lastCustomerMessageAt, now);
  if (item.kind === "checklist") {
    if (windowOpen) return { kind: "text", body: checklistMessage(conversation) };
    const [company, years] = templateParams(conversation);
    return {
      kind: "template",
      name: TEMPLATE_NAMES.paymentReceived,
      bodyParams: [company, years],
    };
  }
  if (!windowOpen) return null;
  return item;
}
