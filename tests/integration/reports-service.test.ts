import { describe, expect, it } from "vitest";
import { createReportsService } from "../../src/backend/modules/reports/service";
import { AuthorizationError } from "../../src/backend/shared/errors";
import { createMockSupabase } from "../helpers/mock-supabase";

const rooms = [
  { occupancy_status: "available", housekeeping_status: "clean" },
  { occupancy_status: "occupied", housekeeping_status: "dirty" },
  { occupancy_status: "reserved", housekeeping_status: "clean" },
];

describe("reports service", () => {
  it("rejects guests from reading dashboard counters", async () => {
    const mock = createMockSupabase({
      tables: {
        profiles: { data: { role: { slug: "guest" } }, error: null },
      },
    });
    const service = createReportsService(mock.client);

    await expect(service.getTodaySummary()).rejects.toBeInstanceOf(AuthorizationError);
    expect(mock.tableCalls("rooms")).toHaveLength(0);
  });

  it("returns dashboard counters for a receptionist", async () => {
    const mock = createMockSupabase({
      tables: {
        profiles: { data: { role: { slug: "receptionist" } }, error: null },
        rooms: { data: rooms, error: null },
        reservations: [
          { data: null, error: null, count: 2 },
          { data: null, error: null, count: 1 },
          { data: null, error: null, count: 1 },
          { data: null, error: null, count: 4 },
        ],
        payments: { data: null, error: null, count: 3 },
      },
    });
    const service = createReportsService(mock.client);

    const summary = await service.getTodaySummary();

    expect(summary.rooms).toEqual({
      total: 3,
      available: 1,
      reserved: 1,
      occupied: 1,
      clean: 2,
      dirty: 1,
      cleaning: 0,
    });
    expect(summary.arrivalsToday).toBe(2);
    expect(summary.inHouse).toBe(1);
    expect(summary.departuresToday).toBe(1);
    expect(summary.pendingReservations).toBe(4);
    expect(summary.unpaidPayments).toBe(3);
  });

  it("surfaces dashboard query failures", async () => {
    const mock = createMockSupabase({
      tables: {
        profiles: { data: { role: { slug: "admin" } }, error: null },
        rooms: { data: null, error: { code: "42501", message: "permission denied" } },
      },
    });
    const service = createReportsService(mock.client);

    await expect(service.getTodaySummary()).rejects.toMatchObject({
      code: "AUTHORIZATION_ERROR",
    });
  });
});
