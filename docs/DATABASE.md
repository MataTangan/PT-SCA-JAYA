# Database

## Overview

The database is PostgreSQL managed by Supabase. It is the authoritative layer
for identity, authorization, pricing, availability, reservations, payments, and
housekeeping.

- Primary keys: UUID (`gen_random_uuid()`).
- Dates: `date` for calendar stays, `timestamptz` for audit timestamps.
- Money: `numeric(12,2)`; seeded currency is IDR.
- Every mutable table has `created_at` and `updated_at`; the latter is stamped
  by a shared trigger.
- Foreign keys use explicit `on delete` behavior.
- Enums are used for reservation, payment, occupancy, and housekeeping states.
- Extensions: `pgcrypto` (in `extensions`) and `btree_gist` (in `public`).

## Migration order

| Migration | Contents |
| --- | --- |
| `20260101000000_extensions_and_enums.sql` | Extensions, enums, `set_updated_at`, `stay_nights` |
| `20260101000100_core_auth_and_roles.sql` | Roles, permissions, profiles, auth trigger, auth helpers, profile guard |
| `20260101000200_rooms_and_facilities.sql` | Room types, rooms, facilities, mapping, room guard |
| `20260101000300_pricing.sql` | Room rates, rate exclusion constraint, applicable-rate function |
| `20260101000400_reservations.sql` | Reservations, allocations, exclusion constraint, lifecycle/immutability triggers |
| `20260101000500_payments_stays_housekeeping.sql` | Payments, stay records, housekeeping tasks and guards |
| `20260101000600_business_functions.sql` | Availability, creation, lifecycle, allocation, check-in/out, reports |
| `20260101000700_enable_rls.sql` | Enables RLS on every application table |
| `20260101000800_rls_policies.sql` | Policies for anon, authenticated, and role-specific access |
| `20260101000900_grants.sql` | Table/sequence/function grants |

Migrations must be applied in filename order. Do not edit an applied migration
in a shared environment; add a new migration instead.

## Enums

| Enum | Values |
| --- | --- |
| `reservation_status` | `pending`, `confirmed`, `checked_in`, `completed`, `cancelled` |
| `payment_status` | `unpaid`, `paid` |
| `payment_method` | `cash`, `bank_transfer`, `credit_card`, `debit_card`, `ewallet` |
| `occupancy_status` | `available`, `reserved`, `occupied` |
| `housekeeping_status` | `clean`, `dirty`, `cleaning` |
| `housekeeping_task_type` | `checkout_clean`, `stayover_clean`, `deep_clean`, `inspection` |

Reservation, payment, occupancy, and housekeeping states are deliberately
separate. A room can be `occupied` and `dirty`; a reservation can be `pending`
with an `unpaid` payment; and housekeeping status is not a reservation status.

## Tables

### `roles`

Application role catalogue.

- `id uuid` primary key.
- `slug text` unique, lowercase format check.
- `name text`, `description text`, `is_system boolean`.
- Seeded slugs: `guest`, `receptionist`, `housekeeping`, `admin`.

### `permissions`

Fine-grained permission catalogue.

- `code text` unique, format `module.action`.
- `module text`, `description text`.
- RLS is primary enforcement; permission codes are also exposed to the frontend
  for menu/button decisions.

### `role_permissions`

Many-to-many mapping.

- Composite primary key `(role_id, permission_id)`.
- Cascades when a role or permission is deleted.

### `profiles`

Public application profile, one-to-one with `auth.users`.

- `id uuid` primary key, references `auth.users(id)` on delete cascade.
- `email text`, `full_name text`, `phone text`.
- `role_id uuid` references `roles(id)` on delete restrict.
- `is_active boolean`.
- Unique lower-case email index.
- Created automatically by `handle_new_user()` for new auth users.
- `guard_profile_update` prevents non-admin callers from changing `role_id`,
  `is_active`, or `email` directly. Email changes must go through Supabase Auth;
  `handle_user_email_change()` synchronizes the profile as a trusted internal
  update. The auth trigger always grants `guest`; client metadata cannot grant a
  staff role.

### `room_types`

- `code text` unique, `name text` unique.
- `capacity integer > 0`, `size_sqm numeric(6,2)`, `bed_type text`.
- `is_active boolean`.
- Seeded: Standard (2), Deluxe (3), Suite (4).

### `rooms`

- `room_number text` unique.
- `room_type_id uuid` references `room_types`.
- `floor integer >= 0`.
- `occupancy_status occupancy_status` default `available`.
- `housekeeping_status housekeeping_status` default `clean`.
- `is_active boolean`.
- Indexes for type, occupancy, housekeeping, active rows, and number search.

### `facilities`

- `code text` unique.
- `name text`, `description text`, `icon text`.
- `category text` constrained to `hotel` or `room`.
- `is_active boolean`.

### `room_type_facilities`

- Composite primary key `(room_type_id, facility_id)`.
- Cascades with either parent.

### `room_rates`

- `room_type_id uuid` references room types.
- `rate_per_night numeric(12,2) > 0`.
- `currency char(3)` default `IDR`.
- `valid_from date`, `valid_to date` nullable.
- `is_active boolean`.
- Check: `valid_to is null or valid_to > valid_from`.
- Exclusion constraint prevents two active rates for the same room type from
  overlapping. The effective window is `[valid_from, valid_to)`.
- `get_applicable_rate(room_type_id, date)` returns the matching rate.

### `reservations`

- `id uuid`, `reservation_code text` unique, generated as
  `SCA-YYYYMMDD-NNNN`.
- `guest_id uuid` references `profiles`.
- `room_type_id uuid` references `room_types`.
- `check_in_date date`, `check_out_date date`.
- `nights integer` must equal `check_out_date - check_in_date` and be positive.
- `room_count integer` 1-10.
- `adults integer > 0`, `children integer >= 0`.
- `status reservation_status` default `pending`.
- `rate_per_night numeric(12,2) > 0`.
- `total_amount numeric(12,2)` must equal `rate_per_night * nights * room_count`.
- `currency char(3)`.
- `created_by uuid` references profiles.
- `cancelled_at`, `cancellation_reason`.
- A cancelled reservation must have `cancelled_at`.
- Indexes for guest, status, room type, stay window, and code search.

### `reservation_rooms` (physical allocation)

- `reservation_id uuid`, `room_id uuid`.
- Stay dates, nights, rate, and subtotal are copied from the reservation by
  `prepare_reservation_room()`.
- `stay daterange` is generated from the dates, half-open `[check_in, check_out)`.
- `allocated_by`, `allocated_at`, `released_at`, `release_reason`.
- Active allocation = `released_at is null`.
- Unique partial index: one active allocation per `(reservation, room)`.
- **GiST exclusion constraint**: active allocations of the same room cannot
  overlap in time. This is the race-safe double-booking guard.
- Trigger also enforces room type match, active room, reservation status, and
  `room_count`.

### `payments`

- `reservation_id uuid` **unique** references reservations.
- `amount numeric(12,2) >= 0`.
- `currency char(3)` must match the reservation.
- `status payment_status` default `unpaid`.
- `method payment_method` nullable.
- `paid_at timestamptz`, `recorded_by`, `notes`.
- `prepare_payment()` enforces exactly the reservation total and currency, sets
  `paid_at` when paid, and clears it when unpaid.
- One full payment per reservation. Partial payments are not supported.

### `stay_records`

- One row per allocated physical room.
- `reservation_id`, `reservation_room_id` (unique), `room_id`.
- `checked_in_at`, `checked_in_by`, `checked_out_at`, `checked_out_by`.
- Check: checkout is after check-in when present.
- Open-stay index supports in-house searches.

### `housekeeping_tasks`

- `room_id`, optional `reservation_id`.
- `task_type`, `status`, `assigned_to`, `notes`, `created_by`.
- `started_at`, `completed_at`.
- `sync_housekeeping_task()` mirrors task status into
  `rooms.housekeeping_status` and maintains timestamps.
- `guard_housekeeping_task_update` limits housekeeping to status/assignment.

## Business functions

| Function | Security | Purpose |
| --- | --- | --- |
| `current_user_role()` | definer | Role slug of `auth.uid()` |
| `is_admin()` / `is_staff()` | definer | Role predicates |
| `has_permission(code)` | definer | Permission check with admin override |
| `get_applicable_rate(type, date)` | invoker/stable | Nightly rate lookup |
| `check_room_availability(room, in, out)` | definer/stable | Room free for full stay; hides allocations while returning a boolean |
| `find_available_rooms(type, in, out)` | invoker/stable | Free rooms of a type |
| `create_reservation(...)` | definer | Validate input, calculate totals, insert reservation + unpaid payment |
| `confirm_reservation(id)` | definer | Staff-only pending -> confirmed |
| `cancel_reservation(id, reason)` | definer | Owner or staff; releases allocations |
| `allocate_room(reservation, room)` | definer | Staff-only allocation |
| `release_room(allocation, reason)` | definer | Staff-only release |
| `check_in_reservation(id)` | definer | Staff-only, requires allocation and clean rooms |
| `check_out_reservation(id)` | definer | Staff-only, releases rooms and creates cleaning tasks |
| `report_occupancy(from, to)` | definer | Admin-only occupancy metrics |
| `report_revenue(from, to)` | definer | Admin-only revenue metrics |

All mutating functions re-check authentication and role/ownership in SQL. The
browser cannot pass a role or bypass these checks. Table-level and function-level
grants are in `20260101000900_grants.sql`.

## Triggers and guards

| Trigger | Table | Purpose |
| --- | --- | --- |
| `*_set_updated_at` | all mutable tables | Maintain `updated_at` |
| `on_auth_user_created` | `auth.users` | Create guest profile |
| `on_auth_user_email_changed` | `auth.users` | Synchronize profile email |
| `profiles_guard_update` | profiles | Block role, active-status, and email escalation |
| `rooms_guard_update` | rooms | Role-specific room edits |
| `reservations_enforce_status_transition` | reservations | Allowed status transitions |
| `reservations_guard_update` | reservations | Immutable identity/pricing |
| `reservation_rooms_prepare` | reservation_rooms | Copy stay/pricing; validate allocation |
| `payments_prepare` | payments | Amount/currency consistency |
| `housekeeping_tasks_guard_update` | housekeeping_tasks | Limit housekeeping edits |
| `housekeeping_tasks_sync` | housekeeping_tasks | Mirror cleanliness to rooms |

Trusted SQL contexts without an end-user JWT (migrations, seed, service-role
maintenance) bypass the profile/room/reservation/housekeeping update guards.
RLS still applies to every PostgREST request.

## RLS and grants

RLS is enabled on all 14 application tables. The complete role matrix is in
[ROLE-PERMISSIONS.md](ROLE-PERMISSIONS.md).

Key patterns:

- Anonymous callers can read only active catalogue rows.
- Authenticated callers can read their own profile, reservations, allocations,
  payments, and stay records.
- Receptionists (`is_staff()`) can read operational data.
- Housekeeping can read tasks and update assigned/unassigned tasks and room
  cleanliness only.
- Admins can manage configuration and read reports.
- `security definer` workflows are used where a guest must write indirectly
  (create/cancel) or where staff need a multi-table transaction (allocation,
  check-in/out).

Explicit grants restrict what PostgREST exposes. RLS is not replaced by grants;
both are required.

## Seed data

`supabase/seed.sql` is deterministic and safe for local development only.

- 4 roles and 22 permission codes.
- 6 auth users and profiles (3 guests, receptionist, housekeeping, admin).
- 3 room types and 6 physical rooms.
- 15 facilities and room-type mappings.
- 3 active rates.
- 5 reservations in varied states (pending, confirmed, checked-in, completed,
  cancelled), with allocations, payments, stays, and housekeeping tasks.
- Demo password: `Demo1234!`.

The seed is intended to be run with:

```bash
npm run db:reset
```

## Generated types

`src/shared/types/database.types.ts` is hand-maintained because the local
Supabase stack was not available during implementation. It mirrors the schema
and includes `Relationships: []` for every table, which `supabase-js` requires.

After a real schema change, regenerate with:

```bash
npm run db:types
```

The script writes `src/shared/types/database.generated.ts`. Compare it with the
hand-maintained file and switch imports only after reviewing the diff.

## Verification status

The SQL migrations, seed, and pgTAP tests have **not been executed** in this
environment because Docker/Supabase Local is unavailable. Unit and mocked
integration tests do not prove SQL correctness. Run:

```bash
npm run db:start
npm run db:reset
npm run test:db
```

in a Docker-capable environment before relying on the database in production.
