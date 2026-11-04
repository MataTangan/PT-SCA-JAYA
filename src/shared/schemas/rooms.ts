import { z } from "zod";
import { OCCUPANCY_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "../constants/statuses";
import { ROLE_SLUGS } from "../constants/roles";
import {
  currencySchema,
  isoDateSchema,
  paginationSchema,
  phoneSchema,
  uuidSchema,
  type WithDefaults,
} from "./common";

// ---------------------------------------------------------------------------
// Profiles / users
// ---------------------------------------------------------------------------
export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    phone: phoneSchema.nullable().optional(),
  })
  .refine((value) => value.fullName !== undefined || value.phone !== undefined, {
    message: "Provide at least one field to update",
  });

export const listProfilesSchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  role: z.enum(ROLE_SLUGS).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const assignRoleSchema = z.object({
  profileId: uuidSchema,
  role: z.enum(ROLE_SLUGS),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ListProfilesInput = WithDefaults<
  z.infer<typeof listProfilesSchema>,
  "page" | "pageSize"
>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;

// ---------------------------------------------------------------------------
// Rooms / room types / facilities
// ---------------------------------------------------------------------------
export const createRoomTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, or underscores")
    .max(40),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(20),
  sizeSqm: z.coerce.number().positive().max(10000).nullable().optional(),
  bedType: z.string().trim().max(40).nullable().optional(),
  facilityIds: z.array(uuidSchema).max(50).optional(),
});

export const updateRoomTypeSchema = createRoomTypeSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const createRoomSchema = z.object({
  roomNumber: z.string().trim().min(1).max(20),
  roomTypeId: uuidSchema,
  floor: z.coerce.number().int().min(0).max(200).default(1),
  notes: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateRoomSchema = createRoomSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const roomStatusSchema = z
  .object({
    occupancyStatus: z.enum(OCCUPANCY_STATUSES).optional(),
    housekeepingStatus: z.enum(["clean", "dirty", "cleaning"]).optional(),
  })
  .refine(
    (value) => value.occupancyStatus !== undefined || value.housekeepingStatus !== undefined,
    { message: "Provide an occupancy or housekeeping status" },
  );

export const listRoomsSchema = paginationSchema.extend({
  roomTypeId: uuidSchema.optional(),
  occupancyStatus: z.enum(OCCUPANCY_STATUSES).optional(),
  housekeepingStatus: z.enum(["clean", "dirty", "cleaning"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().trim().max(40).optional(),
});

export const createFacilitySchema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, or underscores")
    .max(40),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).nullable().optional(),
  category: z.enum(["hotel", "room"]).default("hotel"),
  icon: z.string().trim().max(80).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateFacilitySchema = createFacilitySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateRoomInput = WithDefaults<z.infer<typeof createRoomSchema>, "floor">;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomStatusInput = z.infer<typeof roomStatusSchema>;
export type ListRoomsInput = WithDefaults<z.infer<typeof listRoomsSchema>, "page" | "pageSize">;
export type CreateFacilityInput = WithDefaults<z.infer<typeof createFacilitySchema>, "category">;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------
export const createRoomRateSchema = z
  .object({
    roomTypeId: uuidSchema,
    ratePerNight: z.coerce.number().positive().max(1_000_000_000),
    currency: currencySchema.default("IDR"),
    validFrom: isoDateSchema,
    validTo: isoDateSchema.nullable().optional(),
  })
  .refine((value) => value.validTo == null || value.validTo > value.validFrom, {
    message: "validTo must be after validFrom",
  });

export const listRoomRatesSchema = z.object({
  roomTypeId: uuidSchema.optional(),
  activeOnly: z.coerce.boolean().default(false),
});

export const applicableRateSchema = z.object({
  roomTypeId: uuidSchema,
  date: isoDateSchema,
});

export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);

export type CreateRoomRateInput = WithDefaults<z.infer<typeof createRoomRateSchema>, "currency">;
export type ListRoomRatesInput = WithDefaults<z.infer<typeof listRoomRatesSchema>, "activeOnly">;
