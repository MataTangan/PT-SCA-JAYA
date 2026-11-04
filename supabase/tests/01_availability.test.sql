-- Availability function tests. Requires the seeded demo data.
begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

select ok(
  public.check_room_availability(
    '20000000-0000-4000-8000-000000000101',
    current_date + 100,
    current_date + 102
  ),
  'an unallocated active room is available'
);

select is(
  public.check_room_availability(
    '20000000-0000-4000-8000-000000000201',
    current_date + 14,
    current_date + 15
  ),
  false,
  'a room with an overlapping active allocation is unavailable'
);

select is(
  public.check_room_availability(
    '20000000-0000-4000-8000-000000000201',
    current_date + 20,
    current_date + 22
  ),
  true,
  'the same room is available outside the allocated window'
);

select is(
  public.check_room_availability(
    '20000000-0000-4000-8000-000000000201',
    current_date + 16,
    current_date + 14
  ),
  false,
  'invalid date ranges are unavailable'
);

select is(
  (select count(*)::integer from public.find_available_rooms(
    '10000000-0000-4000-8000-000000000002',
    current_date + 14,
    current_date + 16
  )),
  1,
  'find_available_rooms excludes the allocated deluxe room'
);

select is(
  (select room_number from public.find_available_rooms(
    '10000000-0000-4000-8000-000000000002',
    current_date + 14,
    current_date + 16
  )),
  '202',
  'find_available_rooms returns the remaining deluxe room'
);

select is(
  public.get_applicable_rate(
    '10000000-0000-4000-8000-000000000001',
    current_date
  ),
  450000.00::numeric,
  'get_applicable_rate returns the active standard rate'
);

select is(
  public.get_applicable_rate(
    '10000000-0000-4000-8000-000000000001',
    current_date + 1000
  ),
  450000.00::numeric,
  'an unbounded rate stays applicable in the future'
);

select is(
  public.stay_nights(current_date, current_date + 3),
  3,
  'stay_nights counts calendar nights'
);

-- The availability helper is security definer so anonymous and guest callers
-- get a correct answer without being able to read other guests' allocations.
set local role anon;

select is(
  public.check_room_availability(
    '20000000-0000-4000-8000-000000000201',
    current_date + 14,
    current_date + 15
  ),
  false,
  'anonymous callers get correct availability without allocation read access'
);

reset role;

select * from finish();
rollback;
