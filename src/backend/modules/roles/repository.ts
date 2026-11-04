import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Permission, Role } from "../../../shared/types/domain";
import { unwrap } from "../../shared/utils/supabase";

export function createRolesRepository(client: SupabaseClient<Database>) {
  return {
    async list(): Promise<Role[]> {
      const result = await client.from("roles").select("*").order("name");
      return unwrap(result) as unknown as Role[];
    },

    async listPermissions(): Promise<Permission[]> {
      const result = await client.from("permissions").select("*").order("module").order("code");
      return unwrap(result) as unknown as Permission[];
    },

    async getPermissionsForRole(roleId: string): Promise<string[]> {
      const result = await client
        .from("role_permissions")
        .select("permissions(code)")
        .eq("role_id", roleId);
      const rows = unwrap(result) as unknown as Array<{
        permissions: { code: string } | { code: string }[] | null;
      }>;
      return rows
        .flatMap((row) =>
          Array.isArray(row.permissions)
            ? row.permissions.map((permission) => permission.code)
            : row.permissions
              ? [row.permissions.code]
              : [],
        )
        .sort();
    },
  };
}

export type RolesRepository = ReturnType<typeof createRolesRepository>;
