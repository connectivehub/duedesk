import Link from "next/link";
import { services } from "@/config/pricing";

export function ServiceNav() {
  return (
    <nav aria-label="Services" className="mt-8 grid gap-4 sm:grid-cols-2">
      {services.map((service) => (
        <Link
          key={service.slug}
          href={service.href}
          className={`paper-card block p-5 transition-colors hover:border-ink/30 ${
            service.available ? "" : "opacity-90"
          }`}
        >
          {!service.available && (
            <span className="chop-mark mb-2 block text-stamp">Coming soon</span>
          )}
          <h2 className="font-serif text-lg text-ink">{service.title}</h2>
          <p className="mt-2 text-sm text-ink-muted">{service.shortDescription}</p>
          <span className="mt-3 inline-block text-sm text-navy underline decoration-rule underline-offset-2">
            {service.available ? "View details" : "Register interest"}
          </span>
        </Link>
      ))}
    </nav>
  );
}
