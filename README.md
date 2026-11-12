# DueDesk

Marketing site for [DueDesk](https://duedesk.connective-labs.com): fixed-price, urgent company paperwork for Singapore businesses.

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

Deploy to Vercel with default Next.js settings. Set the production domain to `duedesk.connective-labs.com` in the Vercel project.

## Changing prices

Edit [`config/pricing.ts`](config/pricing.ts). Annual return amounts, rush fee, and turnaround copy are read from `pricing.annualReturn`. Other services use `pricing.books`, `pricing.tender`, and `pricing.grantClaim`.

## Changing WhatsApp messages

Edit [`config/site.ts`](config/site.ts):

- `WHATSAPP_NUMBER` (digits only, country code included, no `+`)
- `WHATSAPP_MESSAGES` per service key (`annualReturn`, `books`, `tender`, `grantClaim`, `general`)

CTA buttons build links via [`lib/whatsapp.ts`](lib/whatsapp.ts): `https://wa.me/<number>?text=<url-encoded message>`.

## Brand assets

Official logo files live in `public/brand/`:

| File | Use |
|------|-----|
| `duedesk-logo.png` | Header wordmark (2×, transparent) |
| `duedesk-logo.svg` | Same artwork in an SVG wrapper |
| `duedesk-monogram.png` | DD monogram |
| `duedesk-logo-source.png` | Original supplied artwork |

Favicon: `app/icon.png`. Apple touch icon: `app/apple-icon.png`. Default social preview: `app/opengraph-image.png` (warm paper, 1200×630).

Navy accent (`#002551`) is taken from the logo; tweak in `app/globals.css` under `@theme`.

## Site URL and SEO

Canonical base URL and sitemap host are in `SITE_URL` in [`config/site.ts`](config/site.ts). Per-page titles and descriptions are set in each route's `metadata` export.

## WhatsApp ordering

Customers message +65 8377 8712. The Cloud API webhook runs the order: company or UEN, overdue years (FY2021–FY2025, picked again to add another), standard or 24-hour rush, a quote, Stripe Checkout, then document intake. Copy is signed as Leon from DueDesk. It never mentions software, and it never says DueDesk files with ACRA. The line used with customers is: "We prepare your pack, and you file it on Bizfile with your Singpass (about 15 minutes), or our partner corporate secretary can arrange it."

ACRA's own fees and late penalties are paid to ACRA directly and are not included. Prices come from [`config/pricing.ts`](config/pricing.ts): S$199 for the first year, S$99 for each extra year, and S$80 for 24-hour rush.

Free-form replies are sent only inside WhatsApp's 24-hour customer service window, opened by a message from the customer. Messages Leon sends from the WhatsApp Business app do not open that window. Pack-ready notes, the done reminder, and a payment checklist sent after the window closes use the templates below.

`/admin` lists orders, status, and files. It is protected by `ADMIN_PASSWORD`. Resume auto replies there after a handoff. The pack-ready and done buttons send the templates, including when the chat is outside the service window.

If `AI_GATEWAY_API_KEY` and `AI_GATEWAY_MODEL` are set, a free-text message with no obvious company or UEN can be read by a model to fill those fields. The reply the customer sees still comes from the fixed script. Leave the keys blank to skip that.

## Environment variables

Copy [`.env.example`](.env.example). Do not commit real values.

| Variable | Purpose |
| --- | --- |
| `WHATSAPP_VERIFY_TOKEN` | String you choose. Meta sends it when verifying the webhook. |
| `WHATSAPP_APP_SECRET` | App secret used to check `X-Hub-Signature-256`. |
| `WHATSAPP_TOKEN` | Permanent Cloud API token. |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID for +65 8377 8712, not the display number. |
| `WHATSAPP_GRAPH_VERSION` | Optional. Defaults to `v26.0`. |
| `SUPABASE_URL` | Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key. Never expose it to the browser. |
| `STRIPE_SECRET_KEY` | Restricted key (`rk_`) that can read and write Checkout Sessions. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the Stripe webhook. |
| `ADMIN_PASSWORD` | Password for `/admin`. |
| `ADMIN_NOTIFY_EMAIL` | Where handoff alerts should go. |
| `RESEND_API_KEY` | Optional. Without it, handoff alerts are only logged. |
| `RESEND_FROM_EMAIL` | Optional sender for those alerts. |
| `AI_GATEWAY_API_KEY` | Optional Vercel AI Gateway key. |
| `AI_GATEWAY_MODEL` | Optional `provider/model` id from the live model list. Prefer zero data retention. |
| `APP_BASE_URL` | Optional origin for the payment return page. Defaults to the production site. |

## Message templates

Submit these in WhatsApp Manager as **Utility**, language **English (`en`)**, before relying on the admin buttons. Sample values for both variables: `Acme Pte Ltd` and `FY2022, FY2023`. The source copy is [`config/whatsapp-templates.ts`](config/whatsapp-templates.ts).

### `duedesk_payment_received`

```
Hi {{1}}, Leon from DueDesk.

Payment received, thank you. Please send these for {{2}}:

1. Financial statements or management accounts
2. Bank statements
3. Director or shareholder changes
4. Any ACRA letters

A photo or a PDF is fine. Send them in this chat, then reply done.

We prepare your pack, and you file it on Bizfile with your Singpass (about 15 minutes), or our partner corporate secretary can arrange it.
```

### `duedesk_pack_ready`

```
Hi {{1}}, Leon from DueDesk.

Your annual return pack for {{2}} is ready. Please check this chat for the files.

We prepare your pack, and you file it on Bizfile with your Singpass (about 15 minutes), or our partner corporate secretary can arrange it.

On Bizfile, sign in with Singpass, open the annual return for each year, upload the documents from the pack, check the figures, and submit. ACRA's own fees and late penalties are paid to ACRA directly and are not included.

Reply here if you want me to walk you through it.
```

### `duedesk_done_reminder`

```
Hi {{1}}, Leon from DueDesk.

The catch-up for {{2}} is complete. Thank you.

Your next annual return is usually due in the month after your financial year end. Put a reminder in your calendar so it does not slip. Message me here when you want the next pack prepared.
```

Send the finished PDF from the WhatsApp Business app when you are ready. A message sent from the phone pauses auto replies for that customer, which is what you want while you are handling the chat yourself.

## Going live

Do this in order. Nothing here deploys or switches the live site by itself.

1. In Meta for Developers, create a Business app and add the WhatsApp product. Put the app through Business Verification and App Review before messaging customers outside the test list. The number +65 8377 8712 must already be on the WhatsApp Business app, version 2.24.17 or newer. Do not delete the Business app account and do not call the deregister API. Coexistence keeps the app and Cloud API on the same number.

2. Onboard that number with Embedded Signup for an existing WhatsApp Business app account (Meta sometimes calls this coexistence). In the launch extras set `featureType` to `whatsapp_business_app_onboarding` and `sessionInfoVersion` to `"3"`. The phone receives a code from the official Facebook Business account. In the Business app, tap Connect, then Connect to the Business Platform, then Confirm if you want chat history shared, and paste the code. The session event is `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING`. Keep the returned `waba_id`. Skip phone-number registration; the number is already registered. Confirm with `GET /v26.0/{phone-number-id}?fields=is_on_biz_app,platform_type`. Coexistence is on when `is_on_biz_app` is true and `platform_type` is `CLOUD_API`.

3. Subscribe the app webhook to `messages`, `smb_message_echoes`, `history`, `smb_app_state_sync`, and `account_update`. Callback URL: `https://duedesk.connective-labs.com/api/whatsapp/webhook`. Verify token: the same value as `WHATSAPP_VERIFY_TOKEN`. Within 24 hours of onboarding, open `/admin` and run Sync contacts, then Sync history, once each, while the Business app stays open. If you miss the 24 hours, Meta requires the number to be disconnected and onboarded again. If history sharing was declined, the webhook arrives with error `2593109` and nothing is imported. Those history and contact payloads are stored and are not answered.

4. Apply the SQL in [`supabase/migrations/20261112083500_whatsapp_orders.sql`](supabase/migrations/20261112083500_whatsapp_orders.sql). It creates the tables, turns on row level security with no public policies, and creates a private Storage bucket named `order-documents`. If the bucket insert fails on your project, create that bucket in the dashboard as private and do not add a public policy.

5. In the Stripe Dashboard, use a sandbox for the test run. Enable card and PayNow. PayNow only works for SGD one-time payments. Create a restricted API key that can read and write Checkout Sessions, and put it in `STRIPE_SECRET_KEY`. Add the webhook endpoint `https://duedesk.connective-labs.com/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Put that endpoint's signing secret in `STRIPE_WEBHOOK_SECRET`. Fulfillment runs from the webhook, and only once `payment_status` is `paid`. PayNow can stay unpaid on the first `completed` event and settle on `async_payment_succeeded`.

6. Set every required variable on the Vercel project as a sensitive environment variable. Deploy the branch only when you intend to take messages. The marketing pages are unchanged.

7. Submit the three Utility templates above and wait until WhatsApp marks them approved. Until then, the admin send buttons will fail outside the service window.

### Coexistence limits

- Throughput stays at 20 messages per second while the number is on both the Business app and Cloud API.
- One-to-one chats from the last 180 days can be synchronised. Group chats are not. Media ids are sent only for media from the 14 days before onboarding.
- Disappearing messages, view-once messages, and live location are turned off for individual chats and are not available on Cloud API. Broadcast lists become read-only. Voice and video calls stay on the Business app and are not mirrored to Cloud API.
- Companion devices are unlinked at onboarding. Up to four can be linked again. WhatsApp for Windows and WhatsApp for Wear OS are not supported. A message from an unsupported companion can arrive as error `131060` and is recorded, not answered. The same error can appear for a few seconds on a brand-new chat; the real message follows.
- Each time Leon sends from the Business app or a supported companion, `smb_message_echoes` fires. That marks the customer's chat as needs Leon and pauses auto replies until `/admin` resumes them. Those app messages are free, and they do not open or extend the Cloud API 24-hour window.
- Cloud API messages, including templates, are billed by Meta. Customer messages are not.
- You cannot deregister a coexistence number with the Deregister API. Disconnect from the Business app under Settings, Account, Business Platform. That sends an `account_update` webhook.

## Costs

Confirm the current cards before you budget. Figures below are the published Singapore rates as of 1 October 2026.

- Meta charges only when a Cloud API message is delivered. Customer messages are free. From 1 October 2026 the first 1,000 service messages per number each month are free, then service messages are about S$0.0205. Utility templates (the three above) are about S$0.0205 each, including inside the 24-hour window. Marketing messages are about S$0.0937 and this flow does not send them. Messages typed in the WhatsApp Business app stay free. Add GST the way your Meta invoice requires. Rate card: [WhatsApp Business Platform pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing).
- Stripe charges its Singapore card rate and its PayNow rate on top of the pack fee. There is no Stripe monthly fee for Checkout on the standard plan. Use a sandbox while testing so live cards are not charged. PayNow must be enabled in the Dashboard.
- Supabase: the free project is enough while volume is low. Stored PDFs count against storage. Move to a paid project if you pass the free limits.
- Vercel: these routes run on the existing project. Optional AI Gateway calls are billed per token only when both AI variables are set.
- Resend is optional. Without it, handoff alerts are written to the server log only.

## Pages

| Path | Purpose |
|------|---------|
| `/` | Service list |
| `/annual-return` | Primary SEO landing page |
| `/books` | Form C-S books catch-up |
| `/tender` | Coming soon |
| `/grant-claim` | Coming soon |
