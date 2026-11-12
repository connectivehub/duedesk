import { DueDeskLogo } from "@/components/DueDeskLogo";

export function SiteHeader() {
  return (
    <header className="border-b ledger-rule bg-[#fdfbf7]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5 sm:items-end sm:px-6">
        <DueDeskLogo />
        <p className="hidden text-right text-sm text-ink-muted sm:block">
          Urgent paperwork.
          <br />
          Fixed price. Named contact.
        </p>
      </div>
    </header>
  );
}
