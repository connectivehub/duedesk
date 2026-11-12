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

## Site URL and SEO

Canonical base URL and sitemap host are in `SITE_URL` in [`config/site.ts`](config/site.ts). Per-page titles and descriptions are set in each route's `metadata` export.

## Pages

| Path | Purpose |
|------|---------|
| `/` | Service list |
| `/annual-return` | Primary SEO landing page |
| `/books` | Form C-S books catch-up |
| `/tender` | Coming soon |
| `/grant-claim` | Coming soon |
