import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Facility } from "../../../shared/types/domain";
import type { CreateFacilityInput, UpdateFacilityInput } from "../../../shared/schemas/rooms";
import { unwrap, unwrapRequired } from "../../shared/utils/supabase";

export function createFacilitiesRepository(client: SupabaseClient<Database>) {
  return {
    async list(activeOnly = false): Promise<Facility[]> {
      let query = client.from("facilities").select("*").order("category").order("name");
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      const result = await query;
      return unwrap(result) as unknown as Facility[];
    },

    async getById(id: string): Promise<Facility> {
      const result = await client.from("facilities").select("*").eq("id", id).maybeSingle();
      return unwrapRequired(result, "Facility not found") as unknown as Facility;
    },

    async create(input: CreateFacilityInput & { category: string }): Promise<Facility> {
      const result = await client
        .from("facilities")
        .insert({
          code: input.code,
          name: input.name,
          description: input.description ?? null,
          category: input.category,
          icon: input.icon ?? null,
          ...(input.isActive === undefined ? {} : { is_active: input.isActive }),
        })
        .select("*")
        .single();
      return unwrapRequired(result, "Facility not found") as unknown as Facility;
    },

    async update(id: string, patch: UpdateFacilityInput): Promise<Facility> {
      const update: Database["public"]["Tables"]["facilities"]["Update"] = {};
      if (patch.code !== undefined) update.code = patch.code;
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.description !== undefined) update.description = patch.description;
      if (patch.category !== undefined) update.category = patch.category;
      if (patch.icon !== undefined) update.icon = patch.icon;
      if (patch.isActive !== undefined) update.is_active = patch.isActive;

      const result = await client
        .from("facilities")
        .update(update)
        .eq("id", id)
        .select("*")
        .single();
      return unwrapRequired(result, "Facility not found") as unknown as Facility;
    },
  };
}

export type FacilitiesRepository = ReturnType<typeof createFacilitiesRepository>;
