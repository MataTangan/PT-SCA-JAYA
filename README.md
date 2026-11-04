# Hotel SCA - Backend & Database Foundation

Backend and PostgreSQL foundation for the Hotel SCA reservation system. It is
framework-independent TypeScript and is intended to be consumed by a React or
Next.js frontend. There are no pages, components, or HTTP route handlers in this
repository.

## What is included

- Supabase/PostgreSQL migrations for roles, profiles, rooms, facilities, rates,
  reservations, room allocations, payments, stays, and housekeeping.
- Row Level Security (RLS) for Guest, Receptionist, Housekeeping, and Admin.
- Transactional database functions for availability, reservation lifecycle,
  allocation, check-in/out, and reports.
- Zod validation boundaries and shared TypeScript types.
- Repository + service modules composed by `createBackend(client)`.
- Deterministic local seed with demo accounts and sample reservations.
- Unit tests, mocked integration tests, gated live-RLS tests, and pgTAP SQL
  tests.

## Requirements

- Node.js 20 or newer.
- npm 10 or newer.
- Docker Desktop for local Supabase (`supabase start`).
- Supabase CLI, installed locally as a dev dependency.

## Quick start

```bash
npm install
cp .env.example .env
npm run db:start
npm run db:reset
npm run test:db
npm run verify
```

`db:start` and `db:reset` need Docker. If Docker is unavailable, the TypeScript
checks and tests still run, but database and RLS tests cannot execute.

Copy the local URL and keys printed by `npx supabase status` into `.env`. The
frontend may use only the URL and anon key. Keep `SUPABASE_SERVICE_ROLE_KEY` on
the server; it is deliberately not exported by `src/backend/index.ts`.

## Verification status

| Check | Status |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` (unit + mocked integration) | Passed: 122 passed, 10 skipped |
| `npm run build` | Passed |
| Live RLS tests | Skipped unless `TEST_SUPABASE_*` is configured |
| pgTAP database/RLS tests | Written, **not executed** in this environment |

Docker is unavailable in the environment where this foundation was produced.
No claim is made that the SQL migrations, seed, pgTAP tests, or live RLS tests
have passed against a running PostgreSQL instance. Run the database checks in a
Docker-capable environment before production use.

## Demo accounts (local seed only)

All demo accounts use the password `Demo1234!`.

| Role | Email |
| --- | --- |
| Guest | `guest1@hotel-sca.test` |
| Guest | `guest2@hotel-sca.test` |
| Guest | `guest3@hotel-sca.test` |
| Receptionist | `receptionist@hotel-sca.test` |
| Housekeeping | `housekeeping@hotel-sca.test` |
| Admin | `admin@hotel-sca.test` |

Never run `supabase/seed.sql` against production. The credentials are public.

## Repository layout

```text
src/
  backend/
    config/              Environment validation
    lib/supabase/        Browser, server, and admin clients
    modules/             auth, users, roles, rooms, room-types, facilities,
                         pricing, reservations, availability, room-allocation,
                         check-in-out, payments, housekeeping, reports
    shared/              errors, validators, dates, pagination, auth helpers
    index.ts             createBackend composition root
  shared/
    constants/           Roles, statuses, error codes
    schemas/             Zod input contracts
    types/               Database and domain types
supabase/
  migrations/            Ordered SQL migrations
  seed.sql               Deterministic development data
  tests/                 pgTAP schema, availability, lifecycle, and RLS tests
tests/
  unit/                  Pure logic and validation tests
  integration/           Mocked Supabase tests + gated live RLS tests
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database](docs/DATABASE.md)
- [ERD](docs/DATABASE-ERD.md)
- [API contracts](docs/API-CONTRACTS.md)
- [Frontend integration](docs/FRONTEND-INTEGRATION.md)
- [Role permissions](docs/ROLE-PERMISSIONS.md)
- [Business rules](docs/BUSINESS-RULES.md)
- [Development guide](docs/DEVELOPMENT-GUIDE.md)

The original design documents, `Grand Design Hotel SCA.md` and
`PEMROGRAMAN WEB.md`, are retained unchanged.

## Important implementation notes

- Reservations target one room type and a `room_count`. Physical rooms are
  attached through `reservation_rooms`.
- Double booking is blocked at the database level with a GiST exclusion
  constraint on active allocations. Application checks are not the final guard.
- A reservation starts as `pending` and is not tied to a physical room until a
  receptionist allocates one. See [Business rules](docs/BUSINESS-RULES.md) for
  the inventory implications.
- There is one payment record per reservation. Partial payments are out of
  scope for this version.
- The frontend must never write `profiles.role_id`, `profiles.is_active`, or
  `profiles.email` directly. Role writes are authorized by the database, not by
  client metadata; email changes go through Supabase Auth.

## License

Private coursework project. No license is granted.
