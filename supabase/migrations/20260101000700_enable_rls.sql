-- ============================================================================
-- 20260101000700_enable_rls.sql
-- Enable Row Level Security on every application table.
-- ============================================================================

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.facilities enable row level security;
alter table public.room_type_facilities enable row level security;
alter table public.room_rates enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_rooms enable row level security;
alter table public.payments enable row level security;
alter table public.stay_records enable row level security;
alter table public.housekeeping_tasks enable row level security;
