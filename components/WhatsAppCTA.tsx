import type { WhatsAppMessageKey } from "@/config/site";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  messageKey: WhatsAppMessageKey;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

export function WhatsAppCTA({
  messageKey,
  children,
  className = "",
  variant = "primary",
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-sm border px-5 py-3 text-center text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "border-ink bg-ink text-paper hover:bg-navy"
      : "border-rule bg-[#fdfbf7] text-ink hover:border-ink";

  return (
    <a
      href={whatsappUrl(messageKey)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </a>
  );
}
