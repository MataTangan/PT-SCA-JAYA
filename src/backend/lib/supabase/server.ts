import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import { getServerEnv } from "../../config/env";

export interface ServerClientOptions {
  /**
   * Access token of the signed-in user. Required when calling services on
   * behalf of a user outside the browser (route handler, server action, test).
   */
  accessToken?: string;
  /** Additional headers, e.g. from an SSR cookie adapter. */
  headers?: Record<string, string>;
}

/**
 * Server-side Supabase client using the anon key and an explicit user token.
 * No session is persisted and tokens are not auto-refreshed.
 *
 * For Next.js App Router cookie-based sessions, use @supabase/ssr in the app's
 * infrastructure layer and pass the resulting access token here (or pass the
 * @supabase/ssr client directly to the service factories).
 */
export function createServerSupabaseClient(
  options: ServerClientOptions = {},
): SupabaseClient<Database> {
  const env = getServerEnv();
  const headers: Record<string, string> = { ...options.headers };
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers,
    },
  });
}
