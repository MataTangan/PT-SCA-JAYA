import type { ApiResponse } from "../types/contracts";

/** Operations exposed by the backend service layer. */
export const BACKEND_OPERATIONS = {
  auth: ["signUp", "signIn", "signOut", "getCurrentUser"],
  users: ["getProfile", "updateProfile", "listProfiles", "assignRole"],
  roles: ["getRoles", "getPermissions", "getRolePermissions"],
  rooms: ["getRooms", "getRoomById", "createRoom", "updateRoom", "updateRoomStatus"],
  roomTypes: ["getRoomTypes", "getRoomTypeById", "createRoomType", "updateRoomType"],
  facilities: ["getFacilities", "createFacility", "updateFacility"],
  pricing: ["getRoomRates", "getApplicableRate", "createRoomRate"],
  reservations: [
    "createReservation",
    "getReservationById",
    "getReservations",
    "updateReservation",
    "confirmReservation",
    "cancelReservation",
  ],
  availability: ["checkRoomAvailability", "getAvailableRooms", "getRoomTypeAvailability"],
  roomAllocation: ["allocateRoom", "releaseRoom", "getAllocations"],
  checkInOut: ["checkIn", "checkOut", "getStayRecords"],
  payments: ["createPaymentRecord", "getPaymentByReservation", "updatePaymentStatus"],
  housekeeping: ["getHousekeepingTasks", "createHousekeepingTask", "updateHousekeepingTask"],
  reports: ["getOccupancyReport", "getRevenueReport", "getTodaySummary"],
} as const;

export type BackendOperationGroup = keyof typeof BACKEND_OPERATIONS;

export function success<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function failure(code: string, message: string, details?: unknown): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, ...(details === undefined ? {} : { details }) },
  };
}
