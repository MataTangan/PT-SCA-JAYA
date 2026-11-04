import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Facility, RoomType, RoomTypeWithFacilities } from "../../../shared/types/domain";
import type { CreateRoomTypeInput, UpdateRoomTypeInput } from "../../../shared/schemas/rooms";
import { mapSupabaseError } from "../../shared/errors";
import { unwrap, unwrapRequired } from "../../shared/utils/supabase";

export const ROOM_TYPE_WITH_FACILITIES_SELECT = "*, room_type_facilities(facility:facilities(*))";

interface RawRoomType extends RoomType {
  room_type_facilities: Array<{ facility: Facility | null }>;
}

function mapRoomType(row: RawRoomType): RoomTypeWithFacilities {
  const { room_type_facilities, ...roomType } = row;
  return {
    ...roomType,
    facilities: room_type_facilities
      .map((entry) => entry.facility)
      .filter((facility): facility is Facility => facility !== null),
  };
}

export function createRoomTypesRepository(client: SupabaseClient<Database>) {
  return {
    async list(activeOnly = false): Promise<RoomTypeWithFacilities[]> {
      let query = client.from("room_types").select(ROOM_TYPE_WITH_FACILITIES_SELECT).order("name");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const result = await query;
      const rows = unwrap(result) as unknown as RawRoomType[];
      return rows.map(mapRoomType);
    },

    async getById(id: string): Promise<RoomTypeWithFacilities> {
      const result = await client
        .from("room_types")
        .select(ROOM_TYPE_WITH_FACILITIES_SELECT)
        .eq("id", id)
        .maybeSingle();
      const row = unwrapRequired(result, "Room type not found") as unknown as RawRoomType;
      return mapRoomType(row);
    },

    async create(input: CreateRoomTypeInput): Promise<RoomTypeWithFacilities> {
      const result = await client
        .from("room_types")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description ?? null,
          capacity: input.capacity,
          size_sqm: input.sizeSqm ?? null,
          bed_type: input.bedType ?? null,
        })
        .select(ROOM_TYPE_WITH_FACILITIES_SELECT)
        .single();
      return mapRoomType(unwrapRequired(result, "Room type not found") as unknown as RawRoomType);
    },

    async update(id: string, patch: UpdateRoomTypeInput): Promise<RoomTypeWithFacilities> {
      const update: Database["public"]["Tables"]["room_types"]["Update"] = {};
      if (patch.code !== undefined) update.code = patch.code;
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.description !== undefined) update.description = patch.description;
      if (patch.capacity !== undefined) update.capacity = patch.capacity;
      if (patch.sizeSqm !== undefined) update.size_sqm = patch.sizeSqm;
      if (patch.bedType !== undefined) update.bed_type = patch.bedType;

      const result = await client
        .from("room_types")
        .update(update)
        .eq("id", id)
        .select(ROOM_TYPE_WITH_FACILITIES_SELECT)
        .single();
      return mapRoomType(unwrapRequired(result, "Room type not found") as unknown as RawRoomType);
    },

    async replaceFacilities(roomTypeId: string, facilityIds: string[]): Promise<void> {
      const deletion = await client
        .from("room_type_facilities")
        .delete()
        .eq("room_type_id", roomTypeId);
      if (deletion.error) {
        throw mapSupabaseError(deletion.error);
      }
      if (facilityIds.length === 0) {
        return;
      }
      const insertion = await client.from("room_type_facilities").insert(
        facilityIds.map((facilityId) => ({
          room_type_id: roomTypeId,
          facility_id: facilityId,
        })),
      );
      if (insertion.error) {
        throw mapSupabaseError(insertion.error);
      }
    },
  };
}

export type RoomTypesRepository = ReturnType<typeof createRoomTypesRepository>;
