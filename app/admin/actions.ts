"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken, isAdminRequest, publicError, safeEqual } from "@/lib/admin/auth";
import { fetchCoexistenceStatus, triggerSmbSync } from "@/lib/whatsapp/client";
import { adminClear, adminComplete, adminPackReady } from "@/lib/whatsapp/process";

const CONVERSATION_ID = /^[0-9a-f-]{36}$/i;

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !safeEqual(password, expected)) redirect("/admin?error=1");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function resumeAutoReplies(formData: FormData): Promise<void> {
  await requireAdmin();
  await runConversationAction(formData, adminClear, "Auto replies resumed.");
}

export async function sendPackReady(formData: FormData): Promise<void> {
  await requireAdmin();
  await runConversationAction(formData, adminPackReady, "Pack-ready message sent.");
}

export async function sendDoneReminder(formData: FormData): Promise<void> {
  await requireAdmin();
  await runConversationAction(formData, adminComplete, "Done reminder sent.");
}

export async function syncHistory(): Promise<void> {
  await requireAdmin();
  await runNotice(() => triggerSmbSync("history"));
}

export async function syncContacts(): Promise<void> {
  await requireAdmin();
  await runNotice(() => triggerSmbSync("smb_app_state_sync"));
}

export async function checkCoexistence(): Promise<void> {
  await requireAdmin();
  await runNotice(() => fetchCoexistenceStatus());
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdminRequest())) redirect("/admin?error=1");
}

async function runConversationAction(
  formData: FormData,
  action: (conversationId: string) => Promise<void>,
  success: string,
): Promise<void> {
  const conversationId = String(formData.get("conversationId") ?? "");
  if (!CONVERSATION_ID.test(conversationId)) {
    redirect(`/admin?notice=${encodeURIComponent("Missing conversation.")}`);
  }
  try {
    await action(conversationId);
  } catch (error) {
    redirect(`/admin?notice=${encodeURIComponent(publicError(error))}`);
  }
  redirect(`/admin?notice=${encodeURIComponent(success)}`);
}

async function runNotice(action: () => Promise<string>): Promise<void> {
  let message = "";
  try {
    message = await action();
  } catch (error) {
    redirect(`/admin?notice=${encodeURIComponent(publicError(error))}`);
  }
  redirect(`/admin?notice=${encodeURIComponent(message)}`);
}
