/**
 * Client-facing prices and turnaround. Edit here to update the site.
 * The WhatsApp ordering flow reads annualReturn amounts from this object.
 */
export const pricing = {
  annualReturn: {
    currency: "S$",
    firstOverdueYear: 199,
    eachAdditionalYear: 99,
    workingDaysTurnaround: 3,
    rushSurcharge: 80,
    rushLabel: "24-hour rush",
    note: "ACRA filing fees and any late penalties are paid by you directly to ACRA and are not included.",
  },
  books: {
    display: "Quoted on WhatsApp",
    note: "Quoted after we understand your months behind and transaction volume.",
  },
  tender: {
    display: "Quoted on WhatsApp",
    comingSoon: false,
    note: "Fixed price after we see the tender reference and closing date.",
  },
  grantClaim: {
    display: "Quoted on WhatsApp",
    comingSoon: false,
    note: "Fixed price after we see the grant type and claim stage.",
  },
  esg: {
    display: "Quoted on WhatsApp",
    note: "A fixed price, agreed up front, before any work starts.",
  },
} as const;

export const services = [
  {
    slug: "annual-return",
    href: "/annual-return",
    title: "Annual Return & AGM Catch-up",
    shortDescription: "Every overdue year, ready to file.",
    available: true,
  },
  {
    slug: "books",
    href: "/books",
    title: "Year-end Books before Form C-S",
    shortDescription: "Get your books ready before IRAS's 30 November deadline.",
    available: true,
  },
  {
    slug: "tender",
    href: "/tender",
    title: "Tender Submission Prep",
    shortDescription: "Tender documents assembled, checked and on time.",
    available: true,
  },
  {
    slug: "grant-claim",
    href: "/grant-claim",
    title: "Grant Claim Packs (EDG/PSG)",
    shortDescription: "Claim documents prepared the way agencies expect.",
    available: true,
  },
  {
    slug: "esg",
    href: "/esg",
    title: "ESG Pack, done for you",
    shortDescription:
      "You don't need more advice, you need it done, at a fixed price agreed up front.",
    available: true,
  },
] as const;
