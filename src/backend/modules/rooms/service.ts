import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { RoomWithType } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import {
  createRoomSchema,
  listRoomsSchema,
  roomStatusSchema,
  updateRoomSchema,
  type CreateRoomInput,
  type ListRoomsInput,
  type RoomStatusInput,
  type UpdateRoomInput,
} from "../../../shared/schemas/rooms";
import { uuidSchema } from "../../../shared/schemas/common";
import { parseInput } from "../../shared/validators";
import { createRoomsRepository } from "./repository";

export function createRoomsService(client: SupabaseClient<Database>) {
  const repository = createRoomsRepository(client);

  return {
    getRooms(input: ListRoomsInput = {}): Promise<Paginated<RoomWithType>> {
      return repository.list(parseInput(listRoomsSchema, input));
    },

    getRoomById(id: string): Promise<RoomWithType> {
      return repository.getById(parseInput(uuidSchema, id));
    },

    async createRoom(input: CreateRoomInput): Promise<RoomWithType> {
      const parsed = parseInput(createRoomSchema, input);
      return repository.create(parsed);
    },

    async updateRoom(id: string, input: UpdateRoomInput): Promise<RoomWithType> {
      const roomId = parseInput(uuidSchema, id);
      const parsed = parseInput(updateRoomSchema, input);
      const patch: Database["public"]["Tables"]["rooms"]["Update"] = {};
      if (parsed.roomNumber !== undefined) patch.room_number = parsed.roomNumber;
      if (parsed.roomTypeId !== undefined) patch.room_type_id = parsed.roomTypeId;
      if (parsed.floor !== undefined) patch.floor = parsed.floor;
      if (parsed.notes !== undefined) patch.notes = parsed.notes;
      if (parsed.isActive !== undefined) patch.is_active = parsed.isActive;
      return repository.update(roomId, patch);
    },

    /** Operational status update. Guard triggers enforce who may change what. */
    async updateRoomStatus(id: string, input: RoomStatusInput): Promise<RoomWithType> {
      const roomId = parseInput(uuidSchema, id);
      const parsed = parseInput(roomStatusSchema, input);
      const patch: Database["public"]["Tables"]["rooms"]["Update"] = {};
      if (parsed.occupancyStatus !== undefined) patch.occupancy_status = parsed.occupancyStatus;
      if (parsed.housekeepingStatus !== undefined) {
        patch.housekeeping_status = parsed.housekeepingStatus;
      }
      return repository.update(roomId, patch);
    },
  };
}

export type RoomsService = ReturnType<typeof createRoomsService>;
