import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { RoomTypeWithFacilities } from "../../../shared/types/domain";
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  type CreateRoomTypeInput,
  type UpdateRoomTypeInput,
} from "../../../shared/schemas";
import { uuidSchema } from "../../../shared/schemas/common";
import { parseInput } from "../../shared/validators";
import { createRoomTypesRepository } from "./repository";

export function createRoomTypesService(client: SupabaseClient<Database>) {
  const repository = createRoomTypesRepository(client);

  return {
    getRoomTypes(activeOnly = false): Promise<RoomTypeWithFacilities[]> {
      return repository.list(activeOnly);
    },

    getRoomTypeById(id: string): Promise<RoomTypeWithFacilities> {
      return repository.getById(parseInput(uuidSchema, id));
    },

    async createRoomType(input: CreateRoomTypeInput): Promise<RoomTypeWithFacilities> {
      const parsed = parseInput(createRoomTypeSchema, input);
      const created = await repository.create(parsed);
      if (parsed.facilityIds && parsed.facilityIds.length > 0) {
        await repository.replaceFacilities(created.id, parsed.facilityIds);
        return repository.getById(created.id);
      }
      return created;
    },

    async updateRoomType(id: string, input: UpdateRoomTypeInput): Promise<RoomTypeWithFacilities> {
      const roomTypeId = parseInput(uuidSchema, id);
      const parsed = parseInput(updateRoomTypeSchema, input);
      await repository.update(roomTypeId, parsed);
      if (parsed.facilityIds !== undefined) {
        await repository.replaceFacilities(roomTypeId, parsed.facilityIds);
      }
      return repository.getById(roomTypeId);
    },
  };
}

export type RoomTypesService = ReturnType<typeof createRoomTypesService>;
