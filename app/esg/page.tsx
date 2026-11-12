import { FinalCta, Hero, QuotePanel, Steps } from "@/components/sections";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

const steps = [
  "WhatsApp your company name and what the pack needs to cover.",
  "Get a fixed quote, in writing, before you pay anything.",
  "Send what you already have. Photos and PDFs are fine.",
  "Receive the pack. The price you accepted does not change.",
];

export const metadata = pageMetadata({
  title: "ESG Pack, done for you",
  description:
    "An ESG pack, done for you, at a fixed price agreed up front. Message DueDesk on WhatsApp for a quote.",
  path: "/esg",
});

export default function EsgPage() {
  return (
    <>
      <Hero
        eyebrow="ESG Pack"
        title="You don't need more advice. You need it done."
        sub="An ESG pack at a fixed price, agreed up front. No retainer, and no open-ended engagement."
        messageKey="esg"
        primaryLabel="Get a fixed quote on WhatsApp"
        secondaryHref="#pricing"
        secondaryLabel="See pricing"
      />
      <Steps
        eyebrow="How it works"
        title="Four steps, all on WhatsApp."
        steps={steps}
        note="The price is fixed before we start. There is no retainer."
      />
      <QuotePanel
        display={pricing.esg.display}
        note={pricing.esg.note}
        messageKey="esg"
        label="Get my fixed quote on WhatsApp"
      />
      <FinalCta title="Need the pack done? Message us now." messageKey="esg" />
    </>
  );
}
