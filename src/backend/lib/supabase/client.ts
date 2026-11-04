import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import { getBrowserEnv, type BrowserEnv } from "../../config/env";

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Browser/React client. Uses the anon key only, persists the session in
 * localStorage, and safely refreshes tokens. Never pass a service-role key.
 *
 * Vite/React: call with explicit values from import.meta.env.
 * Next.js: the NEXT_PUBLIC_* variables are picked up automatically.
 */
export function createBrowserSupabaseClient(
  overrides?: Partial<BrowserEnv>,
): SupabaseClient<Database> {
  const env = getBrowserEnv(overrides);
  return createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}

/** Reuse one browser client per tab. */
export function getBrowserSupabaseClient(
  overrides?: Partial<BrowserEnv>,
): SupabaseClient<Database> {
  if (!cachedClient) {
    cachedClient = createBrowserSupabaseClient(overrides);
  }
  return cachedClient;
}

/** Test helper. */
export function resetBrowserSupabaseClient(): void {
  cachedClient = null;
}
