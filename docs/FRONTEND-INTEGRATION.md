# Frontend Integration

This repository contains no pages, components, or HTTP endpoints. A React or
Next.js application consumes the TypeScript service layer directly, or wraps it
in route handlers and server actions.

## 1. Install and configure

The backend package lives in this repository. In a monorepo, import it through
a workspace package or a path alias. The supported package exports are the
TypeScript source under `src/`; run the frontend with a bundler that transpiles
TypeScript.

Environment variables:

```dotenv
# Browser-safe
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>

# Server-only (scripts and trusted jobs; never in a browser bundle)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<local anon key>
SUPABASE_SERVICE_ROLE_KEY=<local service-role key>
```

Vite projects pass values explicitly:

```ts
import { createBrowserSupabaseClient } from "@/backend/lib/supabase/client";

const supabase = createBrowserSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
```

Only the URL and anon key may reach the browser. `SUPABASE_SERVICE_ROLE_KEY`
bypasses RLS. It is intentionally not exported from `src/backend/index.ts`, and
the admin client module throws if used in a browser window.

## 2. Compose the backend

### Browser client

```ts
import { createBackend } from "@/backend";
import { getBrowserSupabaseClient } from "@/backend/lib/supabase/client";

const supabase = getBrowserSupabaseClient();
const backend = createBackend(supabase);
```

`getBrowserSupabaseClient()` reuses one client per tab, persists the session,
refreshes tokens, and uses PKCE. Use it for client components that need
interactive reads or writes.

### Server client with a user token

```ts
import { createBackend } from "@/backend";
import { createServerSupabaseClient } from "@/backend/lib/supabase/server";

export async function GET(request: Request) {
  const accessToken = readAccessTokenFromCookies(request);
  const supabase = createServerSupabaseClient({ accessToken });
  const backend = createBackend(supabase);
  // RLS runs as the user represented by the token.
}
```

The server client never persists a session. For Next.js App Router
cookie-based sessions, use `@supabase/ssr` in the app's infrastructure layer,
then pass its client directly to `createBackend` or extract the access token
for `createServerSupabaseClient`.

### Service-role client

```ts
// Trusted server code only. Not re-exported from src/backend/index.ts.
import { getAdminSupabaseClient } from "@/backend/lib/supabase/admin";
```

Use it only for maintenance jobs, test setup, or admin-only account
provisioning. Never return its responses unfiltered to ordinary users.

## 3. Authentication

### Sign up

```ts
const result = await backend.auth.signUp({
  email: "guest@example.com",
  password: "a-long-password",
  fullName: "Guest Name",
  phone: "081200000000",
});
```

The database trigger creates a `guest` profile. Client metadata can never grant
a staff role.

- `result.needsEmailConfirmation === true`: show "check your email" and do not
  expect a session yet.
- Local Supabase has `enable_confirmations = false`, so signup normally returns
  a session. Hosted projects may require confirmation.
- Staff accounts are not created by signup. Create the auth user through a
  trusted admin flow, then promote the profile with `users.assignRole`. There
  is no invitation UI or admin user-creation service in this repository.

### Sign in and current user

```ts
const { userId, session } = await backend.auth.signIn({ email, password });
const user = await backend.auth.requireUser();
// user.role: "guest" | "receptionist" | "housekeeping" | "admin"
// user.permissions: string[]
```

Call `requireUser()` in layouts, route handlers, or server actions before
rendering role-specific screens. It throws `AUTHENTICATION_ERROR` when there is
no session and `NOT_FOUND` when an auth user has no profile.

Use `auth.getCurrentUser()` when a signed-out state is normal; it returns
`null` instead of throwing.

### Role-aware rendering

Permission codes are UI hints. RLS and database functions are the security
boundary.

```ts
const canManagePayments = user.permissions.includes("payment.manage");
const isStaff = user.role === "receptionist" || user.role === "admin";
```

Never rely on hidden buttons for security. A caller can always issue Supabase
requests manually.

## 4. Recommended screens and calls

| Screen | Role | Primary calls |
| --- | --- | --- |
| Home / catalogue | Public | `roomTypes.getRoomTypes(true)`, `facilities.getFacilities(true)`, `pricing.getRoomRates({ activeOnly: true })` |
| Room search | Public or guest | `availability.getRoomTypeAvailability(query)` |
| Room detail | Public or guest | `availability.getAvailableRooms(query)` |
| Register / login | Public | `auth.signUp`, `auth.signIn` |
| Guest dashboard | Guest | `auth.requireUser`, `reservations.getReservations`, `payments.getPaymentByReservation` |
| Booking form | Guest or staff | `reservations.createReservation` |
| My reservation | Guest | `reservations.getReservationById`, `reservations.cancelReservation` |
| Reservation list | Receptionist/Admin | `reservations.getReservations`, `reservations.confirmReservation` |
| Room allocation | Receptionist/Admin | `availability.getAvailableRooms`, `roomAllocation.allocateRoom`, `roomAllocation.releaseRoom` |
| Check-in / check-out | Receptionist/Admin | `checkInOut.checkIn`, `checkInOut.checkOut` |
| Payments | Receptionist/Admin | `payments.updatePaymentStatus` |
| Housekeeping board | Housekeeping/Admin | `housekeeping.getHousekeepingTasks`, `housekeeping.updateHousekeepingTask` |
| Room configuration | Admin | `rooms`, `roomTypes`, `facilities`, `pricing` create/update methods |
| Reports | Admin | `reports.getOccupancyReport`, `reports.getRevenueReport`, `reports.getTodaySummary` |
| User administration | Admin | `users.listProfiles`, `users.assignRole`, `roles.getRoles` |

## 5. Guest booking flow

```ts
const query = {
  checkInDate: "2026-12-10",
  checkOutDate: "2026-12-12",
  guests: 2,
};

const types = await backend.availability.getRoomTypeAvailability(query);
if (types.length === 0) {
  // Show an empty state.
}

const rooms = await backend.availability.getAvailableRooms({
  ...query,
  roomTypeId: types[0]!.roomTypeId,
});

const reservation = await backend.reservations.createReservation({
  roomTypeId: types[0]!.roomTypeId,
  checkInDate: query.checkInDate,
  checkOutDate: query.checkOutDate,
  adults: 2,
  children: 0,
  roomCount: 1,
  specialRequests: "High floor if possible",
});

// The database created the unpaid payment record in the same transaction.
const payment = reservation.payment;
```

Do not call `payments.createPaymentRecord` in the normal booking flow. Every
reservation already has exactly one payment row. That method exists to repair or
backfill a missing record and rejects duplicates.

Guests omit `guestId`; the database uses the authenticated user. Receptionists
and admins may pass `guestId` to book for a guest.

The created reservation is `pending`. It does not occupy a physical room until
reception allocates one. The original design brief says "Confirmed" after
booking; this implementation deliberately separates request (`pending`) from
staff confirmation. See [Business rules](BUSINESS-RULES.md).

## 6. Reception and operations flow

```ts
await backend.reservations.confirmReservation({ reservationId });

const available = await backend.availability.getAvailableRooms({
  roomTypeId: reservation.room_type_id,
  checkInDate: reservation.check_in_date,
  checkOutDate: reservation.check_out_date,
});

await backend.roomAllocation.allocateRoom({
  reservationId,
  roomId: available[0]!.id,
});

await backend.checkInOut.checkIn(reservationId);
// At departure:
await backend.checkInOut.checkOut(reservationId);
```

Important behavior:

- Allocation requires a matching room type and a `pending` or `confirmed`
  reservation.
- The GiST exclusion constraint rejects overlapping active allocations, even
  under concurrent requests. Surface the resulting `CONFLICT` as "room no longer
  available" and refresh the room list.
- Check-in requires a `confirmed` reservation, exactly `room_count` active
  allocations, and every allocated room to be `clean`.
- Check-out releases the rooms, closes stay records, and creates housekeeping
  tasks. It does not require payment to be `paid`.
- Check-in currently does not reject an early or late date. The UI should warn
  staff, but the database does not enforce the calendar date.

## 7. Housekeeping flow

```ts
const tasks = await backend.housekeeping.getHousekeepingTasks({
  openOnly: true,
  assignedTo: user.id,
});

await backend.housekeeping.updateHousekeepingTask(task.id, {
  status: "cleaning",
});
```

Task status is synchronized into `rooms.housekeeping_status` by a trigger.
Housekeeping users may update only assigned or unassigned tasks, and may change
only status and assignment. Receptionists and admins can read tasks; admins can
manage all fields.

Room occupancy (`available`, `reserved`, `occupied`) and cleanliness (`clean`,
`dirty`, `cleaning`) are independent. Do not derive one from the other in the
UI without checking both.

## 8. Error handling

Services throw `AppError` subclasses. At an HTTP or server-action boundary:

```ts
import { AppError, toApiFailure, type ApiResponse } from "@/backend";

try {
  const data = await backend.reservations.createReservation(input);
  return Response.json({ success: true, data } satisfies ApiResponse<typeof data>);
} catch (error) {
  const failure = toApiFailure(error, requestId);
  const status = error instanceof AppError ? error.status : 500;
  return Response.json(failure, { status });
}
```

`AppError` is exported from `src/backend`. It exposes `code`, `status`, `message`,
and optional `details`.

| Code | Suggested UI behavior |
| --- | --- |
| `VALIDATION_ERROR` | Highlight fields; show a corrected message |
| `AUTHENTICATION_ERROR` | Redirect to login or refresh the session |
| `AUTHORIZATION_ERROR` | Show "not allowed"; do not retry with another role |
| `NOT_FOUND` | Refresh the list or show a deleted/expired state |
| `CONFLICT` | Refresh availability or current state before retrying |
| `DATABASE_ERROR` | Show a generic failure and log the request ID |
| `INTERNAL_ERROR` | Show a generic failure; never show raw database text |

Do not display PostgreSQL messages directly. The mapper intentionally replaces
most raw errors with safe messages.

## 9. Dates, money, and pagination

- Send calendar dates as strict `YYYY-MM-DD`.
- Send and display timestamps as ISO 8601; let the app decide the local timezone.
- `getTodaySummary()` uses the UTC date. If the hotel operates in a different
  timezone, compute the business date in the server or app layer and treat the
  summary as UTC unless the backend is extended.
- Money is `numeric(12,2)` in PostgreSQL and arrives as a JavaScript number.
  Seeded currency is IDR.
- Paginated methods default to page 1, 20 rows, maximum 100. Responses include
  `items`, `page`, `pageSize`, `total`, and `totalPages`.

## 10. Next.js and React notes

- Keep service calls on the client when interactive; use a server client when
  secrets, cookies, or server-only logic are involved.
- Do not cache user-specific reservations or profiles in a shared CDN cache.
- Server actions should validate with the same Zod schemas if they accept
  untrusted form data before calling the services.
- The service layer already validates inputs, but field-level form errors are
  easier to render from the Zod schema before submission.
- Realtime subscriptions are not configured. The local Supabase config enables
  Realtime, but tables have not been added to a publication. Use refetch or
  explicit polling.
- File uploads, avatars, and room images have no storage bucket or table in this
  foundation.
- The repository does not include a generated Supabase database type. Import
  the hand-maintained `Database` type from `@/backend` until the schema is
  regenerated in a Docker-capable environment.

## 11. Ground rules

1. Never ship the service-role key to the browser.
2. Never write `profiles.role_id`, `profiles.is_active`, or `profiles.email`
   directly from ordinary client code. Role/active changes are admin-only; email
   changes belong to Supabase Auth.
3. Never invent reservation statuses; use the documented transitions.
4. Treat the database as authoritative for rate, nights, total, availability,
   and permissions.
5. Refresh after mutations instead of mutating local state optimistically when
   the operation depends on room availability or reservation status.
6. Keep the frontend's role checks aligned with
   [ROLE-PERMISSIONS.md](ROLE-PERMISSIONS.md), not only with the permission
   catalogue.
