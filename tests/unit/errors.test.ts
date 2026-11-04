import { describe, expect, it } from "vitest";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
  mapSupabaseError,
  toApiFailure,
} from "../../src/backend/shared/errors";
import { ERROR_CODES } from "../../src/shared/constants/errors";

describe("AppError hierarchy", () => {
  it("carries code, status, and details", () => {
    const error = new ConflictError("Already booked", { code: "23P01" });
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ERROR_CODES.CONFLICT);
    expect(error.status).toBe(409);
    expect(error.details).toEqual({ code: "23P01" });
  });

  it("uses stable public messages and statuses", () => {
    expect(new ValidationError().status).toBe(400);
    expect(new AuthenticationError().status).toBe(401);
    expect(new AuthorizationError().status).toBe(403);
    expect(new NotFoundError().status).toBe(404);
    expect(new DatabaseError().status).toBe(500);
  });
});

describe("mapSupabaseError", () => {
  it("returns existing AppErrors unchanged", () => {
    const original = new NotFoundError("Missing");
    expect(mapSupabaseError(original)).toBe(original);
  });

  it.each([
    ["23505", ConflictError],
    ["23P01", ConflictError],
    ["23503", ValidationError],
    ["23514", ValidationError],
    ["22023", ValidationError],
    ["42501", AuthorizationError],
    ["P0002", NotFoundError],
    ["PGRST116", NotFoundError],
    ["28000", AuthenticationError],
  ])("maps PostgreSQL code %s", (code, ErrorClass) => {
    expect(mapSupabaseError({ code, message: "database detail" })).toBeInstanceOf(ErrorClass);
  });

  it("maps serialization/deadlock failures to a retryable conflict", () => {
    const error = mapSupabaseError({ code: "40001", message: "could not serialize" });
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toMatch(/retry/i);
  });

  it("maps auth and RLS messages when no code is present", () => {
    expect(mapSupabaseError(new Error("Invalid login credentials"))).toBeInstanceOf(
      AuthenticationError,
    );
    expect(
      mapSupabaseError(new Error("new row violates row-level security policy")),
    ).toBeInstanceOf(AuthorizationError);
  });

  it("does not leak raw database messages for unknown errors", () => {
    const mapped = mapSupabaseError({ message: "connection reset by peer" });
    expect(mapped).toBeInstanceOf(DatabaseError);
    expect(mapped.message).toBe("The database operation failed");
  });
});

describe("toApiFailure", () => {
  it("builds a safe failure envelope with request id", () => {
    const failure = toApiFailure(new ValidationError("Bad dates"), "req-123");
    expect(failure).toEqual({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Bad dates",
        requestId: "req-123",
      },
    });
  });

  it("includes error details when present", () => {
    const failure = toApiFailure(new ConflictError("Conflict", { field: "room" }));
    expect(failure.success).toBe(false);
    if (!failure.success) {
      expect(failure.error.details).toEqual({ field: "room" });
    }
  });
});
