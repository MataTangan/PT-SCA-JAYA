import type {
  HousekeepingStatus,
  OccupancyStatus,
  PaymentStatus,
  ReservationStatus,
} from "../types/database.types";

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
] as const satisfies readonly ReservationStatus[];

/**
 * Statuses whose active room allocations block availability.
 * Kept separate from occupancy and housekeeping status.
 */
export const RESERVATION_BLOCKING_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
] as const satisfies readonly ReservationStatus[];

export const RESERVATION_STATUS_TRANSITIONS: Record<
  ReservationStatus,
  readonly ReservationStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["completed"],
  completed: [],
  cancelled: [],
};

export const PAYMENT_STATUSES = ["unpaid", "paid"] as const satisfies readonly PaymentStatus[];

export const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "credit_card",
  "debit_card",
  "ewallet",
] as const;

export const OCCUPANCY_STATUSES = [
  "available",
  "reserved",
  "occupied",
] as const satisfies readonly OccupancyStatus[];

export const HOUSEKEEPING_STATUSES = [
  "clean",
  "dirty",
  "cleaning",
] as const satisfies readonly HousekeepingStatus[];

export const HOUSEKEEPING_TASK_TYPES = [
  "checkout_clean",
  "stayover_clean",
  "deep_clean",
  "inspection",
] as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function canTransitionReservation(from: ReservationStatus, to: ReservationStatus): boolean {
  return RESERVATION_STATUS_TRANSITIONS[from].includes(to);
}

export function blocksAvailability(status: ReservationStatus): boolean {
  return (RESERVATION_BLOCKING_STATUSES as readonly ReservationStatus[]).includes(status);
}
