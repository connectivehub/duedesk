import { WHATSAPP_NUMBER } from "@/config/site";

export function SiteFooter() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <footer className="mt-16 border-t ledger-rule bg-paper-dark px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4 text-sm text-ink-muted">
        <p>
          DueDesk is a document preparation service. We do not file on your behalf with ACRA or
          IRAS. Filing is done by your company&apos;s director or by a registered corporate service
          provider.
        </p>
        <p>
          WhatsApp:{" "}
          <a href={waLink} className="text-navy underline decoration-rule underline-offset-2">
            +65 8377 8712
          </a>
        </p>
        <p className="text-xs text-ink-muted/80">A Connective Labs service</p>
      </div>
    </footer>
  );
}
