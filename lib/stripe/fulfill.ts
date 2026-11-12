import type Stripe from "stripe";
import { applyPaymentEvent, conversationIdForSession } from "@/lib/whatsapp/process";
import { claimStripeEvent, releaseStripeEvent } from "@/lib/whatsapp/repository";

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded" &&
    event.type !== "checkout.session.async_payment_failed"
  ) {
    return;
  }

  const claimed = await claimStripeEvent(event.id, event.type);
  if (!claimed) return;

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const conversationId = await conversationIdForSession({
      id: session.id,
      metadata: session.metadata,
    });
    if (!conversationId) {
      console.error("stripe session had no conversation", session.id);
      return;
    }
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

    if (event.type === "checkout.session.async_payment_failed") {
      await applyPaymentEvent(conversationId, "payment_failed", paymentIntentId);
      return;
    }
    if (session.payment_status !== "paid") return;
    await applyPaymentEvent(conversationId, "payment_succeeded", paymentIntentId);
  } catch (error) {
    await releaseStripeEvent(event.id);
    throw error;
  }
}
