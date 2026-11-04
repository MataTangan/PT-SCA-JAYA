import { describe, expect, it } from "vitest";
import { createReservationsService } from "../../src/backend/modules/reservations/service";
import { ConflictError, ValidationError } from "../../src/backend/shared/errors";
import { createMockSupabase } from "../helpers/mock-supabase";

const roomTypeId = "10000000-0000-4000-8000-000000000001";

const reservationRow = {
  id: "40000000-0000-4000-8000-000000000001",
  reservation_code: "SCA-20261105-0001",
  guest_id: "11111111-1111-4111-8111-111111111101",
  room_type_id: roomTypeId,
  check_in_date: "2026-11-10",
  check_out_date: "2026-11-12",
  nights: 2,
  room_count: 1,
  adults: 2,
  children: 0,
  special_requests: null,
  status: "pending",
  rate_per_night: 450000,
  total_amount: 900000,
  currency: "IDR",
  created_by: "11111111-1111-4111-8111-111111111101",
  cancelled_at: null,
  cancellation_reason: null,
  created_at: "2026-11-05T00:00:00.000Z",
  updated_at: "2026-11-05T00:00:00.000Z",
  guest: null,
  room_type: null,
  payment: null,
  reservation_rooms: [],
};

describe("reservations service", () => {
  it("validates the stay before calling the RPC", async () => {
    const mock = createMockSupabase();
    const service = createReservationsService(mock.client);

    await expect(
      service.createReservation({
        roomTypeId,
        checkInDate: "2026-11-12",
        checkOutDate: "2026-11-10",
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(mock.calls).toHaveLength(0);
  });

  it("calls create_reservation with authoritative inputs and returns the joined row", async () => {
    const mock = createMockSupabase({
      rpc: {
        create_reservation: { data: { id: reservationRow.id }, error: null },
      },
      tables: {
        reservations: { data: reservationRow, error: null },
      },
    });
    const service = createReservationsService(mock.client);

    const result = await service.createReservation({
      roomTypeId,
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-12",
      adults: 2,
      specialRequests: "High floor",
    });

    expect(result.id).toBe(reservationRow.id);
    const [rpcCall] = mock.rpcCalls("create_reservation");
    expect(rpcCall?.args).toEqual({
      p_room_type_id: roomTypeId,
      p_check_in_date: "2026-11-10",
      p_check_out_date: "2026-11-12",
      p_adults: 2,
      p_children: 0,
      p_room_count: 1,
      p_special_requests: "High floor",
      p_guest_id: null,
    });
  });

  it("maps an exclusion-constraint failure to a conflict", async () => {
    const mock = createMockSupabase({
      rpc: {
        create_reservation: { data: null, error: { code: "23P01", message: "overlap" } },
      },
    });
    const service = createReservationsService(mock.client);

    await expect(
      service.createReservation({
        roomTypeId,
        checkInDate: "2026-11-10",
        checkOutDate: "2026-11-12",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("passes cancellation reasons through the RPC", async () => {
    const mock = createMockSupabase({
      rpc: {
        cancel_reservation: { data: reservationRow, error: null },
      },
      tables: {
        reservations: { data: reservationRow, error: null },
      },
    });
    const service = createReservationsService(mock.client);

    await service.cancelReservation({
      reservationId: reservationRow.id,
      reason: "Travel plans changed",
    });

    expect(mock.rpcCalls("cancel_reservation")[0]?.args).toEqual({
      p_reservation_id: reservationRow.id,
      p_reason: "Travel plans changed",
    });
  });
});
