# Business Rules

This document is the behavioral contract implemented by the database and
services. It also records assumptions and gaps so the frontend team does not
invent behavior that the backend does not enforce.

## 1. Reservation lifecycle

```text
                 confirm (staff)
pending ---------------------------> confirmed
   |                                    |
   | cancel (owner/staff)               | cancel (owner/staff)
   v                                    v
cancelled                            cancelled

confirmed -- check-in (staff) --> checked_in -- check-out (staff) --> completed
```

- `pending`: request created, rate and total fixed, payment row created as
  `unpaid`, no physical room held.
- `confirmed`: staff accepted the request. A room can be allocated.
- `checked_in`: guest is in house; stay records are open and rooms are
  `occupied`.
- `completed`: guest checked out; allocations closed; cleaning tasks created.
- `cancelled`: terminal; open allocations are released.

Allowed transitions are enforced by `enforce_reservation_status_transition`:

| From | To |
| --- | --- |
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `checked_in`, `cancelled` |
| `checked_in` | `completed` |
| `completed` | none |
| `cancelled` | none |

Admins are also bound by this trigger. Completed and cancelled reservations are
terminal.

> **Design-brief difference:** the original concept document describes a booking
> as "Confirmed" immediately after submission. This implementation creates
> `pending` and requires a receptionist or admin to confirm it. This is an
> explicit product assumption, not an accidental mismatch.

## 2. Creating a reservation

`create_reservation` runs in one transaction and is the only normal guest write
path.

Inputs:

- `roomTypeId`
- `checkInDate`, `checkOutDate`
- `adults`, `children`, `roomCount`
- optional `specialRequests`
- optional `guestId` (staff only)

Rules:

1. The caller must be authenticated.
2. A guest may only book for themselves. Staff may book for another active
   profile.
3. Check-out must be after check-in.
4. Check-in cannot be in the past relative to the database `current_date`.
5. At least one adult is required; children cannot be negative.
6. `roomCount` is between 1 and 10.
7. The room type must exist and be active.
8. `adults + children` must not exceed `room_type.capacity * roomCount`.
9. An active rate must exist on the check-in date.
10. `nights = check_out_date - check_in_date`.
11. `rate_per_night` is copied from the applicable rate.
12. `total_amount = rate_per_night * nights * room_count`.
13. The reservation starts as `pending`.
14. An `unpaid` payment row is created for the exact total and currency.
15. The reservation code is generated as `SCA-YYYYMMDD-NNNN` using a sequence.
16. `created_by` is the authenticated caller.

The service additionally validates the date format and order with Zod before
calling the RPC. The database remains authoritative.

### Rate assumption

One rate is resolved from the check-in date and applied to every night. There is
no per-night rate calendar, weekend surcharge, seasonal split, tax, fee,
discount, voucher, or multi-currency conversion. If a stay spans a rate change,
the implementation still uses the check-in-date rate.

### Identity and ownership

- `guest_id` is the person the reservation belongs to.
- `created_by` is the staff member or guest who created it.
- Guests can read their own reservation, allocations, payment, and stay records.
- Guests cannot directly insert or update reservations; they use the RPCs.

## 3. Availability and inventory

Availability is based on **active physical-room allocations**, not on room
`occupancy_status`.

A room is available for `[check_in, check_out)` when:

- the room exists and `is_active`;
- it has no active `reservation_rooms` row whose `stay` overlaps the requested
  range;
- an active allocation is one with `released_at IS NULL`.

The overlap test uses the half-open `daterange(check_in, check_out, '[)')`.
A checkout on 12 December does not block a check-in on 12 December.

### Pending reservations do not hold inventory

A pending reservation has no physical room. It becomes inventory-blocking only
when staff allocates a room. Two guests can therefore request the same room type
for the same dates; the second allocation loses at race time.

This is intentional for the coursework scope. A real hotel may need a temporary
hold, waitlist, or overbooking policy. None is implemented.

### Race safety

The exclusion constraint on `reservation_rooms` is the final double-booking
guard:

```sql
exclude using gist (room_id with =, stay with &&) where (released_at is null)
```

Concurrent allocations for the same room and overlapping range cannot both
commit. PostgreSQL raises `23P01`, which the service maps to `CONFLICT`.

## 4. Booking status vs. occupancy vs. cleanliness

These states are independent:

| Dimension | Values | Meaning |
| --- | --- | --- |
| Reservation | `pending`, `confirmed`, `checked_in`, `completed`, `cancelled` | Booking lifecycle |
| Payment | `unpaid`, `paid` | Money state |
| Room occupancy | `available`, `reserved`, `occupied` | Physical room state |
| Room cleanliness | `clean`, `dirty`, `cleaning` | Housekeeping state |

Examples:

- A room can be `occupied` and `dirty`.
- A reservation can be `pending` and its payment `unpaid`.
- A room can be `available` and `dirty`.
- A completed reservation does not automatically make its payment `paid`.

The UI must display the relevant dimension, not collapse them into one badge.

## 5. Room allocation

Staff allocate physical rooms through `allocate_room`.

Rules:

1. Caller must be receptionist or admin.
2. Reservation must be `pending` or `confirmed`.
3. Room must exist and be active.
4. Room type must match the reservation.
5. Active allocation count cannot exceed `room_count`.
6. The reservation row is locked while the count is checked.
7. The same room cannot be allocated twice to the same reservation while the
   allocation is active.
8. Overlapping active allocations for the same room are rejected by the
   exclusion constraint.
9. Stay dates, rate, and subtotal are copied from the reservation, not supplied
   by the client.
10. Allocation sets the room to `reserved` if it was `available`.

`release_room` closes an active allocation and marks the room `available` when
no other active allocation remains for that room. It is staff-only and does not
currently reject a release during `checked_in`; room moves are not a formal
workflow in this version.

## 6. Check-in

`check_in_reservation` is staff-only.

Requirements:

1. Reservation status is `confirmed`.
2. The number of active allocations equals `room_count`.
3. Every allocated room has `housekeeping_status = 'clean'`.

Effects:

- Creates one `stay_records` row per active allocation.
- Sets `checked_in_at` and `checked_in_by`.
- Sets allocated rooms to `occupied`.
- Sets the reservation to `checked_in`.

Assumptions:

- Check-in does not verify that today is the reservation's check-in date.
  Early and late check-ins are allowed by the database. The frontend should
  display a warning if it wants stricter behavior.
- Check-in does not require the payment to be `paid`.
- No identity document, deposit, or guest-registration record is stored.

## 7. Check-out

`check_out_reservation` is staff-only.

Requirements:

1. Reservation status is `checked_in`.

Effects:

- Closes open stay records with `checked_out_at` and `checked_out_by`.
- Releases every active allocation with reason `Checked out`.
- Marks each room `available`.
- Creates a `checkout_clean` housekeeping task with status `dirty`.
- Sets the reservation to `completed`.

Assumptions:

- Check-out does not require payment to be `paid`.
- No invoice, refund, deposit settlement, or late-checkout fee is implemented.
- The room becomes `available` immediately even though its cleanliness status is
  `dirty` until housekeeping finishes.

## 8. Payments

The model is one full payment per reservation.

- `payments.reservation_id` is unique.
- `create_reservation` inserts the initial `unpaid` row.
- `payments.createPaymentRecord` exists for repair/backfill. It refuses a
  missing, cancelled, or already-existing payment row and always derives the
  amount and currency from the reservation.
- Amount must equal `reservations.total_amount`.
- Currency must equal the reservation currency.
- Status is only `unpaid` or `paid`.
- Setting `paid` sets `paid_at`; reverting to `unpaid` clears it.
- `method` is nullable at the database level, though the create-record service
  requires one. A UI may require a method before marking paid, but the database
  does not.

Not implemented:

- Partial payments, installments, deposits, refunds, chargebacks.
- Multiple payment rows per reservation.
- Tax, service charge, or exchange-rate handling.
- Payment gateway integration.
- Automatic payment-status changes from reservation status.

## 9. Housekeeping

Tasks have type `checkout_clean`, `stayover_clean`, `deep_clean`, or
`inspection`, and status `clean`, `dirty`, or `cleaning`.

Rules:

1. Receptionists and admins can create tasks.
2. Housekeeping users can read all tasks but update only tasks assigned to them
   or unassigned.
3. Housekeeping users can change only status and assignment.
4. Task status is mirrored into `rooms.housekeeping_status`.
5. `cleaning` sets `started_at` if empty.
6. `clean` sets `started_at` and `completed_at` if empty.
7. Returning to `dirty` clears both timestamps.
8. Check-out creates a `dirty` checkout-clean task.

The system does not require a clean task before manually setting a room clean,
and it does not prevent multiple overlapping tasks for the same room.

## 10. Cancellation

`cancel_reservation` permits the owner, a receptionist, or an admin.

Allowed from `pending` or `confirmed` only.

Effects:

- Sets status `cancelled`.
- Stamps `cancelled_at` and stores the optional reason.
- Releases any active allocations.
- Marks rooms `available` if no other active allocation remains.

Not implemented:

- Cancellation fees, refunds, deposit forfeiture, or no-show handling.
- Cancellation windows or date-based policy.
- Restoring a cancelled reservation.

## 11. Reports

`report_occupancy(from, to)` and `report_revenue(from, to)` are admin-only and
use a half-open date range `[from, to)`. The end date must be after the start
date.

### Occupancy

- `days = to - from`.
- `total_rooms` counts active rooms.
- `occupied_room_nights` sums the intersection of non-cancelled allocation
  stays with the report range.
- `available_room_nights = total_rooms * days - occupied_room_nights`, floored
  at zero.
- `occupancy_rate = occupied_room_nights / (total_rooms * days)`, rounded to
  four decimals.

Occupancy is derived from allocations, not from `rooms.occupancy_status`. A
reservation without a physical room contributes no occupied nights.

### Revenue

- Counts non-cancelled reservations whose `created_at` falls in the range.
- `gross_reservation_value` is the sum of reservation totals.
- `paid_amount` and `unpaid_amount` split the linked payment amounts by current
  payment status.

Revenue is booking-date based, not cash-received-date based.

### Today summary

`getTodaySummary()` is a service-side dashboard composition:

- room counts by occupancy and cleanliness;
- confirmed arrivals with today's check-in date;
- checked-in in-house reservations;
- checked-in reservations with today's check-out date;
- pending reservations;
- unpaid payments.

The date is the UTC date. A hotel operating in another timezone needs a
timezone-aware extension or app-side calculation.

## 12. Pagination and search

- Default page: 1.
- Default page size: 20.
- Maximum page size: 100.
- Reservation code and room number searches are case-insensitive substring
  matches.
- Profile search matches name or email.
- `from`/`to` reservation filters overlap the stay window; reports use the
  half-open range described above.

## 13. Assumptions and unresolved product decisions

| Topic | Current behavior | Risk / decision needed |
| --- | --- | --- |
| Initial status | `pending` | Design brief says confirmed after booking; staff confirmation is a deliberate change |
| Inventory hold | None for pending | Popular dates can be oversubscribed until allocation |
| Rate changes during stay | Check-in rate for all nights | Per-night rates are not supported |
| Taxes and fees | None | Total is room rate × nights × rooms only |
| Payment gate | No payment check at check-in or check-out | Hotel may require full payment before check-in |
| Partial payments | Not supported | One full payment row per reservation |
| Refunds | Not supported | Cancellation does not alter payment |
| Check-in date | Not enforced | Staff can check in early or late |
| Room moves | Release + reallocate before check-in only; no formal move flow | Checked-in moves are not modeled safely |
| No-shows | Not modeled | A confirmed no-show stays confirmed until staff cancels |
| Timezone | Database `current_date` and JS UTC date | Business date may differ from hotel local date |
| Cancellation policy | Any pending/confirmed booking can be cancelled by owner/staff | No fees or windows |
| Housekeeping assignment | Any staff can assign; housekeeping can self-assign or unassign | Workload balancing is manual |
| Realtime | Not configured | Frontend must refetch |
| Notifications | Not implemented | No email/SMS for booking or status changes |
| Audit trail | `created_at`, `updated_at`, actor columns only | No event history for every status change |

## 14. Verification caveat

The business rules above describe the SQL in `supabase/migrations/`. The SQL
migrations, seed, pgTAP tests, and live RLS tests have **not been executed** in
the environment where this foundation was produced because Docker/Supabase
Local is unavailable. Run `npm run db:start`, `npm run db:reset`, and
`npm run test:db` in a Docker-capable environment before treating these rules as
verified against a live database.
