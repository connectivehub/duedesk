import { describe, expect, it } from "vitest";
import { pricing } from "@/config/pricing";
import { formatSgd, quoteAnnualReturn } from "@/lib/pricing/quote";

describe("annual return quote", () => {
  it("charges the first year, each extra year, and the rush fee from config", () => {
    const first = pricing.annualReturn.firstOverdueYear * 100;
    const extra = pricing.annualReturn.eachAdditionalYear * 100;
    const rush = pricing.annualReturn.rushSurcharge * 100;

    expect(quoteAnnualReturn(1, false).totalCents).toBe(first);
    expect(quoteAnnualReturn(1, true).totalCents).toBe(first + rush);
    expect(quoteAnnualReturn(2, false).totalCents).toBe(first + extra);
    expect(quoteAnnualReturn(3, true)).toMatchObject({
      additionalCount: 2,
      rushCents: rush,
      totalCents: first + extra * 2 + rush,
      currency: "SGD",
    });
  });

  it("refuses an empty year list", () => {
    expect(() => quoteAnnualReturn(0, false)).toThrow(/at least one/i);
    expect(() => quoteAnnualReturn(1.5, false)).toThrow(/at least one/i);
  });

  it("formats Singapore dollars without trailing zeroes", () => {
    expect(formatSgd(19900)).toBe("S$199");
    expect(formatSgd(19950)).toBe("S$199.50");
  });
});
