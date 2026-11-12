import Link from "next/link";
import { SITE_NAME } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-b ledger-rule bg-[#fdfbf7]">
      <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="group">
          <span className="font-serif text-2xl tracking-tight text-ink group-hover:text-navy">
            {SITE_NAME}
          </span>
          <span className="mt-0.5 block chop-mark text-ink-muted">Singapore</span>
        </Link>
        <p className="hidden text-right text-sm text-ink-muted sm:block">
          Urgent paperwork.
          <br />
          Fixed price. Named contact.
        </p>
      </div>
    </header>
  );
}
