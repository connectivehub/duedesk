import { toGraphPayload } from "@/lib/whatsapp/payload";
import type { Outbound } from "@/lib/whatsapp/types";

const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

export function graphVersion(): string {
  const value = process.env.WHATSAPP_GRAPH_VERSION?.trim();
  if (value && /^v\d+\.\d+$/.test(value)) return value;
  return "v26.0";
}

export async function sendWhatsApp(to: string, message: Exclude<Outbound, { kind: "checklist" }>): Promise<void> {
  const response = await fetch(graphUrl(`${phoneNumberId()}/messages`), {
    method: "POST",
    headers: graphHeaders(),
    body: JSON.stringify(toGraphPayload(to, message)),
  });
  if (!response.ok) {
    throw new Error(`WhatsApp send failed (${response.status}): ${await graphError(response)}`);
  }
}

export async function downloadWhatsAppMedia(mediaId: string): Promise<{ bytes: Buffer; mimeType: string }> {
  const metaResponse = await fetch(graphUrl(mediaId), {
    headers: graphHeaders(),
    signal: AbortSignal.timeout(15000),
  });
  if (!metaResponse.ok) throw new Error("Could not read the WhatsApp file");
  const meta = (await metaResponse.json()) as { url?: string; mime_type?: string; file_size?: number };
  if (!meta.url) throw new Error("WhatsApp file had no download address");
  if (meta.file_size && meta.file_size > MAX_MEDIA_BYTES) throw new Error("File is over 20MB");

  const fileResponse = await fetch(meta.url, {
    headers: graphHeaders(),
    signal: AbortSignal.timeout(20000),
  });
  if (!fileResponse.ok) throw new Error("Could not download the WhatsApp file");
  const bytes = Buffer.from(await fileResponse.arrayBuffer());
  if (bytes.length > MAX_MEDIA_BYTES) throw new Error("File is over 20MB");
  return { bytes, mimeType: meta.mime_type ?? "application/octet-stream" };
}

export async function triggerSmbSync(syncType: "history" | "smb_app_state_sync"): Promise<string> {
  const response = await fetch(graphUrl(`${phoneNumberId()}/smb_app_data`), {
    method: "POST",
    headers: graphHeaders(),
    body: JSON.stringify({ messaging_product: "whatsapp", sync_type: syncType }),
  });
  if (!response.ok) throw new Error(await graphError(response));
  return "Sync requested. WhatsApp sends the data to the webhook. Each sync can run once, and only within 24 hours of onboarding.";
}

export async function fetchCoexistenceStatus(): Promise<string> {
  const response = await fetch(graphUrl(`${phoneNumberId()}?fields=display_phone_number,is_on_biz_app,platform_type`), {
    headers: graphHeaders(),
  });
  if (!response.ok) throw new Error(await graphError(response));
  const body = (await response.json()) as {
    display_phone_number?: string;
    is_on_biz_app?: boolean;
    platform_type?: string;
  };
  const onApp = body.is_on_biz_app ? "yes" : "no";
  return `Number ${body.display_phone_number ?? "unknown"}: Business app ${onApp}, platform ${body.platform_type ?? "unknown"}. Coexistence is active when the Business app flag is yes and the platform is CLOUD_API.`;
}

function graphUrl(path: string): string {
  return `https://graph.facebook.com/${graphVersion()}/${path}`;
}

function graphHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${requiredEnv("WHATSAPP_TOKEN")}`,
    "Content-Type": "application/json",
  };
}

function phoneNumberId(): string {
  return requiredEnv("WHATSAPP_PHONE_NUMBER_ID");
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function graphError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return (body.error?.message ?? `HTTP ${response.status}`).slice(0, 180);
  } catch {
    return `HTTP ${response.status}`;
  }
}
