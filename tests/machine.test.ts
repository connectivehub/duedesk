import { describe, expect, it } from "vitest";
import { ACRA_FEE_SENTENCE, FILING_SENTENCE, TEMPLATE_NAMES } from "@/config/whatsapp-templates";
import { pricing } from "@/config/pricing";
import { customerText, reduceConversation } from "@/lib/whatsapp/machine";
import { blankConversation, type Conversation, type MachineEvent, type Outbound } from "@/lib/whatsapp/types";

const at = "2026-11-12T01:00:00.000Z";

function bodies(outbound: Outbound[]): string {
  return outbound
    .map((item) => {
      if (item.kind === "template") return `${item.name} ${item.bodyParams.join(" ")}`;
      if (item.kind === "checklist") return "checklist";
      return item.body;
    })
    .join("\n");
}

function step(conversation: Conversation, event: MachineEvent) {
  return reduceConversation(conversation, event);
}

describe("ordering state machine", () => {
  it("walks from greeting through payment, files, and prep", () => {
    const conversation = blankConversation("6591234567");
    let result = step(conversation, customerText("hi", at));
    expect(result.conversation.state).toBe("greeting");
    expect(bodies(result.outbound)).toContain(FILING_SENTENCE);
    expect(bodies(result.outbound)).toContain("Leon from DueDesk");

    result = step(result.conversation, customerText("Acme Pte Ltd", at));
    expect(result.conversation.state).toBe("collect_years");
    expect(result.conversation.companyName).toMatch(/Acme/);
    expect(result.outbound[1]).toMatchObject({ kind: "list" });

    result = step(result.conversation, { type: "interactive", id: "year_FY2022", at });
    result = step(result.conversation, { type: "interactive", id: "year_FY2024", at });
    expect(result.conversation.years).toEqual(["FY2022", "FY2024"]);
    const yearList = result.outbound[0];
    expect(yearList?.kind).toBe("list");
    if (yearList?.kind === "list") {
      expect(yearList.rows.map((row) => row.id)).not.toContain("year_FY2022");
      expect(yearList.rows.map((row) => row.id)).toContain("years_done");
    }

    result = step(result.conversation, { type: "interactive", id: "years_done", at });
    expect(result.conversation.state).toBe("collect_speed");

    result = step(result.conversation, { type: "interactive", id: "speed_rush", at });
    const expected = (pricing.annualReturn.firstOverdueYear + pricing.annualReturn.eachAdditionalYear + pricing.annualReturn.rushSurcharge) * 100;
    expect(result.conversation.state).toBe("confirm_quote");
    expect(result.conversation.rush).toBe(true);
    expect(result.conversation.quoteCents).toBe(expected);
    expect(bodies(result.outbound)).toContain(ACRA_FEE_SENTENCE);

    result = step(result.conversation, { type: "interactive", id: "quote_yes", at });
    expect(result.conversation.state).toBe("awaiting_payment");
    expect(result.effects).toContainEqual({ type: "create_checkout" });

    result = step(result.conversation, { type: "payment_succeeded" });
    expect(result.conversation.state).toBe("collect_documents");
    expect(result.outbound).toContainEqual({ kind: "checklist" });
    expect(result.effects).toContainEqual({ type: "mark_paid" });

    result = step(result.conversation, { type: "media", mimeType: "application/pdf", filename: "accounts.pdf", at });
    expect(result.conversation.fileCount).toBe(1);
    expect(result.effects).toContainEqual({ type: "store_media" });

    result = step(result.conversation, customerText("done", at));
    expect(result.conversation.state).toBe("in_prep");
    expect(bodies(result.outbound)).toContain(FILING_SENTENCE);
    expect(result.effects).toContainEqual({ type: "mark_in_prep" });
  });

  it("asks again before accepting done with no files", () => {
    const paid = {
      ...blankConversation("6591234567"),
      state: "collect_documents" as const,
      companyName: "Acme Pte Ltd",
      years: ["FY2023"],
      checklistSent: true,
      lastCustomerMessageAt: at,
    };
    const first = step(paid, customerText("done", at));
    expect(first.conversation.state).toBe("collect_documents");
    expect(first.conversation.doneConfirmPending).toBe(true);
    const second = step(first.conversation, customerText("done", at));
    expect(second.conversation.state).toBe("in_prep");
  });

  it("pauses for a person, a refund, and a Business app reply", () => {
    const greeting = step(blankConversation("6591234567"), customerText("hello", at)).conversation;
    const human = step(greeting, customerText("human", at));
    expect(human.conversation.state).toBe("needs_leon");
    expect(human.conversation.stateBeforeHandoff).toBe("greeting");
    expect(human.outbound).toHaveLength(1);
    expect(step(human.conversation, customerText("are you there", at)).outbound).toHaveLength(0);

    const refund = step(greeting, customerText("I want a refund", at));
    expect(refund.conversation.handoffReason).toMatch(/refund/i);

    const echo = step(greeting, { type: "echo", at });
    expect(echo.conversation.state).toBe("needs_leon");
    expect(echo.outbound).toHaveLength(0);
    expect(echo.effects).toContainEqual({ type: "notify_handoff", reason: "Replied from the WhatsApp Business app" });
    expect(echo.conversation.lastCustomerMessageAt).toBe(at);
    expect(step(blankConversation("6591234567"), { type: "echo", at }).conversation.lastCustomerMessageAt).toBeNull();
    expect(step(echo.conversation, { type: "echo", at }).effects).toHaveLength(0);
  });

  it("keeps a paused chat quiet when payment clears, then sends the list when resumed", () => {
    const paused = step(
      { ...blankConversation("6591234567"), state: "awaiting_payment", companyName: "Acme Pte Ltd", years: ["FY2022"], rush: false, quoteCents: 19900 },
      { type: "echo", at },
    ).conversation;
    const paid = step(paused, { type: "payment_succeeded" });
    expect(paid.conversation.state).toBe("needs_leon");
    expect(paid.conversation.stateBeforeHandoff).toBe("collect_documents");
    expect(paid.outbound).toHaveLength(0);

    const resumed = step(paid.conversation, { type: "admin_clear" });
    expect(resumed.conversation.state).toBe("collect_documents");
    expect(resumed.outbound).toContainEqual({ kind: "checklist" });
  });

  it("sends pack and reminder templates from admin", () => {
    const ready = {
      ...blankConversation("6591234567"),
      state: "in_prep" as const,
      companyName: "Acme Pte Ltd",
      years: ["FY2022"],
    };
    const pack = step(ready, { type: "admin_pack_ready" });
    expect(pack.conversation.state).toBe("pack_sent");
    expect(pack.outbound[0]).toMatchObject({ kind: "template", name: TEMPLATE_NAMES.packReady });
    const done = step(pack.conversation, { type: "admin_complete" });
    expect(done.conversation.state).toBe("completed");
    expect(done.outbound[0]).toMatchObject({ kind: "template", name: TEMPLATE_NAMES.doneReminder });
  });
});
