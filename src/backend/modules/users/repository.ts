import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { ProfileWithRole } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import type { ListProfilesInput } from "../../../shared/schemas";
import { normalizePagination, totalPages } from "../../shared/utils/pagination";
import { unwrap, unwrapCount, unwrapRequired } from "../../shared/utils/supabase";
import { PROFILE_WITH_ROLE_SELECT } from "../auth/repository";

export function createUsersRepository(client: SupabaseClient<Database>) {
  return {
    async getById(id: string): Promise<ProfileWithRole> {
      const result = await client
        .from("profiles")
        .select(PROFILE_WITH_ROLE_SELECT)
        .eq("id", id)
        .maybeSingle();
      return unwrapRequired(result, "Profile not found") as unknown as ProfileWithRole;
    },

    async update(
      id: string,
      patch: { full_name?: string; phone?: string | null },
    ): Promise<ProfileWithRole> {
      const result = await client
        .from("profiles")
        .update(patch)
        .eq("id", id)
        .select(PROFILE_WITH_ROLE_SELECT)
        .single();
      return unwrapRequired(result, "Profile not found") as unknown as ProfileWithRole;
    },

    async setRole(id: string, roleId: string): Promise<ProfileWithRole> {
      const result = await client
        .from("profiles")
        .update({ role_id: roleId })
        .eq("id", id)
        .select(PROFILE_WITH_ROLE_SELECT)
        .single();
      return unwrapRequired(result, "Profile not found") as unknown as ProfileWithRole;
    },

    async list(input: ListProfilesInput): Promise<Paginated<ProfileWithRole>> {
      const { page, pageSize, from, to } = normalizePagination(input.page, input.pageSize);

      let roleId: string | null = null;
      if (input.role) {
        const roleResult = await client
          .from("roles")
          .select("id")
          .eq("slug", input.role)
          .maybeSingle();
        roleId = unwrap(roleResult)?.id ?? null;
        if (!roleId) {
          return { items: [], page, pageSize, total: 0, totalPages: 0 };
        }
      }

      let query = client
        .from("profiles")
        .select(PROFILE_WITH_ROLE_SELECT, { count: "exact" })
        .order("full_name", { ascending: true })
        .range(from, to);

      if (roleId) {
        query = query.eq("role_id", roleId);
      }
      if (input.isActive !== undefined) {
        query = query.eq("is_active", input.isActive);
      }
      if (input.search) {
        const term = input.search.replace(/[%,]/g, "");
        query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
      }

      const result = await query;
      const items = unwrap(result) as unknown as ProfileWithRole[];
      const total = unwrapCount(result);
      return { items, page, pageSize, total, totalPages: totalPages(total, pageSize) };
    },
  };
}

export type UsersRepository = ReturnType<typeof createUsersRepository>;
