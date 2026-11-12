import type { WhatsAppMessageKey } from "@/config/site";
import { MessageCircleIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/whatsapp";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "px-3 text-sm",
  md: "px-5 text-base",
  lg: "px-6 py-3 text-lg",
};

type Props = {
  messageKey: WhatsAppMessageKey;
  children: React.ReactNode;
  className?: string;
  size?: Size;
};

export function WhatsAppCTA({ messageKey, children, className = "", size = "md" }: Props) {
  return (
    <a
      href={whatsappUrl(messageKey)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-whatsapp font-semibold text-whatsapp-foreground transition-[filter] hover:brightness-95 ${sizes[size]} ${className}`}
    >
      <MessageCircleIcon className="size-5 shrink-0" />
      {children}
    </a>
  );
}

type GhostProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function GhostLink({ href, children, className = "" }: GhostProps) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-sm border border-primary-foreground/50 px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 ${className}`}
    >
      {children}
    </a>
  );
}
