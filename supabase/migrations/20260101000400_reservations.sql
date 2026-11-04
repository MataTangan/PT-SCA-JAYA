-- ============================================================================
-- 20260101000400_reservations.sql
-- Reservations and room allocations. Overlap prevention is enforced with a
-- PostgreSQL GiST exclusion constraint, so concurrent double bookings fail
-- regardless of application code.
-- ============================================================================

create sequence public.reservation_code_seq as bigint start 1;

create or replace function public.generate_reservation_code()
returns text
language sql
volatile
set search_path = public
as $$
  select 'SCA-'
    || to_char(now(), 'YYYYMMDD')
    || '-'
    || lpad(nextval('public.reservation_code_seq')::text, 4, '0');
$$;

comment on function public.generate_reservation_code() is
  'Human-readable, unique reservation code, e.g. SCA-20260101-0001.';

-- ---------------------------------------------------------------------------
-- reservations
-- One reservation targets one room type and a room_count. Specific physical
-- rooms are attached later through reservation_rooms.
-- ---------------------------------------------------------------------------
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_code text not null unique default public.generate_reservation_code(),
  guest_id uuid not null references public.profiles(id) on delete restrict,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  check_in_date date not null,
  check_out_date date not null,
  nights integer not null,
  room_count integer not null default 1,
  adults integer not null default 1,
  children integer not null default 0,
  special_requests text,
  status public.reservation_status not null default 'pending',
  rate_per_night numeric(12, 2) not null,
  total_amount numeric(12, 2) not null,
  currency char(3) not null default 'IDR',
  created_by uuid references public.profiles(id) on delete set null,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_dates_valid check (check_out_date > check_in_date),
  constraint reservations_nights_match check (nights = (check_out_date - check_in_date)),
  constraint reservations_nights_positive check (nights > 0),
  constraint reservations_room_count_valid check (room_count between 1 and 10),
  constraint reservations_adults_positive check (adults > 0),
  constraint reservations_children_non_negative check (children >= 0),
  constraint reservations_rate_positive check (rate_per_night > 0),
  constraint reservations_total_non_negative check (total_amount >= 0),
  constraint reservations_total_match
    check (total_amount = rate_per_night * nights * room_count),
  constraint reservations_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint reservations_cancelled_consistency
    check (status <> 'cancelled' or cancelled_at is not null)
);

create index reservations_guest_id_idx on public.reservations(guest_id, created_at desc);
create index reservations_status_idx on public.reservations(status);
create index reservations_room_type_id_idx on public.reservations(room_type_id);
create index reservations_stay_idx on public.reservations(check_in_date, check_out_date);
create index reservations_code_search_idx
  on public.reservations(reservation_code text_pattern_ops);

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

-- Only the documented transitions are allowed. This protects the workflow
-- even if a client bypasses the service layer.
create or replace function public.enforce_reservation_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
      or (old.status = 'confirmed' and new.status in ('checked_in', 'cancelled'))
      or (old.status = 'checked_in' and new.status = 'completed')
    ) then
      raise exception 'Invalid reservation status transition: % -> %', old.status, new.status
        using errcode = '23514';
    end if;
  end if;

  if new.status = 'cancelled' and new.cancelled_at is null then
    new.cancelled_at := now();
  end if;

  return new;
end;
$$;

create trigger reservations_enforce_status_transition
before update on public.reservations
for each row execute function public.enforce_reservation_status_transition();

-- Receptionists may progress a reservation but not rewrite its financial or
-- identity fields. Admins are allowed to correct data.
create or replace function public.guard_reservation_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if (new.reservation_code, new.guest_id, new.room_type_id, new.check_in_date,
      new.check_out_date, new.nights, new.room_count, new.rate_per_night,
      new.total_amount, new.currency, new.created_by)
     is distinct from
     (old.reservation_code, old.guest_id, old.room_type_id, old.check_in_date,
      old.check_out_date, old.nights, old.room_count, old.rate_per_night,
      old.total_amount, old.currency, old.created_by)
  then
    raise exception 'Reservation identity, stay, and pricing fields are immutable'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger reservations_guard_update
before update on public.reservations
for each row execute function public.guard_reservation_update();

-- ---------------------------------------------------------------------------
-- reservation_rooms (room allocation)
-- check_in_date/check_out_date are copied from the reservation and combined
-- into the generated `stay` range used by the exclusion constraint.
-- ---------------------------------------------------------------------------
create table public.reservation_rooms (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  check_in_date date not null,
  check_out_date date not null,
  nights integer not null,
  rate_per_night numeric(12, 2) not null,
  subtotal numeric(12, 2) not null,
  stay daterange generated always as (
    daterange(check_in_date, check_out_date, '[)')
  ) stored,
  allocated_by uuid references public.profiles(id) on delete set null,
  allocated_at timestamptz not null default now(),
  released_at timestamptz,
  release_reason text,
  constraint reservation_rooms_stay_valid check (check_out_date > check_in_date),
  constraint reservation_rooms_nights_match check (nights = (check_out_date - check_in_date)),
  constraint reservation_rooms_rate_positive check (rate_per_night > 0),
  constraint reservation_rooms_subtotal_match
    check (subtotal = rate_per_night * nights),
  -- Active allocations of the same room may never overlap in time.
  constraint reservation_rooms_no_overlap exclude using gist (
    room_id with =,
    stay with &&
  ) where (released_at is null)
);

create index reservation_rooms_reservation_id_idx
  on public.reservation_rooms(reservation_id);
create index reservation_rooms_room_id_idx on public.reservation_rooms(room_id);
create index reservation_rooms_active_idx
  on public.reservation_rooms(room_id, check_in_date, check_out_date)
  where released_at is null;
create unique index reservation_rooms_one_active_per_room_key
  on public.reservation_rooms(reservation_id, room_id)
  where released_at is null;

-- Copy authoritative stay/pricing values from the reservation and enforce
-- room type, availability-blocking status, and room_count.
create or replace function public.prepare_reservation_room()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
  v_room public.rooms%rowtype;
  v_active_count integer;
begin
  select * into v_reservation
  from public.reservations
  where id = new.reservation_id
  for update;

  if not found then
    raise exception 'Reservation % does not exist', new.reservation_id using errcode = '23503';
  end if;

  select * into v_room from public.rooms where id = new.room_id;
  if not found then
    raise exception 'Room % does not exist', new.room_id using errcode = '23503';
  end if;

  if not v_room.is_active then
    raise exception 'Room % is inactive and cannot be allocated', v_room.room_number
      using errcode = '23514';
  end if;

  if v_room.room_type_id <> v_reservation.room_type_id then
    raise exception 'Room % does not match the reservation room type', v_room.room_number
      using errcode = '23514';
  end if;

  new.check_in_date := v_reservation.check_in_date;
  new.check_out_date := v_reservation.check_out_date;
  new.nights := v_reservation.nights;
  new.rate_per_night := v_reservation.rate_per_night;
  new.subtotal := v_reservation.rate_per_night * v_reservation.nights;

  if new.allocated_by is null then
    new.allocated_by := auth.uid();
  end if;

  if new.released_at is null then
    if v_reservation.status not in ('pending', 'confirmed') then
      raise exception 'Cannot allocate a room to a % reservation', v_reservation.status
        using errcode = '23514';
    end if;

    select count(*) into v_active_count
    from public.reservation_rooms rr
    where rr.reservation_id = new.reservation_id
      and rr.released_at is null
      and rr.id <> new.id;

    if v_active_count >= v_reservation.room_count then
      raise exception 'Reservation already has % active room allocation(s)', v_active_count
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger reservation_rooms_prepare
before insert or update on public.reservation_rooms
for each row execute function public.prepare_reservation_room();
