import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { ProfileWithRole } from "../../../shared/types/domain";
import { unwrap, unwrapMaybe } from "../../shared/utils/supabase";

export const PROFILE_WITH_ROLE_SELECT = "*, role:roles!profiles_role_id_fkey(*)";

interface PermissionJoinRow {
  permissions: { code: string } | { code: string }[] | null;
}

export function createAuthRepository(client: SupabaseClient<Database>) {
  return {
    async getProfile(userId: string): Promise<ProfileWithRole | null> {
      const result = await client
        .from("profiles")
        .select(PROFILE_WITH_ROLE_SELECT)
        .eq("id", userId)
        .maybeSingle();
      return unwrapMaybe(result) as unknown as ProfileWithRole | null;
    },

    async getPermissions(roleId: string): Promise<string[]> {
      const result = await client
        .from("role_permissions")
        .select("permissions(code)")
        .eq("role_id", roleId);
      const rows = unwrap(result) as unknown as PermissionJoinRow[];
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

    async getAllPermissionCodes(): Promise<string[]> {
      const result = await client.from("permissions").select("code").order("code");
      const rows = unwrap(result) as unknown as Array<{ code: string }>;
      return rows.map((row) => row.code);
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;
