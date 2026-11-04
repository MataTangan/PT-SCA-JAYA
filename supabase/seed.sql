-- ============================================================================
-- Hotel SCA - local / development seed
--
-- WARNING: demo accounts use the publicly known password "Demo1234!".
-- This file is intended for local development and dedicated test projects
-- only. Never run it against production. No real secrets are stored here.
--
-- Run with: npx supabase db reset
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
insert into public.roles (id, slug, name, description) values
  ('00000000-0000-4000-8000-000000000001', 'guest', 'Guest', 'Hotel guest; self-service reservations'),
  ('00000000-0000-4000-8000-000000000002', 'receptionist', 'Receptionist', 'Front desk operations'),
  ('00000000-0000-4000-8000-000000000003', 'housekeeping', 'Housekeeping', 'Room cleanliness and readiness'),
  ('00000000-0000-4000-8000-000000000004', 'admin', 'Administrator', 'Configuration, accounts, and reports')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

-- ---------------------------------------------------------------------------
-- Permission catalogue
-- ---------------------------------------------------------------------------
insert into public.permissions (code, module, description) values
  ('profile.read', 'users', 'Read own profile'),
  ('profile.update', 'users', 'Update own profile'),
  ('role.read', 'roles', 'Read roles and permissions'),
  ('role.manage', 'roles', 'Manage roles and permissions'),
  ('room.read', 'rooms', 'Read room types and physical rooms'),
  ('room.manage', 'rooms', 'Create and edit rooms and room types'),
  ('facility.manage', 'facilities', 'Manage hotel and room facilities'),
  ('rate.read', 'pricing', 'Read room rates'),
  ('rate.manage', 'pricing', 'Manage room rates'),
  ('reservation.read', 'reservations', 'Read reservations'),
  ('reservation.create', 'reservations', 'Create reservations'),
  ('reservation.manage', 'reservations', 'Update and confirm reservations'),
  ('reservation.cancel', 'reservations', 'Cancel reservations'),
  ('availability.read', 'availability', 'Check room availability'),
  ('allocation.manage', 'room-allocation', 'Allocate and release rooms'),
  ('checkin.manage', 'check-in-out', 'Process check-in'),
  ('checkout.manage', 'check-in-out', 'Process check-out'),
  ('payment.read', 'payments', 'Read payments'),
  ('payment.manage', 'payments', 'Record and update payments'),
  ('housekeeping.read', 'housekeeping', 'Read housekeeping tasks'),
  ('housekeeping.update', 'housekeeping', 'Update housekeeping status'),
  ('report.read', 'reports', 'Read occupancy and revenue reports')
on conflict (code) do update
set module = excluded.module,
    description = excluded.description;

-- ---------------------------------------------------------------------------
-- Role -> permission mapping
-- ---------------------------------------------------------------------------
delete from public.role_permissions;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any (
  case r.slug
    when 'guest' then array[
      'profile.read', 'profile.update', 'reservation.read', 'reservation.create',
      'reservation.cancel', 'availability.read', 'payment.read', 'rate.read', 'room.read'
    ]
    when 'receptionist' then array[
      'profile.read', 'room.read', 'rate.read', 'reservation.read', 'reservation.create',
      'reservation.manage', 'reservation.cancel', 'availability.read', 'allocation.manage',
      'checkin.manage', 'checkout.manage', 'payment.read', 'payment.manage',
      'housekeeping.read', 'housekeeping.update'
    ]
    when 'housekeeping' then array[
      'profile.read', 'room.read', 'housekeeping.read', 'housekeeping.update'
    ]
    else (select array_agg(code) from public.permissions)
  end
);

-- ---------------------------------------------------------------------------
-- Demo auth users. The trigger creates a guest profile for each row.
-- Staff profiles are promoted explicitly below (never via client metadata).
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111101',
    'authenticated', 'authenticated', 'guest1@hotel-sca.test',
    extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Ayu Lestari","phone":"081200000001"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111102',
    'authenticated', 'authenticated', 'guest2@hotel-sca.test',
    extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Bima Pratama","phone":"081200000002"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111103',
    'authenticated', 'authenticated', 'guest3@hotel-sca.test',
    extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Citra Maharani","phone":"081200000003"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222201',
    'authenticated', 'authenticated', 'receptionist@hotel-sca.test',
    extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Raka Saputra","phone":"081200000010"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222202',
    'authenticated', 'authenticated', 'housekeeping@hotel-sca.test',
    extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sari Wulandari","phone":"081200000011"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222203',
    'authenticated', 'authenticated', 'admin@hotel-sca.test',
    extensions.crypt('Demo1234!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dewi Anggraini","phone":"081200000012"}'::jsonb,
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(), now(), now()
from auth.users u
where u.id in (
  '11111111-1111-4111-8111-111111111101',
  '11111111-1111-4111-8111-111111111102',
  '11111111-1111-4111-8111-111111111103',
  '22222222-2222-4222-8222-222222222201',
  '22222222-2222-4222-8222-222222222202',
  '22222222-2222-4222-8222-222222222203'
)
on conflict do nothing;

update public.profiles p
set role_id = r.id,
    full_name = d.full_name,
    phone = d.phone
from (
  values
    ('11111111-1111-4111-8111-111111111101'::uuid, 'guest', 'Ayu Lestari', '081200000001'),
    ('11111111-1111-4111-8111-111111111102'::uuid, 'guest', 'Bima Pratama', '081200000002'),
    ('11111111-1111-4111-8111-111111111103'::uuid, 'guest', 'Citra Maharani', '081200000003'),
    ('22222222-2222-4222-8222-222222222201'::uuid, 'receptionist', 'Raka Saputra', '081200000010'),
    ('22222222-2222-4222-8222-222222222202'::uuid, 'housekeeping', 'Sari Wulandari', '081200000011'),
    ('22222222-2222-4222-8222-222222222203'::uuid, 'admin', 'Dewi Anggraini', '081200000012')
) as d(id, role_slug, full_name, phone)
join public.roles r on r.slug = d.role_slug
where p.id = d.id;

-- ---------------------------------------------------------------------------
-- Room types
-- ---------------------------------------------------------------------------
insert into public.room_types (
  id, code, name, description, capacity, size_sqm, bed_type
) values
  (
    '10000000-0000-4000-8000-000000000001', 'standard', 'Standard',
    'A simple, comfortable room for solo travellers and couples.', 2, 24.00, 'Twin'
  ),
  (
    '10000000-0000-4000-8000-000000000002', 'deluxe', 'Deluxe',
    'A larger room with a seating area and a king-size bed.', 3, 34.00, 'King'
  ),
  (
    '10000000-0000-4000-8000-000000000003', 'suite', 'Suite',
    'A premium suite with a separate living room.', 4, 56.00, 'King'
  )
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    capacity = excluded.capacity,
    size_sqm = excluded.size_sqm,
    bed_type = excluded.bed_type;

-- ---------------------------------------------------------------------------
-- Facilities
-- ---------------------------------------------------------------------------
insert into public.facilities (code, name, description, category, icon) values
  ('restaurant', 'Restaurant', 'On-site dining for breakfast, lunch, and dinner.', 'hotel', 'utensils'),
  ('swimming_pool', 'Swimming Pool', 'Outdoor pool for guests.', 'hotel', 'waves'),
  ('fitness_center', 'Fitness Center', 'Exercise equipment and training space.', 'hotel', 'dumbbell'),
  ('meeting_room', 'Meeting Room', 'Space for meetings and business events.', 'hotel', 'presentation'),
  ('parking_area', 'Parking Area', 'Parking for hotel guests.', 'hotel', 'car'),
  ('front_desk_24h', '24-Hour Front Desk', 'Reception assistance around the clock.', 'hotel', 'concierge-bell'),
  ('ac', 'Air Conditioning', 'Individual air conditioning.', 'room', 'wind'),
  ('tv', 'Television', 'In-room television.', 'room', 'tv'),
  ('wifi', 'Wi-Fi', 'Complimentary internet access.', 'room', 'wifi'),
  ('private_bathroom', 'Private Bathroom', 'En-suite bathroom.', 'room', 'bath'),
  ('work_desk', 'Work Desk', 'Desk for working or studying.', 'room', 'laptop'),
  ('seating_area', 'Seating Area', 'Lounge seating inside the room.', 'room', 'armchair'),
  ('living_room', 'Separate Living Room', 'Separate living area in the suite.', 'room', 'sofa'),
  ('king_bed', 'King Bed', 'King-size bed.', 'room', 'bed-double'),
  ('twin_bed', 'Twin Beds', 'Two single beds.', 'room', 'bed-single')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    icon = excluded.icon;

insert into public.room_type_facilities (room_type_id, facility_id)
select rt.id, f.id
from (
  values
    ('standard', 'ac'),
    ('standard', 'tv'),
    ('standard', 'wifi'),
    ('standard', 'private_bathroom'),
    ('standard', 'work_desk'),
    ('standard', 'twin_bed'),
    ('deluxe', 'ac'),
    ('deluxe', 'tv'),
    ('deluxe', 'wifi'),
    ('deluxe', 'private_bathroom'),
    ('deluxe', 'work_desk'),
    ('deluxe', 'seating_area'),
    ('deluxe', 'king_bed'),
    ('suite', 'ac'),
    ('suite', 'tv'),
    ('suite', 'wifi'),
    ('suite', 'private_bathroom'),
    ('suite', 'work_desk'),
    ('suite', 'seating_area'),
    ('suite', 'living_room'),
    ('suite', 'king_bed')
) as mapping(room_type_code, facility_code)
join public.room_types rt on rt.code = mapping.room_type_code
join public.facilities f on f.code = mapping.facility_code
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Physical rooms
-- ---------------------------------------------------------------------------
insert into public.rooms (id, room_number, room_type_id, floor, notes) values
  ('20000000-0000-4000-8000-000000000101', '101', '10000000-0000-4000-8000-000000000001', 1, null),
  ('20000000-0000-4000-8000-000000000102', '102', '10000000-0000-4000-8000-000000000001', 1, null),
  ('20000000-0000-4000-8000-000000000103', '103', '10000000-0000-4000-8000-000000000001', 1, null),
  ('20000000-0000-4000-8000-000000000201', '201', '10000000-0000-4000-8000-000000000002', 2, null),
  ('20000000-0000-4000-8000-000000000202', '202', '10000000-0000-4000-8000-000000000002', 2, null),
  ('20000000-0000-4000-8000-000000000301', '301', '10000000-0000-4000-8000-000000000003', 3, null)
on conflict (room_number) do update
set room_type_id = excluded.room_type_id,
    floor = excluded.floor,
    notes = excluded.notes;

-- ---------------------------------------------------------------------------
-- Rates (IDR)
-- ---------------------------------------------------------------------------
insert into public.room_rates (
  id, room_type_id, rate_per_night, currency, valid_from, valid_to, is_active
) values
  ('30000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001',
   450000.00, 'IDR', current_date - 365, null, true),
  ('30000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000002',
   750000.00, 'IDR', current_date - 365, null, true),
  ('30000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000003',
   1500000.00, 'IDR', current_date - 365, null, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample reservations
-- SEED-001 pending future stay
-- SEED-002 confirmed future stay, room 201 allocated, paid
-- SEED-003 checked-in current stay, room 202 occupied, paid
-- SEED-004 completed past stay, room 103 released, paid
-- SEED-005 cancelled past stay, room 301 released, unpaid
-- ---------------------------------------------------------------------------
insert into public.reservations (
  id, reservation_code, guest_id, room_type_id, check_in_date, check_out_date,
  nights, room_count, adults, children, status, rate_per_night, total_amount,
  created_by
) values
  (
    '40000000-0000-4000-8000-000000000001', 'SEED-001',
    '11111111-1111-4111-8111-111111111101', '10000000-0000-4000-8000-000000000001',
    current_date + 7, current_date + 9, 2, 1, 2, 0, 'pending', 450000.00, 900000.00,
    '11111111-1111-4111-8111-111111111101'
  ),
  (
    '40000000-0000-4000-8000-000000000002', 'SEED-002',
    '11111111-1111-4111-8111-111111111102', '10000000-0000-4000-8000-000000000002',
    current_date + 14, current_date + 16, 2, 1, 2, 0, 'confirmed', 750000.00, 1500000.00,
    '22222222-2222-4222-8222-222222222201'
  ),
  (
    '40000000-0000-4000-8000-000000000003', 'SEED-003',
    '11111111-1111-4111-8111-111111111103', '10000000-0000-4000-8000-000000000002',
    current_date - 1, current_date + 2, 3, 1, 1, 1, 'confirmed', 750000.00, 2250000.00,
    '22222222-2222-4222-8222-222222222201'
  ),
  (
    '40000000-0000-4000-8000-000000000004', 'SEED-004',
    '11111111-1111-4111-8111-111111111101', '10000000-0000-4000-8000-000000000001',
    current_date - 10, current_date - 7, 3, 1, 1, 0, 'confirmed', 450000.00, 1350000.00,
    '22222222-2222-4222-8222-222222222201'
  ),
  (
    '40000000-0000-4000-8000-000000000005', 'SEED-005',
    '11111111-1111-4111-8111-111111111102', '10000000-0000-4000-8000-000000000003',
    current_date - 5, current_date - 3, 2, 1, 2, 0, 'pending', 1500000.00, 3000000.00,
    '11111111-1111-4111-8111-111111111102'
  )
on conflict (id) do nothing;

-- Active allocations (trigger copies stay/pricing from the reservation).
insert into public.reservation_rooms (
  id, reservation_id, room_id, check_in_date, check_out_date, nights,
  rate_per_night, subtotal, allocated_by
) values
  (
    '50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000201', current_date, current_date + 1, 1,
    1.00, 1.00, '22222222-2222-4222-8222-222222222201'
  ),
  (
    '50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000202', current_date, current_date + 1, 1,
    1.00, 1.00, '22222222-2222-4222-8222-222222222201'
  ),
  (
    '50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000103', current_date, current_date + 1, 1,
    1.00, 1.00, '22222222-2222-4222-8222-222222222201'
  ),
  (
    '50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000301', current_date, current_date + 1, 1,
    1.00, 1.00, '11111111-1111-4111-8111-111111111102'
  )
on conflict (id) do nothing;

-- Progress seeded reservations through the valid transitions.
update public.reservations
set status = 'checked_in'
where id = '40000000-0000-4000-8000-000000000003';

update public.reservations
set status = 'checked_in'
where id = '40000000-0000-4000-8000-000000000004';

update public.reservations
set status = 'completed'
where id = '40000000-0000-4000-8000-000000000004';

update public.reservations
set status = 'cancelled',
    cancellation_reason = 'Guest changed travel plans'
where id = '40000000-0000-4000-8000-000000000005';

-- Release the historical allocations only after the statuses are final.
update public.reservation_rooms
set released_at = now() - interval '7 days',
    release_reason = 'Checked out'
where id = '50000000-0000-4000-8000-000000000004';

update public.reservation_rooms
set released_at = now() - interval '3 days',
    release_reason = 'Reservation cancelled'
where id = '50000000-0000-4000-8000-000000000005';

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
insert into public.payments (
  id, reservation_id, amount, currency, status, method, paid_at, recorded_by
) values
  (
    '60000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001',
    900000.00, 'IDR', 'unpaid', null, null, null
  ),
  (
    '60000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002',
    1500000.00, 'IDR', 'paid', 'bank_transfer', now() - interval '1 day',
    '22222222-2222-4222-8222-222222222201'
  ),
  (
    '60000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003',
    2250000.00, 'IDR', 'paid', 'credit_card', now() - interval '2 days',
    '22222222-2222-4222-8222-222222222201'
  ),
  (
    '60000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004',
    1350000.00, 'IDR', 'paid', 'cash', now() - interval '10 days',
    '22222222-2222-4222-8222-222222222201'
  ),
  (
    '60000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000005',
    3000000.00, 'IDR', 'unpaid', null, null, null
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Stay records
-- ---------------------------------------------------------------------------
insert into public.stay_records (
  id, reservation_id, reservation_room_id, room_id,
  checked_in_at, checked_in_by, checked_out_at, checked_out_by
) values
  (
    '70000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000202',
    now() - interval '1 day', '22222222-2222-4222-8222-222222222201', null, null
  ),
  (
    '70000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004',
    '50000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000103',
    now() - interval '10 days', '22222222-2222-4222-8222-222222222201',
    now() - interval '7 days', '22222222-2222-4222-8222-222222222201'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Room operational state
-- 201 reserved (future confirmed stay), 202 occupied (current stay).
-- ---------------------------------------------------------------------------
update public.rooms
set occupancy_status = case
  when id = '20000000-0000-4000-8000-000000000201' then 'reserved'::public.occupancy_status
  when id = '20000000-0000-4000-8000-000000000202' then 'occupied'::public.occupancy_status
  else 'available'::public.occupancy_status
end;

-- ---------------------------------------------------------------------------
-- Housekeeping tasks (the trigger synchronizes rooms.housekeeping_status)
-- ---------------------------------------------------------------------------
insert into public.housekeeping_tasks (
  id, room_id, reservation_id, task_type, status, assigned_to, notes, created_by,
  started_at, completed_at
) values
  (
    '80000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000102',
    null, 'deep_clean', 'dirty', '22222222-2222-4222-8222-222222222202',
    'Deep clean after maintenance.', '22222222-2222-4222-8222-222222222203', null, null
  ),
  (
    '80000000-0000-4000-8000-000000000103', '20000000-0000-4000-8000-000000000103',
    '40000000-0000-4000-8000-000000000004', 'checkout_clean', 'clean',
    '22222222-2222-4222-8222-222222222202', 'Post check-out cleaning.',
    '22222222-2222-4222-8222-222222222201', now() - interval '7 days', now() - interval '6 days'
  ),
  (
    '80000000-0000-4000-8000-000000000301', '20000000-0000-4000-8000-000000000301',
    null, 'stayover_clean', 'cleaning', '22222222-2222-4222-8222-222222222202',
    'Suite turnover in progress.', '22222222-2222-4222-8222-222222222203',
    now() - interval '1 hour', null
  )
on conflict (id) do nothing;
