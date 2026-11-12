import Image from "next/image";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  BookOpenIcon,
  CheckIcon,
  ClockIcon,
  FileCheckIcon,
  FileTextIcon,
  KeyIcon,
  ListChecksIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "@/components/icons";
import { GhostLink, WhatsAppCTA } from "@/components/WhatsAppCTA";
import { pricing } from "@/config/pricing";
import {
  BIZFILE_SEARCH_URL,
  COMPANY_LEGAL_NAME,
  COMPANY_UEN,
  WHATSAPP_DISPLAY,
  type WhatsAppMessageKey,
} from "@/config/site";
import {
  ACRA_PENALTY_URL,
  annualReturnExample,
  catchUpTopics,
  filingLine,
  guarantees,
  howItWorks,
  packItems,
  penalties,
  promises,
  serviceCards,
  situations,
} from "@/lib/content";

const guaranteeIcons = {
  file: FileCheckIcon,
  clock: ClockIcon,
  zap: ZapIcon,
  key: KeyIcon,
} as const;

const packIcons = {
  scroll: ScrollTextIcon,
  fileText: FileTextIcon,
  checks: ListChecksIcon,
  book: BookOpenIcon,
} as const;

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-[1.7rem] md:text-4xl">{title}</h2>
      <div className="rule-gold mt-5" />
      {children ? <div className="mt-5 text-muted-foreground">{children}</div> : null}
    </div>
  );
}

export function Hero({
  eyebrow,
  title,
  sub,
  messageKey,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  finePrint = "Reply usually within 2 hours, 9am–9pm. No sign-up, no retainer.",
}: {
  eyebrow: string;
  title: string;
  sub: string;
  messageKey: WhatsAppMessageKey;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  finePrint?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary">
      <Image
        src="/images/hero-shophouse-office.jpg"
        alt="A director reviewing paper files at a wooden desk in a quiet Singapore shophouse office"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/30 md:to-transparent"
        aria-hidden="true"
      />
      <div className="container-site relative py-16 md:py-28">
        <div className="fade-in max-w-xl">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="text-[2rem] leading-tight text-primary-foreground md:text-5xl">{title}</h1>
          <p className="mt-6 text-lg text-primary-foreground/90">{sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppCTA messageKey={messageKey} size="lg">
              {primaryLabel}
            </WhatsAppCTA>
            {secondaryHref && secondaryLabel ? (
              <GhostLink href={secondaryHref}>{secondaryLabel}</GhostLink>
            ) : null}
          </div>
          {finePrint ? <p className="mt-5 text-sm text-primary-foreground/75">{finePrint}</p> : null}
        </div>
      </div>
    </section>
  );
}

export function GuaranteeBar() {
  return (
    <section aria-label="Our guarantees" className="border-b border-rule bg-card">
      <ul className="container-site grid grid-cols-1 gap-y-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {guarantees.map((item) => {
          const Icon = guaranteeIcons[item.icon];
          return (
            <li key={item.label} className="flex items-center gap-3 text-[15px] font-medium">
              <Icon className="size-5 shrink-0 text-gold" />
              {item.label}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PenaltySection({ title }: { title: string }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-site">
        <SectionHeading eyebrow="ACRA penalties" title={title} />
        <dl className="border-t-2 border-primary bg-card">
          {penalties.map((row, index) => (
            <div
              key={row.label}
              className="ledger-row grid gap-1 px-4 py-4 md:grid-cols-[3rem_16rem_1fr] md:gap-6 md:px-6"
            >
              <span className="hidden font-serif text-gold md:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <dt className="font-semibold text-primary">{row.label}</dt>
              <dd>{row.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 font-serif text-xl text-primary">
          The best time to fix it is today. Message us and we&apos;ll tell you exactly where you stand.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Source:{" "}
          <a
            href={ACRA_PENALTY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            ACRA, acra.gov.sg
          </a>
        </p>
      </div>
    </section>
  );
}

export function Situations() {
  return (
    <section className="border-y border-rule bg-card py-16 md:py-24">
      <div className="container-site">
        <SectionHeading eyebrow="Is this you?" title="Ordinary reasons. Straightforward fixes." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {situations.map((item) => (
            <article key={item.quote} className="flex flex-col border border-rule bg-background">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg">“{item.quote}”</h3>
                <p className="mt-3 flex-1 text-muted-foreground">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceGrid() {
  return (
    <section id="services" className="py-16 md:py-24">
      <div className="container-site">
        <SectionHeading
          eyebrow="Services"
          title="One job each. Done properly, at a fixed price."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((service) => (
            <article
              key={service.href}
              className={`relative flex flex-col border bg-card p-6 ${
                service.badge ? "border-primary" : "border-rule"
              }`}
            >
              {service.badge ? (
                <span className="absolute -top-3 left-6 bg-primary px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  {service.badge}
                </span>
              ) : null}
              <h3 className="text-xl">{service.title}</h3>
              {service.price ? <p className="mt-2 font-serif text-lg text-gold">{service.price}</p> : null}
              <p className="mt-3 flex-1 text-muted-foreground">{service.body}</p>
              <WhatsAppCTA messageKey={service.messageKey} size="sm" className="mt-6 self-start">
                Get a quote
              </WhatsAppCTA>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ id = "how-it-works" }: { id?: string }) {
  return (
    <section id={id} className="border-y border-rule bg-card py-16 md:py-24">
      <div className="container-site">
        <SectionHeading eyebrow="How it works" title="Four steps, all on WhatsApp." />
        <ol className="grid gap-8 md:grid-cols-4">
          {howItWorks.map((step, index) => (
            <li key={step} className="border-t border-rule pt-5">
              <span className="font-serif text-5xl text-gold" aria-hidden="true">
                {index + 1}
              </span>
              <p className="mt-3">{step}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl border-l-2 border-gold pl-4 font-serif text-primary">{filingLine}</p>
      </div>
    </section>
  );
}

export function PricingBlock() {
  const ar = pricing.annualReturn;
  const example = annualReturnExample(3);

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeading eyebrow="Pricing" title="Annual Return & AGM Catch-up">
          <p>Published prices. A one-off job, with no subscription and no retainer. PayNow or card.</p>
        </SectionHeading>
        <div>
          <table className="w-full border-t-2 border-primary bg-card text-left">
            <caption className="sr-only">Annual return catch-up prices</caption>
            <tbody>
              <tr className="ledger-row">
                <th scope="row" className="px-4 py-4 font-medium md:px-6">
                  First overdue year
                </th>
                <td className="px-4 py-4 text-right font-serif text-lg text-primary md:px-6">
                  {ar.currency}
                  {ar.firstOverdueYear}
                </td>
              </tr>
              <tr className="ledger-row">
                <th scope="row" className="px-4 py-4 font-medium md:px-6">
                  Each additional year
                </th>
                <td className="px-4 py-4 text-right font-serif text-lg text-primary md:px-6">
                  {ar.currency}
                  {ar.eachAdditionalYear}
                </td>
              </tr>
              <tr className="ledger-row">
                <th scope="row" className="px-4 py-4 font-medium md:px-6">
                  Turnaround
                </th>
                <td className="px-4 py-4 text-right font-serif text-lg text-primary md:px-6">
                  {ar.workingDaysTurnaround} working days
                </td>
              </tr>
              <tr className="ledger-row">
                <th scope="row" className="px-4 py-4 font-medium md:px-6">
                  {ar.rushLabel}
                </th>
                <td className="px-4 py-4 text-right font-serif text-lg text-primary md:px-6">
                  +{ar.currency}
                  {ar.rushSurcharge}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-6 bg-muted px-4 py-3">
            <strong className="text-primary">Example:</strong> {example.years} overdue years ={" "}
            {example.currency}
            {ar.firstOverdueYear} + {example.currency}
            {ar.eachAdditionalYear} + {example.currency}
            {ar.eachAdditionalYear} = <strong className="text-primary">{example.currency}{example.total}</strong>.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{ar.note}</p>
          <WhatsAppCTA messageKey="annualReturn" size="lg" className="mt-8 w-full sm:w-auto">
            Get my fixed quote on WhatsApp
          </WhatsAppCTA>
        </div>
      </div>
    </section>
  );
}

export function Promises() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="container-site">
        <div className="border-2 border-gold bg-card p-6 md:p-10">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="size-7 text-gold" />
            <h2 className="text-2xl md:text-3xl">Our promises</h2>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {promises.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="border-y border-rule bg-card py-16 md:py-24">
      <div className="container-site grid items-start gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div className="relative aspect-[4/5] overflow-hidden border border-rule bg-muted">
          <Image
            src="/images/leon-lee.jpg"
            alt="Leon Lee, who handles every DueDesk case"
            fill
            sizes="(min-width: 768px) 29rem, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow mb-3">About</p>
          <h2 className="text-[1.7rem] md:text-4xl">A real person, in Singapore, on your case.</h2>
          <div className="rule-gold mt-5" />
          <p className="mt-6">
            DueDesk is run by Leon Lee, who handles every case personally, from your first message to
            the day you file.
          </p>
          <p className="mt-4">
            Good business owners fall behind for ordinary reasons: a busy year, a dormant company, a
            secretary who stopped replying. Catching up should be quick, fairly priced and free of
            judgement.
          </p>
          <ul className="mt-8 flex flex-col gap-2 border-y border-rule py-4 text-sm sm:flex-row sm:gap-6">
            <li>A brand of {COMPANY_LEGAL_NAME}, Singapore</li>
            <li>UEN {COMPANY_UEN}</li>
            <li>Published fixed prices</li>
          </ul>
          <div className="mt-8 border border-rule bg-background p-5 md:p-6">
            <h3 className="text-xl md:text-2xl">Why you can check us before you pay</h3>
            <ul className="mt-5 grid gap-3">
              <li className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-gold" />
                <span>
                  Registered Singapore company: {COMPANY_LEGAL_NAME}, UEN {COMPANY_UEN} (
                  <a
                    href={BIZFILE_SEARCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    Bizfile search
                  </a>
                  )
                </span>
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-gold" />
                <span>
                  Prices published in full on{" "}
                  <a href="#pricing" className="underline underline-offset-4">
                    this page
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-gold" />
                <span>Fixed quote in writing before you pay</span>
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-gold" />
                <span>One named person, Leon, from first message to filing</span>
              </li>
              <li className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-gold" />
                <span>We never ask for your Singpass or Corppass</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container-site max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Plain answers to fair questions" />
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}

export function FinalCta({
  title,
  messageKey,
  sub = "A fixed quote, usually within 2 hours (9am–9pm).",
}: {
  title: string;
  messageKey: WhatsAppMessageKey;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-center md:py-28">
      <Image
        src="/images/singapore-skyline.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover opacity-15"
      />
      <div className="container-site relative">
        <h2 className="text-[1.8rem] text-primary-foreground md:text-4xl">{title}</h2>
        <p className="mt-4 text-primary-foreground/85">{sub}</p>
        <WhatsAppCTA messageKey={messageKey} size="lg" className="mt-8">
          WhatsApp {WHATSAPP_DISPLAY}
        </WhatsAppCTA>
      </div>
    </section>
  );
}

export function CatchUpTopics() {
  return (
    <section className="py-16 md:py-20">
      <div className="container-site grid gap-10 md:grid-cols-3">
        {catchUpTopics.map((topic) => (
          <div key={topic.title}>
            <h2 className="text-xl md:text-2xl">{topic.title}</h2>
            <p className="mt-3 text-muted-foreground">{topic.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PackSection() {
  return (
    <section className="border-y border-rule bg-card py-16 md:py-24">
      <div className="container-site">
        <SectionHeading eyebrow="Your pack" title="What's in your pack">
          <p>{filingLine}</p>
        </SectionHeading>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packItems.map((item) => {
            const Icon = packIcons[item.icon];
            return (
              <li key={item.title} className="border-t border-rule pt-5">
                <Icon className="size-7 text-gold" />
                <h3 className="mt-4 text-lg">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Steps({
  id,
  eyebrow,
  title,
  steps,
  note,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  steps: readonly string[];
  note?: string;
}) {
  return (
    <section id={id} className="border-y border-rule bg-card py-16 md:py-24">
      <div className="container-site">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ol className="grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="border-t border-rule pt-5">
              <span className="font-serif text-5xl text-gold" aria-hidden="true">
                {index + 1}
              </span>
              <p className="mt-3">{step}</p>
            </li>
          ))}
        </ol>
        {note ? (
          <p className="mt-10 max-w-2xl border-l-2 border-gold pl-4 font-serif text-primary">{note}</p>
        ) : null}
      </div>
    </section>
  );
}

export function QuotePanel({
  display,
  note,
  messageKey,
  label,
}: {
  display: string;
  note: string;
  messageKey: WhatsAppMessageKey;
  label: string;
}) {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <SectionHeading eyebrow="Pricing" title={display}>
          <p>A one-off job. No subscription and no retainer. The price is fixed before you pay.</p>
        </SectionHeading>
        <div>
          <p className="border-t-2 border-primary bg-card px-4 py-6 font-serif text-2xl text-primary md:px-6">
            {display}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{note}</p>
          <WhatsAppCTA messageKey={messageKey} size="lg" className="mt-8 w-full sm:w-auto">
            {label}
          </WhatsAppCTA>
        </div>
      </div>
    </section>
  );
}
