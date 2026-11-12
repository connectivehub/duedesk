/**
 * Client-facing prices and turnaround. Edit here to update the site.
 */
export const pricing = {
  annualReturn: {
    currency: "S$",
    firstOverdueYear: 199,
    eachAdditionalYear: 99,
    workingDaysTurnaround: 3,
    rushSurcharge: 80,
    rushLabel: "24-hour rush",
    note:
      "ACRA's own filing fee and any penalties are paid to ACRA separately and are not included in our fee.",
  },
  books: {
    display: "Price on WhatsApp",
    note: "Quoted after we understand your months behind and transaction volume.",
  },
  tender: {
    display: "Coming soon",
    comingSoon: true,
  },
  grantClaim: {
    display: "Coming soon",
    comingSoon: true,
  },
} as const;

export const services = [
  {
    slug: "annual-return",
    href: "/annual-return",
    title: "Overdue annual return",
    shortDescription:
      "Catch up AGM and annual return paperwork for every overdue year, in order.",
    available: true,
  },
  {
    slug: "books",
    href: "/books",
    title: "Books catch-up (Form C-S)",
    shortDescription:
      "Year-end bookkeeping tidy-up ahead of your Form C-S due 30 November.",
    available: true,
  },
  {
    slug: "tender",
    href: "/tender",
    title: "Tender submission pack",
    shortDescription: "Document preparation for urgent tender responses.",
    available: false,
  },
  {
    slug: "grant-claim",
    href: "/grant-claim",
    title: "Grant claim (EDG / PSG)",
    shortDescription: "Support paperwork for Enterprise Development Grant or PSG claims.",
    available: false,
  },
] as const;
