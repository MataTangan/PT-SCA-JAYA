-- ============================================================================
-- 20260101000000_extensions_and_enums.sql
-- Extensions, shared enums, and the updated_at trigger helper.
-- ============================================================================

-- Supabase projects normally provide this schema; create it for plain local
-- PostgreSQL instances so extension installation stays portable.
create schema if not exists extensions;

-- gen_random_uuid() is provided by pgcrypto on older PostgreSQL versions.
create extension if not exists pgcrypto with schema extensions;

-- btree_gist is installed in public so the GiST exclusion constraints below
-- resolve their operator classes without depending on a session search_path.
create extension if not exists btree_gist with schema public;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'checked_in',
  'completed',
  'cancelled'
);

create type public.payment_status as enum ('unpaid', 'paid');

create type public.payment_method as enum (
  'cash',
  'bank_transfer',
  'credit_card',
  'debit_card',
  'ewallet'
);

create type public.occupancy_status as enum ('available', 'reserved', 'occupied');

create type public.housekeeping_status as enum ('clean', 'dirty', 'cleaning');

create type public.housekeeping_task_type as enum (
  'checkout_clean',
  'stayover_clean',
  'deep_clean',
  'inspection'
);

-- ---------------------------------------------------------------------------
-- Shared trigger helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger helper that stamps updated_at.';

-- ---------------------------------------------------------------------------
-- Domain helper: the number of nights between two dates.
-- The uniqueness/consistency of a reservation stay is enforced by CHECK
-- constraints; this helper exists for read-side reporting.
-- ---------------------------------------------------------------------------
create or replace function public.stay_nights(p_check_in date, p_check_out date)
returns integer
language sql
immutable
as $$
  select (p_check_out - p_check_in)::integer;
$$;

comment on function public.stay_nights(date, date) is
  'Nights between check-in and check-out. Returns <= 0 for invalid ranges.';
