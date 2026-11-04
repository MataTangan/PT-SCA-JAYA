-- End-to-end reservation lifecycle through the security-definer RPCs.
-- Requires the seeded demo data.
begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

-- Guest creates a reservation for themselves.
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111101","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$
    select public.create_reservation(
      '10000000-0000-4000-8000-000000000001',
      current_date + 30,
      current_date + 32,
      2,
      0,
      1,
      'Lifecycle test'
    )
  $$,
  'a guest can create their own reservation'
);

select is(
  (
    select count(*)::integer
    from public.reservations
    where guest_id = '11111111-1111-4111-8111-111111111101'
      and check_in_date = current_date + 30
  ),
  1,
  'the reservation is visible to its owner'
);

select is(
  (
    select status::text
    from public.reservations
    where guest_id = '11111111-1111-4111-8111-111111111101'
      and check_in_date = current_date + 30
  ),
  'pending',
  'new reservations start pending'
);

select is(
  (
    select total_amount
    from public.reservations
    where guest_id = '11111111-1111-4111-8111-111111111101'
      and check_in_date = current_date + 30
  ),
  900000.00::numeric,
  'the database computes the total from the configured rate'
);

select is(
  (
    select count(*)::integer
    from public.payments
    where reservation_id = (
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    )
  ),
  1,
  'creation also creates the unpaid payment record'
);

select throws_ok(
  $$
    select public.confirm_reservation((
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    ))
  $$,
  '42501',
  null,
  'a guest cannot confirm a reservation'
);

select throws_ok(
  $$
    select public.allocate_room(
      (select id from public.reservations
       where guest_id = '11111111-1111-4111-8111-111111111101'
         and check_in_date = current_date + 30),
      '20000000-0000-4000-8000-000000000101'
    )
  $$,
  '42501',
  null,
  'a guest cannot allocate rooms'
);

-- Receptionist confirms, allocates, checks in, and checks out.
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222201","role":"authenticated"}',
  true
);

select lives_ok(
  $$
    select public.confirm_reservation((
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    ))
  $$,
  'a receptionist can confirm a pending reservation'
);

select is(
  (
    select status::text from public.reservations
    where guest_id = '11111111-1111-4111-8111-111111111101'
      and check_in_date = current_date + 30
  ),
  'confirmed',
  'the reservation is confirmed'
);

select lives_ok(
  $$
    select public.allocate_room(
      (select id from public.reservations
       where guest_id = '11111111-1111-4111-8111-111111111101'
         and check_in_date = current_date + 30),
      '20000000-0000-4000-8000-000000000101'
    )
  $$,
  'a receptionist can allocate a matching free room'
);

select is(
  (
    select occupancy_status::text from public.rooms
    where id = '20000000-0000-4000-8000-000000000101'
  ),
  'reserved',
  'allocation marks the room reserved'
);

select lives_ok(
  $$
    select public.check_in_reservation((
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    ))
  $$,
  'a receptionist can check in a confirmed, fully allocated reservation'
);

select is(
  (
    select status::text from public.reservations
    where guest_id = '11111111-1111-4111-8111-111111111101'
      and check_in_date = current_date + 30
  ),
  'checked_in',
  'check-in advances the reservation status'
);

select is(
  (
    select count(*)::integer from public.stay_records
    where reservation_id = (
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    )
  ),
  1,
  'check-in creates one stay record per allocated room'
);

select is(
  (
    select occupancy_status::text from public.rooms
    where id = '20000000-0000-4000-8000-000000000101'
  ),
  'occupied',
  'check-in marks the room occupied'
);

select lives_ok(
  $$
    select public.check_out_reservation((
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    ))
  $$,
  'a receptionist can check out an in-house reservation'
);

select is(
  (
    select status::text from public.reservations
    where guest_id = '11111111-1111-4111-8111-111111111101'
      and check_in_date = current_date + 30
  ),
  'completed',
  'check-out completes the reservation'
);

select is(
  (
    select occupancy_status::text from public.rooms
    where id = '20000000-0000-4000-8000-000000000101'
  ),
  'available',
  'check-out releases the room'
);

select is(
  (
    select count(*)::integer from public.housekeeping_tasks
    where room_id = '20000000-0000-4000-8000-000000000101'
      and task_type = 'checkout_clean'
  ),
  1,
  'check-out creates a checkout cleaning task'
);

select throws_ok(
  $$
    select public.check_out_reservation((
      select id from public.reservations
      where guest_id = '11111111-1111-4111-8111-111111111101'
        and check_in_date = current_date + 30
    ))
  $$,
  '23514',
  null,
  'a completed reservation cannot be checked out again'
);

reset role;

select * from finish();
rollback;
