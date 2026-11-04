-- ============================================================================
-- 20260101000800_rls_policies.sql
-- Role-based Row Level Security.
--
-- Key rules:
--   * Guests read/own their profile and reservations only.
--   * Receptionists read operational data and progress reservations, but the
--     guard triggers prevent them from rewriting pricing/identity fields.
--   * Housekeeping reads rooms/tasks and updates cleanliness only.
--   * Admins manage configuration, accounts, and reports.
--   * anon may read only the public catalogue: room types, rooms, facilities,
--     room-type facilities, and active rates.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- roles / permissions / role_permissions
-- ---------------------------------------------------------------------------
create policy "roles readable by authenticated users"
on public.roles for select to authenticated
using (true);

create policy "roles managed by admins"
on public.roles for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "permissions readable by authenticated users"
on public.permissions for select to authenticated
using (true);

create policy "permissions managed by admins"
on public.permissions for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "role permissions readable by authenticated users"
on public.role_permissions for select to authenticated
using (true);

create policy "role permissions managed by admins"
on public.role_permissions for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles readable by owner or staff"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_staff());

create policy "profiles inserted by admins"
on public.profiles for insert to authenticated
with check (public.is_admin());

create policy "profiles updated by owner or admins"
on public.profiles for update to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

create policy "profiles deleted by admins"
on public.profiles for delete to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- room types / facilities / room_type_facilities / room_rates
-- ---------------------------------------------------------------------------
create policy "active room types are public"
on public.room_types for select to anon, authenticated
using (is_active or public.is_admin());

create policy "room types managed by admins"
on public.room_types for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "active facilities are public"
on public.facilities for select to anon, authenticated
using (is_active or public.is_admin());

create policy "facilities managed by admins"
on public.facilities for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "room type facilities are public"
on public.room_type_facilities for select to anon, authenticated
using (true);

create policy "room type facilities managed by admins"
on public.room_type_facilities for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "active room rates are public"
on public.room_rates for select to anon, authenticated
using (is_active or public.is_admin());

create policy "room rates managed by admins"
on public.room_rates for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- rooms
-- ---------------------------------------------------------------------------
create policy "active rooms are public"
on public.rooms for select to anon, authenticated
using (is_active or public.is_admin());

create policy "rooms inserted by admins"
on public.rooms for insert to authenticated
with check (public.is_admin());

create policy "rooms updated by operations staff"
on public.rooms for update to authenticated
using (public.is_admin() or public.current_user_role() in ('receptionist', 'housekeeping'))
with check (public.is_admin() or public.current_user_role() in ('receptionist', 'housekeeping'));

create policy "rooms deleted by admins"
on public.rooms for delete to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reservations
-- ---------------------------------------------------------------------------
create policy "reservations readable by owner or staff"
on public.reservations for select to authenticated
using (guest_id = (select auth.uid()) or public.is_staff());

create policy "reservations inserted by staff"
on public.reservations for insert to authenticated
with check (public.is_staff());

create policy "reservations updated by staff"
on public.reservations for update to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "reservations deleted by admins"
on public.reservations for delete to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- reservation_rooms
-- ---------------------------------------------------------------------------
create policy "allocations readable by owner or staff"
on public.reservation_rooms for select to authenticated
using (
  public.is_staff()
  or exists (
    select 1 from public.reservations res
    where res.id = reservation_rooms.reservation_id
      and res.guest_id = (select auth.uid())
  )
);

create policy "allocations managed by admins"
on public.reservation_rooms for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create policy "payments readable by owner or staff"
on public.payments for select to authenticated
using (
  public.is_staff()
  or exists (
    select 1 from public.reservations res
    where res.id = payments.reservation_id
      and res.guest_id = (select auth.uid())
  )
);

create policy "payments inserted by staff"
on public.payments for insert to authenticated
with check (public.is_staff());

create policy "payments updated by staff"
on public.payments for update to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "payments deleted by admins"
on public.payments for delete to authenticated
using (public.is_admin());

-- ---------------------------------------------------------------------------
-- stay_records
-- ---------------------------------------------------------------------------
create policy "stay records readable by owner or staff"
on public.stay_records for select to authenticated
using (
  public.is_staff()
  or exists (
    select 1 from public.reservations res
    where res.id = stay_records.reservation_id
      and res.guest_id = (select auth.uid())
  )
);

create policy "stay records managed by admins"
on public.stay_records for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- housekeeping_tasks
-- ---------------------------------------------------------------------------
create policy "tasks readable by operations staff"
on public.housekeeping_tasks for select to authenticated
using (public.is_staff() or public.current_user_role() = 'housekeeping');

create policy "tasks inserted by staff"
on public.housekeeping_tasks for insert to authenticated
with check (public.is_staff());

create policy "tasks updated by operations staff"
on public.housekeeping_tasks for update to authenticated
using (
  public.is_staff()
  or (
    public.current_user_role() = 'housekeeping'
    and (assigned_to = (select auth.uid()) or assigned_to is null)
  )
)
with check (
  public.is_staff()
  or (
    public.current_user_role() = 'housekeeping'
    and (assigned_to = (select auth.uid()) or assigned_to is null)
  )
);

create policy "tasks deleted by admins"
on public.housekeeping_tasks for delete to authenticated
using (public.is_admin());
