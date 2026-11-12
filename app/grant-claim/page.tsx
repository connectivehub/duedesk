import { StickyWhatsApp } from "@/components/StickyWhatsApp";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { pricing } from "@/config/pricing";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Grant claim paperwork (EDG / PSG)",
  description:
    "Document preparation for EDG and PSG grant claims in Singapore. Coming soon; contact us on WhatsApp.",
  path: "/grant-claim",
});

export default function GrantClaimPage() {
  return (
    <>
      <header className="border-b ledger-rule py-10">
        <span className="chop-mark text-stamp">Coming soon</span>
        <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">
          Grant claim support (EDG / PSG)
        </h1>
        <p className="mt-5 text-lg text-ink-muted">
          Enterprise Development Grant and Productivity Solutions Grant claims need matching invoices,
          project write-ups, and evidence in the right order. We are preparing a fixed-scope pack
          for common claim types.
        </p>
        <div className="mt-8">
          <WhatsAppCTA messageKey="grantClaim">WhatsApp: grant claim help</WhatsAppCTA>
        </div>
      </header>

      <div className="paper-card my-10 p-6">
        <p className="text-ink-muted">
          Pricing: <span className="font-medium text-ink">{pricing.grantClaim.display}</span>. Send
          your grant reference and claim stage on WhatsApp. We will confirm when this page goes live
          and if we can take your job earlier.
        </p>
      </div>

      <StickyWhatsApp messageKey="grantClaim" label="Grant claim help" />
    </>
  );
}
