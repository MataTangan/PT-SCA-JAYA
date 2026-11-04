# Architecture

## Shape

Hotel SCA is a modular monolith. One Supabase project provides PostgreSQL,
authentication, and the PostgREST data API. The backend is a TypeScript service
layer over that project; it does not run its own web server.

```text
React / Next.js
      |
      | supabase-js (anon key + user session)
      v
Supabase Auth + PostgREST + PostgreSQL RPCs
      |
      | RLS, constraints, triggers, transactional functions
      v
PostgreSQL
```

Server-side code such as Next.js server actions can call the same service layer
with a server client that carries the user's access token. The service-role
admin client is reserved for trusted scripts and maintenance jobs.

## Layers

### 1. Shared contracts

`src/shared` contains the public, framework-neutral contract:

- `schemas/` - Zod input validation and normalization.
- `types/database.types.ts` - hand-maintained Supabase table/function types.
- `types/domain.ts` - composed row types and report shapes.
- `types/contracts.ts` - generic API envelope and pagination.
- `constants/` - role slugs, statuses, error codes, and permissions.

No backend code may trust an input before it passes a Zod schema.

### 2. Repositories

Each module has a repository that performs Supabase queries or calls an RPC. It
returns typed rows and throws raw Supabase errors. Repositories do not contain
business rules beyond query construction and mapping.

### 3. Services

Services own validation, authorization intent, orchestration, and error
translation. They call one or more repository methods and always pass errors
through `mapSupabaseError`, except where a more specific domain error is
appropriate.

Services are created by a factory:

```ts
const backend = createBackend(supabaseClient);
await backend.reservations.createReservation(input);
```

The client determines the security context. `createBackend` does not create a
client and does not store global state.

### 4. Database enforcement

The database is the final authority:

- RLS controls which rows a caller can read or write.
- Guard triggers prevent privilege escalation and immutable-field changes even
  when a client talks to PostgREST directly.
- Transactional `security definer` functions implement multi-step workflows.
- Exclusion constraints prevent double booking under concurrency.

This is defense in depth. Application checks are for UX and early errors; they
are not the security boundary.

### 5. Composition root

`src/backend/index.ts` exposes:

```ts
export interface Backend {
  auth;
  users;
  roles;
  rooms;
  roomTypes;
  facilities;
  pricing;
  reservations;
  availability;
  roomAllocation;
  checkInOut;
  payments;
  housekeeping;
  reports;
}
```

The admin client is exported from its own module path only and is intentionally
absent from the root barrel. Importing it is an explicit server-only decision.

## Request flow examples

### Guest creates a reservation

```text
schema validation
  -> reservations service
  -> repository.rpc("create_reservation")
  -> PostgreSQL function checks auth, role, dates, capacity, rate
  -> inserts reservation and unpaid payment in one transaction
  -> repository reloads the joined reservation
```

### Receptionist checks in a guest

```text
schema validation
  -> check-in/out service
  -> repository.rpc("check_in_reservation")
  -> function validates status, allocation count, and cleanliness
  -> inserts stay records, marks rooms occupied, moves status to checked_in
```

### Availability search

```text
availability service
  -> load active room types
  -> rpc find_available_rooms for each type
  -> rpc get_applicable_rate for the check-in date
  -> group and sort the result in TypeScript
```

## Module responsibilities

| Module | Responsibility |
| --- | --- |
| `auth` | Signup, sign-in, sign-out, current user, permissions |
| `users` | Profiles and admin role assignment |
| `roles` | Role and permission catalogue reads |
| `rooms` | Physical room CRUD and operational status |
| `room-types` | Room type CRUD and facility links |
| `facilities` | Hotel/room facility CRUD |
| `pricing` | Rate windows and applicable nightly rate |
| `reservations` | Creation, reads, updates, confirm, cancel |
| `availability` | Room and room-type availability |
| `room-allocation` | Attach and release physical rooms |
| `check-in-out` | Stay records and room occupancy transitions |
| `payments` | Single payment record per reservation |
| `housekeeping` | Cleaning tasks and status |
| `reports` | Occupancy, revenue, and dashboard counters |

## Error model

All expected failures extend `AppError` and expose:

- `code` - stable machine-readable code.
- `status` - suggested HTTP status.
- `message` - safe client-facing message.
- `details` - optional structured context.

`mapSupabaseError` translates PostgreSQL/PostgREST codes:

| Database condition | Application error |
| --- | --- |
| Unique violation | `ConflictError` |
| Exclusion violation (`23P01`) | `ConflictError` (room unavailable) |
| Foreign key violation | `ValidationError` |
| Check/input violation | `ValidationError` |
| RLS/permission denied | `AuthorizationError` |
| Missing row | `NotFoundError` |
| Serialization/deadlock | `ConflictError` (retry) |
| Authentication failure | `AuthenticationError` |

`toApiFailure` converts any error into the `ApiFailure` envelope for route
handlers and server actions.

## Concurrency

The critical race is two staff allocating the same room for overlapping stays.
The database owns the solution:

```sql
constraint reservation_rooms_no_overlap exclude using gist (
  room_id with =,
  stay with &&
) where (released_at is null)
```

The allocation RPC locks the reservation row while it checks `room_count`, and
the exclusion constraint serializes the physical room booking. If two
transactions race, PostgreSQL rejects one with `23P01`, which becomes a
`ConflictError`.

## Extending the backend

1. Add or change the database migration.
2. Update `src/shared/types/database.types.ts` or regenerate it.
3. Add Zod schemas for new input.
4. Add repository methods.
5. Add service methods with validation and error mapping.
6. Export the module from `src/backend/index.ts`.
7. Add unit/integration tests and, for database behavior, pgTAP tests.
8. Update the relevant documentation.

See [Development guide](DEVELOPMENT-GUIDE.md) for the detailed checklist.

## Non-goals

- No UI, page routes, or React components.
- No custom password hashing or custom auth tables.
- No service-role key in browser code.
- No in-memory business state shared between requests.
- No provider-specific framework assumptions.
