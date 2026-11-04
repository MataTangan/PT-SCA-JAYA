-- ============================================================================
-- 20260101000600_business_functions.sql
-- Availability, reservation lifecycle, and reporting RPCs.
-- Every mutating function re-checks authorization server-side. The browser
-- can call these functions, but it cannot supply a role or bypass the checks.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Availability
-- ---------------------------------------------------------------------------
create or replace function public.check_room_availability(
  p_room_id uuid,
  p_check_in date,
  p_check_out date
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Security definer is required: availability must inspect every active
  -- allocation, while RLS intentionally hides other guests' allocations from
  -- anonymous and guest callers. Only a boolean is returned.
  select case
    when p_check_in is null or p_check_out is null or p_check_out <= p_check_in then false
    else
      exists (select 1 from public.rooms r where r.id = p_room_id and r.is_active)
      and not exists (
        select 1
        from public.reservation_rooms rr
        where rr.room_id = p_room_id
          and rr.released_at is null
          and rr.stay && daterange(p_check_in, p_check_out, '[)')
      )
  end;
$$;

comment on function public.check_room_availability(uuid, date, date) is
  'True when the room is active and has no active allocation overlapping [check_in, check_out).';

create or replace function public.find_available_rooms(
  p_room_type_id uuid,
  p_check_in date,
  p_check_out date
)
returns setof public.rooms
language sql
stable
set search_path = public
as $$
  select r.*
  from public.rooms r
  where r.room_type_id = p_room_type_id
    and r.is_active
    and public.check_room_availability(r.id, p_check_in, p_check_out)
  order by r.room_number;
$$;

comment on function public.find_available_rooms(uuid, date, date) is
  'Active rooms of a type with no overlapping active allocation for the stay.';

-- ---------------------------------------------------------------------------
-- Reservation creation
-- ---------------------------------------------------------------------------
create or replace function public.create_reservation(
  p_room_type_id uuid,
  p_check_in_date date,
  p_check_out_date date,
  p_adults integer default 1,
  p_children integer default 0,
  p_room_count integer default 1,
  p_special_requests text default null,
  p_guest_id uuid default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_guest_id uuid;
  v_room_type public.room_types%rowtype;
  v_rate numeric(12, 2);
  v_nights integer;
  v_reservation public.reservations%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_guest_id := coalesce(p_guest_id, v_uid);

  if not exists (
    select 1 from public.profiles p where p.id = v_guest_id and p.is_active
  ) then
    raise exception 'Guest profile % does not exist or is inactive', v_guest_id
      using errcode = 'P0002';
  end if;

  if v_guest_id <> v_uid and not public.is_staff() then
    raise exception 'Guests can only create reservations for themselves'
      using errcode = '42501';
  end if;

  if p_check_in_date is null or p_check_out_date is null then
    raise exception 'Check-in and check-out dates are required' using errcode = '22023';
  end if;
  if p_check_out_date <= p_check_in_date then
    raise exception 'Check-out date must be after check-in date' using errcode = '22023';
  end if;
  if p_check_in_date < current_date then
    raise exception 'Check-in date cannot be in the past' using errcode = '22023';
  end if;
  if p_adults is null or p_adults < 1 then
    raise exception 'At least one adult is required' using errcode = '22023';
  end if;
  if p_children is null or p_children < 0 then
    raise exception 'Children count cannot be negative' using errcode = '22023';
  end if;
  if p_room_count is null or p_room_count < 1 or p_room_count > 10 then
    raise exception 'Room count must be between 1 and 10' using errcode = '22023';
  end if;

  select * into v_room_type
  from public.room_types
  where id = p_room_type_id and is_active;

  if not found then
    raise exception 'Room type % does not exist or is inactive', p_room_type_id
      using errcode = 'P0002';
  end if;

  if (p_adults + p_children) > (v_room_type.capacity * p_room_count) then
    raise exception 'Guest count exceeds the capacity of % room(s) of type %',
      p_room_count, v_room_type.name using errcode = '23514';
  end if;

  v_rate := public.get_applicable_rate(p_room_type_id, p_check_in_date);
  if v_rate is null then
    raise exception 'No active rate is configured for room type % on %',
      v_room_type.name, p_check_in_date using errcode = '23514';
  end if;

  v_nights := (p_check_out_date - p_check_in_date);

  insert into public.reservations (
    guest_id,
    room_type_id,
    check_in_date,
    check_out_date,
    nights,
    room_count,
    adults,
    children,
    special_requests,
    status,
    rate_per_night,
    total_amount,
    created_by
  )
  values (
    v_guest_id,
    p_room_type_id,
    p_check_in_date,
    p_check_out_date,
    v_nights,
    p_room_count,
    p_adults,
    p_children,
    nullif(btrim(coalesce(p_special_requests, '')), ''),
    'pending',
    v_rate,
    v_rate * v_nights * p_room_count,
    v_uid
  )
  returning * into v_reservation;

  insert into public.payments (reservation_id, amount, currency, status)
  values (v_reservation.id, v_reservation.total_amount, v_reservation.currency, 'unpaid');

  return v_reservation;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reservation lifecycle
-- ---------------------------------------------------------------------------
create or replace function public.confirm_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.is_staff() then
    raise exception 'Only receptionists or admins can confirm reservations'
      using errcode = '42501';
  end if;

  update public.reservations
  set status = 'confirmed'
  where id = p_reservation_id and status = 'pending'
  returning * into v_reservation;

  if not found then
    raise exception 'Reservation not found or is not pending' using errcode = 'P0002';
  end if;

  return v_reservation;
end;
$$;

create or replace function public.cancel_reservation(
  p_reservation_id uuid,
  p_reason text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reservation public.reservations%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into v_reservation
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation % does not exist', p_reservation_id using errcode = 'P0002';
  end if;

  if v_reservation.guest_id <> v_uid and not public.is_staff() then
    raise exception 'You can only cancel your own reservation' using errcode = '42501';
  end if;

  if v_reservation.status not in ('pending', 'confirmed') then
    raise exception 'A % reservation cannot be cancelled', v_reservation.status
      using errcode = '23514';
  end if;

  update public.reservation_rooms
  set released_at = now(),
      release_reason = coalesce(p_reason, 'Reservation cancelled')
  where reservation_id = p_reservation_id
    and released_at is null;

  -- This derived room update must work for a guest cancelling their own
  -- allocated reservation without widening direct room permissions.
  perform set_config('hotel.sca_internal', 'on', true);

  update public.rooms r
  set occupancy_status = 'available'
  where r.id in (
    select rr.room_id from public.reservation_rooms rr where rr.reservation_id = p_reservation_id
  )
    and r.occupancy_status = 'reserved'
    and not exists (
      select 1 from public.reservation_rooms rr
      where rr.room_id = r.id and rr.released_at is null
    );

  update public.reservations
  set status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = p_reason
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

-- ---------------------------------------------------------------------------
-- Room allocation
-- ---------------------------------------------------------------------------
create or replace function public.allocate_room(
  p_reservation_id uuid,
  p_room_id uuid
)
returns public.reservation_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reservation public.reservations%rowtype;
  v_allocation public.reservation_rooms%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.is_staff() then
    raise exception 'Only receptionists or admins can allocate rooms' using errcode = '42501';
  end if;

  select * into v_reservation
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation % does not exist', p_reservation_id using errcode = 'P0002';
  end if;
  if v_reservation.status not in ('pending', 'confirmed') then
    raise exception 'Rooms can only be allocated to pending or confirmed reservations'
      using errcode = '23514';
  end if;

  insert into public.reservation_rooms (reservation_id, room_id)
  values (p_reservation_id, p_room_id)
  returning * into v_allocation;

  update public.rooms
  set occupancy_status = 'reserved'
  where id = p_room_id
    and occupancy_status = 'available';

  return v_allocation;
end;
$$;

create or replace function public.release_room(
  p_reservation_room_id uuid,
  p_reason text default null
)
returns public.reservation_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_allocation public.reservation_rooms%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.is_staff() then
    raise exception 'Only receptionists or admins can release rooms' using errcode = '42501';
  end if;

  update public.reservation_rooms
  set released_at = now(),
      release_reason = coalesce(p_reason, 'Released by staff')
  where id = p_reservation_room_id
    and released_at is null
  returning * into v_allocation;

  if not found then
    raise exception 'Allocation % not found or already released', p_reservation_room_id
      using errcode = 'P0002';
  end if;

  update public.rooms r
  set occupancy_status = 'available'
  where r.id = v_allocation.room_id
    and r.occupancy_status = 'reserved'
    and not exists (
      select 1 from public.reservation_rooms rr
      where rr.room_id = r.id and rr.released_at is null
    );

  return v_allocation;
end;
$$;

-- ---------------------------------------------------------------------------
-- Check-in / check-out
-- ---------------------------------------------------------------------------
create or replace function public.check_in_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reservation public.reservations%rowtype;
  v_allocated integer;
  v_not_clean integer;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.is_staff() then
    raise exception 'Only receptionists or admins can check guests in' using errcode = '42501';
  end if;

  select * into v_reservation
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation % does not exist', p_reservation_id using errcode = 'P0002';
  end if;
  if v_reservation.status <> 'confirmed' then
    raise exception 'Only confirmed reservations can be checked in' using errcode = '23514';
  end if;

  select count(*) into v_allocated
  from public.reservation_rooms
  where reservation_id = p_reservation_id and released_at is null;

  if v_allocated <> v_reservation.room_count then
    raise exception 'Reservation needs % allocated room(s), found %',
      v_reservation.room_count, v_allocated using errcode = '23514';
  end if;

  select count(*) into v_not_clean
  from public.reservation_rooms rr
  join public.rooms r on r.id = rr.room_id
  where rr.reservation_id = p_reservation_id
    and rr.released_at is null
    and r.housekeeping_status <> 'clean';

  if v_not_clean > 0 then
    raise exception 'All allocated rooms must be clean before check-in'
      using errcode = '23514';
  end if;

  insert into public.stay_records (
    reservation_id,
    reservation_room_id,
    room_id,
    checked_in_by
  )
  select rr.reservation_id, rr.id, rr.room_id, v_uid
  from public.reservation_rooms rr
  where rr.reservation_id = p_reservation_id
    and rr.released_at is null;

  update public.rooms r
  set occupancy_status = 'occupied'
  where r.id in (
    select rr.room_id
    from public.reservation_rooms rr
    where rr.reservation_id = p_reservation_id and rr.released_at is null
  );

  update public.reservations
  set status = 'checked_in'
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

create or replace function public.check_out_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_reservation public.reservations%rowtype;
  v_room record;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.is_staff() then
    raise exception 'Only receptionists or admins can check guests out' using errcode = '42501';
  end if;

  select * into v_reservation
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation % does not exist', p_reservation_id using errcode = 'P0002';
  end if;
  if v_reservation.status <> 'checked_in' then
    raise exception 'Only checked-in reservations can be checked out' using errcode = '23514';
  end if;

  update public.stay_records
  set checked_out_at = now(),
      checked_out_by = v_uid
  where reservation_id = p_reservation_id
    and checked_out_at is null;

  for v_room in
    select rr.room_id, rr.id as reservation_room_id
    from public.reservation_rooms rr
    where rr.reservation_id = p_reservation_id and rr.released_at is null
  loop
    update public.reservation_rooms
    set released_at = now(),
        release_reason = 'Checked out'
    where id = v_room.reservation_room_id;

    update public.rooms
    set occupancy_status = 'available'
    where id = v_room.room_id;

    insert into public.housekeeping_tasks (
      room_id,
      reservation_id,
      task_type,
      status,
      created_by
    )
    values (
      v_room.room_id,
      p_reservation_id,
      'checkout_clean',
      'dirty',
      v_uid
    );
  end loop;

  update public.reservations
  set status = 'completed'
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reports (admin only)
-- ---------------------------------------------------------------------------
create or replace function public.report_occupancy(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total_rooms integer;
  v_days integer;
  v_occupied_nights integer;
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can read reports' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception 'Report range must be a valid half-open [from, to) interval'
      using errcode = '22023';
  end if;

  v_days := p_to - p_from;

  select count(*) into v_total_rooms from public.rooms where is_active;

  select coalesce(sum(
    greatest(
      0,
      least(upper(rr.stay), p_to) - greatest(lower(rr.stay), p_from)
    )
  ), 0)::integer
  into v_occupied_nights
  from public.reservation_rooms rr
  join public.reservations res on res.id = rr.reservation_id
  where res.status <> 'cancelled'
    and rr.stay && daterange(p_from, p_to, '[)');

  v_result := jsonb_build_object(
    'from', p_from,
    'to', p_to,
    'days', v_days,
    'total_rooms', v_total_rooms,
    'occupied_room_nights', v_occupied_nights,
    'available_room_nights', greatest(v_total_rooms * v_days - v_occupied_nights, 0),
    'occupancy_rate', case
      when v_total_rooms * v_days = 0 then 0
      else round(v_occupied_nights::numeric / (v_total_rooms * v_days), 4)
    end
  );

  return v_result;
end;
$$;

create or replace function public.report_revenue(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can read reports' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception 'Report range must be a valid half-open [from, to) interval'
      using errcode = '22023';
  end if;

  select jsonb_build_object(
    'from', p_from,
    'to', p_to,
    'reservations_created', count(*),
    'gross_reservation_value', coalesce(sum(res.total_amount), 0),
    'paid_amount', coalesce(sum(case when pay.status = 'paid' then pay.amount else 0 end), 0),
    'unpaid_amount', coalesce(sum(case when pay.status = 'unpaid' then pay.amount else 0 end), 0)
  )
  into v_result
  from public.reservations res
  left join public.payments pay on pay.reservation_id = res.id
  where res.status <> 'cancelled'
    and res.created_at >= p_from::timestamptz
    and res.created_at < p_to::timestamptz;

  return v_result;
end;
$$;
