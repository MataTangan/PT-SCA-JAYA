# API Contracts

This document describes the TypeScript service API exported by
`createBackend(client)`. There are no HTTP endpoints in this repository. A
Next.js/React app can call these methods from server actions, route handlers, or
client components through the Supabase browser client.

## Composition

```ts
import { createBrowserSupabaseClient } from "@/backend/lib/supabase/client";
import { createBackend } from "@/backend";

const backend = createBackend(createBrowserSupabaseClient());
```

The service methods throw typed errors. They do not return `{ data, error }`
objects. Wrap calls with `toApiFailure` at the HTTP boundary.

## Common conventions

### Dates

- Calendar dates: `YYYY-MM-DD` strings.
- Timestamps: ISO 8601 strings from PostgreSQL.
- Reservation nights: `checkOutDate - checkInDate` in calendar days.
- Reports use a half-open date range `[from, to)`.

### Money

- Numeric values are returned as JavaScript numbers by the service layer.
- Seeded currency is `IDR`.
- Amounts are rounded to two decimals in pure helpers. Reservation totals are
  calculated by PostgreSQL with `numeric(12,2)`.

### Pagination

Every paginated method accepts:

```ts
interface PageParams {
  page?: number; // default 1
  pageSize?: number; // default 20, maximum 100
}
```

and returns:

```ts
interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

### Error envelope

```ts
type ApiResponse<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
        requestId?: string;
      };
    };
```

Error codes: `VALIDATION_ERROR`, `AUTHENTICATION_ERROR`,
`AUTHORIZATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `DATABASE_ERROR`,
`INTERNAL_ERROR`.

Supabase errors are mapped by the backend. Never display raw PostgreSQL
messages to end users.

## Auth

| Method | Input | Output |
| --- | --- | --- |
| `signUp(input)` | `SignUpInput` | `AuthResult` |
| `signIn(input)` | `SignInInput` | `AuthResult` |
| `signOut()` | none | `void` |
| `getCurrentUser()` | none | `CurrentUser \| null` |
| `requireUser()` | none | `CurrentUser` |

```ts
interface SignUpInput {
  email: string;
  password: string; // 8-72 characters
  fullName: string;
  phone?: string;
}

interface AuthResult {
  userId: string;
  email: string | null;
  session: Session | null;
  profile: ProfileWithRole | null;
  needsEmailConfirmation: boolean;
}

interface CurrentUser {
  id: string;
  email: string;
  profile: ProfileWithRole;
  role: "guest" | "receptionist" | "housekeeping" | "admin";
  permissions: string[];
}
```

Signup always creates a guest profile through the database auth trigger. Staff
accounts are promoted by an admin after creation.

## Users and roles

| Method | Input | Output |
| --- | --- | --- |
| `users.getProfile(profileId)` | UUID | `ProfileWithRole` |
| `users.updateProfile(input)` | `UpdateProfileInput` | `ProfileWithRole` |
| `users.listProfiles(input)` | `ListProfilesInput` | `Paginated<ProfileWithRole>` |
| `users.assignRole(input)` | `{ profileId, role }` | `ProfileWithRole` |
| `roles.getRoles()` | none | `Role[]` |
| `roles.getPermissions()` | none | `Permission[]` |
| `roles.getRolePermissions(roleId)` | UUID | `string[]` (permission codes) |

`updateProfile` affects only the authenticated caller. `assignRole` is
admin-only and also guarded by a database trigger.

`ListProfilesInput`:

```ts
{
  page?: number;
  pageSize?: number;
  search?: string;
  role?: "guest" | "receptionist" | "housekeeping" | "admin";
  isActive?: boolean;
}
```

## Rooms, room types, and facilities

| Method | Input | Output |
| --- | --- | --- |
| `rooms.getRooms(input)` | `ListRoomsInput` | `Paginated<RoomWithType>` |
| `rooms.getRoomById(id)` | UUID | `RoomWithType` |
| `rooms.createRoom(input)` | `CreateRoomInput` | `RoomWithType` |
| `rooms.updateRoom(id, input)` | UUID + `UpdateRoomInput` | `RoomWithType` |
| `rooms.updateRoomStatus(id, input)` | UUID + status input | `RoomWithType` |
| `roomTypes.getRoomTypes(activeOnly?)` | boolean | `RoomTypeWithFacilities[]` |
| `roomTypes.getRoomTypeById(id)` | UUID | `RoomTypeWithFacilities` |
| `roomTypes.createRoomType(input)` | `CreateRoomTypeInput` | `RoomTypeWithFacilities` |
| `roomTypes.updateRoomType(id, input)` | UUID + input | `RoomTypeWithFacilities` |
| `facilities.getFacilities(activeOnly?)` | boolean | `Facility[]` |
| `facilities.getFacilityById(id)` | UUID | `Facility` |
| `facilities.createFacility(input)` | `CreateFacilityInput` | `Facility` |
| `facilities.updateFacility(id, input)` | UUID + input | `Facility` |

`ListRoomsInput`:

```ts
{
  page?: number;
  pageSize?: number;
  roomTypeId?: string;
  occupancyStatus?: "available" | "reserved" | "occupied";
  housekeepingStatus?: "clean" | "dirty" | "cleaning";
  isActive?: boolean;
  search?: string;
}
```

Room creation defaults `floor` to 1. Room status updates are restricted by the
database guard trigger:

- Receptionist: occupancy only.
- Housekeeping: housekeeping status only.
- Admin: anything.

## Pricing

| Method | Input | Output |
| --- | --- | --- |
| `pricing.getRoomRates(input)` | `{ roomTypeId?, activeOnly? }` | `RoomRate[]` |
| `pricing.getApplicableRate(roomTypeId, date)` | UUID + date | `number \| null` |
| `pricing.createRoomRate(input)` | rate input | `RoomRate` |

```ts
interface CreateRoomRateInput {
  roomTypeId: string;
  ratePerNight: number;
  currency?: string; // default IDR
  validFrom: string;
  validTo?: string | null;
  // validTo must be after validFrom
}
```

Active rate windows for the same room type may not overlap. This is enforced by
a PostgreSQL exclusion constraint.

## Reservations

| Method | Input | Output |
| --- | --- | --- |
| `reservations.createReservation(input)` | `CreateReservationInput` | `ReservationWithRelations` |
| `reservations.getReservationById(id)` | UUID | `ReservationWithRelations` |
| `reservations.getReservations(input)` | `ListReservationsInput` | `Paginated<ReservationSummary>` |
| `reservations.updateReservation(id, input)` | UUID + fields | `ReservationWithRelations` |
| `reservations.confirmReservation({ reservationId })` | UUID | `ReservationWithRelations` |
| `reservations.cancelReservation({ reservationId, reason? })` | input | `ReservationWithRelations` |

```ts
interface CreateReservationInput {
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number; // default 1
  children?: number; // default 0
  roomCount?: number; // default 1
  specialRequests?: string | null;
  guestId?: string | null; // staff only; guests may only book themselves
}
```

Creation is executed by `create_reservation` in PostgreSQL. The database:

- Requires an authenticated caller.
- Allows guests to book only themselves; staff may pass `guestId`.
- Rejects past check-in dates.
- Requires check-out after check-in.
- Checks guest count against room capacity × room count.
- Resolves the active rate on the check-in date.
- Calculates nights and total.
- Creates the reservation with status `pending`.
- Creates the matching `unpaid` payment record.

`updateReservation` accepts only `specialRequests`, `adults`, and `children`.
Identity, stay, and pricing fields are immutable to non-admins.

`ListReservationsInput`:

```ts
{
  page?: number;
  pageSize?: number;
  status?: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
  guestId?: string;
  roomTypeId?: string;
  code?: string;
  from?: string; // overlaps filter
  to?: string;   // overlaps filter
}
```

## Availability

| Method | Input | Output |
| --- | --- | --- |
| `availability.checkRoomAvailability(roomId, checkIn, checkOut)` | UUID + dates | `boolean` |
| `availability.getAvailableRooms(query)` | `AvailabilityQuery` | `RoomWithType[]` |
| `availability.getRoomTypeAvailability(query)` | `AvailabilityQuery` | `RoomTypeAvailability[]` |

```ts
interface AvailabilityQuery {
  checkInDate: string;
  checkOutDate: string;
  roomTypeId?: string;
  guests?: number;
}

interface RoomTypeAvailability {
  roomTypeId: string;
  roomTypeName: string;
  capacity: number;
  availableRooms: number;
  ratePerNight: number | null;
}
```

Availability considers active physical rooms and active allocations for the
full stay. It does not count unallocated pending reservations as inventory
holds; see [Business rules](BUSINESS-RULES.md). All availability methods validate
the input with Zod. When `guests` is provided, room types whose per-room
capacity is below that number are omitted.

The database checks allocation availability through a `security definer` helper
so anonymous and guest callers can get a correct boolean without being allowed
to read other guests' allocation rows.

## Room allocation

| Method | Input | Output |
| --- | --- | --- |
| `roomAllocation.allocateRoom({ reservationId, roomId })` | input | `ReservationRoom` |
| `roomAllocation.releaseRoom({ reservationRoomId, reason? })` | input | `ReservationRoom` |
| `roomAllocation.getAllocations({ reservationId?, roomId?, activeOnly? })` | filters | `AllocationWithRoom[]` |

Only receptionists and admins may allocate or release. Allocation is limited to
`pending` or `confirmed` reservations and to the reservation's room type. The
database exclusion constraint is the final double-booking guard.

## Check-in and check-out

| Method | Input | Output |
| --- | --- | --- |
| `checkInOut.checkIn(reservationId)` | UUID | `Reservation` |
| `checkInOut.checkOut(reservationId)` | UUID | `Reservation` |
| `checkInOut.getStayRecords(input)` | `ListStayRecordsInput` | `Paginated<StayRecordWithRoom>` |

Check-in requires:

- A `confirmed` reservation.
- Exactly `room_count` active allocations.
- Every allocated room marked `clean`.

The database does not require today to be the reservation's check-in date and
does not require payment to be `paid`. The frontend should surface warnings if
the hotel wants stricter operational policy.

Check-out:

- Requires a `checked_in` reservation.
- Sets open stay records' `checked_out_at`.
- Releases allocations.
- Marks rooms available.
- Creates a `checkout_clean` task with status `dirty`.
- Marks the reservation `completed`.

`ListStayRecordsInput`:

```ts
{
  page?: number;
  pageSize?: number;
  reservationId?: string;
  roomId?: string;
  openOnly?: boolean;
}
```

## Payments

| Method | Input | Output |
| --- | --- | --- |
| `payments.getPaymentByReservation(reservationId)` | UUID | `Payment \| null` |
| `payments.createPaymentRecord(input)` | `{ reservationId, method, notes? }` | `Payment` |
| `payments.updatePaymentStatus(input)` | `{ paymentId, status, method?, notes? }` | `Payment` |

`createPaymentRecord` derives `amount` and `currency` from the reservation. It
rejects missing, cancelled, or reservations that already have a payment record.
There is one payment record per reservation. Every reservation already receives
an `unpaid` row during creation, so this method is intended for backfill/repair
rather than the normal booking flow.

`status` is `unpaid` or `paid`. Marking paid sets `paid_at`; reverting to unpaid
clears it. The database trigger enforces amount and currency equality.
`method` is optional at the database level when updating status.

## Housekeeping

| Method | Input | Output |
| --- | --- | --- |
| `housekeeping.getHousekeepingTasks(input)` | `ListHousekeepingTasksInput` | `Paginated<HousekeepingTaskWithRoom>` |
| `housekeeping.getHousekeepingTask(id)` | UUID | `HousekeepingTaskWithRoom` |
| `housekeeping.createHousekeepingTask(input)` | task input | `HousekeepingTask` |
| `housekeeping.updateHousekeepingTask(id, input)` | UUID + input | `HousekeepingTaskWithRoom` |

```ts
interface ListHousekeepingTasksInput {
  page?: number;
  pageSize?: number;
  status?: "clean" | "dirty" | "cleaning";
  roomId?: string;
  assignedTo?: string;
  taskType?: "checkout_clean" | "stayover_clean" | "deep_clean" | "inspection";
  openOnly?: boolean;
}
```

Task status updates synchronize `rooms.housekeeping_status`. Housekeeping users
may only change status and assignment, and only for tasks assigned to them or
unassigned.

## Reports

| Method | Input | Output |
| --- | --- | --- |
| `reports.getOccupancyReport({ from, to })` | half-open date range | `OccupancyReport` |
| `reports.getRevenueReport({ from, to })` | half-open date range | `RevenueReport` |
| `reports.getTodaySummary()` | none | `TodaySummary` |

```ts
interface OccupancyReport {
  from: string;
  to: string;
  days: number;
  total_rooms: number;
  occupied_room_nights: number;
  available_room_nights: number;
  occupancy_rate: number;
}

interface RevenueReport {
  from: string;
  to: string;
  reservations_created: number;
  gross_reservation_value: number;
  paid_amount: number;
  unpaid_amount: number;
}
```

The report RPCs are admin-only. `getTodaySummary` is restricted to
receptionists and admins by the service and returns room, arrival, in-house,
departure, pending-reservation, and unpaid-payment counters for the dashboard.
The summary date is the current UTC date.

## Direct database RPCs

Advanced callers may use `supabase.rpc(...)`, but the service layer is
recommended because it validates input and normalizes errors. The public RPC
names and parameter names are defined in:

- `supabase/migrations/20260101000600_business_functions.sql`
- `src/shared/types/database.types.ts`

Sensitive functions are granted only to `authenticated`, and reports are
additionally admin-checked inside the function.
