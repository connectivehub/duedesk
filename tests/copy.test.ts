import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FILING_SENTENCE, whatsappTemplates } from "@/config/whatsapp-templates";
import { checklistMessage, greetingMessage, inPrepMessage, quoteMessage } from "@/lib/whatsapp/copy";
import { blankConversation } from "@/lib/whatsapp/types";

const banned = [
  /\bAI\b/,
  /\bartificial intelligence\b/i,
  /\bbots?\b/i,
  /\bchatbot\b/i,
  /\bautomation\b/i,
  /\bautomated\b/i,
  /\bwe file\b/i,
  /\bwe'll file\b/i,
  /\bwe will file\b/i,
  /\bDueDesk files\b/i,
];

describe("customer copy", () => {
  it("stays in Leon's voice and does not say DueDesk files with ACRA", () => {
    const conversation = {
      ...blankConversation("6591234567"),
      companyName: "Acme Pte Ltd",
      years: ["FY2022", "FY2023"],
      rush: false,
    };
    const samples = [
      greetingMessage(),
      checklistMessage(conversation),
      inPrepMessage(),
      quoteMessage(conversation).body,
      ...whatsappTemplates.map((template) => template.body),
    ];
    for (const sample of samples) {
      for (const pattern of banned) {
        expect(sample).not.toMatch(pattern);
      }
    }
    expect(greetingMessage()).toContain(FILING_SENTENCE);
    expect(checklistMessage(conversation)).toContain(FILING_SENTENCE);
    expect(inPrepMessage()).toContain(FILING_SENTENCE);
    expect(whatsappTemplates[0]?.body).toContain(FILING_SENTENCE);
    expect(whatsappTemplates[1]?.body).toContain("Bizfile");
    expect(quoteMessage(conversation).body).toContain("paid to ACRA directly");
  });

  it("lists the live webhook, templates, and secrets in the readme", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
    expect(readme).toContain("https://duedesk.connective-labs.com/api/whatsapp/webhook");
    expect(readme).toContain("WHATSAPP_VERIFY_TOKEN");
    expect(readme).toContain("WHATSAPP_APP_SECRET");
    expect(readme).toContain("WHATSAPP_TOKEN");
    expect(readme).toContain("WHATSAPP_PHONE_NUMBER_ID");
    expect(readme).toContain("SUPABASE_URL");
    expect(readme).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(readme).toContain("STRIPE_SECRET_KEY");
    expect(readme).toContain("STRIPE_WEBHOOK_SECRET");
    expect(readme).toContain("ADMIN_PASSWORD");
    for (const template of whatsappTemplates) {
      expect(readme).toContain(template.name);
      expect(readme).toContain(template.body);
    }
    expect(readme).toContain("smb_message_echoes");
    expect(readme).toContain("20 messages per second");
  });
});
