import { AuthSessionMissingError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { createAuthService } from "../../src/backend/modules/auth/service";
import { AuthenticationError, NotFoundError } from "../../src/backend/shared/errors";
import { createMockSupabase } from "../helpers/mock-supabase";

const userId = "11111111-1111-4111-8111-111111111101";
const guestRole = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "guest",
  name: "Guest",
  description: null,
  is_system: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const profile = {
  id: userId,
  email: "guest1@hotel-sca.test",
  full_name: "Ayu Lestari",
  phone: "081200000001",
  role_id: guestRole.id,
  is_active: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  role: guestRole,
};

describe("auth service", () => {
  it("marks signup as needing confirmation when no session is returned", async () => {
    const mock = createMockSupabase({
      auth: {
        signUpResult: {
          data: { user: { id: userId, email: profile.email }, session: null },
          error: null,
        },
      },
    });
    const service = createAuthService(mock.client);

    const result = await service.signUp({
      email: profile.email,
      password: "long-enough-password",
      fullName: profile.full_name,
    });

    expect(result).toMatchObject({
      userId,
      needsEmailConfirmation: true,
      profile: null,
    });
  });

  it("loads the profile and permissions on sign-in", async () => {
    const mock = createMockSupabase({
      auth: {
        user: { id: userId, email: profile.email },
        signInResult: {
          data: { user: { id: userId, email: profile.email }, session: { access_token: "token" } },
          error: null,
        },
      },
      tables: {
        profiles: { data: profile, error: null },
        role_permissions: {
          data: [{ permissions: { code: "reservation.read" } }],
          error: null,
        },
      },
    });
    const service = createAuthService(mock.client);

    const result = await service.signIn({
      email: profile.email,
      password: "Demo1234!",
    });

    expect(result.needsEmailConfirmation).toBe(false);
    expect(result.profile?.role.slug).toBe("guest");
  });

  it("returns the current user with permissions", async () => {
    const mock = createMockSupabase({
      auth: { user: { id: userId, email: profile.email } },
      tables: {
        profiles: { data: profile, error: null },
        role_permissions: {
          data: [
            { permissions: { code: "reservation.read" } },
            { permissions: { code: "profile.read" } },
          ],
          error: null,
        },
      },
    });
    const service = createAuthService(mock.client);

    const user = await service.getCurrentUser();

    expect(user).toMatchObject({ id: userId, role: "guest" });
    expect(user?.permissions).toEqual(["profile.read", "reservation.read"]);
  });

  it("returns null from getCurrentUser when there is no session", async () => {
    const mock = createMockSupabase({
      auth: { getUserError: new AuthSessionMissingError() },
    });
    const service = createAuthService(mock.client);

    await expect(service.getCurrentUser()).resolves.toBeNull();
    await expect(service.requireUser()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("throws when the profile is missing", async () => {
    const mock = createMockSupabase({
      auth: { user: { id: userId, email: profile.email } },
      tables: { profiles: { data: null, error: null } },
    });
    const service = createAuthService(mock.client);

    await expect(service.getCurrentUser()).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws on an authentication failure", async () => {
    const mock = createMockSupabase({
      auth: {
        signInResult: {
          data: { user: null, session: null },
          error: { message: "Invalid login credentials" },
        },
      },
    });
    const service = createAuthService(mock.client);

    await expect(
      service.signIn({ email: profile.email, password: "wrong-password" }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });
});
