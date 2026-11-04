export {
  createBrowserSupabaseClient,
  getBrowserSupabaseClient,
  resetBrowserSupabaseClient,
} from "./client";
export { createServerSupabaseClient, type ServerClientOptions } from "./server";
// Intentionally not exporting ./admin here: it must stay server-only.
