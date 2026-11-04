import { describe, expect, it } from "vitest";
import {
  unwrap,
  unwrapCount,
  unwrapMaybe,
  unwrapRequired,
} from "../../src/backend/shared/utils/supabase";
import { ConflictError, NotFoundError } from "../../src/backend/shared/errors";
import type { PostgrestError } from "@supabase/supabase-js";

const conflict = {
  code: "23505",
  message: "duplicate key",
  details: "",
  hint: "",
  name: "PostgrestError",
} as unknown as PostgrestError;

describe("unwrap", () => {
  it("returns data when there is no error", () => {
    expect(unwrap({ data: { id: "1" }, error: null })).toEqual({ id: "1" });
  });

  it("maps Supabase errors", () => {
    expect(() => unwrap({ data: null, error: conflict })).toThrow(ConflictError);
  });
});

describe("unwrapRequired", () => {
  it("throws NotFound for a null row", () => {
    expect(() => unwrapRequired({ data: null, error: null }, "Room not found")).toThrow(
      "Room not found",
    );
  });

  it("returns a present row", () => {
    expect(unwrapRequired({ data: { id: "1" }, error: null })).toEqual({ id: "1" });
  });
});

describe("unwrapMaybe", () => {
  it("treats PGRST116 as a missing row", () => {
    const missing = { ...conflict, code: "PGRST116" } as PostgrestError;
    expect(unwrapMaybe({ data: null, error: missing })).toBeNull();
  });

  it("propagates other errors", () => {
    expect(() => unwrapMaybe({ data: null, error: conflict })).toThrow(ConflictError);
  });
});

describe("unwrapCount", () => {
  it("returns zero for a null count", () => {
    expect(unwrapCount({ count: null, error: null })).toBe(0);
  });

  it("returns the count and maps errors", () => {
    expect(unwrapCount({ count: 7, error: null })).toBe(7);
    expect(() => unwrapCount({ count: null, error: conflict })).toThrow(ConflictError);
  });
});

describe("NotFoundError", () => {
  it("is an AppError with a 404 status", () => {
    const error = new NotFoundError();
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });
});
