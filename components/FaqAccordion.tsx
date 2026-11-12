"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

type Item = { q: string; a: string };

export function FaqAccordion({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t-2 border-primary">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q} className="ledger-row">
            <h3 className="font-sans text-base">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`faq-${index}`}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-semibold text-primary"
                onClick={() => setOpen(expanded ? null : index)}
              >
                {item.q}
                <ChevronDownIcon
                  className={`size-5 shrink-0 text-gold transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div id={`faq-${index}`} hidden={!expanded} className="pb-5 pr-8">
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
