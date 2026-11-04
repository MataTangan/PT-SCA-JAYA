import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { RoomRate } from "../../../shared/types/domain";
import type { CreateRoomRateInput, ListRoomRatesInput } from "../../../shared/schemas/rooms";
import { unwrap, unwrapRequired } from "../../shared/utils/supabase";

export function createPricingRepository(client: SupabaseClient<Database>) {
  return {
    async list(input: ListRoomRatesInput): Promise<RoomRate[]> {
      let query = client.from("room_rates").select("*").order("valid_from", { ascending: false });
      if (input.roomTypeId) query = query.eq("room_type_id", input.roomTypeId);
      if (input.activeOnly) query = query.eq("is_active", true);
      const result = await query;
      return unwrap(result) as unknown as RoomRate[];
    },

    async getApplicableRate(roomTypeId: string, date: string): Promise<number | null> {
      const { data, error } = await client.rpc("get_applicable_rate", {
        p_room_type_id: roomTypeId,
        p_date: date,
      });
      if (error) {
        throw error;
      }
      return data;
    },

    async create(input: CreateRoomRateInput & { currency: string }): Promise<RoomRate> {
      const result = await client
        .from("room_rates")
        .insert({
          room_type_id: input.roomTypeId,
          rate_per_night: input.ratePerNight,
          currency: input.currency,
          valid_from: input.validFrom,
          valid_to: input.validTo ?? null,
        })
        .select("*")
        .single();
      return unwrapRequired(result, "Room rate not found") as unknown as RoomRate;
    },
  };
}

export type PricingRepository = ReturnType<typeof createPricingRepository>;
