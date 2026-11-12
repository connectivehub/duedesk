import { randomBytes } from "node:crypto";
import Stripe from "stripe";
import { SITE_URL } from "@/config/site";
import { quoteAnnualReturn } from "@/lib/pricing/quote";

const STRIPE_API_VERSION = "2026-10-28.endive";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export async function ensureCheckoutSession(input: {
  conversationId: string;
  phone: string;
  companyName: string | null;
  uen: string | null;
  years: string[];
  rush: boolean;
  quoteCents: number | null;
  existingSessionId: string | null;
}): Promise<{ sessionId: string; url: string; alreadyPaid: boolean }> {
  const stripe = getStripe();
  if (input.existingSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(input.existingSessionId);
    if (existing.payment_status === "paid") {
      return { sessionId: existing.id, url: existing.url ?? "", alreadyPaid: true };
    }
    if (existing.status === "open" && existing.url) {
      return { sessionId: existing.id, url: existing.url, alreadyPaid: false };
    }
  }

  const amount = input.quoteCents ?? quoteAnnualReturn(input.years.length, input.rush).totalCents;
  const base = (process.env.APP_BASE_URL || SITE_URL).replace(/\/$/, "");
  const who = input.companyName ?? input.uen ?? "Singapore company";
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: input.conversationId,
      success_url: `${base}/api/whatsapp/checkout/return?result=success`,
      cancel_url: `${base}/api/whatsapp/checkout/return?result=cancelled`,
      // Card and PayNow only. Dynamic methods stay on; this allowlist filters them.
      // Do not send payment_method_types.
      allowed_payment_method_types: ["card", "paynow"],
      integration_identifier: integrationIdentifier(),
      metadata: {
        conversation_id: input.conversationId,
        phone: input.phone,
        years: input.years.join(",").slice(0, 450),
        rush: input.rush ? "true" : "false",
        company_name: who.slice(0, 450),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "sgd",
            unit_amount: amount,
            product_data: {
              name: "DueDesk annual return pack",
              description: `${who} — ${input.years.join(", ")} — ${input.rush ? "24-hour rush" : "standard"}`.slice(0, 500),
            },
          },
        },
      ],
    },
    {
      idempotencyKey: [
        "duedesk",
        input.conversationId,
        String(amount),
        input.years.join("."),
        input.rush ? "rush" : "std",
        input.existingSessionId ?? "first",
      ]
        .join("_")
        .slice(0, 255),
    },
  );

  if (!session.url) throw new Error("Stripe did not return a payment link");
  return { sessionId: session.id, url: session.url, alreadyPaid: session.payment_status === "paid" };
}

function integrationIdentifier(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(8);
  let suffix = "";
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `duedesk_whatsapp_${suffix}`;
}
