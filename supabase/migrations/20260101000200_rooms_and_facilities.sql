-- ============================================================================
-- 20260101000200_rooms_and_facilities.sql
-- Room types, physical rooms, facilities, and room-type facility mapping.
-- ============================================================================

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  description text,
  capacity integer not null,
  size_sqm numeric(6, 2),
  bed_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_types_capacity_positive check (capacity > 0),
  constraint room_types_size_positive check (size_sqm is null or size_sqm > 0),
  constraint room_types_code_format check (code ~ '^[a-z0-9_]+$')
);

create index room_types_active_idx on public.room_types(is_active) where is_active;

create trigger room_types_set_updated_at
before update on public.room_types
for each row execute function public.set_updated_at();

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  category text not null default 'hotel',
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facilities_category_valid check (category in ('hotel', 'room')),
  constraint facilities_code_format check (code ~ '^[a-z0-9_]+$')
);

create index facilities_category_idx on public.facilities(category);
create index facilities_active_idx on public.facilities(is_active) where is_active;

create trigger facilities_set_updated_at
before update on public.facilities
for each row execute function public.set_updated_at();

create table public.room_type_facilities (
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (room_type_id, facility_id)
);

create index room_type_facilities_facility_id_idx
  on public.room_type_facilities(facility_id);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  floor integer not null default 1,
  notes text,
  occupancy_status public.occupancy_status not null default 'available',
  housekeeping_status public.housekeeping_status not null default 'clean',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_floor_positive check (floor >= 0),
  constraint rooms_number_not_blank check (length(btrim(room_number)) > 0)
);

create index rooms_room_type_id_idx on public.rooms(room_type_id);
create index rooms_occupancy_status_idx on public.rooms(occupancy_status);
create index rooms_housekeeping_status_idx on public.rooms(housekeeping_status);
create index rooms_active_idx on public.rooms(is_active) where is_active;
create index rooms_search_number_idx on public.rooms(room_number text_pattern_ops);

create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Guard direct room edits: non-admins may only touch the operational column
-- they own. Receptionists manage occupancy; housekeeping manages cleanliness.
-- ---------------------------------------------------------------------------
create or replace function public.guard_room_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.current_user_role();
begin
  -- Internal server-side functions mark their transaction as internal so they
  -- can synchronize derived room state (e.g. housekeeping after check-out)
  -- without widening what end users may edit.
  if current_setting('hotel.sca_internal', true) = 'on' then
    return new;
  end if;

  -- Trusted SQL contexts (migrations, seed, service-role maintenance) have no
  -- end-user JWT. RLS still governs every PostgREST request.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if v_role = 'receptionist' then
    if (new.room_number, new.room_type_id, new.floor, new.notes, new.housekeeping_status, new.is_active)
       is distinct from
       (old.room_number, old.room_type_id, old.floor, old.notes, old.housekeeping_status, old.is_active)
    then
      raise exception 'Receptionists may only change room occupancy status'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if v_role = 'housekeeping' then
    if (new.room_number, new.room_type_id, new.floor, new.notes, new.occupancy_status, new.is_active)
       is distinct from
       (old.room_number, old.room_type_id, old.floor, old.notes, old.occupancy_status, old.is_active)
    then
      raise exception 'Housekeeping may only change room housekeeping status'
        using errcode = '42501';
    end if;
    return new;
  end if;

  raise exception 'You are not allowed to modify rooms' using errcode = '42501';
end;
$$;

create trigger rooms_guard_update
before update on public.rooms
for each row execute function public.guard_room_update();
