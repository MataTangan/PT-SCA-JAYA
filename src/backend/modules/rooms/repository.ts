import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { RoomWithType } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import type { ListRoomsInput } from "../../../shared/schemas/rooms";
import { normalizePagination, totalPages } from "../../shared/utils/pagination";
import { unwrap, unwrapCount, unwrapRequired } from "../../shared/utils/supabase";

export const ROOM_WITH_TYPE_SELECT = "*, room_type:room_types(*)";

export function createRoomsRepository(client: SupabaseClient<Database>) {
  return {
    async list(input: ListRoomsInput): Promise<Paginated<RoomWithType>> {
      const { page, pageSize, from, to } = normalizePagination(input.page, input.pageSize);

      let query = client
        .from("rooms")
        .select(ROOM_WITH_TYPE_SELECT, { count: "exact" })
        .order("room_number", { ascending: true })
        .range(from, to);

      if (input.roomTypeId) query = query.eq("room_type_id", input.roomTypeId);
      if (input.occupancyStatus) query = query.eq("occupancy_status", input.occupancyStatus);
      if (input.housekeepingStatus)
        query = query.eq("housekeeping_status", input.housekeepingStatus);
      if (input.isActive !== undefined) query = query.eq("is_active", input.isActive);
      if (input.search) {
        const term = input.search.replace(/[%,]/g, "");
        query = query.ilike("room_number", `%${term}%`);
      }

      const result = await query;
      const items = unwrap(result) as unknown as RoomWithType[];
      const total = unwrapCount(result);
      return { items, page, pageSize, total, totalPages: totalPages(total, pageSize) };
    },

    async getById(id: string): Promise<RoomWithType> {
      const result = await client
        .from("rooms")
        .select(ROOM_WITH_TYPE_SELECT)
        .eq("id", id)
        .maybeSingle();
      return unwrapRequired(result, "Room not found") as unknown as RoomWithType;
    },

    async create(input: {
      roomNumber: string;
      roomTypeId: string;
      floor: number;
      notes?: string | null | undefined;
      isActive?: boolean | undefined;
    }): Promise<RoomWithType> {
      const result = await client
        .from("rooms")
        .insert({
          room_number: input.roomNumber,
          room_type_id: input.roomTypeId,
          floor: input.floor,
          notes: input.notes ?? null,
          ...(input.isActive === undefined ? {} : { is_active: input.isActive }),
        })
        .select(ROOM_WITH_TYPE_SELECT)
        .single();
      return unwrapRequired(result, "Room not found") as unknown as RoomWithType;
    },

    async update(
      id: string,
      patch: Database["public"]["Tables"]["rooms"]["Update"],
    ): Promise<RoomWithType> {
      const result = await client
        .from("rooms")
        .update(patch)
        .eq("id", id)
        .select(ROOM_WITH_TYPE_SELECT)
        .single();
      return unwrapRequired(result, "Room not found") as unknown as RoomWithType;
    },
  };
}

export type RoomsRepository = ReturnType<typeof createRoomsRepository>;
