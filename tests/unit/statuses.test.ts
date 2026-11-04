import { describe, expect, it } from "vitest";
import {
  blocksAvailability,
  canTransitionReservation,
  HOUSEKEEPING_STATUSES,
  OCCUPANCY_STATUSES,
  PAYMENT_METHODS,
  RESERVATION_BLOCKING_STATUSES,
  RESERVATION_STATUSES,
} from "../../src/shared/constants/statuses";

describe("reservation status transitions", () => {
  it.each([
    ["pending", "confirmed"],
    ["pending", "cancelled"],
    ["confirmed", "checked_in"],
    ["confirmed", "cancelled"],
    ["checked_in", "completed"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransitionReservation(from, to)).toBe(true);
  });

  it.each([
    ["pending", "checked_in"],
    ["pending", "completed"],
    ["confirmed", "completed"],
    ["checked_in", "cancelled"],
    ["completed", "cancelled"],
    ["cancelled", "confirmed"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransitionReservation(from, to)).toBe(false);
  });
});

describe("availability blocking", () => {
  it("blocks pending, confirmed, and checked-in reservations", () => {
    for (const status of RESERVATION_BLOCKING_STATUSES) {
      expect(blocksAvailability(status)).toBe(true);
    }
  });

  it("does not block completed or cancelled reservations", () => {
    expect(blocksAvailability("completed")).toBe(false);
    expect(blocksAvailability("cancelled")).toBe(false);
  });
});

describe("status catalogues", () => {
  it("contains every reservation status", () => {
    expect(RESERVATION_STATUSES).toEqual([
      "pending",
      "confirmed",
      "checked_in",
      "completed",
      "cancelled",
    ]);
  });

  it("exposes independently defined occupancy and housekeeping values", () => {
    expect(OCCUPANCY_STATUSES).toEqual(["available", "reserved", "occupied"]);
    expect(HOUSEKEEPING_STATUSES).toEqual(["clean", "dirty", "cleaning"]);
  });

  it("lists the supported payment methods", () => {
    expect(PAYMENT_METHODS).toContain("cash");
    expect(PAYMENT_METHODS).toContain("ewallet");
  });
});
