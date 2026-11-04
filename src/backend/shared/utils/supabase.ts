import type { PostgrestError } from "@supabase/supabase-js";
import { mapSupabaseError, NotFoundError } from "../errors";

export interface SupabaseResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

/** Throw a safe AppError when Supabase reports an error, otherwise return data. */
export function unwrap<T>(result: SupabaseResult<T>): T {
  if (result.error) {
    throw mapSupabaseError(result.error);
  }
  return result.data as T;
}

/** Like unwrap, but treat a missing single row as NotFound instead of null. */
export function unwrapRequired<T>(result: SupabaseResult<T>, message = "Resource not found"): T {
  const data = unwrap(result);
  if (data === null || data === undefined) {
    throw new NotFoundError(message);
  }
  return data;
}

export function unwrapCount(result: {
  count: number | null;
  error: PostgrestError | null;
}): number {
  if (result.error) {
    throw mapSupabaseError(result.error);
  }
  return result.count ?? 0;
}

export function unwrapMaybe<T>(result: SupabaseResult<T>): T | null {
  if (result.error) {
    if (result.error.code === "PGRST116") {
      return null;
    }
    throw mapSupabaseError(result.error);
  }
  return result.data;
}
