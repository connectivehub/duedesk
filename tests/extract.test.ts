import { describe, expect, it } from "vitest";
import { extractMessage, validateLlmPayload } from "@/lib/whatsapp/extract";

describe("deterministic extraction", () => {
  it("reads a company and years without treating a UEN as a year", () => {
    const parsed = extractMessage("Acme Pte Ltd 201912345K, FY2022 and FY 2024");
    expect(parsed.uen).toBe("201912345K");
    expect(parsed.companyName).toMatch(/Acme Pte Ltd/i);
    expect(parsed.years).toEqual(["FY2022", "FY2024"]);
  });

  it("does not treat a greeting or a person request as a company", () => {
    expect(extractMessage("hello").greetingOnly).toBe(true);
    expect(extractMessage("hello").companyName).toBeNull();
    expect(extractMessage("human").handoffReason).toMatch(/person/i);
    expect(extractMessage("Human Capital Pte Ltd").handoffReason).toBeNull();
    expect(extractMessage("Human Capital Pte Ltd").companyName).toMatch(/Human Capital/i);
  });

  it("keeps only plausible model output", () => {
    expect(
      validateLlmPayload({
        companyName: "Northstar Pte Ltd",
        uen: "not-a-uen",
        years: ["FY2021", "201912345K", "FY1999"],
      }),
    ).toEqual({
      companyName: "Northstar Pte Ltd",
      uen: null,
      years: ["FY2021"],
    });
    expect(validateLlmPayload({ companyName: null, uen: null, years: [] })).toBeNull();
  });
});
