import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "../../src/backend/config/env";
import { createServerSupabaseClient } from "../../src/backend/lib/supabase/server";

const url = "https://example.supabase.co";
const anonKey = "a".repeat(40);
const accessToken = "header.payload.signature";

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", url);
  vi.stubEnv("SUPABASE_ANON_KEY", anonKey);
  resetEnvCache();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  resetEnvCache();
});

describe("createServerSupabaseClient", () => {
  it("sends the explicit access token when resolving the user", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      expect(request.url).toBe(`${url}/auth/v1/user`);
      expect(request.headers.get("Authorization")).toBe(`Bearer ${accessToken}`);
      expect(request.headers.get("apikey")).toBe(anonKey);

      return new Response(JSON.stringify({ id: "user-1", email: "guest@example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = createServerSupabaseClient({ accessToken });
    const { data, error } = await client.auth.getUser();

    expect(error).toBeNull();
    expect(data.user?.id).toBe("user-1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not persist or attach a session without an access token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const client = createServerSupabaseClient();
    const { data, error } = await client.auth.getUser();

    expect(data.user).toBeNull();
    expect(error?.name).toBe("AuthSessionMissingError");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
