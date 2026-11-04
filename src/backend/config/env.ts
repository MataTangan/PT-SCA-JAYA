import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(20, "SUPABASE_ANON_KEY is missing or too short"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const adminEnvSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

const browserEnvSchema = z.object({
  url: z.string().url("Supabase URL must be a valid URL"),
  anonKey: z.string().min(20, "Supabase anon key is missing or too short"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type AdminEnv = z.infer<typeof adminEnvSchema>;
export interface BrowserEnv {
  url: string;
  anonKey: string;
}

let cachedServerEnv: ServerEnv | null = null;
let cachedAdminEnv: AdminEnv | null = null;

function readProcessEnv(): Record<string, string | undefined> {
  return typeof process !== "undefined" ? process.env : {};
}

function configError(scope: string, issues: z.ZodError): Error {
  const lines = issues.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  return new Error(`Invalid ${scope} environment configuration:\n${lines.join("\n")}`);
}

/** Validate and cache server-side environment variables. */
export function getServerEnv(
  source: Record<string, string | undefined> = readProcessEnv(),
): ServerEnv {
  if (cachedServerEnv && source === readProcessEnv()) {
    return cachedServerEnv;
  }
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    throw configError("server", result.error);
  }
  cachedServerEnv = result.data;
  return result.data;
}

/** Service-role configuration. Only call this from trusted server code. */
export function getAdminEnv(
  source: Record<string, string | undefined> = readProcessEnv(),
): AdminEnv {
  if (cachedAdminEnv && source === readProcessEnv()) {
    return cachedAdminEnv;
  }
  const result = adminEnvSchema.safeParse(source);
  if (!result.success) {
    throw configError("admin", result.error);
  }
  cachedAdminEnv = result.data;
  return result.data;
}

/**
 * Browser-safe configuration.
 *
 * Next.js exposes NEXT_PUBLIC_* variables. Vite exposes import.meta.env, which
 * is not readable from this framework-independent module, so React/Vite apps
 * should pass `{ url: import.meta.env.VITE_SUPABASE_URL, anonKey: ... }`.
 */
export function getBrowserEnv(
  overrides?: Partial<BrowserEnv>,
  source: Record<string, string | undefined> = readProcessEnv(),
): BrowserEnv {
  const result = browserEnvSchema.safeParse({
    url: overrides?.url ?? source.NEXT_PUBLIC_SUPABASE_URL ?? source.VITE_SUPABASE_URL,
    anonKey:
      overrides?.anonKey ?? source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? source.VITE_SUPABASE_ANON_KEY,
  });
  if (!result.success) {
    throw configError("browser", result.error);
  }
  return result.data;
}

/** Test helper: clear cached values after mutating process.env. */
export function resetEnvCache(): void {
  cachedServerEnv = null;
  cachedAdminEnv = null;
}
