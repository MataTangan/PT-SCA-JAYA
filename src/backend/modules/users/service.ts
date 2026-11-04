import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { ProfileWithRole } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import {
  assignRoleSchema,
  listProfilesSchema,
  updateProfileSchema,
  type AssignRoleInput,
  type ListProfilesInput,
  type UpdateProfileInput,
} from "../../../shared/schemas";
import { NotFoundError } from "../../shared/errors";
import { requireUserId } from "../../shared/utils/auth";
import { unwrap } from "../../shared/utils/supabase";
import { parseInput } from "../../shared/validators";
import { createUsersRepository } from "./repository";
import { uuidSchema } from "../../../shared/schemas/common";

export function createUsersService(client: SupabaseClient<Database>) {
  const repository = createUsersRepository(client);

  return {
    async getProfile(profileId: string): Promise<ProfileWithRole> {
      const id = parseInput(uuidSchema, profileId);
      return repository.getById(id);
    },

    /** Update the authenticated user's own profile. Role is never client-editable. */
    async updateProfile(input: UpdateProfileInput): Promise<ProfileWithRole> {
      const parsed = parseInput(updateProfileSchema, input);
      const userId = await requireUserId(client);
      const patch: { full_name?: string; phone?: string | null } = {};
      if (parsed.fullName !== undefined) {
        patch.full_name = parsed.fullName;
      }
      if (parsed.phone !== undefined) {
        patch.phone = parsed.phone;
      }
      return repository.update(userId, patch);
    },

    /** Staff-only listing; RLS returns only what the caller may see. */
    async listProfiles(input: ListProfilesInput = {}): Promise<Paginated<ProfileWithRole>> {
      const parsed = parseInput(listProfilesSchema, input);
      return repository.list(parsed);
    },

    /** Admin-only role assignment. The DB trigger also enforces this. */
    async assignRole(input: AssignRoleInput): Promise<ProfileWithRole> {
      const parsed = parseInput(assignRoleSchema, input);
      const roleResult = await client
        .from("roles")
        .select("id")
        .eq("slug", parsed.role)
        .maybeSingle();
      const role = unwrap(roleResult);
      if (!role) {
        throw new NotFoundError(`Role ${parsed.role} does not exist`);
      }
      return repository.setRole(parsed.profileId, role.id);
    },
  };
}

export type UsersService = ReturnType<typeof createUsersService>;
