import type { SupabaseClient } from "@supabase/supabase-js";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import { AuthenticationError, mapSupabaseError } from "../errors";

/** Return the authenticated user id or throw a 401 error. */
export async function requireUserId(client: SupabaseClient<Database>): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (isAuthSessionMissingError(error)) {
      throw new AuthenticationError();
    }
    throw mapSupabaseError(error);
  }
  if (!data.user) {
    throw new AuthenticationError();
  }
  return data.user.id;
}

/** Return the authenticated user id, or null when there is no session. */
export async function getOptionalUserId(client: SupabaseClient<Database>): Promise<string | null> {
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (isAuthSessionMissingError(error)) {
      return null;
    }
    throw mapSupabaseError(error);
  }
  return data.user?.id ?? null;
}
