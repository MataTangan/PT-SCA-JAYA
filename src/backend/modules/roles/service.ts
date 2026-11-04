import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import { uuidSchema } from "../../../shared/schemas/common";
import { parseInput } from "../../shared/validators";
import { createRolesRepository } from "./repository";

export function createRolesService(client: SupabaseClient<Database>) {
  const repository = createRolesRepository(client);

  return {
    getRoles: () => repository.list(),
    getPermissions: () => repository.listPermissions(),
    getRolePermissions(roleId: string) {
      return repository.getPermissionsForRole(parseInput(uuidSchema, roleId));
    },
  };
}

export type RolesService = ReturnType<typeof createRolesService>;
