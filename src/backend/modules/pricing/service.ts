import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { RoomRate } from "../../../shared/types/domain";
import {
  applicableRateSchema,
  createRoomRateSchema,
  listRoomRatesSchema,
  type CreateRoomRateInput,
  type ListRoomRatesInput,
} from "../../../shared/schemas/rooms";
import { mapSupabaseError } from "../../shared/errors";
import { parseInput } from "../../shared/validators";
import { createPricingRepository } from "./repository";

export function createPricingService(client: SupabaseClient<Database>) {
  const repository = createPricingRepository(client);

  return {
    getRoomRates(input: ListRoomRatesInput = {}): Promise<RoomRate[]> {
      return repository.list(parseInput(listRoomRatesSchema, input));
    },

    async getApplicableRate(roomTypeId: string, date: string): Promise<number | null> {
      const parsed = parseInput(applicableRateSchema, { roomTypeId, date });
      try {
        return await repository.getApplicableRate(parsed.roomTypeId, parsed.date);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async createRoomRate(input: CreateRoomRateInput): Promise<RoomRate> {
      return repository.create(parseInput(createRoomRateSchema, input));
    },
  };
}

export type PricingService = ReturnType<typeof createPricingService>;
