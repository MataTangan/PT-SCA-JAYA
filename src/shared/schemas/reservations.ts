import { z } from "zod";
import { isoDateSchema, paginationSchema, uuidSchema, type WithDefaults } from "./common";
import { paymentMethodSchema, paymentStatusSchema } from "./rooms";

// ---------------------------------------------------------------------------
// Reservations
// ---------------------------------------------------------------------------
export const createReservationSchema = z
  .object({
    roomTypeId: uuidSchema,
    checkInDate: isoDateSchema,
    checkOutDate: isoDateSchema,
    adults: z.coerce.number().int().min(1).max(20).default(1),
    children: z.coerce.number().int().min(0).max(20).default(0),
    roomCount: z.coerce.number().int().min(1).max(10).default(1),
    specialRequests: z.string().trim().max(1000).nullable().optional(),
    guestId: uuidSchema.nullable().optional(),
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

export const updateReservationSchema = z
  .object({
    specialRequests: z.string().trim().max(1000).nullable().optional(),
    adults: z.coerce.number().int().min(1).max(20).optional(),
    children: z.coerce.number().int().min(0).max(20).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const cancelReservationSchema = z.object({
  reservationId: uuidSchema,
  reason: z.string().trim().max(500).optional(),
});

export const confirmReservationSchema = z.object({
  reservationId: uuidSchema,
});

export const listReservationsSchema = paginationSchema.extend({
  status: z.enum(["pending", "confirmed", "checked_in", "completed", "cancelled"]).optional(),
  guestId: uuidSchema.optional(),
  roomTypeId: uuidSchema.optional(),
  code: z.string().trim().max(40).optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
});

export type CreateReservationInput = WithDefaults<
  z.infer<typeof createReservationSchema>,
  "adults" | "children" | "roomCount"
>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type ListReservationsInput = WithDefaults<
  z.infer<typeof listReservationsSchema>,
  "page" | "pageSize"
>;

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------
export const availabilityQuerySchema = z
  .object({
    checkInDate: isoDateSchema,
    checkOutDate: isoDateSchema,
    roomTypeId: uuidSchema.optional(),
    guests: z.coerce.number().int().min(1).max(50).optional(),
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

export const roomAvailabilitySchema = z
  .object({
    roomId: uuidSchema,
    checkInDate: isoDateSchema,
    checkOutDate: isoDateSchema,
  })
  .refine((value) => value.checkOutDate > value.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type RoomAvailabilityInput = z.infer<typeof roomAvailabilitySchema>;

// ---------------------------------------------------------------------------
// Allocation / check-in / check-out
// ---------------------------------------------------------------------------
export const allocateRoomSchema = z.object({
  reservationId: uuidSchema,
  roomId: uuidSchema,
});

export const releaseRoomSchema = z.object({
  reservationRoomId: uuidSchema,
  reason: z.string().trim().max(500).optional(),
});

export const reservationIdSchema = z.object({ reservationId: uuidSchema });

export const listStayRecordsSchema = paginationSchema.extend({
  reservationId: uuidSchema.optional(),
  roomId: uuidSchema.optional(),
  openOnly: z.coerce.boolean().optional(),
});

export type AllocateRoomInput = z.infer<typeof allocateRoomSchema>;
export type ReleaseRoomInput = z.infer<typeof releaseRoomSchema>;
export type ListStayRecordsInput = WithDefaults<
  z.infer<typeof listStayRecordsSchema>,
  "page" | "pageSize"
>;

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export const createPaymentRecordSchema = z.object({
  reservationId: uuidSchema,
  method: paymentMethodSchema,
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: uuidSchema,
  status: paymentStatusSchema,
  method: paymentMethodSchema.optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export type CreatePaymentRecordInput = z.infer<typeof createPaymentRecordSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;

// ---------------------------------------------------------------------------
// Housekeeping
// ---------------------------------------------------------------------------
export const createHousekeepingTaskSchema = z.object({
  roomId: uuidSchema,
  reservationId: uuidSchema.nullable().optional(),
  taskType: z
    .enum(["checkout_clean", "stayover_clean", "deep_clean", "inspection"])
    .default("checkout_clean"),
  assignedTo: uuidSchema.nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const updateHousekeepingTaskSchema = z
  .object({
    status: z.enum(["clean", "dirty", "cleaning"]).optional(),
    assignedTo: uuidSchema.nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const listHousekeepingTasksSchema = paginationSchema.extend({
  status: z.enum(["clean", "dirty", "cleaning"]).optional(),
  roomId: uuidSchema.optional(),
  assignedTo: uuidSchema.optional(),
  taskType: z.enum(["checkout_clean", "stayover_clean", "deep_clean", "inspection"]).optional(),
  openOnly: z.coerce.boolean().optional(),
});

export type CreateHousekeepingTaskInput = WithDefaults<
  z.infer<typeof createHousekeepingTaskSchema>,
  "taskType"
>;
export type UpdateHousekeepingTaskInput = z.infer<typeof updateHousekeepingTaskSchema>;
export type ListHousekeepingTasksInput = WithDefaults<
  z.infer<typeof listHousekeepingTasksSchema>,
  "page" | "pageSize"
>;

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
export const reportRangeSchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
  })
  .refine((value) => value.to > value.from, {
    message: "The report end date must be after the start date",
    path: ["to"],
  });

export type ReportRangeInput = z.infer<typeof reportRangeSchema>;
