import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../shared/types/database.types";
import { createAuthService } from "./modules/auth";
import { createAvailabilityService } from "./modules/availability";
import { createCheckInOutService } from "./modules/check-in-out";
import { createFacilitiesService } from "./modules/facilities";
import { createHousekeepingService } from "./modules/housekeeping";
import { createPaymentsService } from "./modules/payments";
import { createPricingService } from "./modules/pricing";
import { createReportsService } from "./modules/reports";
import { createReservationsService } from "./modules/reservations";
import { createRoomAllocationService } from "./modules/room-allocation";
import { createRoomsService } from "./modules/rooms";
import { createRoomTypesService } from "./modules/room-types";
import { createRolesService } from "./modules/roles";
import { createUsersService } from "./modules/users";

export interface Backend {
  auth: ReturnType<typeof createAuthService>;
  users: ReturnType<typeof createUsersService>;
  roles: ReturnType<typeof createRolesService>;
  rooms: ReturnType<typeof createRoomsService>;
  roomTypes: ReturnType<typeof createRoomTypesService>;
  facilities: ReturnType<typeof createFacilitiesService>;
  pricing: ReturnType<typeof createPricingService>;
  reservations: ReturnType<typeof createReservationsService>;
  availability: ReturnType<typeof createAvailabilityService>;
  roomAllocation: ReturnType<typeof createRoomAllocationService>;
  checkInOut: ReturnType<typeof createCheckInOutService>;
  payments: ReturnType<typeof createPaymentsService>;
  housekeeping: ReturnType<typeof createHousekeepingService>;
  reports: ReturnType<typeof createReportsService>;
}

/**
 * Compose every backend service around a single Supabase client.
 *
 * The client determines the security context:
 *   - browser client (anon key + user session): respects RLS as the user
 *   - server client (anon key + access token): respects RLS as the user
 *   - admin client (service role): bypasses RLS - trusted server code only
 */
export function createBackend(client: SupabaseClient<Database>): Backend {
  return {
    auth: createAuthService(client),
    users: createUsersService(client),
    roles: createRolesService(client),
    rooms: createRoomsService(client),
    roomTypes: createRoomTypesService(client),
    facilities: createFacilitiesService(client),
    pricing: createPricingService(client),
    reservations: createReservationsService(client),
    availability: createAvailabilityService(client),
    roomAllocation: createRoomAllocationService(client),
    checkInOut: createCheckInOutService(client),
    payments: createPaymentsService(client),
    housekeeping: createHousekeepingService(client),
    reports: createReportsService(client),
  };
}

export type { Database } from "../shared/types/database.types";
export * from "../shared/types/contracts";
export * from "./shared/errors";
export * from "./shared/utils";
export * from "./config";
export * from "./lib/supabase/client";
export * from "./lib/supabase/server";
