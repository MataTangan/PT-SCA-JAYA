import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { ReservationRoom } from "../../../shared/types/domain";
import {
  allocateRoomSchema,
  releaseRoomSchema,
  type AllocateRoomInput,
  type ReleaseRoomInput,
} from "../../../shared/schemas";
import { uuidSchema } from "../../../shared/schemas/common";
import { mapSupabaseError } from "../../shared/errors";
import { parseInput } from "../../shared/validators";
import { createRoomAllocationRepository, type AllocationWithRoom } from "./repository";

export function createRoomAllocationService(client: SupabaseClient<Database>) {
  const repository = createRoomAllocationRepository(client);

  return {
    async allocateRoom(input: AllocateRoomInput): Promise<ReservationRoom> {
      const parsed = parseInput(allocateRoomSchema, input);
      try {
        return await repository.allocate(parsed.reservationId, parsed.roomId);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async releaseRoom(input: ReleaseRoomInput): Promise<ReservationRoom> {
      const parsed = parseInput(releaseRoomSchema, input);
      try {
        return await repository.release(parsed.reservationRoomId, parsed.reason);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async getAllocations(input: {
      reservationId?: string;
      roomId?: string;
      activeOnly?: boolean;
    }): Promise<AllocationWithRoom[]> {
      if (input.reservationId !== undefined) {
        parseInput(uuidSchema, input.reservationId);
      }
      if (input.roomId !== undefined) {
        parseInput(uuidSchema, input.roomId);
      }
      return repository.list(input);
    },
  };
}

export type RoomAllocationService = ReturnType<typeof createRoomAllocationService>;
