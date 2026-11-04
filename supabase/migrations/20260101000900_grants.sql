-- ============================================================================
-- 20260101000900_grants.sql
-- Explicit API grants. RLS is the primary access control; grants only decide
-- which tables/columns/operations are reachable through PostgREST at all.
-- ============================================================================

grant usage on schema public to anon, authenticated;

-- Public catalogue (RLS further restricts rows to active entries).
grant select on public.room_types to anon, authenticated;
grant select on public.rooms to anon, authenticated;
grant select on public.facilities to anon, authenticated;
grant select on public.room_type_facilities to anon, authenticated;
grant select on public.room_rates to anon, authenticated;

-- Authenticated application tables. RLS policies decide row access.
grant select, insert, update, delete on public.roles to authenticated;
grant select, insert, update, delete on public.permissions to authenticated;
grant select, insert, update, delete on public.role_permissions to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.room_types to authenticated;
grant select, insert, update, delete on public.rooms to authenticated;
grant select, insert, update, delete on public.facilities to authenticated;
grant select, insert, update, delete on public.room_type_facilities to authenticated;
grant select, insert, update, delete on public.room_rates to authenticated;
grant select, insert, update, delete on public.reservations to authenticated;
grant select, insert, update, delete on public.reservation_rooms to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.stay_records to authenticated;
grant select, insert, update, delete on public.housekeeping_tasks to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Function execution privileges.
-- Default PostgreSQL grants EXECUTE to PUBLIC, so every sensitive function is
-- explicitly revoked and then granted to the narrowest role.
-- ---------------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
revoke execute on function public.generate_reservation_code() from public, anon, authenticated;

revoke execute on function public.create_reservation(uuid, date, date, integer, integer, integer, text, uuid)
  from public, anon;
grant execute on function public.create_reservation(uuid, date, date, integer, integer, integer, text, uuid)
  to authenticated;

revoke execute on function public.confirm_reservation(uuid) from public, anon;
grant execute on function public.confirm_reservation(uuid) to authenticated;

revoke execute on function public.cancel_reservation(uuid, text) from public, anon;
grant execute on function public.cancel_reservation(uuid, text) to authenticated;

revoke execute on function public.allocate_room(uuid, uuid) from public, anon;
grant execute on function public.allocate_room(uuid, uuid) to authenticated;

revoke execute on function public.release_room(uuid, text) from public, anon;
grant execute on function public.release_room(uuid, text) to authenticated;

revoke execute on function public.check_in_reservation(uuid) from public, anon;
grant execute on function public.check_in_reservation(uuid) to authenticated;

revoke execute on function public.check_out_reservation(uuid) from public, anon;
grant execute on function public.check_out_reservation(uuid) to authenticated;

revoke execute on function public.report_occupancy(date, date) from public, anon;
grant execute on function public.report_occupancy(date, date) to authenticated;

revoke execute on function public.report_revenue(date, date) from public, anon;
grant execute on function public.report_revenue(date, date) to authenticated;

-- Read-only helpers are safe to expose; they reveal no private data.
revoke execute on function public.get_applicable_rate(uuid, date) from public;
grant execute on function public.get_applicable_rate(uuid, date) to anon, authenticated;

revoke execute on function public.check_room_availability(uuid, date, date) from public;
grant execute on function public.check_room_availability(uuid, date, date) to anon, authenticated;

revoke execute on function public.find_available_rooms(uuid, date, date) from public;
grant execute on function public.find_available_rooms(uuid, date, date) to anon, authenticated;

revoke execute on function public.stay_nights(date, date) from public;
grant execute on function public.stay_nights(date, date) to anon, authenticated;
