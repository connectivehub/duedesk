import { JsonLd } from "@/components/JsonLd";
import {
  CatchUpTopics,
  FaqSection,
  FinalCta,
  GuaranteeBar,
  Hero,
  HowItWorks,
  PackSection,
  PenaltySection,
  PricingBlock,
  Promises,
} from "@/components/sections";
import { annualReturnFaqs, faqPageLd } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Overdue annual return",
  absoluteTitle: "Annual Return Overdue? Catch Up in 3 Working Days | DueDesk Singapore",
  description:
    "Late annual return or missed AGM? Fixed price from S$199, ready in 3 working days, 24-hour rush available. We prepare your pack and you file on Bizfile. WhatsApp for a quote.",
  path: "/annual-return",
});

export default function AnnualReturnPage() {
  return (
    <>
      <JsonLd data={faqPageLd(annualReturnFaqs)} />
      <Hero
        eyebrow="Annual Return & AGM Catch-up"
        title="Annual return overdue or AGM missed? Get caught up in 3 working days."
        sub="A fixed price for every overdue year, prepared by a named person, ready for you to file."
        messageKey="annualReturn"
        primaryLabel="Get a fixed quote on WhatsApp"
        secondaryHref="#pricing"
        secondaryLabel="See pricing"
      />
      <GuaranteeBar />
      <CatchUpTopics />
      <PenaltySection title="ACRA penalty: what a late filing costs" />
      <PackSection />
      <PricingBlock />
      <HowItWorks />
      <div className="pt-16 md:pt-24">
        <Promises />
      </div>
      <FaqSection items={annualReturnFaqs} />
      <FinalCta
        title="Stop the penalties piling up. Message us now."
        messageKey="annualReturn"
      />
    </>
  );
}
