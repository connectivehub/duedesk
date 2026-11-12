import { getStripe } from "@/lib/stripe/checkout";
import { handleStripeEvent } from "@/lib/stripe/fulfill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Server misconfigured", { status: 500 });

  const raw = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (error) {
    console.error("stripe webhook failed", error instanceof Error ? error.message : "error");
    return new Response("Error", { status: 500 });
  }
  return new Response("OK", { status: 200 });
}
