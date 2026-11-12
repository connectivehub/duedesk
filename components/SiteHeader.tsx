"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DueDeskLogo } from "@/components/DueDeskLogo";
import { ChevronDownIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { services } from "@/config/pricing";
import { companyNav } from "@/lib/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-background/95 backdrop-blur-sm">
      <div className="container-site flex h-16 items-center justify-between gap-3 md:h-20">
        <Link
          href="/"
          className="flex min-h-11 items-center"
          aria-label="DueDesk home"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <DueDeskLogo linked={false} priority className="h-7 w-auto sm:h-9 md:h-11" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 text-[15px] lg:flex">
          <div
            className="relative"
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              className="flex min-h-11 items-center gap-1 text-foreground hover:text-primary"
              onClick={() => setServicesOpen((open) => !open)}
              onMouseEnter={() => setServicesOpen(true)}
            >
              Services{" "}
              <ChevronDownIcon className="size-4" />
            </button>
            {servicesOpen ? (
              <ul className="absolute left-0 top-full w-72 border border-rule bg-card py-2 shadow-sm">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={service.href}
                      className="block px-4 py-2.5 hover:bg-muted"
                      onClick={() => setServicesOpen(false)}
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {companyNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center text-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppCTA messageKey="general" size="sm">
            WhatsApp us
          </WhatsAppCTA>
          <button
            type="button"
            className="flex size-11 items-center justify-center text-primary lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-rule bg-background lg:hidden">
          <div className="container-site py-3">
            <p className="eyebrow pt-2">Services</p>
            <ul className="mb-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={service.href}
                    onClick={() => setMobileOpen(false)}
                    className="ledger-row flex min-h-11 items-center"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
            {companyNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="ledger-row flex min-h-11 items-center font-serif text-lg text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
