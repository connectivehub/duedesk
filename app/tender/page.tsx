import { FinalCta, Hero, QuotePanel, Steps } from "@/components/sections";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

const steps = [
  "WhatsApp the tender name and the closing date.",
  "Get a fixed quote, in writing, before you pay anything.",
  "Send the tender documents, forms, and annexes you already have.",
  "Receive an assembled, checked pack in time to submit. You make the submission.",
];

export const metadata = pageMetadata({
  title: "Tender Submission Prep",
  description:
    "Tender documents assembled, checked and on time for Singapore businesses. Fixed quote on WhatsApp before you pay.",
  path: "/tender",
});

export default function TenderPage() {
  return (
    <>
      <Hero
        eyebrow="Tender Submission Prep"
        title="Tender documents assembled, checked and on time."
        sub="Forms, declarations, and annexes pulled into one pack when the closing date is close. You submit. We prepare."
        messageKey="tender"
        primaryLabel="Get a fixed quote on WhatsApp"
        secondaryHref="#pricing"
        secondaryLabel="See pricing"
      />
      <Steps
        eyebrow="How it works"
        title="Four steps, all on WhatsApp."
        steps={steps}
        note="We prepare the submission pack. Your company makes the tender submission."
      />
      <QuotePanel
        display={pricing.tender.display}
        note={pricing.tender.note}
        messageKey="tender"
        label="Get my fixed quote on WhatsApp"
      />
      <FinalCta title="Closing date close? Message us now." messageKey="tender" />
    </>
  );
}
