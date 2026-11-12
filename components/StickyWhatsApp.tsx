"use client";

import { usePathname } from "next/navigation";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import type { WhatsAppMessageKey } from "@/config/site";

const messageByPath: Record<string, WhatsAppMessageKey> = {
  "/books": "books",
  "/tender": "tender",
  "/grant-claim": "grantClaim",
  "/esg": "esg",
};

/** Full-width bar on small screens. Hidden from the `md` breakpoint up. */
export function StickyWhatsApp() {
  const pathname = usePathname();
  const messageKey = messageByPath[pathname] ?? "annualReturn";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-background/95 p-3 backdrop-blur-sm md:hidden">
      <WhatsAppCTA messageKey={messageKey} size="md" className="w-full px-5 text-base">
        Get a fixed quote on WhatsApp
      </WhatsAppCTA>
    </div>
  );
}
