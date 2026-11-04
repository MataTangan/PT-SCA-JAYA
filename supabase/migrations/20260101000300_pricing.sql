-- ============================================================================
-- 20260101000300_pricing.sql
-- Room rates with non-overlapping validity windows per room type.
-- ============================================================================

create table public.room_rates (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  rate_per_night numeric(12, 2) not null,
  currency char(3) not null default 'IDR',
  valid_from date not null,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_rates_amount_positive check (rate_per_night > 0),
  constraint room_rates_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint room_rates_window_valid check (valid_to is null or valid_to > valid_from),
  -- Two active rates for the same room type may never overlap. The range is
  -- half-open [valid_from, valid_to) and an unbounded valid_to means "current".
  constraint room_rates_no_overlap exclude using gist (
    room_type_id with =,
    daterange(valid_from, valid_to, '[)') with &&
  ) where (is_active)
);

create index room_rates_room_type_id_idx on public.room_rates(room_type_id);
create index room_rates_lookup_idx
  on public.room_rates(room_type_id, valid_from desc)
  where is_active;

create trigger room_rates_set_updated_at
before update on public.room_rates
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Resolve the rate that applies on a single date.
-- Only one active rate can match; the exclusion constraint guarantees it.
-- ---------------------------------------------------------------------------
create or replace function public.get_applicable_rate(
  p_room_type_id uuid,
  p_date date
)
returns numeric(12, 2)
language sql
stable
set search_path = public
as $$
  select rr.rate_per_night
  from public.room_rates rr
  where rr.room_type_id = p_room_type_id
    and rr.is_active
    and rr.valid_from <= p_date
    and (rr.valid_to is null or p_date < rr.valid_to)
  order by rr.valid_from desc
  limit 1;
$$;

comment on function public.get_applicable_rate(uuid, date) is
  'Active nightly rate for a room type on a date. NULL when no rate is configured.';
