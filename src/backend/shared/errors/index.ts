import type { ApiFailure } from "../../../shared/types/contracts";
import { ERROR_CODES, type ErrorCode } from "../../../shared/constants/errors";

export interface AppErrorOptions {
  details?: unknown;
  cause?: unknown;
}

/** Base class for all expected backend failures. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, status: number, options: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    if (options.details !== undefined) {
      this.details = options.details;
    }
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: unknown) {
    super(ERROR_CODES.VALIDATION_ERROR, message, 400, { details });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(ERROR_CODES.AUTHENTICATION_ERROR, message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You are not allowed to perform this action") {
    super(ERROR_CODES.AUTHORIZATION_ERROR, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(ERROR_CODES.NOT_FOUND, message, 404, { details });
  }
}

export class ConflictError extends AppError {
  constructor(message = "The operation conflicts with the current state", details?: unknown) {
    super(ERROR_CODES.CONFLICT, message, 409, { details });
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database error occurred", details?: unknown) {
    super(ERROR_CODES.DATABASE_ERROR, message, 500, { details });
  }
}

export class InternalError extends AppError {
  constructor(message = "An unexpected error occurred", details?: unknown) {
    super(ERROR_CODES.INTERNAL_ERROR, message, 500, { details });
  }
}

interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

/**
 * Translate Supabase/PostgREST/PostgreSQL errors into safe application errors.
 * Raw database details are never returned to clients by default.
 */
export function mapSupabaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const candidate = error as PostgrestLikeError | null;
  const code = candidate?.code ?? "";
  const message = candidate?.message ?? "Unknown backend error";

  switch (code) {
    case "23505":
    case "23505 ":
      return new ConflictError("A record with these values already exists", { code });
    case "23P01":
      return new ConflictError("The selected room is not available for these dates", { code });
    case "23503":
      return new ValidationError("A referenced record does not exist", { code });
    case "23514":
    case "22023":
    case "22P02":
      return new ValidationError(message, { code });
    case "42501":
      return new AuthorizationError();
    case "P0002":
    case "PGRST116":
      return new NotFoundError();
    case "28000":
    case "401":
      return new AuthenticationError();
    case "40001":
    case "40P01":
      return new ConflictError("The request conflicted with another operation; retry it", {
        code,
      });
    default:
      break;
  }

  if (/invalid login credentials|invalid_grant|jwt|token/i.test(message)) {
    return new AuthenticationError("Invalid authentication credentials");
  }
  if (/row-level security|permission denied/i.test(message)) {
    return new AuthorizationError();
  }
  if (/duplicate key|unique constraint/i.test(message)) {
    return new ConflictError("A record with these values already exists");
  }
  if (/violates check constraint|invalid input syntax|cannot be null/i.test(message)) {
    return new ValidationError(message);
  }

  return new DatabaseError("The database operation failed", { code });
}

/** Safe error envelope for HTTP route handlers and server actions. */
export function toApiFailure(error: unknown, requestId?: string): ApiFailure {
  const appError = mapSupabaseError(error);
  return {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details === undefined ? {} : { details: appError.details }),
      ...(requestId === undefined ? {} : { requestId }),
    },
  };
}
