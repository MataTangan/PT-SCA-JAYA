import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Facility } from "../../../shared/types/domain";
import {
  createFacilitySchema,
  updateFacilitySchema,
  type CreateFacilityInput,
  type UpdateFacilityInput,
} from "../../../shared/schemas";
import { uuidSchema } from "../../../shared/schemas/common";
import { parseInput } from "../../shared/validators";
import { createFacilitiesRepository } from "./repository";

export function createFacilitiesService(client: SupabaseClient<Database>) {
  const repository = createFacilitiesRepository(client);

  return {
    getFacilities(activeOnly = false): Promise<Facility[]> {
      return repository.list(activeOnly);
    },

    getFacilityById(id: string): Promise<Facility> {
      return repository.getById(parseInput(uuidSchema, id));
    },

    async createFacility(input: CreateFacilityInput): Promise<Facility> {
      return repository.create(parseInput(createFacilitySchema, input));
    },

    async updateFacility(id: string, input: UpdateFacilityInput): Promise<Facility> {
      return repository.update(parseInput(uuidSchema, id), parseInput(updateFacilitySchema, input));
    },
  };
}

export type FacilitiesService = ReturnType<typeof createFacilitiesService>;
