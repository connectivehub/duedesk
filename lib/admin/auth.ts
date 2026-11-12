import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "duedesk_admin";

export function safeEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function adminToken(password: string): string {
  return createHmac("sha256", password).update("duedesk-admin-session-v1").digest("hex");
}

export async function isAdminRequest(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, adminToken(password));
}

export function publicError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Request failed";
  if (/sk_|rk_|whsec_|Bearer|eyJ|service_role/i.test(message)) return "Request failed";
  return message.slice(0, 180);
}
