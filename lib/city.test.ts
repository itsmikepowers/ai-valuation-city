import { describe, expect, it } from "vitest";
import { companies, SNAPSHOT } from "./data";
import {
  dateAt,
  disclosedFunding,
  money,
  positionFor,
  recordAt,
  scaleFor,
  seeded,
  stateAt,
} from "./city";

const openai = companies.find((c) => c.id === "openai")!;
describe("historical city state", () => {
  it("includes month-end events and handles leap years", () => {
    expect(dateAt(2025 + 2 / 12)).toBe("2025-03-31");
    expect(dateAt(2024 + 1 / 12)).toBe("2024-02-29");
    expect(recordAt(openai, dateAt(2025 + 2 / 12))?.amount).toBe(300);
  });
  it("does not invent valuations before first records or after snapshot", () => {
    expect(stateAt(openai, "2014-12-31")).toBe("absent");
    expect(stateAt(openai, "2020-12-31")).toBe("construction");
    expect(recordAt(openai, "2020-12-31")).toBeUndefined();
    expect(recordAt(openai, "2024-11-30")?.amount).toBe(157);
    expect(recordAt(openai, "2026-09-30")).toEqual(recordAt(openai, SNAPSHOT));
  });
  it("preserves transaction types and sums only known dated funding", () => {
    const xai = companies.find((c) => c.id === "xai")!;
    expect(recordAt(xai, SNAPSHOT)?.type).toBe("Acquisition valuation");
    expect(disclosedFunding(xai, SNAPSHOT)).toBe(6);
    expect(disclosedFunding(openai, "2020-01-01")).toBeNull();
    expect(disclosedFunding(openai, SNAPSHOT)).toBe(46.6);
  });
  it("does not mutate record order when looking up history", () => {
    const copy = { ...openai, history: [...openai.history].reverse() };
    const order = copy.history.map((v) => v.date);
    expect(recordAt(copy, SNAPSHOT)?.amount).toBe(300);
    expect(copy.history.map((v) => v.date)).toEqual(order);
  });
});
describe("city geometry and dataset integrity", () => {
  it("preserves a dramatic scale difference without hiding smaller firms", () => {
    expect(scaleFor(300).height / scaleFor(3).height).toBeGreaterThan(12);
    expect(scaleFor(0.5).height).toBeGreaterThan(2);
    expect(scaleFor(-1)).toEqual(scaleFor(0));
    expect(scaleFor(Infinity)).toEqual(scaleFor(0));
  });
  it("uses unique deterministic parcels and architecture seeds", () => {
    expect(new Set(companies.map((c) => positionFor(c).join(","))).size).toBe(
      companies.length,
    );
    expect(new Set(companies.map((c) => c.buildingSeed)).size).toBe(
      companies.length,
    );
    const a = seeded(123),
      b = seeded(123);
    expect(Array.from({ length: 10 }, a)).toEqual(
      Array.from({ length: 10 }, b),
    );
  });
  it("has a dated attributed source and status on every valuation", () => {
    for (const c of companies)
      for (const v of c.history) {
        expect(v.amount).toBeGreaterThan(0);
        expect(v.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(v.date <= SNAPSHOT).toBe(true);
        expect(v.source).toBeTruthy();
        expect(v.type).toBeTruthy();
        expect(new URL(v.sourceUrl).protocol).toBe("https:");
      }
  });
  it("formats millions, billions and trillions", () => {
    expect(money(0.5)).toBe("$500M");
    expect(money(9.9)).toBe("$9.9B");
    expect(money(1200)).toBe("$1.20T");
  });
});
