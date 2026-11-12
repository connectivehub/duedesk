import Image from "next/image";
import Link from "next/link";

type Props = {
  linked?: boolean;
  className?: string;
  priority?: boolean;
};

/** Official wordmark. Display height is set by className. */
export function DueDeskLogo({
  linked = true,
  className = "h-9 w-auto md:h-11",
  priority = false,
}: Props) {
  const image = (
    <Image
      src="/brand/duedesk-logo.png"
      alt="DueDesk"
      width={344}
      height={77}
      priority={priority}
      className={className}
    />
  );

  if (!linked) return image;

  return (
    <Link href="/" className="flex min-h-11 items-center" aria-label="DueDesk home">
      {image}
    </Link>
  );
}
