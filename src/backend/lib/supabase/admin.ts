import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import { getAdminEnv } from "../../config/env";

let cachedAdminClient: SupabaseClient<Database> | null = null;

/**
 * Service-role client. It bypasses RLS, so it must only be used in trusted
 * server environments (scripts, admin route handlers, migrations, tests).
 *
 * This module deliberately is NOT re-exported from src/backend/index.ts.
 * Import it only from server-only entry points.
 */
export function createAdminSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase service-role client must never run in a browser");
  }
  const env = getAdminEnv();
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Reuse the service-role client inside a trusted server process. */
export function getAdminSupabaseClient(): SupabaseClient<Database> {
  if (!cachedAdminClient) {
    cachedAdminClient = createAdminSupabaseClient();
  }
  return cachedAdminClient;
}

/** Test helper. */
export function resetAdminSupabaseClient(): void {
  cachedAdminClient = null;
}
