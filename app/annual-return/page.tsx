import { JsonLd } from "@/components/JsonLd";
import { Section } from "@/components/Section";
import { StickyWhatsApp } from "@/components/StickyWhatsApp";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { pricing } from "@/config/pricing";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";

const { annualReturn: ar } = pricing;

const faqs = [
  {
    question: "Do you file the annual return on Bizfile for us?",
    answer:
      "We prepare your AGM and annual return catch-up pack. Your director files on Bizfile with Singpass, or our partner corporate service provider files on your instruction.",
  },
  {
    question: "Can you stop ACRA penalties?",
    answer:
      "Penalties are set by ACRA when you file late. We help you get the paperwork ready so you can file as soon as possible. Any composition or late fees are paid to ACRA, not to us.",
  },
  {
    question: "We missed more than one year. How is pricing calculated?",
    answer: `The first overdue year is ${ar.currency}${ar.firstOverdueYear}. Each additional overdue year is ${ar.currency}${ar.eachAdditionalYear}. We work through the years in order.`,
  },
  {
    question: "What is the rush option?",
    answer: `Need it faster? Add ${ar.currency}${ar.rushSurcharge} for ${ar.rushLabel} (${ar.workingDaysTurnaround} working days is our standard).`,
  },
  {
    question: "What if our AGM was never held?",
    answer:
      "A late or missing AGM can be a separate breach from a late annual return. We include AGM papers in the catch-up pack for each overdue year, based on the documents you provide.",
  },
  {
    question: "Who will I be dealing with?",
    answer:
      "One named person from start to finish. You can reach them on WhatsApp while you are filing if something on Bizfile does not match your pack.",
  },
];

export const metadata = pageMetadata({
  title: "Overdue annual return (Singapore)",
  description:
    "Late ACRA annual return or AGM overdue? Fixed-price catch-up packs for Singapore companies. S$199 first year, S$99 each extra year.",
  path: "/annual-return",
});

export default function AnnualReturnPage() {
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Overdue annual return catch-up",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "Singapore",
    },
    description:
      "Document preparation for overdue AGM and annual return filings for Singapore companies.",
    offers: {
      "@type": "Offer",
      priceCurrency: "SGD",
      price: ar.firstOverdueYear,
      description: `First overdue year ${ar.currency}${ar.firstOverdueYear}; additional years ${ar.currency}${ar.eachAdditionalYear}`,
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={[serviceLd, faqLd]} />

      <header className="border-b ledger-rule py-10">
        <p className="chop-mark text-stamp">ACRA · Bizfile</p>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Annual return overdue? We&apos;ll get your company caught up.
        </h1>
        <p className="mt-5 text-lg text-ink-muted">
          For Singapore companies searching because the annual return is late, the AGM slipped, or
          Bizfile shows overdue status. We prepare each year&apos;s catch-up pack in order. You stay
          in control of filing.
        </p>
        <div className="mt-8">
          <WhatsAppCTA messageKey="annualReturn">WhatsApp: start an annual return job</WhatsAppCTA>
        </div>
      </header>

      <Section title="The problem">
        <p>
          An annual return must be filed within the window ACRA sets after your financial year end.
          When it is late, Bizfile charges a penalty:{" "}
          <strong className="font-medium text-ink">
            S$300 if filed within three months after the due date
          </strong>
          , and <strong className="font-medium text-ink">S$600 after that</strong>. These amounts
          are collected when you file on Bizfile. ACRA may also seek composition for continued
          default.
        </p>
        <p>
          A late or missing AGM is a separate matter from the annual return. Both need to be
          addressed before your company is properly caught up.
        </p>
      </Section>

      <Section title="What we do">
        <ul className="list-disc space-y-2 pl-5">
          <li>Collect your scattered PDFs, emails, and bank exports, however messy they arrive.</li>
          <li>
            Prepare the AGM and annual return catch-up pack for <em>every</em> overdue year, in
            chronological order.
          </li>
          <li>Include a plain step-by-step guide for what to click on Bizfile.</li>
          <li>Stay on WhatsApp while you file, if a figure or date does not match.</li>
        </ul>
        <p className="text-sm">
          We prepare. We do not submit to ACRA on your behalf unless you engage our partner corporate
          service provider to file for you.
        </p>
      </Section>

      <Section title="What you provide">
        <ul className="list-disc space-y-2 pl-5">
          <li>UEN and company name as registered.</li>
          <li>Director and shareholder particulars (NRIC or passport details as already filed).</li>
          <li>Financial year end date and which years are overdue.</li>
          <li>
            Financial statements or management accounts per year, if you have them. Tell us if a
            year has none yet.
          </li>
          <li>Registered office address and principal activities (SSIC) if changed.</li>
        </ul>
      </Section>

      <Section title="How it works">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-ink">Message us on WhatsApp</strong> with your UEN and how many
            years are overdue. We confirm the fixed price before payment.
          </li>
          <li>
            <strong className="text-ink">Named person assigned</strong> within one working day to
            collect documents.
          </li>
          <li>
            <strong className="text-ink">We deliver the pack</strong> in {ar.workingDaysTurnaround}{" "}
            working days (or sooner with rush).
          </li>
          <li>
            <strong className="text-ink">You file on Bizfile</strong> with your CorpPass/Singpass as
            director, paying ACRA&apos;s fee and any penalties at that time. Alternatively, our
            partner corporate service provider files for you on your instruction.
          </li>
        </ol>
      </Section>

      <Section id="pricing" title="Pricing">
        <div className="paper-card p-6">
          <dl className="space-y-3 text-ink">
            <div className="flex justify-between gap-4 border-b border-rule pb-3">
              <dt>First overdue year</dt>
              <dd className="font-serif text-lg">
                {ar.currency}
                {ar.firstOverdueYear}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-rule pb-3">
              <dt>Each additional overdue year</dt>
              <dd className="font-serif text-lg">
                {ar.currency}
                {ar.eachAdditionalYear}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-rule pb-3">
              <dt>Standard turnaround</dt>
              <dd>{ar.workingDaysTurnaround} working days</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{ar.rushLabel}</dt>
              <dd>
                +{ar.currency}
                {ar.rushSurcharge}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-ink-muted">{ar.note}</p>
        </div>
        <div className="mt-6">
          <WhatsAppCTA messageKey="annualReturn">Get a quote on WhatsApp</WhatsAppCTA>
        </div>
      </Section>

      <Section id="faq" title="Frequently asked questions">
        <dl className="space-y-6">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-ink">{item.question}</dt>
              <dd className="mt-2">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <section className="border-t ledger-rule py-12 text-center">
        <h2 className="font-serif text-2xl">Ready to catch up?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Tell us your UEN and how many years are overdue. We reply with a fixed price and what to
          send next.
        </p>
        <div className="mt-6">
          <WhatsAppCTA messageKey="annualReturn">WhatsApp DueDesk</WhatsAppCTA>
        </div>
      </section>

      <StickyWhatsApp messageKey="annualReturn" label="Annual return help" />
    </>
  );
}
