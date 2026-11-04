import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { ReservationRoom, Room } from "../../../shared/types/domain";
import { unwrap } from "../../shared/utils/supabase";

export const ALLOCATION_WITH_ROOM_SELECT =
  "*, room:rooms(id,room_number,room_type_id,floor,occupancy_status,housekeeping_status)";

export interface AllocationWithRoom extends ReservationRoom {
  room: Pick<
    Room,
    "id" | "room_number" | "room_type_id" | "floor" | "occupancy_status" | "housekeeping_status"
  > | null;
}

export function createRoomAllocationRepository(client: SupabaseClient<Database>) {
  return {
    async allocate(reservationId: string, roomId: string): Promise<ReservationRoom> {
      const { data, error } = await client.rpc("allocate_room", {
        p_reservation_id: reservationId,
        p_room_id: roomId,
      });
      if (error) throw error;
      return data as unknown as ReservationRoom;
    },

    async release(reservationRoomId: string, reason?: string): Promise<ReservationRoom> {
      const { data, error } = await client.rpc("release_room", {
        p_reservation_room_id: reservationRoomId,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      return data as unknown as ReservationRoom;
    },

    async list(input: {
      reservationId?: string;
      roomId?: string;
      activeOnly?: boolean;
    }): Promise<AllocationWithRoom[]> {
      let query = client
        .from("reservation_rooms")
        .select(ALLOCATION_WITH_ROOM_SELECT)
        .order("allocated_at", { ascending: false });
      if (input.reservationId) query = query.eq("reservation_id", input.reservationId);
      if (input.roomId) query = query.eq("room_id", input.roomId);
      if (input.activeOnly) query = query.is("released_at", null);
      const result = await query;
      return unwrap(result) as unknown as AllocationWithRoom[];
    },
  };
}

export type RoomAllocationRepository = ReturnType<typeof createRoomAllocationRepository>;
