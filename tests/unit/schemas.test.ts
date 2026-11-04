import { describe, expect, it } from "vitest";
import {
  availabilityQuerySchema,
  createFacilitySchema,
  createHousekeepingTaskSchema,
  createReservationSchema,
  createRoomRateSchema,
  createRoomSchema,
  listReservationsSchema,
  paginationSchema,
  reportRangeSchema,
  signUpSchema,
} from "../../src/shared/schemas";
import { MAX_PAGE_SIZE } from "../../src/shared/constants";

const validUuid = "10000000-0000-4000-8000-000000000001";

describe("paginationSchema", () => {
  it("applies defaults", () => {
    const parsed = paginationSchema.parse({});
    expect(parsed).toEqual({ page: 1, pageSize: 20 });
  });

  it("coerces numeric query strings", () => {
    expect(paginationSchema.parse({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
  });

  it(`rejects page sizes above ${MAX_PAGE_SIZE}`, () => {
    expect(paginationSchema.safeParse({ pageSize: MAX_PAGE_SIZE + 1 }).success).toBe(false);
  });
});

describe("createReservationSchema", () => {
  const base = {
    roomTypeId: validUuid,
    checkInDate: "2026-11-10",
    checkOutDate: "2026-11-12",
  };

  it("applies occupancy defaults and coerces values", () => {
    expect(createReservationSchema.parse({ ...base, adults: "2", children: "1" })).toMatchObject({
      adults: 2,
      children: 1,
      roomCount: 1,
    });
  });

  it("rejects equal or reversed dates", () => {
    expect(
      createReservationSchema.safeParse({ ...base, checkOutDate: base.checkInDate }).success,
    ).toBe(false);
    expect(createReservationSchema.safeParse({ ...base, checkOutDate: "2026-11-09" }).success).toBe(
      false,
    );
  });

  it("rejects malformed room types", () => {
    expect(createReservationSchema.safeParse({ ...base, roomTypeId: "room-1" }).success).toBe(
      false,
    );
  });
});

describe("availabilityQuerySchema", () => {
  it("accepts guest counts and validates the stay window", () => {
    const parsed = availabilityQuerySchema.parse({
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-11",
      guests: "2",
    });
    expect(parsed.guests).toBe(2);
  });

  it("rejects an invalid date range", () => {
    expect(
      availabilityQuerySchema.safeParse({
        checkInDate: "2026-11-11",
        checkOutDate: "2026-11-11",
      }).success,
    ).toBe(false);
  });
});

describe("catalogue and operational schemas", () => {
  it("defaults room floors and facility category", () => {
    expect(
      createRoomSchema.parse({
        roomNumber: "101",
        roomTypeId: validUuid,
      }).floor,
    ).toBe(1);
    expect(
      createFacilitySchema.parse({
        code: "wifi",
        name: "Wi-Fi",
      }).category,
    ).toBe("hotel");
  });

  it("defaults the rate currency to IDR and validates the window", () => {
    const parsed = createRoomRateSchema.parse({
      roomTypeId: validUuid,
      ratePerNight: "450000",
      validFrom: "2026-01-01",
    });
    expect(parsed.currency).toBe("IDR");
    expect(
      createRoomRateSchema.safeParse({
        roomTypeId: validUuid,
        ratePerNight: 1,
        validFrom: "2026-01-01",
        validTo: "2026-01-01",
      }).success,
    ).toBe(false);
    expect(
      createRoomRateSchema.safeParse({
        roomTypeId: validUuid,
        ratePerNight: 1,
        validFrom: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("defaults the housekeeping task type", () => {
    expect(createHousekeepingTaskSchema.parse({ roomId: validUuid }).taskType).toBe(
      "checkout_clean",
    );
  });

  it("allows list filters to omit pagination", () => {
    expect(listReservationsSchema.parse({ status: "pending" })).toMatchObject({
      page: 1,
      pageSize: 20,
      status: "pending",
    });
  });
});

describe("reportRangeSchema", () => {
  it("requires a half-open range", () => {
    expect(reportRangeSchema.safeParse({ from: "2026-01-01", to: "2026-01-31" }).success).toBe(
      true,
    );
    expect(reportRangeSchema.safeParse({ from: "2026-01-31", to: "2026-01-01" }).success).toBe(
      false,
    );
  });
});

describe("signUpSchema", () => {
  it("enforces password length and email format", () => {
    expect(
      signUpSchema.safeParse({
        email: "guest@example.com",
        password: "short",
        fullName: "Guest",
      }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        email: "not-an-email",
        password: "long-enough",
        fullName: "Guest",
      }).success,
    ).toBe(false);
  });
});
