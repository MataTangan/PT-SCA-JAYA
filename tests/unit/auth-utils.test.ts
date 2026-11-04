import { AuthSessionMissingError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getOptionalUserId, requireUserId } from "../../src/backend/shared/utils/auth";
import { AuthenticationError } from "../../src/backend/shared/errors";
import { createMockSupabase } from "../helpers/mock-supabase";

const userId = "11111111-1111-4111-8111-111111111101";

describe("auth utilities", () => {
  it("returns the authenticated user id", async () => {
    const mock = createMockSupabase({ auth: { user: { id: userId } } });

    await expect(requireUserId(mock.client)).resolves.toBe(userId);
    await expect(getOptionalUserId(mock.client)).resolves.toBe(userId);
  });

  it("treats a missing session as unauthenticated", async () => {
    const mock = createMockSupabase({ auth: { getUserError: new AuthSessionMissingError() } });

    await expect(requireUserId(mock.client)).rejects.toBeInstanceOf(AuthenticationError);
    await expect(getOptionalUserId(mock.client)).resolves.toBeNull();
  });
});
