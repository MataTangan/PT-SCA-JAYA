import { describe, expect, it } from "vitest";
import {
  addDaysIso,
  calculateNights,
  calculateTotalAmount,
  parseIsoDate,
  todayIso,
} from "../../src/backend/shared/utils/dates";

describe("parseIsoDate", () => {
  it("parses a valid calendar date as UTC", () => {
    const date = parseIsoDate("2026-02-28");
    expect(date.toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });

  it("accepts leap days", () => {
    expect(parseIsoDate("2024-02-29").toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });

  it.each(["2026-02-29", "2026-13-01", "2026-04-31", "2026-1-01", "not-a-date"])(
    "rejects invalid value %s",
    (value) => {
      expect(() => parseIsoDate(value)).toThrow(RangeError);
    },
  );
});

describe("calculateNights", () => {
  it("counts calendar nights across month boundaries", () => {
    expect(calculateNights("2026-01-30", "2026-02-02")).toBe(3);
  });

  it("uses check-out minus check-in and ignores time zones", () => {
    expect(calculateNights("2026-11-05", "2026-11-06")).toBe(1);
  });

  it("rejects same-day and reversed stays", () => {
    expect(() => calculateNights("2026-01-01", "2026-01-01")).toThrow(RangeError);
    expect(() => calculateNights("2026-01-02", "2026-01-01")).toThrow(RangeError);
  });
});

describe("calculateTotalAmount", () => {
  it("multiplies rate, nights, and room count", () => {
    expect(calculateTotalAmount(450_000, 2, 3)).toBe(2_700_000);
  });

  it("rounds to two decimals", () => {
    expect(calculateTotalAmount(10.005, 1)).toBe(10.01);
  });

  it.each([
    [0, 1, 1],
    [1, 0, 1],
    [1, 1.5, 1],
    [1, 1, 0],
  ])("rejects invalid inputs (%s, %s, %s)", (rate, nights, rooms) => {
    expect(() => calculateTotalAmount(rate, nights, rooms)).toThrow(RangeError);
  });
});

describe("date helpers", () => {
  it("formats today as an ISO date", () => {
    expect(todayIso(new Date("2026-07-04T23:59:59.000Z"))).toBe("2026-07-04");
  });

  it("adds days across leap-month boundaries", () => {
    expect(addDaysIso("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDaysIso("2024-02-28", 2)).toBe("2024-03-01");
    expect(addDaysIso("2026-01-01", -1)).toBe("2025-12-31");
  });
});
