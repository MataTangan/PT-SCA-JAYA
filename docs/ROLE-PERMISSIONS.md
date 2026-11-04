# Role Permissions

There are four application roles: `guest`, `receptionist`, `housekeeping`, and
`admin`. Authorization is enforced in this order:

1. PostgreSQL grants decide which tables and functions are reachable.
2. Row Level Security (RLS) decides which rows may be read or written.
3. Guard triggers block privilege escalation and immutable-field changes.
4. `security definer` RPCs re-check the caller's role and data ownership.
5. The service layer validates input and normalizes errors for the UI.

The permission catalogue is a UI hint. It is not the security boundary, and it
does not list every readable resource. The database policies below are the
authoritative matrix.

## Role summary

| Role | Purpose | Main capabilities |
| --- | --- | --- |
| Guest | Hotel customer | Browse the public catalogue, check availability, manage their own profile and reservations, view their own payment and stay data |
| Receptionist | Front desk | Read operational data, create/confirm/cancel reservations, allocate rooms, check guests in and out, record payments, manage room occupancy, read and update housekeeping tasks |
| Housekeeping | Room readiness | Read rooms and all tasks, update assigned/unassigned task status and assignment; cannot read reservations or change occupancy |
| Admin | Hotel administrator | Manage roles, users, rooms, room types, facilities, rates, reservations, payments, housekeeping, and reports |

## Permission catalogue

This is the seed in `supabase/seed.sql`. Admin receives every permission code.
The permission codes are exposed by `auth.getCurrentUser()` for menu and button
decisions.

| Code | Module | Guest | Receptionist | Housekeeping | Admin |
| --- | --- | :---: | :---: | :---: | :---: |
| `profile.read` | users | Yes | Yes | Yes | Yes |
| `profile.update` | users | Yes | - | - | Yes |
| `role.read` | roles | - | - | - | Yes |
| `role.manage` | roles | - | - | - | Yes |
| `room.read` | rooms | Yes | Yes | Yes | Yes |
| `room.manage` | rooms | - | - | - | Yes |
| `facility.manage` | facilities | - | - | - | Yes |
| `rate.read` | pricing | Yes | Yes | - | Yes |
| `rate.manage` | pricing | - | - | - | Yes |
| `reservation.read` | reservations | Yes | Yes | - | Yes |
| `reservation.create` | reservations | Yes | Yes | - | Yes |
| `reservation.manage` | reservations | - | Yes | - | Yes |
| `reservation.cancel` | reservations | Yes | Yes | - | Yes |
| `availability.read` | availability | Yes | Yes | - | Yes |
| `allocation.manage` | room-allocation | - | Yes | - | Yes |
| `checkin.manage` | check-in-out | - | Yes | - | Yes |
| `checkout.manage` | check-in-out | - | Yes | - | Yes |
| `payment.read` | payments | Yes | Yes | - | Yes |
| `payment.manage` | payments | - | Yes | - | Yes |
| `housekeeping.read` | housekeeping | - | Yes | Yes | Yes |
| `housekeeping.update` | housekeeping | - | Yes | Yes | Yes |
| `report.read` | reports | - | - | - | Yes |

The maintenance UI should still hide actions that the database will reject. For
example, a guest has `reservation.create` but may only book for themselves. A
receptionist has `reservation.manage` but cannot rewrite identity, stay, or
pricing fields.

## Actual database capability matrix

### Public catalogue

| Action | Guest | Receptionist | Housekeeping | Admin | Anonymous |
| --- | :---: | :---: | :---: | :---: | :---: |
| Read active room types | Yes | Yes | Yes | Yes | Yes |
| Read active physical rooms | Yes | Yes | Yes | Yes | Yes |
| Read active facilities and mappings | Yes | Yes | Yes | Yes | Yes |
| Read active room rates | Yes | Yes | Yes | Yes | Yes |
| Read inactive catalogue rows | - | - | - | Yes | - |
| Create/update/delete catalogue | - | - | - | Yes | - |

### Profiles and roles

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Read own profile | Yes | Yes | Yes | Yes |
| Read every profile | - | Yes | - | Yes |
| Update own name/phone | Yes | Yes | Yes | Yes |
| Change role or active flag | - | - | - | Yes |
| Read role/permission catalogue | Yes | Yes | Yes | Yes |
| Manage roles/permissions | - | - | - | Yes |
| List profiles | - | Yes | - | Yes |
| Assign a role | - | - | - | Yes |

RLS lets any authenticated user read `roles`, `permissions`, and
`role_permissions`. Profile updates are guarded so a non-admin cannot change
`role_id`, `is_active`, or `email`, even if they bypass the service layer. Staff
accounts are created as guests first and then promoted by an admin.

### Rooms

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Read active rooms | Yes | Yes | Yes | Yes |
| Read inactive rooms | - | - | - | Yes |
| Create or delete a room | - | - | - | Yes |
| Change occupancy status | - | Yes | - | Yes |
| Change housekeeping status | - | - | Yes | Yes |
| Rename, retype, move floor, deactivate | - | - | - | Yes |

The room guard trigger enforces the column-level rules. A receptionist cannot
edit cleanliness and a housekeeping user cannot edit occupancy, even though both
have an `UPDATE` grant on the table.

### Reservations and allocations

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Read own reservations | Yes | Yes | - | Yes |
| Read every reservation | - | Yes | - | Yes |
| Create reservation for self | Via RPC | Via RPC | - | Via RPC |
| Create reservation for another guest | - | Via RPC | - | Via RPC |
| Update special requests/occupancy counts | - | Yes | - | Yes |
| Confirm reservation | - | Via RPC | - | Via RPC |
| Cancel own reservation | Via RPC | Via RPC | - | Via RPC |
| Cancel another reservation | - | Via RPC | - | Via RPC |
| Read own allocations | Yes | Yes | - | Yes |
| Read every allocation | - | Yes | - | Yes |
| Allocate or release a room | - | Via RPC | - | Via RPC |
| Directly insert/update allocations | - | - | - | Yes |
| Delete a reservation | - | - | - | Yes |

Guests have no direct `INSERT` or `UPDATE` policy on `reservations`. Creation
and cancellation go through `security definer` functions so the database can
atomically create the payment record and release allocations.

### Check-in, check-out, and stays

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Read own stay records | Yes | Yes | - | Yes |
| Read every stay record | - | Yes | - | Yes |
| Check in | - | Via RPC | - | Via RPC |
| Check out | - | Via RPC | - | Via RPC |
| Directly write stay records | - | - | - | Yes |

### Payments

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Read own payment | Yes | Yes | - | Yes |
| Read every payment | - | Yes | - | Yes |
| Insert/update a payment | - | Yes | - | Yes |
| Delete a payment | - | - | - | Yes |
| Create payment record via service | - | Yes | - | Yes |

A payment row is created automatically with every reservation. Guests cannot
change its status. Amount and currency are checked against the reservation by a
trigger.

### Housekeeping

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Read tasks | - | Yes | Yes | Yes |
| Create a task | - | Yes | - | Yes |
| Update any task | - | Yes | Assigned/unassigned only | Yes |
| Update task status/assignment only | - | - | Yes | Yes |
| Delete a task | - | - | - | Yes |

Housekeeping can read every task but can only update tasks where `assigned_to`
is their own id or `NULL`. The guard trigger also prevents them from changing
room, reservation, task type, notes, or creator. Task status changes propagate
to `rooms.housekeeping_status` through a trigger.

### Reports and configuration

| Action | Guest | Receptionist | Housekeeping | Admin |
| --- | :---: | :---: | :---: | :---: |
| Occupancy and revenue reports | - | - | - | Yes |
| Dashboard counters | - | Yes | - | Yes |
| Manage room types/facilities | - | - | - | Yes |
| Manage room rates | - | - | - | Yes |
| Manage users and roles | - | - | - | Yes |

`report_occupancy` and `report_revenue` check `is_admin()` inside the function.
`getTodaySummary()` is a service-side composition of normal RLS-protected
queries, so staff see operational counters and guests cannot access the screen.

## Reservation status rules by role

| Transition | Guest | Receptionist | Admin |
| --- | :---: | :---: | :---: |
| `pending -> confirmed` | - | Yes | Yes |
| `pending -> cancelled` | Own only | Yes | Yes |
| `confirmed -> checked_in` | - | Yes | Yes |
| `confirmed -> cancelled` | Own only | Yes | Yes |
| `checked_in -> completed` | - | Yes | Yes |
| Any other transition | - | - | - |

Admins are still bound by the status-transition trigger. "Admin" does not mean
"skip the workflow". Admins may correct identity, stay, and pricing fields, but
they cannot move a completed reservation back to confirmed.

## RLS policy map

| Table | Read | Write |
| --- | --- | --- |
| `roles`, `permissions`, `role_permissions` | Authenticated | Admin |
| `profiles` | Owner or staff | Owner (name/phone) or admin |
| `room_types`, `facilities`, `room_rates` | Active rows public; all rows admin | Admin |
| `rooms` | Active rows public; all rows admin | Admin insert/delete; operations staff update with guards |
| `room_type_facilities` | Public | Admin |
| `reservations` | Owner or staff | Staff insert/update; admin delete; guests via RPC only |
| `reservation_rooms` | Owner or staff | Admin direct; staff via RPC |
| `payments` | Owner or staff | Staff insert/update; admin delete |
| `stay_records` | Owner or staff | Admin direct; staff via check-in/out RPC |
| `housekeeping_tasks` | Staff or housekeeping | Staff insert; staff/housekeeping update; admin delete |

"Staff" means `receptionist` or `admin`. Housekeeping is deliberately not
`is_staff()`.

## Guard triggers

| Guard | Protection |
| --- | --- |
| `guard_profile_update` | Non-admin cannot change `role_id`, `is_active`, or `email` |
| `guard_room_update` | Receptionist may only change occupancy; housekeeping may only change cleanliness |
| `enforce_reservation_status_transition` | Only the documented lifecycle transitions are accepted |
| `guard_reservation_update` | Non-admin cannot rewrite identity, stay, or pricing fields |
| `prepare_reservation_room` | Allocation must match room type, active room, allowed reservation status, and room count |
| `prepare_payment` | Payment amount and currency must equal the reservation |
| `guard_housekeeping_task_update` | Housekeeping may only change status and assignment |
| `sync_housekeeping_task` | Task status is mirrored into room cleanliness |

Trusted SQL contexts with no end-user JWT (migrations, seed, service-role
maintenance) bypass the update guards. RLS still applies to every PostgREST
request, including service-role calls only in the sense that the service role
bypasses RLS by design; never expose that key to clients.

## Testing the matrix

- `supabase/tests/03_rls.test.sql` covers anonymous reads, guest isolation,
  receptionist operational reads, housekeeping restrictions, and admin reports.
- `tests/integration/live-rls.test.ts` exercises the same behaviors through
  `supabase-js` against a dedicated test project when `TEST_SUPABASE_*` is set.
- The live suite is skipped by default and has not been executed in the
  environment where this backend was produced.
- Mocked service tests do not prove RLS. Run the SQL and live suites before
  production use.

See [Database](DATABASE.md) and [Business rules](BUSINESS-RULES.md) for the
schema and workflow context.
