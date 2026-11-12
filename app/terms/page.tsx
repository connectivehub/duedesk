import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms of Service",
  absoluteTitle: "Terms of Service | DueDesk",
  description: "Terms of Service for DueDesk, a brand of Connective Labs Pte Ltd, Singapore.",
  path: "/terms",
  noindex: true,
  twitterCard: "summary",
});

export default function TermsPage() {
  return (
    <section className="container-site max-w-3xl py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl">Terms of Service</h1>
      <div className="rule-gold mt-5" />
      <p className="mt-8 text-muted-foreground">[placeholder: legal text]</p>
    </section>
  );
}
