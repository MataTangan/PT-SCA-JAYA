-- ============================================================================
-- 20260101000100_core_auth_and_roles.sql
-- Roles, permissions, profiles, auth integration, and authorization helpers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_slug_format check (slug ~ '^[a-z][a-z0-9_]*$')
);

comment on table public.roles is
  'Application roles. Guests self-register; staff roles are assigned by admins.';

create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- permissions (catalogue) and role_permissions (mapping)
-- ---------------------------------------------------------------------------
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint permissions_code_format check (code ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$')
);

comment on table public.permissions is
  'Fine-grained permission catalogue. RLS remains the primary enforcement layer.';

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create index role_permissions_permission_id_idx on public.role_permissions(permission_id);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role_id uuid not null references public.roles(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_not_blank check (length(btrim(full_name)) > 0),
  constraint profiles_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

comment on table public.profiles is
  'Public application profile for every auth.users row. Role changes are guarded.';

create unique index profiles_email_lower_key on public.profiles (lower(email));
create index profiles_role_id_idx on public.profiles(role_id);
create index profiles_is_active_idx on public.profiles(is_active) where is_active;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Authorization helpers (SECURITY DEFINER: read profiles/roles safely)
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.slug
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
    and p.is_active;
$$;

comment on function public.current_user_role() is
  'Role slug of the authenticated caller, or NULL when unauthenticated/inactive.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('receptionist', 'admin'), false);
$$;

create or replace function public.has_permission(p_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.profiles p
      join public.role_permissions rp on rp.role_id = p.role_id
      join public.permissions perm on perm.id = rp.permission_id
      where p.id = auth.uid()
        and p.is_active
        and perm.code = p_code
    );
$$;

comment on function public.has_permission(text) is
  'True when the caller holds the permission code. Admin implicitly holds all.';

-- ---------------------------------------------------------------------------
-- Auth integration: create a profile for every new auth user.
-- IMPORTANT: role is always guest at signup. raw_user_meta_data is untrusted
-- and must never be able to grant a staff role.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_role uuid;
  v_full_name text;
begin
  select id into v_guest_role from public.roles where slug = 'guest';
  if v_guest_role is null then
    raise exception 'Seed role "guest" is missing; run the seed before creating users'
      using errcode = '55000';
  end if;

  v_full_name := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  if v_full_name is null then
    v_full_name := split_part(coalesce(new.email, 'guest'), '@', 1);
  end if;

  insert into public.profiles (id, email, full_name, phone, role_id)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@placeholder.invalid'),
    v_full_name,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    v_guest_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Mark the synchronization as trusted so guard_profile_update does not block
  -- the auth-driven email update.
  perform set_config('hotel.sca_internal', 'on', true);

  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
after update of email on auth.users
for each row
when (new.email is distinct from old.email)
execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- Guards: prevent privilege escalation and invalid room/reservation edits.
-- These run even when a caller bypasses service-level checks and talks to
-- PostgREST directly.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Trusted internal synchronization (e.g. auth email change) bypasses the
  -- end-user column guards. RLS still applies to every PostgREST request.
  if current_setting('hotel.sca_internal', true) = 'on' then
    return new;
  end if;

  if new.email is distinct from old.email then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Only administrators can change a profile email'
        using errcode = '42501';
    end if;
  end if;

  if new.role_id is distinct from old.role_id or new.is_active is distinct from old.is_active then
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Only administrators can change a profile role or active status'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_update
before update on public.profiles
for each row execute function public.guard_profile_update();
