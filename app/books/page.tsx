import { Section } from "@/components/Section";
import { StickyWhatsApp } from "@/components/StickyWhatsApp";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

const books = pricing.books;

export const metadata = pageMetadata({
  title: "Books catch-up for Form C-S",
  description:
    "Year-end bookkeeping catch-up for Singapore companies ahead of Form C-S due 30 November. Price on WhatsApp.",
  path: "/books",
});

export default function BooksPage() {
  return (
    <>
      <header className="border-b ledger-rule py-10">
        <p className="chop-mark text-stamp">IRAS · Form C-S</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Books behind? Catch up before Form C-S is due.
        </h1>
        <p className="mt-5 text-lg text-ink-muted">
          Form C-S for the year of assessment is due 30 November. If your records stopped months ago,
          we help tidy the year-end books so your tax agent or director can complete the return.
        </p>
        <div className="mt-8">
          <WhatsAppCTA messageKey="books">WhatsApp: books catch-up</WhatsAppCTA>
        </div>
      </header>

      <Section title="The problem">
        <p>
          Mixed receipts, missing months, and bank feeds that were never reconciled make November
          stressful. The return itself is filed by your director or tax agent. The blocker is often
          the underlying records.
        </p>
      </Section>

      <Section title="What we do">
        <ul className="list-disc space-y-2 pl-5">
          <li>Reconstruct sales and expenses for the missing period from what you have.</li>
          <li>Reconcile bank statements to a clean year-end trial balance.</li>
          <li>Hand over a tidy pack your tax agent can use for Form C-S.</li>
        </ul>
      </Section>

      <Section title="How it works">
        <ol className="list-decimal space-y-3 pl-5">
          <li>WhatsApp us your UEN and how far behind the books are.</li>
          <li>We quote a fixed price before you commit.</li>
          <li>You send bank CSVs, invoices, and payroll summaries.</li>
          <li>We deliver the catch-up pack; you or your tax agent files with IRAS.</li>
        </ol>
      </Section>

      <Section title="Pricing">
        <p className="font-serif text-2xl text-ink">{books.display}</p>
        <p className="text-sm">{books.note}</p>
        <div className="mt-6">
          <WhatsAppCTA messageKey="books">Ask for a quote</WhatsAppCTA>
        </div>
      </Section>

      <StickyWhatsApp messageKey="books" label="Books help" />
    </>
  );
}
