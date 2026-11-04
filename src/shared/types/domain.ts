import type { Tables } from "./database.types";

export type Role = Tables<"roles">;
export type Permission = Tables<"permissions">;
export type Profile = Tables<"profiles">;
export type RoomType = Tables<"room_types">;
export type Room = Tables<"rooms">;
export type Facility = Tables<"facilities">;
export type RoomRate = Tables<"room_rates">;
export type Reservation = Tables<"reservations">;
export type ReservationRoom = Tables<"reservation_rooms">;
export type Payment = Tables<"payments">;
export type StayRecord = Tables<"stay_records">;
export type HousekeepingTask = Tables<"housekeeping_tasks">;

/** Role slug values seeded by the database. */
export type RoleSlug = "guest" | "receptionist" | "housekeeping" | "admin";

/** Authenticated session identity returned by the auth service. */
export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
  role: RoleSlug;
  permissions: string[];
}

export interface ProfileWithRole extends Profile {
  role: Role;
}

export interface RoomWithType extends Room {
  room_type: RoomType;
}

export interface RoomTypeWithFacilities extends RoomType {
  facilities: Facility[];
}

export interface ReservationSummary extends Reservation {
  guest: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
  room_type: RoomType | null;
  payment: Payment | null;
}

export interface ReservationWithRelations extends ReservationSummary {
  reservation_rooms: Array<
    ReservationRoom & {
      room: Pick<
        Room,
        "id" | "room_number" | "floor" | "occupancy_status" | "housekeeping_status"
      > | null;
    }
  >;
}

export interface HousekeepingTaskWithRoom extends HousekeepingTask {
  room: Pick<
    Room,
    "id" | "room_number" | "floor" | "occupancy_status" | "housekeeping_status"
  > | null;
  assignee: Pick<Profile, "id" | "full_name"> | null;
}

export interface OccupancyReport {
  from: string;
  to: string;
  days: number;
  total_rooms: number;
  occupied_room_nights: number;
  available_room_nights: number;
  occupancy_rate: number;
}

export interface RevenueReport {
  from: string;
  to: string;
  reservations_created: number;
  gross_reservation_value: number;
  paid_amount: number;
  unpaid_amount: number;
}
