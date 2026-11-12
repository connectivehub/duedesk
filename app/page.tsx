import { JsonLd } from "@/components/JsonLd";
import {
  About,
  FaqSection,
  FinalCta,
  GuaranteeBar,
  Hero,
  HowItWorks,
  PenaltySection,
  PricingBlock,
  Promises,
  ServiceGrid,
  Situations,
} from "@/components/sections";
import { faqPageLd, homeFaqs } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Overdue annual return",
  absoluteTitle: "DueDesk | Overdue Annual Return? Caught Up in 3 Working Days",
  description:
    "Fixed-price help for Singapore companies behind on ACRA annual returns and AGMs. From S$199, ready in 3 working days. We prepare your pack, you file on Bizfile.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPageLd(homeFaqs)} />
      <Hero
        eyebrow="For Singapore companies behind on ACRA filings"
        title="Overdue annual return? We'll get you caught up in 3 working days."
        sub="Fixed price, agreed before you pay. One named person handles your case. We prepare everything, and you file on Bizfile with your Singpass in about 15 minutes."
        messageKey="annualReturn"
        primaryLabel="Get a fixed quote on WhatsApp"
        secondaryHref="#pricing"
        secondaryLabel="See pricing"
      />
      <GuaranteeBar />
      <PenaltySection title="The longer it waits, the more it costs" />
      <Situations />
      <ServiceGrid />
      <HowItWorks />
      <PricingBlock />
      <Promises />
      <About />
      <FaqSection items={homeFaqs} />
      <FinalCta
        title="Stop the penalties piling up. Message us now."
        messageKey="annualReturn"
      />
    </>
  );
}
