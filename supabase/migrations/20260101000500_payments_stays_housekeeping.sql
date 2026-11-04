-- ============================================================================
-- 20260101000500_payments_stays_housekeeping.sql
-- Payments, stay records, and housekeeping tasks.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- payments
-- The initial business model records one full payment per reservation
-- (status unpaid/paid). Partial payments are not supported; see docs.
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations(id) on delete cascade,
  amount numeric(12, 2) not null,
  currency char(3) not null default 'IDR',
  status public.payment_status not null default 'unpaid',
  method public.payment_method,
  paid_at timestamptz,
  recorded_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_non_negative check (amount >= 0),
  constraint payments_currency_format check (currency ~ '^[A-Z]{3}$')
);

create index payments_status_idx on public.payments(status);
create index payments_paid_at_idx on public.payments(paid_at) where paid_at is not null;

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create or replace function public.prepare_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations%rowtype;
begin
  select * into v_reservation from public.reservations where id = new.reservation_id;
  if not found then
    raise exception 'Reservation % does not exist', new.reservation_id using errcode = '23503';
  end if;

  if new.amount <> v_reservation.total_amount then
    raise exception 'Payment amount (%) must equal the reservation total (%)',
      new.amount, v_reservation.total_amount using errcode = '23514';
  end if;

  if new.currency <> v_reservation.currency then
    raise exception 'Payment currency must match the reservation currency'
      using errcode = '23514';
  end if;

  if new.status = 'paid' then
    new.paid_at := coalesce(new.paid_at, now());
  else
    new.paid_at := null;
  end if;

  if new.recorded_by is null then
    new.recorded_by := auth.uid();
  end if;

  return new;
end;
$$;

create trigger payments_prepare
before insert or update on public.payments
for each row execute function public.prepare_payment();

-- ---------------------------------------------------------------------------
-- stay_records
-- One record per allocated physical room, so multi-room reservations are
-- represented correctly.
-- ---------------------------------------------------------------------------
create table public.stay_records (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  reservation_room_id uuid not null unique
    references public.reservation_rooms(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references public.profiles(id) on delete set null,
  checked_out_at timestamptz,
  checked_out_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stay_records_checkout_after_checkin
    check (checked_out_at is null or checked_out_at > checked_in_at)
);

create index stay_records_reservation_id_idx on public.stay_records(reservation_id);
create index stay_records_room_id_idx on public.stay_records(room_id);
create index stay_records_open_idx on public.stay_records(room_id) where checked_out_at is null;

create trigger stay_records_set_updated_at
before update on public.stay_records
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- housekeeping_tasks
-- ---------------------------------------------------------------------------
create table public.housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete set null,
  task_type public.housekeeping_task_type not null default 'checkout_clean',
  status public.housekeeping_status not null default 'dirty',
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index housekeeping_tasks_room_id_idx on public.housekeeping_tasks(room_id);
create index housekeeping_tasks_status_idx on public.housekeeping_tasks(status);
create index housekeeping_tasks_assigned_to_idx
  on public.housekeeping_tasks(assigned_to)
  where assigned_to is not null;
create index housekeeping_tasks_open_idx
  on public.housekeeping_tasks(room_id, status)
  where status <> 'clean';

create trigger housekeeping_tasks_set_updated_at
before update on public.housekeeping_tasks
for each row execute function public.set_updated_at();

create or replace function public.guard_housekeeping_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if public.current_user_role() = 'housekeeping' then
    if (new.room_id, new.reservation_id, new.task_type, new.notes, new.created_by)
       is distinct from
       (old.room_id, old.reservation_id, old.task_type, old.notes, old.created_by)
    then
      raise exception 'Housekeeping may only update task status and assignment'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if public.is_staff() then
    return new;
  end if;

  raise exception 'You are not allowed to modify housekeeping tasks'
    using errcode = '42501';
end;
$$;

create trigger housekeeping_tasks_guard_update
before update on public.housekeeping_tasks
for each row execute function public.guard_housekeeping_task_update();

-- Keep room cleanliness and task timestamps consistent.
create or replace function public.sync_housekeeping_task()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'cleaning' then
      new.started_at := coalesce(new.started_at, now());
    elsif new.status = 'clean' then
      new.started_at := coalesce(new.started_at, now());
      new.completed_at := coalesce(new.completed_at, now());
    end if;
  elsif tg_op = 'UPDATE' then
    if new.status = 'dirty' and old.status <> 'dirty' then
      new.started_at := null;
      new.completed_at := null;
    elsif new.status = 'cleaning' and old.status <> 'cleaning' then
      new.started_at := coalesce(new.started_at, now());
      new.completed_at := null;
    elsif new.status = 'clean' and old.status <> 'clean' then
      new.started_at := coalesce(new.started_at, now());
      new.completed_at := coalesce(new.completed_at, now());
    end if;
  end if;

  perform set_config('hotel.sca_internal', 'on', true);

  update public.rooms
  set housekeeping_status = new.status
  where id = new.room_id;

  return new;
end;
$$;

create trigger housekeeping_tasks_sync
before insert or update on public.housekeeping_tasks
for each row execute function public.sync_housekeeping_task();
