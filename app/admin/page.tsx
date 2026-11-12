import type { Metadata } from "next";
import { login, logout, checkCoexistence, resumeAutoReplies, sendDoneReminder, sendPackReady, syncContacts, syncHistory } from "@/app/admin/actions";
import { isAdminRequest, publicError } from "@/lib/admin/auth";
import { formatSgd } from "@/lib/pricing/quote";
import { formatPhone } from "@/lib/phone";
import { listAdmin, type AdminOrder, type AdminPaused } from "@/lib/whatsapp/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAdminRequest();
  if (!authed) {
    return (
      <section className="py-8">
        <h1 className="text-3xl">Orders</h1>
        <p className="mt-2 text-ink-muted">Sign in to see WhatsApp orders.</p>
        {params.error ? <p className="mt-4 text-stamp">That password did not match.</p> : null}
        <form action={login} className="paper-card mt-6 max-w-sm p-4">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full border border-rule bg-paper px-3 py-2"
          />
          <button type="submit" className="mt-4 bg-ink px-4 py-2 text-sm text-paper">
            Sign in
          </button>
        </form>
      </section>
    );
  }

  let orders: AdminOrder[] = [];
  let paused: AdminPaused[] = [];
  let loadError: string | null = null;
  try {
    const data = await listAdmin();
    orders = data.orders;
    paused = data.paused;
  } catch (error) {
    loadError = publicError(error);
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl">Orders</h1>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-2 text-ink-muted">
        A reply from the WhatsApp Business app pauses auto replies for that chat until you resume them.
      </p>
      {params.notice ? <p className="mt-4 border border-rule bg-paper-dark px-3 py-2 text-sm">{params.notice}</p> : null}
      {loadError ? <p className="mt-4 text-stamp">{loadError}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <form action={checkCoexistence}>
          <button type="submit" className="border border-ink px-3 py-2 text-sm">
            Check coexistence
          </button>
        </form>
        <form action={syncContacts}>
          <button type="submit" className="border border-ink px-3 py-2 text-sm">
            Sync contacts
          </button>
        </form>
        <form action={syncHistory}>
          <button type="submit" className="border border-ink px-3 py-2 text-sm">
            Sync history
          </button>
        </form>
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Contact and history sync can each run once, within 24 hours of onboarding. History is stored and never answered.
      </p>

      <h2 className="mt-10 text-2xl">Needs Leon</h2>
      {paused.length === 0 ? <p className="mt-2 text-ink-muted">No paused chats.</p> : null}
      <div className="mt-4 space-y-4">
        {paused.map((chat) => (
          <article key={chat.id} className="paper-card p-4">
            <h3 className="text-xl">{chat.companyName ?? formatPhone(chat.phone)}</h3>
            <p className="text-sm text-ink-muted">
              {formatPhone(chat.phone)}
              {chat.profileName ? ` · ${chat.profileName}` : ""} · was {chat.stateBefore ?? "greeting"} · {when(chat.updatedAt)}
            </p>
            <p className="mt-2">{chat.reason ?? "Paused"}</p>
            {chat.recent.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm">
                {chat.recent.map((message, index) => (
                  <li key={`${chat.id}-${index}`}>
                    <span className="text-ink-muted">{message.direction}: </span>
                    {message.body ?? "(no text)"}
                  </li>
                ))}
              </ul>
            ) : null}
            <form action={resumeAutoReplies} className="mt-3">
              <input type="hidden" name="conversationId" value={chat.id} />
              <button type="submit" className="bg-ink px-3 py-2 text-sm text-paper">
                Resume auto replies
              </button>
            </form>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-2xl">All orders</h2>
      {orders.length === 0 ? <p className="mt-2 text-ink-muted">No orders yet.</p> : null}
      <div className="mt-4 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="paper-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl">{order.companyName ?? formatPhone(order.phone)}</h3>
              <p className="text-sm uppercase tracking-wide text-stamp">{order.status}</p>
            </div>
            <p className="text-sm text-ink-muted">
              {formatPhone(order.phone)}
              {order.uen ? ` · ${order.uen}` : ""} · {order.years.join(", ") || "no years"} · {order.rush ? "24-hour rush" : "standard"} ·{" "}
              {formatSgd(order.amountCents)}
            </p>
            <p className="text-sm text-ink-muted">
              Chat {order.conversationState ?? "unknown"}
              {order.handoffReason ? ` · ${order.handoffReason}` : ""} · updated {when(order.updatedAt)}
            </p>
            {order.checkoutUrl && order.status === "awaiting_payment" ? (
              <p className="mt-2 text-sm">
                <a href={order.checkoutUrl} className="underline">
                  Payment link
                </a>
              </p>
            ) : null}
            {order.files.length > 0 ? (
              <ul className="mt-3 text-sm">
                {order.files.map((file) => (
                  <li key={file.id}>
                    {file.url ? (
                      <a href={file.url} className="underline">
                        {file.filename ?? "File"}
                      </a>
                    ) : (
                      file.filename ?? "File"
                    )}
                    {file.mimeType ? ` (${file.mimeType})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">No files yet.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.conversationState === "needs_leon" ? (
                <form action={resumeAutoReplies}>
                  <input type="hidden" name="conversationId" value={order.conversationId} />
                  <button type="submit" className="border border-ink px-3 py-2 text-sm">
                    Resume auto replies
                  </button>
                </form>
              ) : null}
              <form action={sendPackReady}>
                <input type="hidden" name="conversationId" value={order.conversationId} />
                <button type="submit" className="bg-ink px-3 py-2 text-sm text-paper">
                  Send pack ready
                </button>
              </form>
              <form action={sendDoneReminder}>
                <input type="hidden" name="conversationId" value={order.conversationId} />
                <button type="submit" className="border border-ink px-3 py-2 text-sm">
                  Send done reminder
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  }).format(date);
}
