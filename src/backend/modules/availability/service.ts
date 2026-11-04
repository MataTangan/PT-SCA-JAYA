import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Room, RoomType, RoomWithType } from "../../../shared/types/domain";
import {
  availabilityQuerySchema,
  roomAvailabilitySchema,
  type AvailabilityQuery,
} from "../../../shared/schemas";
import { mapSupabaseError } from "../../shared/errors";
import { parseInput } from "../../shared/validators";
import { unwrap } from "../../shared/utils/supabase";

export interface RoomTypeAvailability {
  roomTypeId: string;
  roomTypeName: string;
  capacity: number;
  availableRooms: number;
  ratePerNight: number | null;
}

export function createAvailabilityRepository(client: SupabaseClient<Database>) {
  return {
    async checkRoomAvailability(
      roomId: string,
      checkInDate: string,
      checkOutDate: string,
    ): Promise<boolean> {
      const { data, error } = await client.rpc("check_room_availability", {
        p_room_id: roomId,
        p_check_in: checkInDate,
        p_check_out: checkOutDate,
      });
      if (error) throw error;
      return data ?? false;
    },

    async findAvailableRooms(
      roomTypeId: string,
      checkInDate: string,
      checkOutDate: string,
    ): Promise<Room[]> {
      const { data, error } = await client.rpc("find_available_rooms", {
        p_room_type_id: roomTypeId,
        p_check_in: checkInDate,
        p_check_out: checkOutDate,
      });
      if (error) throw error;
      return (data ?? []) as unknown as Room[];
    },
  };
}

export function createAvailabilityService(client: SupabaseClient<Database>) {
  const repository = createAvailabilityRepository(client);

  async function loadRoomTypes(roomTypeId?: string): Promise<RoomType[]> {
    let query = client.from("room_types").select("*").eq("is_active", true).order("name");
    if (roomTypeId) query = query.eq("id", roomTypeId);
    const result = await query;
    return unwrap(result) as unknown as RoomType[];
  }

  return {
    async checkRoomAvailability(
      roomId: string,
      checkInDate: string,
      checkOutDate: string,
    ): Promise<boolean> {
      const parsed = parseInput(roomAvailabilitySchema, {
        roomId,
        checkInDate,
        checkOutDate,
      });
      try {
        return await repository.checkRoomAvailability(
          parsed.roomId,
          parsed.checkInDate,
          parsed.checkOutDate,
        );
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    /** Rooms of one type (or all types) available for the full stay. */
    async getAvailableRooms(query: AvailabilityQuery): Promise<RoomWithType[]> {
      const parsed = parseInput(availabilityQuerySchema, query);
      const results: RoomWithType[] = [];
      try {
        const types = await loadRoomTypes(parsed.roomTypeId);
        for (const type of types) {
          if (parsed.guests !== undefined && type.capacity < parsed.guests) {
            continue;
          }
          const rooms = await repository.findAvailableRooms(
            type.id,
            parsed.checkInDate,
            parsed.checkOutDate,
          );
          for (const room of rooms) {
            results.push({ ...room, room_type: type });
          }
        }
      } catch (error) {
        throw mapSupabaseError(error);
      }
      return results.sort((a, b) => a.room_number.localeCompare(b.room_number));
    },

    /** Grouped availability for the public room search results. */
    async getRoomTypeAvailability(query: AvailabilityQuery): Promise<RoomTypeAvailability[]> {
      const parsed = parseInput(availabilityQuerySchema, query);
      const results: RoomTypeAvailability[] = [];

      try {
        const types = await loadRoomTypes(parsed.roomTypeId);
        for (const type of types) {
          if (parsed.guests !== undefined && type.capacity < parsed.guests) {
            continue;
          }
          const rooms = await repository.findAvailableRooms(
            type.id,
            parsed.checkInDate,
            parsed.checkOutDate,
          );
          if (rooms.length === 0) {
            continue;
          }
          const { data: rate, error } = await client.rpc("get_applicable_rate", {
            p_room_type_id: type.id,
            p_date: parsed.checkInDate,
          });
          if (error) throw error;
          results.push({
            roomTypeId: type.id,
            roomTypeName: type.name,
            capacity: type.capacity,
            availableRooms: rooms.length,
            ratePerNight: rate,
          });
        }
      } catch (error) {
        throw mapSupabaseError(error);
      }

      return results;
    },
  };
}

export type AvailabilityService = ReturnType<typeof createAvailabilityService>;
