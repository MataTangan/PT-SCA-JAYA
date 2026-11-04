# Database ERD

## Logical relationships

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "has profile"
    ROLES ||--o{ PROFILES : "assigned to"
    ROLES ||--o{ ROLE_PERMISSIONS : "grants"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "granted by"

    ROOM_TYPES ||--o{ ROOMS : "categorizes"
    ROOM_TYPES ||--o{ ROOM_RATES : "priced by"
    ROOM_TYPES ||--o{ ROOM_TYPE_FACILITIES : "offers"
    FACILITIES ||--o{ ROOM_TYPE_FACILITIES : "belongs to"

    PROFILES ||--o{ RESERVATIONS : "books"
    ROOM_TYPES ||--o{ RESERVATIONS : "requested type"
    PROFILES ||--o{ RESERVATIONS : "creates (created_by)"

    RESERVATIONS ||--o{ RESERVATION_ROOMS : "allocates"
    ROOMS ||--o{ RESERVATION_ROOMS : "assigned to"
    PROFILES ||--o{ RESERVATION_ROOMS : "allocates (allocated_by)"

    RESERVATIONS ||--|| PAYMENTS : "has one"
    PROFILES ||--o{ PAYMENTS : "records"

    RESERVATIONS ||--o{ STAY_RECORDS : "produces"
    RESERVATION_ROOMS ||--|| STAY_RECORDS : "checked in as"
    ROOMS ||--o{ STAY_RECORDS : "hosts"

    ROOMS ||--o{ HOUSEKEEPING_TASKS : "needs cleaning"
    RESERVATIONS ||--o{ HOUSEKEEPING_TASKS : "may trigger"
    PROFILES ||--o{ HOUSEKEEPING_TASKS : "assigned to / creates"

    AUTH_USERS {
        uuid id PK
        text email
    }

    PROFILES {
        uuid id PK
        text email UK
        text full_name
        text phone
        uuid role_id FK
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    ROLES {
        uuid id PK
        text slug UK
        text name
        text description
        boolean is_system
    }

    PERMISSIONS {
        uuid id PK
        text code UK
        text module
        text description
    }

    ROLE_PERMISSIONS {
        uuid role_id PK,FK
        uuid permission_id PK,FK
    }

    ROOM_TYPES {
        uuid id PK
        text code UK
        text name UK
        text description
        integer capacity
        numeric size_sqm
        text bed_type
        boolean is_active
    }

    ROOMS {
        uuid id PK
        text room_number UK
        uuid room_type_id FK
        integer floor
        text notes
        occupancy_status occupancy_status
        housekeeping_status housekeeping_status
        boolean is_active
    }

    FACILITIES {
        uuid id PK
        text code UK
        text name
        text description
        text category
        text icon
        boolean is_active
    }

    ROOM_TYPE_FACILITIES {
        uuid room_type_id PK,FK
        uuid facility_id PK,FK
    }

    ROOM_RATES {
        uuid id PK
        uuid room_type_id FK
        numeric rate_per_night
        char currency
        date valid_from
        date valid_to
        boolean is_active
    }

    RESERVATIONS {
        uuid id PK
        text reservation_code UK
        uuid guest_id FK
        uuid room_type_id FK
        date check_in_date
        date check_out_date
        integer nights
        integer room_count
        integer adults
        integer children
        text special_requests
        reservation_status status
        numeric rate_per_night
        numeric total_amount
        char currency
        uuid created_by FK
        timestamptz cancelled_at
        text cancellation_reason
    }

    RESERVATION_ROOMS {
        uuid id PK
        uuid reservation_id FK
        uuid room_id FK
        date check_in_date
        date check_out_date
        integer nights
        numeric rate_per_night
        numeric subtotal
        daterange stay
        uuid allocated_by FK
        timestamptz allocated_at
        timestamptz released_at
        text release_reason
    }

    PAYMENTS {
        uuid id PK
        uuid reservation_id FK,UK
        numeric amount
        char currency
        payment_status status
        payment_method method
        timestamptz paid_at
        uuid recorded_by FK
        text notes
    }

    STAY_RECORDS {
        uuid id PK
        uuid reservation_id FK
        uuid reservation_room_id FK,UK
        uuid room_id FK
        timestamptz checked_in_at
        uuid checked_in_by FK
        timestamptz checked_out_at
        uuid checked_out_by FK
    }

    HOUSEKEEPING_TASKS {
        uuid id PK
        uuid room_id FK
        uuid reservation_id FK
        housekeeping_task_type task_type
        housekeeping_status status
        uuid assigned_to FK
        text notes
        uuid created_by FK
        timestamptz started_at
        timestamptz completed_at
    }
```

## Cardinalities in words

- One auth user has exactly one `profiles` row.
- One role has many profiles; one profile has exactly one role.
- Roles and permissions are many-to-many through `role_permissions`.
- One room type has many physical rooms and many rate windows.
- A room type has many facilities; a facility can belong to many room types.
- A guest profile can create many reservations.
- One reservation targets exactly one room type and has a `room_count` from 1 to
  10.
- One reservation has zero or more `reservation_rooms` allocations; the number
  of active allocations may not exceed `room_count`.
- One reservation has exactly one payment record in the current business model.
- One active `reservation_rooms` row can produce one `stay_records` row when the
  guest is checked in.
- Housekeeping tasks reference a room; they may also reference the reservation
  that generated the checkout clean.

## Important invariants

1. `reservations.check_out_date > check_in_date`.
2. `reservations.nights = check_out_date - check_in_date`.
3. `reservations.total_amount = rate_per_night * nights * room_count`.
4. Active `reservation_rooms` for the same room cannot overlap
   (`stay && stay` exclusion).
5. `reservation_rooms` copies stay, rate, and subtotal from its reservation.
6. A physical room allocation must match the reservation room type and be active.
7. `payments.amount = reservations.total_amount` and currencies match.
8. A reservation status only moves through
   `pending -> confirmed -> checked_in -> completed`, with cancellation allowed
   from `pending` or `confirmed`.
9. Reservation identity, stay, and pricing fields are immutable to non-admin
   callers after creation.
10. `profiles.role_id` and `profiles.is_active` are not editable by non-admins.

## Deletion behavior

- Deleting an auth user cascades to their profile.
- A role used by profiles cannot be deleted (`on delete restrict`).
- A room type used by rooms or reservations cannot be deleted.
- A physical room used by allocations or stays cannot be deleted.
- Deleting a reservation cascades to allocations, payments, stays, and sets
  `housekeeping_tasks.reservation_id` to null.
- Deleting a room cascades to housekeeping tasks, but allocations/stays restrict
  deletion while they reference the room.

## Enum transition map

```mermaid
stateDiagram-v2
    [*] --> pending : create_reservation
    pending --> confirmed : confirm_reservation (staff)
    pending --> cancelled : cancel_reservation (owner/staff)
    confirmed --> checked_in : check_in_reservation (staff)
    confirmed --> cancelled : cancel_reservation (owner/staff)
    checked_in --> completed : check_out_reservation (staff)
    completed --> [*]
    cancelled --> [*]
```
