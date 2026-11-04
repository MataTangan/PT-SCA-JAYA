-- Schema, constraint, and trigger tests.
-- Run after `npx supabase db reset` so the deterministic seed data exists:
--   npm run db:reset && npm run test:db
begin;

create extension if not exists pgtap with schema extensions;

select plan(33);

-- ---------------------------------------------------------------------------
-- Tables, keys, and triggers
-- ---------------------------------------------------------------------------
select has_table('public', 'roles', 'roles table exists');
select has_table('public', 'permissions', 'permissions table exists');
select has_table('public', 'role_permissions', 'role_permissions table exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'room_types', 'room_types table exists');
select has_table('public', 'rooms', 'rooms table exists');
select has_table('public', 'facilities', 'facilities table exists');
select has_table('public', 'room_type_facilities', 'room_type_facilities table exists');
select has_table('public', 'room_rates', 'room_rates table exists');
select has_table('public', 'reservations', 'reservations table exists');
select has_table('public', 'reservation_rooms', 'reservation_rooms table exists');
select has_table('public', 'payments', 'payments table exists');
select has_table('public', 'stay_records', 'stay_records table exists');
select has_table('public', 'housekeeping_tasks', 'housekeeping_tasks table exists');

select has_pk('public', 'reservations', 'reservations has a primary key');
select has_pk('public', 'reservation_rooms', 'reservation_rooms has a primary key');
select has_pk('public', 'payments', 'payments has a primary key');

select has_trigger('public', 'reservations', 'reservations_enforce_status_transition',
  'reservation status trigger exists');
select has_trigger('public', 'reservation_rooms', 'reservation_rooms_prepare',
  'allocation trigger exists');
select has_trigger('public', 'payments', 'payments_prepare', 'payment trigger exists');
select has_trigger('public', 'housekeeping_tasks', 'housekeeping_tasks_sync',
  'housekeeping sync trigger exists');

select has_index('public', 'rooms', 'rooms_room_number_key', 'room number uniqueness index exists');
select has_index('public', 'reservations', 'reservations_code_search_idx',
  'reservation code search index exists');

-- ---------------------------------------------------------------------------
-- Reservation constraints
-- ---------------------------------------------------------------------------
select throws_ok(
  $$
    insert into public.reservations (
      reservation_code, guest_id, room_type_id, check_in_date, check_out_date,
      nights, room_count, adults, children, status, rate_per_night, total_amount
    ) values (
      'TEST-BAD-DATES', '11111111-1111-4111-8111-111111111101',
      '10000000-0000-4000-8000-000000000001',
      current_date + 5, current_date + 5, 1, 1, 1, 0, 'pending', 450000, 450000
    )
  $$,
  '23514',
  null,
  'rejects a stay whose check-out is not after check-in'
);

select throws_ok(
  $$
    insert into public.reservations (
      reservation_code, guest_id, room_type_id, check_in_date, check_out_date,
      nights, room_count, adults, children, status, rate_per_night, total_amount
    ) values (
      'TEST-BAD-NIGHTS', '11111111-1111-4111-8111-111111111101',
      '10000000-0000-4000-8000-000000000001',
      current_date + 5, current_date + 8, 2, 1, 1, 0, 'pending', 450000, 900000
    )
  $$,
  '23514',
  null,
  'rejects a nights value that does not match the stay'
);

select throws_ok(
  $$
    insert into public.reservations (
      reservation_code, guest_id, room_type_id, check_in_date, check_out_date,
      nights, room_count, adults, children, status, rate_per_night, total_amount
    ) values (
      'TEST-BAD-TOTAL', '11111111-1111-4111-8111-111111111101',
      '10000000-0000-4000-8000-000000000001',
      current_date + 5, current_date + 7, 2, 1, 1, 0, 'pending', 450000, 1
    )
  $$,
  '23514',
  null,
  'rejects a total that does not match rate * nights * room_count'
);

select throws_ok(
  $$ update public.reservations set status = 'checked_in'
     where id = '40000000-0000-4000-8000-000000000001' $$,
  '23514',
  null,
  'enforces valid reservation status transitions'
);

select throws_ok(
  $$ update public.payments set amount = 1
     where id = '60000000-0000-4000-8000-000000000001' $$,
  '23514',
  null,
  'requires payment amounts to equal the reservation total'
);

select throws_ok(
  $$ insert into public.room_rates (room_type_id, rate_per_night, valid_from)
     values ('10000000-0000-4000-8000-000000000001', 1, current_date - 10) $$,
  '23P01',
  null,
  'prevents overlapping active rate windows'
);

-- ---------------------------------------------------------------------------
-- Double-booking exclusion constraint
-- ---------------------------------------------------------------------------
insert into public.reservations (
  id, reservation_code, guest_id, room_type_id, check_in_date, check_out_date,
  nights, room_count, adults, children, status, rate_per_night, total_amount, created_by
) values (
  '90000000-0000-4000-8000-000000000001', 'TEST-OVERLAP',
  '11111111-1111-4111-8111-111111111101',
  '10000000-0000-4000-8000-000000000002',
  current_date + 14, current_date + 16, 2, 1, 1, 0, 'confirmed',
  750000, 1500000, '22222222-2222-4222-8222-222222222201'
);

select throws_ok(
  $$ insert into public.reservation_rooms (reservation_id, room_id)
     values ('90000000-0000-4000-8000-000000000001',
             '20000000-0000-4000-8000-000000000201') $$,
  '23P01',
  null,
  'rejects an allocation that overlaps an active allocation for the same room'
);

select throws_ok(
  $$ insert into public.reservation_rooms (reservation_id, room_id)
     values ('90000000-0000-4000-8000-000000000001',
             '20000000-0000-4000-8000-000000000101') $$,
  '23514',
  null,
  'rejects a room that does not match the reservation room type'
);

select throws_ok(
  $$ insert into public.payments (reservation_id, amount, currency)
     values ('90000000-0000-4000-8000-000000000001', 1, 'IDR') $$,
  '23514',
  null,
  'rejects a payment for the wrong amount at insert time'
);

-- Reservation identity/pricing are immutable for non-admin updates.
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222201","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$ update public.reservations set total_amount = 1
     where id = '40000000-0000-4000-8000-000000000002' $$,
  '42501',
  null,
  'rejects pricing changes by a receptionist'
);

reset role;

select * from finish();
rollback;
