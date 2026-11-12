import Image from "next/image";
import Link from "next/link";

/** Official wordmark: 2× PNG (344×77) for sharp small sizes; SVG wrapper in repo. */
const LOGO_WIDTH = 172;
const LOGO_HEIGHT = 38;

export function DueDeskLogo() {
  return (
    <Link href="/" className="group inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/40">
      <Image
        src="/brand/duedesk-logo.png"
        alt="DueDesk"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority
        className="h-8 w-auto sm:h-9"
        sizes="(max-width: 640px) 140px, 172px"
      />
      <span className="chop-mark mt-1 block text-ink-muted group-hover:text-stamp">Singapore</span>
    </Link>
  );
}
