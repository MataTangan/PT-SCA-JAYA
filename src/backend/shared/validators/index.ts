import type { ZodError, ZodType } from "zod";
import { ValidationError } from "../errors";

export interface ValidationIssue {
  path: string;
  message: string;
}

export function zodIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
}

/** Validate at a backend boundary. Throws a 400 ValidationError on failure. */
export function parseInput<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError("Invalid input", zodIssues(result.error));
  }
  return result.data;
}

/** Validate an untrusted identifier/parameter as a non-empty string. */
export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }
  return value;
}
