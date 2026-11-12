export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const result = new URL(request.url).searchParams.get("result");
  const cancelled = result === "cancelled";
  const title = cancelled ? "Payment not completed" : "Back to WhatsApp";
  const body = cancelled
    ? "No payment was taken. Return to the WhatsApp chat with Leon if you still want the pack."
    : "If the payment went through, the document list will arrive in the WhatsApp chat. You can close this page.";

  const html = `<!doctype html>
<html lang="en-SG">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${title}</title>
  <style>
    body { margin: 0; font-family: Georgia, serif; background: #f7f2e8; color: #0d1a2e; }
    main { max-width: 36rem; margin: 4rem auto; padding: 0 1.25rem; }
    p { font-family: system-ui, sans-serif; line-height: 1.6; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${body}</p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
