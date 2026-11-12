import { FinalCta, Hero, QuotePanel, Steps } from "@/components/sections";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

const steps = [
  "WhatsApp the grant type (EDG or PSG) and where the claim stands.",
  "Get a fixed quote, in writing, before you pay anything.",
  "Send invoices, project write-ups, and the evidence you have. Messy is fine.",
  "Receive a claim pack in the order agencies expect. You submit the claim.",
];

export const metadata = pageMetadata({
  title: "Grant Claim Packs (EDG/PSG)",
  description:
    "EDG and PSG claim documents prepared the way agencies expect. Fixed quote on WhatsApp before you pay. You submit the claim.",
  path: "/grant-claim",
});

export default function GrantClaimPage() {
  return (
    <>
      <Hero
        eyebrow="Grant Claim Packs (EDG/PSG)"
        title="Claim documents prepared the way agencies expect."
        sub="Enterprise Development Grant and Productivity Solutions Grant claims need invoices, write-ups, and evidence in the right order. We prepare the pack. You submit it."
        messageKey="grantClaim"
        primaryLabel="Get a fixed quote on WhatsApp"
        secondaryHref="#pricing"
        secondaryLabel="See pricing"
      />
      <Steps
        eyebrow="How it works"
        title="Four steps, all on WhatsApp."
        steps={steps}
        note="We prepare the claim pack. We do not submit the claim to the agency for you."
      />
      <QuotePanel
        display={pricing.grantClaim.display}
        note={pricing.grantClaim.note}
        messageKey="grantClaim"
        label="Get my fixed quote on WhatsApp"
      />
      <FinalCta title="Claim coming up? Message us now." messageKey="grantClaim" />
    </>
  );
}
