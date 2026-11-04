# Development Guide

## 1. Prerequisites

- Node.js 20 or newer.
- npm 10 or newer.
- Docker Desktop for local Supabase.
- Supabase CLI 3.x, installed as a dev dependency.

Node and npm checks:

```bash
node --version
npm --version
npx supabase --version
```

Docker is required only for database work. TypeScript checks and mocked tests
run without it.

## 2. First-run setup

```bash
npm install
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Start and initialize the local database:

```bash
npm run db:start
npm run db:reset
npx supabase status
```

Copy the printed API URL, anon key, and service-role key into `.env`. Only the
URL and anon key may be exposed to a browser.

The reset applies every migration in order and then runs
`supabase/seed.sql`. Demo accounts use the password `Demo1234!`.

## 3. Commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | TypeScript check with no emit |
| `npm run build` | Compile declarations and JavaScript to `dist/` |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm test` | Unit and mocked integration tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run verify` | Typecheck, lint, and tests |
| `npm run db:start` | Start local Supabase (Docker) |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:reset` | Reapply migrations and seed |
| `npm run db:push` | Push migrations to a linked project |
| `npm run db:diff` | Create a migration from schema drift |
| `npm run db:lint` | Supabase database lint |
| `npm run db:types` | Generate local database types to `database.generated.ts` |
| `npm run test:db` | Run pgTAP SQL tests (`supabase test db`) |

## 4. Verification status in this environment

At the time this foundation was produced:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed for the unit and mocked integration suites: 122 passed,
  10 skipped.
- `npm run build` passed.
- The live RLS suite was skipped because `TEST_SUPABASE_*` was not configured.
- Docker was not installed, so migrations, seed, pgTAP tests, and live RLS tests
  could not run.

Do not claim database verification until these commands succeed in a
Docker-capable environment:

```bash
npm run db:start
npm run db:reset
npm run test:db
npm run verify
```

Then configure a dedicated test project and run the live suite:

```bash
# .env.test (not committed)
TEST_SUPABASE_URL=http://127.0.0.1:54321
TEST_SUPABASE_ANON_KEY=<test anon key>
TEST_SUPABASE_SERVICE_ROLE_KEY=<test service-role key>
```

```bash
npm test
```

The live tests sign in with the seeded demo accounts, so the target project must
contain the seed. Never point `TEST_SUPABASE_*` at production.

## 5. Repository structure

```text
src/
  backend/
    config/env.ts             Environment parsing and caching
    lib/supabase/             Browser, server, and admin clients
    modules/<module>/         repository.ts + service.ts per domain
    shared/                   Errors, validators, dates, pagination, auth
    index.ts                  createBackend composition root
  shared/
    constants/                Roles, statuses, permissions, errors
    schemas/                  Zod input contracts
    types/                    Hand-maintained Database types and domain types
supabase/
  migrations/                 Ordered schema and function migrations
  seed.sql                    Local demo data
  tests/                      pgTAP tests
tests/
  unit/                       Pure helpers and schemas
  integration/                Mocked Supabase and gated live RLS
```

## 6. Architecture conventions

### Layers

1. **Schema** validates untrusted input and normalizes it.
2. **Repository** builds Supabase queries or calls RPCs. It throws database
   errors and does not own business policy.
3. **Service** validates, orchestrates, applies domain errors, and maps
   Supabase errors.
4. **Database** is authoritative for identity, authorization, pricing,
   availability, and workflow.

Do not move critical checks into React components. A hidden button is not
authorization.

### Error handling

- Throw `ValidationError`, `AuthenticationError`, `AuthorizationError`,
  `NotFoundError`, `ConflictError`, `DatabaseError`, or `InternalError`.
- Pass unknown Supabase errors through `mapSupabaseError`.
- Never expose raw PostgreSQL messages to end users.
- At an HTTP boundary, use `toApiFailure(error, requestId)`.

### Input validation

Every service method that accepts external input must parse it with Zod:

```ts
const parsed = parseInput(createRoomSchema, input);
```

Do not use `as` to silence untrusted input. `as` is acceptable only for typed
Supabase join shapes that have been checked at runtime.

### Dates and money

- Calendar dates are strict `YYYY-MM-DD`.
- Timestamps are ISO 8601.
- Use the date helpers instead of ad-hoc `Date` arithmetic for stays.
- Money is returned as a JavaScript number but calculated by PostgreSQL for
  reservations. Do not recompute the authoritative reservation total on the
  client.

## 7. Database workflow

### Add a migration

Never edit a migration that has already been applied in a shared environment.
Create a new timestamped file:

```bash
npx supabase migration new add_room_image_url
```

Add SQL to `supabase/migrations/<timestamp>_add_room_image_url.sql`, then:

```bash
npm run db:reset
npm run test:db
```

Every new public table needs:

- RLS enabled.
- Explicit grants in a migration.
- Policies for each intended role.
- A test for the role matrix.
- An entry in `src/shared/types/database.types.ts` or a regenerated type file.
- Documentation updates.

### Edit a migration during initial development

Before the project is shared or deployed, a broken migration can be fixed in
place and the local database reset. Once a migration has been pushed to a
shared or production project, add a corrective migration instead.

### Regenerate types

```bash
npm run db:types
```

This writes `src/shared/types/database.generated.ts`. The current
`database.types.ts` is hand-maintained because the local stack was unavailable.
Compare the generated file with the hand-maintained one before switching
imports. Do not delete relationship metadata; `supabase-js` type inference
needs `Relationships`.

### Seed

`supabase/seed.sql` is local/demo data only.

- It contains publicly known passwords.
- It inserts into `auth.users` and `auth.identities`.
- It uses deterministic UUIDs that the pgTAP tests reference.
- It assumes migrations have already run.
- It is executed by `supabase db reset`, not by `db push`.

Changing seed UUIDs will break `supabase/tests/*.sql` and the live RLS test
constants. Keep them in sync.

## 8. Testing strategy

### Unit tests

`tests/unit/` covers pure helpers and Zod schemas:

- date parsing and night calculation;
- pagination normalization;
- status transitions and blocking statuses;
- error mapping;
- environment validation;
- Supabase result helpers.

### Mocked integration tests

`tests/integration/` uses `tests/helpers/mock-supabase.ts` to assert service
orchestration and RPC arguments without a database. These tests prove the
TypeScript layer calls the right functions with the right inputs. They do not
prove SQL, triggers, constraints, grants, or RLS.

### pgTAP tests

`supabase/tests/`:

| File | Coverage |
| --- | --- |
| `00_schema.test.sql` | Tables, keys, triggers, reservation/payment/rate constraints, double-booking guard |
| `01_availability.test.sql` | Room availability and applicable rates |
| `02_reservation_lifecycle.test.sql` | Guest creation, staff confirmation/allocation, check-in/out |
| `03_rls.test.sql` | Anonymous, guest, receptionist, housekeeping, and admin access |

Run:

```bash
npm run db:reset
npm run test:db
```

### Live RLS tests

`tests/integration/live-rls.test.ts` uses real `supabase-js` clients and seeded
accounts. It is skipped unless `TEST_SUPABASE_URL` and
`TEST_SUPABASE_ANON_KEY` are present. Keep the test project separate from
production and reseed it before the suite.

### Writing a test for a new rule

- Put pure logic in `tests/unit`.
- Put service orchestration in `tests/integration`.
- Put constraints, triggers, RPC behavior, and RLS in `supabase/tests`.
- If a rule affects data visibility, add both a pgTAP test and a live test where
  feasible.
- Assert the error code, not only a message.

## 9. Adding a module

1. Add or change the database schema and functions.
2. Update or regenerate database types.
3. Add Zod schemas in `src/shared/schemas/`.
4. Add domain types in `src/shared/types/domain.ts` if needed.
5. Create `src/backend/modules/<name>/repository.ts`.
6. Create `src/backend/modules/<name>/service.ts`.
7. Export a factory from `src/backend/modules/<name>/index.ts`.
8. Compose it in `src/backend/index.ts`.
9. Add unit, integration, and pgTAP tests.
10. Update the API, role, and business-rule docs.

Keep repositories free of policy except query construction. Put policy in SQL
when it must hold under concurrent requests or direct PostgREST access.

## 10. Security checklist

- Use only the anon key in browser code.
- Never import `src/backend/lib/supabase/admin.ts` from a client component.
- Never return the service-role key, database URL with credentials, or raw SQL
  errors to a browser.
- Add RLS policies for every new table before granting access.
- Re-check authorization inside `security definer` functions; they bypass RLS.
- Set a safe `search_path` on every `security definer` function.
- Prefer explicit grants; do not assume new public tables are automatically
  exposed safely.
- Keep guard triggers aligned with service-layer intent.
- Test with an unauthenticated client, each role, and crossed ownership.

## 11. Troubleshooting

### `supabase start` fails

Docker is missing or not running. Start Docker Desktop and retry. The local
stack uses ports 54321-54324 and 54322 for PostgreSQL by default.

### A guest cannot see availability

Check that the availability RPC can read allocations under RLS. Availability is
implemented through `check_room_availability`, which must be able to inspect
allocations for all guests without exposing them. If it is changed to a plain
invoker function, public availability will be wrong or permission-denied.

### A guest cannot cancel an allocated reservation

Cancellation updates room occupancy after releasing allocations. The room guard
must permit that derived internal update. Keep the internal transaction flag or
an equivalent `security definer` helper in place.

### `PGRST116` or "JSON object requested"

Use `maybeSingle()` for optional rows and `single()` only when the row must
exist. `unwrapRequired` turns a missing row into `NotFoundError`.

### A staff account still behaves like a guest

Promote the profile with `users.assignRole` or the admin SQL path, not by
changing auth metadata. The auth trigger always creates a guest profile.

### Types are out of sync with the database

Regenerate with `npm run db:types` in a running local environment, compare, and
update the hand-maintained type. Do not add `as any` to hide a schema mismatch.

### Tests pass but the database is untested

Mocked tests do not exercise SQL. Run `npm run db:reset && npm run test:db` and
the live RLS suite before deployment.

## 12. Pre-handoff checklist

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` emits declarations successfully.
- [ ] `npm run db:reset` applies all migrations and seed without error.
- [ ] `npm run test:db` passes.
- [ ] Live RLS tests pass on a dedicated seeded test project.
- [ ] `src/shared/types/database.types.ts` matches the schema.
- [ ] New tables have grants, RLS, policies, and tests.
- [ ] Role matrix and business rules are updated.
- [ ] No service-role key or demo password exists outside local/demo files.
- [ ] `supabase/seed.sql` is not part of a production deployment.

## 13. Known limitations

- No HTTP server, pages, or UI.
- No Docker-based database verification in the original environment.
- No per-night pricing, tax, discount, or multi-currency support.
- No partial payments, refunds, or payment gateway.
- No check-in date validation and no payment gate at check-in/check-out.
- No formal room-move or no-show workflow.
- No realtime subscriptions, storage buckets, or notifications.
- No audit-event table beyond actor/timestamp columns.
- `getTodaySummary()` uses UTC, not a hotel timezone.
