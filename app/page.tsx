import { ServiceNav } from "@/components/ServiceNav";
import { StickyWhatsApp } from "@/components/StickyWhatsApp";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Urgent company paperwork",
  description:
    "DueDesk helps Singapore business owners catch up overdue annual returns, books for Form C-S, and other fixed-price paperwork jobs.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <div className="border-b ledger-rule py-12">
        <p className="chop-mark text-stamp">Est. for busy directors</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Last-minute company paperwork, sorted at a fixed price
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-muted">
          When ACRA or IRAS deadlines have passed and your desk is full of half-finished files, we
          prepare the documents you need. You file with your own Singpass, or our partner corporate
          service provider files for you.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <WhatsAppCTA messageKey="general">Message us on WhatsApp</WhatsAppCTA>
          <a
            href="#services"
            className="text-center text-sm text-navy underline decoration-rule underline-offset-4"
          >
            Browse services
          </a>
        </div>
      </div>

      <section id="services" className="py-10">
        <h2 className="font-serif text-xl">Services</h2>
        <p className="mt-2 text-sm text-ink-muted">
          One-off jobs. No monthly retainer. Each price is agreed before we start.
        </p>
        <ServiceNav />
      </section>

      <StickyWhatsApp messageKey="general" label="WhatsApp" />
    </>
  );
}
