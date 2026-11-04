import { afterEach, describe, expect, it } from "vitest";
import {
  getAdminEnv,
  getBrowserEnv,
  getServerEnv,
  resetEnvCache,
} from "../../src/backend/config/env";

const url = "https://example.supabase.co";
const key = "a".repeat(40);

afterEach(() => {
  resetEnvCache();
});

describe("getServerEnv", () => {
  it("parses a valid server configuration and applies defaults", () => {
    const env = getServerEnv({
      SUPABASE_URL: url,
      SUPABASE_ANON_KEY: key,
    });
    expect(env).toEqual({
      SUPABASE_URL: url,
      SUPABASE_ANON_KEY: key,
      NODE_ENV: "development",
      LOG_LEVEL: "info",
    });
  });

  it("rejects incomplete configuration", () => {
    expect(() => getServerEnv({ SUPABASE_URL: url })).toThrow(/SUPABASE_ANON_KEY/);
  });

  it("keeps the service-role key optional", () => {
    expect(
      getServerEnv({ SUPABASE_URL: url, SUPABASE_ANON_KEY: key }).SUPABASE_SERVICE_ROLE_KEY,
    ).toBeUndefined();
  });
});

describe("getAdminEnv", () => {
  it("requires a service-role key", () => {
    expect(() => getAdminEnv({ SUPABASE_URL: url })).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("returns a validated admin configuration", () => {
    expect(getAdminEnv({ SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key })).toEqual({
      SUPABASE_URL: url,
      SUPABASE_SERVICE_ROLE_KEY: key,
    });
  });
});

describe("getBrowserEnv", () => {
  it("reads Next.js public variables", () => {
    expect(
      getBrowserEnv(undefined, {
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
      }),
    ).toEqual({ url, anonKey: key });
  });

  it("prefers explicit overrides", () => {
    expect(
      getBrowserEnv(
        { url: "https://override.example.co", anonKey: key },
        { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: key },
      ),
    ).toEqual({ url: "https://override.example.co", anonKey: key });
  });

  it("rejects missing browser configuration", () => {
    expect(() => getBrowserEnv(undefined, {})).toThrow(/Invalid browser environment/);
  });
});
