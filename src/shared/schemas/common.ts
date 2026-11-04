import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants/statuses";

export const uuidSchema = z.string().uuid("Must be a valid UUID");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "Must be a real calendar date");

export const emailSchema = z.string().trim().email("Must be a valid email address").max(254);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+()\-\s]{7,20}$/, "Must be a valid phone number")
  .max(20);

export const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Use a 3-letter ISO currency code");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export const sortDirectionSchema = z.enum(["asc", "desc"]).default("desc");

/** Input type where fields with schema defaults may be omitted by callers. */
export type WithDefaults<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PaginationInput = WithDefaults<z.infer<typeof paginationSchema>, "page" | "pageSize">;

export function isAfterDate(after: string, before: string): boolean {
  return after > before;
}
