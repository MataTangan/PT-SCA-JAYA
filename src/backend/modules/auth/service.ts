import type { SupabaseClient } from "@supabase/supabase-js";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { RoleSlug } from "../../../shared/constants/roles";
import { ROLE_SLUGS } from "../../../shared/constants/roles";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "../../../shared/schemas";
import {
  AuthenticationError,
  InternalError,
  NotFoundError,
  mapSupabaseError,
} from "../../shared/errors";
import { parseInput } from "../../shared/validators";
import { createAuthRepository } from "./repository";
import type { AuthResult, CurrentUser } from "./types";

function asRoleSlug(value: string): RoleSlug {
  if ((ROLE_SLUGS as readonly string[]).includes(value)) {
    return value as RoleSlug;
  }
  throw new InternalError(`Unknown role slug configured in the database: ${value}`);
}

export function createAuthService(client: SupabaseClient<Database>) {
  const repository = createAuthRepository(client);

  async function loadCurrentUser(): Promise<CurrentUser | null> {
    const { data, error } = await client.auth.getUser();
    if (error) {
      if (isAuthSessionMissingError(error)) {
        return null;
      }
      throw mapSupabaseError(error);
    }
    if (!data.user) {
      return null;
    }

    const profile = await repository.getProfile(data.user.id);
    if (!profile) {
      throw new NotFoundError("Profile not found for the authenticated user");
    }

    const role = asRoleSlug(profile.role.slug);
    const permissions =
      role === "admin"
        ? await repository.getAllPermissionCodes()
        : await repository.getPermissions(profile.role_id);

    return {
      id: data.user.id,
      email: profile.email,
      profile,
      role,
      permissions,
    };
  }

  return {
    /** Register a guest. Staff accounts are created by admins, never via signup. */
    async signUp(input: SignUpInput): Promise<AuthResult> {
      const parsed = parseInput(signUpSchema, input);
      const { data, error } = await client.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
          data: {
            full_name: parsed.fullName,
            ...(parsed.phone === undefined ? {} : { phone: parsed.phone }),
          },
        },
      });
      if (error) {
        throw mapSupabaseError(error);
      }
      if (!data.user) {
        throw new InternalError("Supabase did not return a user after signup");
      }

      const profile = data.session ? await repository.getProfile(data.user.id) : null;

      return {
        userId: data.user.id,
        email: data.user.email ?? null,
        session: data.session,
        profile,
        needsEmailConfirmation: data.session === null,
      };
    },

    async signIn(input: SignInInput): Promise<AuthResult> {
      const parsed = parseInput(signInSchema, input);
      const { data, error } = await client.auth.signInWithPassword({
        email: parsed.email,
        password: parsed.password,
      });
      if (error) {
        throw mapSupabaseError(error);
      }
      if (!data.user) {
        throw new AuthenticationError("Sign-in failed");
      }

      const profile = await repository.getProfile(data.user.id);

      return {
        userId: data.user.id,
        email: data.user.email ?? null,
        session: data.session,
        profile,
        needsEmailConfirmation: false,
      };
    },

    async signOut(): Promise<void> {
      const { error } = await client.auth.signOut();
      if (error) {
        throw mapSupabaseError(error);
      }
    },

    async getCurrentUser(): Promise<CurrentUser | null> {
      return loadCurrentUser();
    },

    async requireUser(): Promise<CurrentUser> {
      const user = await loadCurrentUser();
      if (!user) {
        throw new AuthenticationError();
      }
      return user;
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
