import { pricing } from "@/config/pricing";

export type AnnualReturnQuote = {
  yearCount: number;
  rush: boolean;
  firstYearCents: number;
  additionalYearCents: number;
  additionalCount: number;
  rushCents: number;
  totalCents: number;
  currency: "SGD";
};

export function quoteAnnualReturn(yearCount: number, rush: boolean): AnnualReturnQuote {
  if (!Number.isInteger(yearCount) || yearCount < 1) {
    throw new Error("At least one financial year is required");
  }

  const firstYearCents = pricing.annualReturn.firstOverdueYear * 100;
  const additionalYearCents = pricing.annualReturn.eachAdditionalYear * 100;
  const additionalCount = yearCount - 1;
  const rushCents = rush ? pricing.annualReturn.rushSurcharge * 100 : 0;
  const totalCents = firstYearCents + additionalYearCents * additionalCount + rushCents;

  return {
    yearCount,
    rush,
    firstYearCents,
    additionalYearCents,
    additionalCount,
    rushCents,
    totalCents,
    currency: "SGD",
  };
}

export function formatSgd(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error("Amount must be whole cents");
  }
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  if (remainder === 0) return `${sign}S$${dollars}`;
  return `${sign}S$${dollars}.${remainder.toString().padStart(2, "0")}`;
}
