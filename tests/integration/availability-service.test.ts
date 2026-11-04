import { describe, expect, it } from "vitest";
import { createAvailabilityService } from "../../src/backend/modules/availability/service";
import { ValidationError } from "../../src/backend/shared/errors";
import { createMockSupabase } from "../helpers/mock-supabase";

const standardType = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Standard",
  capacity: 2,
};

const deluxeType = {
  id: "10000000-0000-4000-8000-000000000002",
  name: "Deluxe",
  capacity: 3,
};

const room = {
  id: "20000000-0000-4000-8000-000000000101",
  room_number: "101",
  room_type_id: standardType.id,
  floor: 1,
  notes: null,
  occupancy_status: "available",
  housekeeping_status: "clean",
  is_active: true,
  created_at: "2026-11-05T00:00:00.000Z",
  updated_at: "2026-11-05T00:00:00.000Z",
};

describe("availability service", () => {
  it("groups available rooms by type and resolves the nightly rate", async () => {
    const mock = createMockSupabase({
      tables: {
        room_types: { data: [standardType], error: null },
      },
      rpc: {
        find_available_rooms: { data: [room], error: null },
        get_applicable_rate: { data: 450000, error: null },
      },
    });
    const service = createAvailabilityService(mock.client);

    const result = await service.getRoomTypeAvailability({
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-12",
    });

    expect(result).toEqual([
      {
        roomTypeId: standardType.id,
        roomTypeName: "Standard",
        capacity: 2,
        availableRooms: 1,
        ratePerNight: 450000,
      },
    ]);
  });

  it("skips room types below the requested guest count", async () => {
    const mock = createMockSupabase({
      tables: {
        room_types: { data: [standardType, deluxeType], error: null },
      },
      rpc: {
        find_available_rooms: { data: [room], error: null },
        get_applicable_rate: { data: 750000, error: null },
      },
    });
    const service = createAvailabilityService(mock.client);

    const result = await service.getRoomTypeAvailability({
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-12",
      guests: 3,
    });

    expect(result.map((entry) => entry.roomTypeId)).toEqual([deluxeType.id]);
  });

  it("validates availability input before calling the RPC", async () => {
    const mock = createMockSupabase();
    const service = createAvailabilityService(mock.client);

    await expect(
      service.getAvailableRooms({
        checkInDate: "not-a-date",
        checkOutDate: "2026-11-12",
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(mock.calls).toHaveLength(0);
  });

  it("filters physical-room results by guest capacity", async () => {
    const mock = createMockSupabase({
      tables: {
        room_types: { data: [standardType, deluxeType], error: null },
      },
      rpc: {
        find_available_rooms: { data: [room], error: null },
      },
    });
    const service = createAvailabilityService(mock.client);

    const result = await service.getAvailableRooms({
      checkInDate: "2026-11-10",
      checkOutDate: "2026-11-12",
      guests: 3,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.room_type.id).toBe(deluxeType.id);
    expect(mock.rpcCalls("find_available_rooms")).toHaveLength(1);
    expect(mock.rpcCalls("find_available_rooms")[0]?.args).toMatchObject({
      p_room_type_id: deluxeType.id,
    });
  });

  it("checks a single room through the RPC", async () => {
    const mock = createMockSupabase({
      rpc: { check_room_availability: { data: true, error: null } },
    });
    const service = createAvailabilityService(mock.client);

    await expect(service.checkRoomAvailability(room.id, "2026-11-10", "2026-11-12")).resolves.toBe(
      true,
    );
    expect(mock.rpcCalls("check_room_availability")[0]?.args).toEqual({
      p_room_id: room.id,
      p_check_in: "2026-11-10",
      p_check_out: "2026-11-12",
    });
  });
});
