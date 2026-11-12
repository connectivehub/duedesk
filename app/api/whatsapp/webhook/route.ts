import { readWebhookChallenge, verifyMetaSignature } from "@/lib/whatsapp/signature";
import { processWebhookPayload } from "@/lib/whatsapp/process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token) return new Response("Server misconfigured", { status: 500 });
  const challenge = readWebhookChallenge(new URL(request.url).searchParams, token);
  if (challenge === null) return new Response("Forbidden", { status: 403 });
  return new Response(challenge, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return new Response("Server misconfigured", { status: 500 });
  const raw = await request.text();
  if (!verifyMetaSignature(raw, request.headers.get("x-hub-signature-256"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  try {
    await processWebhookPayload(payload);
  } catch (error) {
    console.error("whatsapp webhook failed", error instanceof Error ? error.message : "error");
    return new Response("Error", { status: 500 });
  }
  return new Response("OK", { status: 200 });
}
