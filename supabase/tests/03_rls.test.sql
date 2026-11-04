-- Row Level Security and role-matrix tests. Requires the seeded demo data.
begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

-- ---------------------------------------------------------------------------
-- Anonymous visitor
-- ---------------------------------------------------------------------------
set local role anon;

select cmp_ok(
  (select count(*)::integer from public.room_types where is_active),
  '>=',
  3,
  'anonymous visitors can read active room types'
);

select cmp_ok(
  (select count(*)::integer from public.rooms where is_active),
  '>=',
  6,
  'anonymous visitors can read active rooms'
);

select throws_ok(
  $$ select id from public.reservations limit 1 $$,
  '42501',
  null,
  'anonymous visitors cannot read reservations'
);

reset role;

-- ---------------------------------------------------------------------------
-- Guest
-- ---------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111101","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.profiles),
  1,
  'a guest sees only their own profile'
);

select cmp_ok(
  (select count(*)::integer from public.reservations),
  '>=',
  2,
  'a guest sees their own reservations'
);

select is_empty(
  $$ select id from public.reservations
     where guest_id = '11111111-1111-4111-8111-111111111102' $$,
  'a guest cannot see another guest reservation'
);

select is_empty(
  $$ update public.reservations
     set special_requests = 'guest edit'
     returning id $$,
  'a guest cannot update reservations directly'
);

select throws_ok(
  $$ update public.profiles set email = 'spoofed@example.com' $$,
  '42501',
  null,
  'a guest cannot change their profile email outside Supabase Auth'
);

select throws_ok(
  $$
    insert into public.reservations (
      guest_id, room_type_id, check_in_date, check_out_date,
      nights, room_count, adults, children, rate_per_night, total_amount
    ) values (
      '11111111-1111-4111-8111-111111111101',
      '10000000-0000-4000-8000-000000000001',
      current_date + 40, current_date + 42, 2, 1, 1, 0, 450000, 900000
    )
  $$,
  '42501',
  null,
  'a guest cannot insert reservations outside the RPC'
);

select throws_ok(
  $$ select public.report_revenue(current_date, current_date + 30) $$,
  '42501',
  null,
  'a guest cannot read revenue reports'
);

reset role;

-- ---------------------------------------------------------------------------
-- Receptionist
-- ---------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222201","role":"authenticated"}',
  true
);
set local role authenticated;

select cmp_ok(
  (select count(*)::integer from public.reservations),
  '>=',
  5,
  'a receptionist can read every seeded reservation'
);

select cmp_ok(
  (select count(*)::integer from public.profiles),
  '>=',
  6,
  'a receptionist can read guest profiles'
);

select throws_ok(
  $$ update public.reservations set total_amount = 1
     where id = '40000000-0000-4000-8000-000000000002' $$,
  '42501',
  null,
  'a receptionist cannot rewrite reservation pricing'
);

select throws_ok(
  $$ update public.rooms set room_number = '999'
     where id = '20000000-0000-4000-8000-000000000101' $$,
  '42501',
  null,
  'a receptionist cannot rename a room'
);

reset role;

-- ---------------------------------------------------------------------------
-- Housekeeping
-- ---------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222202","role":"authenticated"}',
  true
);
set local role authenticated;

select cmp_ok(
  (select count(*)::integer from public.housekeeping_tasks),
  '>=',
  3,
  'housekeeping can read housekeeping tasks'
);

select is_empty(
  $$ select id from public.reservations $$,
  'housekeeping cannot read reservations'
);

select lives_ok(
  $$ update public.housekeeping_tasks set status = 'cleaning'
     where id = '80000000-0000-4000-8000-000000000102' $$,
  'housekeeping can progress an assigned task'
);

select throws_ok(
  $$ update public.rooms set occupancy_status = 'occupied'
     where id = '20000000-0000-4000-8000-000000000101' $$,
  '42501',
  null,
  'housekeeping cannot change room occupancy'
);

reset role;

-- ---------------------------------------------------------------------------
-- Administrator
-- ---------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222203","role":"authenticated"}',
  true
);
set local role authenticated;

select cmp_ok(
  (select count(*)::integer from public.profiles),
  '>=',
  6,
  'an administrator can read every profile'
);

select ok(
  (select public.report_revenue(current_date, current_date + 30))
    ? 'gross_reservation_value',
  'an administrator can read revenue reports'
);

reset role;

select * from finish();
rollback;
