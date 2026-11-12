import {
  FinalCta,
  Hero,
  QuotePanel,
  Steps,
} from "@/components/sections";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

const steps = [
  "WhatsApp us your company name or UEN and how far behind the books are.",
  "Get a fixed quote, in writing, before you pay anything.",
  "Send bank statements, invoices, and payroll summaries. Photos and PDFs are fine.",
  "We hand over a tidy year-end pack. Your director or tax agent files Form C-S with IRAS.",
];

export const metadata = pageMetadata({
  title: "Year-end Books before Form C-S",
  description:
    "Year-end bookkeeping catch-up for Singapore companies ahead of Form C-S, due 30 November. Fixed quote on WhatsApp before you pay.",
  path: "/books",
});

export default function BooksPage() {
  return (
    <>
      <Hero
        eyebrow="Year-end Books before Form C-S"
        title="Books behind? Catch up before Form C-S is due."
        sub="Get your books ready before IRAS's 30 November deadline. We tidy the year-end records. Your director or tax agent files the return."
        messageKey="books"
        primaryLabel="Get a fixed quote on WhatsApp"
        secondaryHref="#pricing"
        secondaryLabel="See pricing"
      />
      <section className="py-16 md:py-20">
        <div className="container-site grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="text-xl md:text-2xl">The records stopped</h2>
            <p className="mt-3 text-muted-foreground">
              Mixed receipts, missing months, and bank feeds that were never reconciled make November
              stressful. The return is filed by your director or tax agent. The blocker is often the
              underlying records.
            </p>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl">What we prepare</h2>
            <p className="mt-3 text-muted-foreground">
              Sales and expenses for the missing period, a bank reconciliation, and a year-end pack
              your tax agent can use for Form C-S.
            </p>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl">You stay in control</h2>
            <p className="mt-3 text-muted-foreground">
              We prepare the books pack. We do not file with IRAS. The price is agreed before you
              send a single file.
            </p>
          </div>
        </div>
      </section>
      <Steps
        id="how-it-works"
        eyebrow="How it works"
        title="Four steps, all on WhatsApp."
        steps={steps}
        note="Form C-S is filed by your director or tax agent. We get the books ready for them."
      />
      <QuotePanel
        display={pricing.books.display}
        note={pricing.books.note}
        messageKey="books"
        label="Get my fixed quote on WhatsApp"
      />
      <FinalCta title="Form C-S is due 30 November. Message us now." messageKey="books" />
    </>
  );
}
