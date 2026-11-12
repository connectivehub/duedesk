import { StickyWhatsApp } from "@/components/StickyWhatsApp";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Tender submission pack",
  description:
    "Tender document preparation for Singapore businesses. Service launching soon; WhatsApp us in the meantime.",
  path: "/tender",
});

export default function TenderPage() {
  return (
    <>
      <header className="border-b ledger-rule py-10">
        <span className="chop-mark text-stamp">Coming soon</span>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Tender submission pack
        </h1>
        <p className="mt-5 text-lg text-ink-muted">
          Fixed-price help to assemble forms, declarations, and annexes when a tender deadline is
          close. We are finishing our checklist for common government and enterprise tenders.
        </p>
        <div className="mt-8">
          <WhatsAppCTA messageKey="tender">WhatsApp: tender help</WhatsAppCTA>
        </div>
      </header>

      <div className="paper-card my-10 p-6">
        <p className="text-ink-muted">
          Pricing: <span className="font-medium text-ink">{pricing.tender.display}</span>. Message us
          with the tender reference and closing date. We will tell you when this service is open and
          whether we can help now as a one-off job.
        </p>
      </div>

      <StickyWhatsApp messageKey="tender" label="Tender help" />
    </>
  );
}
