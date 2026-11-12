export async function notifyHandoff(input: { phone: string; reason: string; companyName: string | null }): Promise<void> {
  console.log(
    JSON.stringify({
      event: "needs_leon",
      phone: input.phone,
      companyName: input.companyName,
      reason: input.reason,
    }),
  );

  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!to || !apiKey || !from) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        from,
        to: [to],
        subject: `DueDesk WhatsApp needs Leon (${input.phone})`,
        text: [
          "A WhatsApp chat needs Leon.",
          `Phone: ${input.phone}`,
          `Company: ${input.companyName ?? "unknown"}`,
          `Reason: ${input.reason}`,
          "",
          "Auto replies stay paused until you resume them at /admin.",
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      console.error("handoff email failed", response.status);
    }
  } catch (error) {
    console.error("handoff email failed", error instanceof Error ? error.message : "error");
  }
}
