import Link from "next/link";
import { DueDeskLogo } from "@/components/DueDeskLogo";
import { services } from "@/config/pricing";
import { WHATSAPP_DISPLAY } from "@/config/site";
import { companyNav } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-card pb-24 pt-14 md:pb-10">
      <div className="container-site grid gap-10 md:grid-cols-4">
        <div>
          <DueDeskLogo linked={false} className="h-10 w-auto" />
          <p className="mt-4 text-muted-foreground">
            Fixed-price help for Singapore companies behind on their filings.
          </p>
        </div>
        <div>
          <h2 className="eyebrow mb-3 font-sans">Services</h2>
          <ul className="space-y-1">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={service.href}
                  className="inline-flex min-h-11 items-center hover:text-primary md:min-h-0 md:py-1"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-3 font-sans">Company</h2>
          <ul className="space-y-1">
            {companyNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center hover:text-primary md:min-h-0 md:py-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-3 font-sans">Contact</h2>
          <a
            href={whatsappUrl("general")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
          >
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <p className="text-muted-foreground">Mon–Sat 9am–9pm</p>
        </div>
      </div>
      <div className="container-site mt-12 border-t border-rule pt-6 text-sm text-muted-foreground">
        <p>DueDesk is a brand of Connective Labs Pte Ltd, Singapore. UEN [placeholder].</p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline md:min-h-0"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline md:min-h-0"
          >
            Terms of Service
          </Link>
          <span className="inline-flex min-h-11 items-center md:min-h-0">
            © {new Date().getFullYear()} Connective Labs Pte Ltd
          </span>
        </p>
        <p className="mt-3 max-w-3xl">
          DueDesk prepares documents. Directors remain responsible for what is filed. Not affiliated
          with ACRA or any government agency.
        </p>
      </div>
    </footer>
  );
}
