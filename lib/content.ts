import { pricing } from "@/config/pricing";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_UEN,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_DISPLAY,
  type WhatsAppMessageKey,
} from "@/config/site";

const ar = pricing.annualReturn;

export const companyNav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const guarantees = [
  { icon: "file", label: "Fixed price, quoted in writing first" },
  { icon: "clock", label: "Ready in 3 working days" },
  { icon: "zap", label: "24-hour rush available" },
  { icon: "key", label: "We never ask for your Singpass" },
] as const;

export const penalties = [
  {
    label: "Up to 3 months late",
    detail: "S$300 late lodgment penalty, charged automatically on Bizfile.",
  },
  { label: "More than 3 months late", detail: "S$600." },
  {
    label: "Composition sum",
    detail:
      "ACRA may also offer a composition sum of at least S$500 per breach. A late AGM and a late annual return are separate breaches.",
  },
  {
    label: "Repeated defaults",
    detail: "Can lead to court prosecution of the company and its directors.",
  },
  {
    label: "Director disqualification",
    detail: "Three or more filing convictions within 5 years disqualify a director for 5 years.",
  },
  {
    label: "Striking off",
    detail:
      "ACRA can strike off companies that stop filing. For striking-off letters dated on or after 20 Oct 2026, you have 15 days to object.",
  },
] as const;

export const ACRA_PENALTY_URL =
  "https://www.acra.gov.sg/compliance/annual-returns/late-lodgment-penalties";

export const situations = [
  {
    image: "/images/owners-paperwork.jpg",
    alt: "Two business owners frowning over a laptop and paperwork in their renovation workshop",
    quote: "My corporate secretary stopped replying.",
    body: "We pick up where they left off.",
    width: 1024,
    height: 768,
  },
  {
    image: "/images/paper-files-desk.jpg",
    alt: "Hands sorting through old paper folders on a wooden desk",
    quote: "The company was dormant, so I thought there was nothing to file.",
    body: "Dormant companies still file annual returns. We'll catch up every missed year.",
    width: 1200,
    height: 896,
  },
  {
    image: "/images/overseas-director.jpg",
    alt: "A director abroad messaging on her phone at night, documents on the table",
    quote: "I'm a director based overseas.",
    body: "Everything happens on WhatsApp, and you file with your Singpass from anywhere.",
    width: 1024,
    height: 768,
  },
  {
    image: "/images/owner-letter.jpg",
    alt: "A café owner reading an official letter while checking her phone",
    quote: "I just got a letter from ACRA.",
    body: "Send us a photo. We'll explain what it means and what to do first.",
    width: 1200,
    height: 896,
  },
] as const;

export type ServiceCard = {
  href: string;
  title: string;
  body: string;
  messageKey: WhatsAppMessageKey;
  price?: string;
  badge?: string;
};

export const serviceCards: ServiceCard[] = [
  {
    href: "/annual-return",
    title: "Annual Return & AGM Catch-up",
    price: `From ${ar.currency}${ar.firstOverdueYear}`,
    body: "Every overdue year, ready to file.",
    badge: "Most requested",
    messageKey: "annualReturn",
  },
  {
    href: "/books",
    title: "Year-end Books before Form C-S",
    body: "Get your books ready before IRAS's 30 November deadline.",
    messageKey: "books",
  },
  {
    href: "/tender",
    title: "Tender Submission Prep",
    body: "Tender documents assembled, checked and on time.",
    messageKey: "tender",
  },
  {
    href: "/grant-claim",
    title: "Grant Claim Packs (EDG/PSG)",
    body: "Claim documents prepared the way agencies expect.",
    messageKey: "grantClaim",
  },
  {
    href: "/esg",
    title: "ESG Pack, done for you",
    body: "You don't need more advice, you need it done, at a fixed price agreed up front.",
    messageKey: "esg",
  },
];

export const howItWorks = [
  "Message us on WhatsApp with your company name or UEN and the years you think are overdue.",
  "Get a fixed quote, in writing, before you pay anything. It won't change.",
  "Send what you have. Photos and PDFs are fine, and so is messy.",
  "Receive your ready-to-file pack with step-by-step Bizfile instructions. We're on WhatsApp while you file, or our partner corporate secretary can arrange the filing.",
] as const;

export const filingLine =
  "We prepare your pack. You file on Bizfile with your Singpass (about 15 minutes), or our partner corporate secretary can arrange it.";

export const promises = [
  "Your quote is fixed and in writing before you pay.",
  `If a 24-hour rush pack is late, your ${ar.currency}${ar.rushSurcharge} rush fee is refunded.`,
  "Leon, one named person, handles your case start to finish.",
  "We never ask for your Singpass or Corppass. You stay in control of filing.",
  "No retainer, no upsell.",
] as const;

export const homeFaqs = [
  {
    q: "Do you file with ACRA for me?",
    a: "No. We prepare your complete pack, and you file on Bizfile with your own Singpass, which takes about 15 minutes with us on WhatsApp. If you'd rather not, our partner corporate secretary can arrange it.",
  },
  {
    q: "Is this legit? Why so affordable?",
    a: "We do one job the same way every time and publish the price. There's no retainer to sell you, and you see a fixed quote before paying.",
  },
  {
    q: "My accounts aren't done. Can you still help?",
    a: "Yes, that's common. Send bank statements and whatever records you have. If books are needed first, we quote that separately before you commit.",
  },
  {
    q: "What do I send?",
    a: "Your UEN, bank statements for each overdue year, any accounts, details of director or shareholder changes, and any ACRA letters.",
  },
  {
    q: "My company was dormant. Do I still file?",
    a: "Yes. ACRA requires every live company to file an annual return, including dormant ones.",
  },
  {
    q: "My corporate secretary disappeared. What now?",
    a: "Send us what you have. We'll prepare the overdue years and introduce our partner corporate secretary if you need a new one.",
  },
  {
    q: "Can you get my penalty waived?",
    a: "No one can promise that. ACRA reviews appeals case by case, and we'll show you how a director can appeal once you're up to date.",
  },
  {
    q: "How fast?",
    a: `${ar.workingDaysTurnaround} working days after we receive your documents, or 24 hours with rush (+${ar.currency}${ar.rushSurcharge}).`,
  },
  {
    q: "How do I pay?",
    a: "PayNow or card, after you accept the quote.",
  },
  {
    q: "Is my data safe?",
    a: "Your documents are used only for your pack. We never ask for your Singpass or Corppass, and we'll delete your files on request.",
  },
] as const;

export const dueFaq = {
  q: "When is it due?",
  a: "Non-listed companies file within 7 months after financial year end.",
} as const;

export const annualReturnFaqs = [dueFaq, ...homeFaqs];

export const packItems = [
  {
    icon: "scroll",
    title: "Annual return answers",
    body: "Prepared for each overdue year, ready to enter on Bizfile.",
  },
  {
    icon: "fileText",
    title: "AGM or written-resolution documents",
    body: "Signed-ready documents for each missed AGM.",
  },
  {
    icon: "checks",
    title: "Document checklist",
    body: "What we used, and what to keep on file.",
  },
  {
    icon: "book",
    title: "Step-by-step Bizfile guide",
    body: "Screen-by-screen, so filing takes about 15 minutes.",
  },
] as const;

export const catchUpTopics = [
  {
    title: "Annual return overdue?",
    body: "Non-listed companies file within 7 months after financial year end. If that date has passed, the late penalty starts on Bizfile. We prepare every missed year in one go.",
  },
  {
    title: "Late AGM, Singapore",
    body: "A late AGM is a separate breach from a late annual return. We prepare AGM or written-resolution documents for each year so both are put right together.",
  },
  {
    title: "Dormant company annual return",
    body: "Dormant companies still file annual returns. No business does not mean nothing to file. We catch up every missed year at the same published price.",
  },
] as const;

export function annualReturnExample(years = 3) {
  const extra = Math.max(0, years - 1);
  const total = ar.firstOverdueYear + extra * ar.eachAdditionalYear;
  return { years, extra, total, currency: ar.currency };
}

export function faqPageLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export const professionalServiceLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  url: SITE_URL,
  telephone: WHATSAPP_DISPLAY,
  areaServed: "SG",
  address: {
    "@type": "PostalAddress",
    addressCountry: "SG",
  },
  parentOrganization: {
    "@type": "Organization",
    name: COMPANY_LEGAL_NAME,
    taxID: COMPANY_UEN,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "UEN",
      value: COMPANY_UEN,
    },
  },
  openingHours: "Mo-Sa 09:00-21:00",
  priceRange: `From ${ar.currency}${ar.firstOverdueYear}`,
};
