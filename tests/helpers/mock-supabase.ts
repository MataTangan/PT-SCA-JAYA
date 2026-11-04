import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/shared/types/database.types";

export interface MockResponse {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

export type MockResolver = MockResponse | ((call: RecordedCall) => MockResponse);

export interface RecordedCall {
  type: "table" | "rpc" | "auth";
  name: string;
  args?: unknown;
  operations: Array<{ method: string; args: unknown[] }>;
}

export interface MockAuthOptions {
  user?: { id: string; email?: string } | null;
  getUserError?: unknown;
  signInResult?: { data: unknown; error: unknown };
  signUpResult?: { data: unknown; error: unknown };
  signOutError?: unknown;
}

export interface MockClientOptions {
  tables?: Record<string, MockResolver | MockResolver[]>;
  rpc?: Record<string, MockResolver | MockResolver[]>;
  auth?: MockAuthOptions;
}

export interface MockSupabase {
  client: SupabaseClient<Database>;
  calls: RecordedCall[];
  tableCalls(table: string): RecordedCall[];
  rpcCalls(name: string): RecordedCall[];
}

function resolveNext(
  resolver: MockResolver | MockResolver[] | undefined,
  call: RecordedCall,
): MockResponse {
  if (resolver === undefined) {
    return { data: null, error: null, count: 0 };
  }
  if (Array.isArray(resolver)) {
    const next = resolver.length > 1 ? resolver.shift() : resolver[0];
    if (!next) {
      return { data: null, error: null, count: 0 };
    }
    return typeof next === "function" ? next(call) : next;
  }
  return typeof resolver === "function" ? resolver(call) : resolver;
}

export function createMockSupabase(options: MockClientOptions = {}): MockSupabase {
  const calls: RecordedCall[] = [];
  const tableQueues: Record<string, MockResolver[]> = {};
  const rpcQueues: Record<string, MockResolver[]> = {};

  for (const [table, resolver] of Object.entries(options.tables ?? {})) {
    tableQueues[table] = Array.isArray(resolver) ? [...resolver] : [resolver];
  }
  for (const [name, resolver] of Object.entries(options.rpc ?? {})) {
    rpcQueues[name] = Array.isArray(resolver) ? [...resolver] : [resolver];
  }

  function makeQuery(call: RecordedCall) {
    const operations: Array<{ method: string; args: unknown[] }> = [];
    call.operations = operations;

    const builder = {
      select(...args: unknown[]) {
        operations.push({ method: "select", args });
        return builder;
      },
      insert(...args: unknown[]) {
        operations.push({ method: "insert", args });
        return builder;
      },
      update(...args: unknown[]) {
        operations.push({ method: "update", args });
        return builder;
      },
      delete(...args: unknown[]) {
        operations.push({ method: "delete", args });
        return builder;
      },
      eq(...args: unknown[]) {
        operations.push({ method: "eq", args });
        return builder;
      },
      neq(...args: unknown[]) {
        operations.push({ method: "neq", args });
        return builder;
      },
      gte(...args: unknown[]) {
        operations.push({ method: "gte", args });
        return builder;
      },
      lte(...args: unknown[]) {
        operations.push({ method: "lte", args });
        return builder;
      },
      is(...args: unknown[]) {
        operations.push({ method: "is", args });
        return builder;
      },
      ilike(...args: unknown[]) {
        operations.push({ method: "ilike", args });
        return builder;
      },
      or(...args: unknown[]) {
        operations.push({ method: "or", args });
        return builder;
      },
      order(...args: unknown[]) {
        operations.push({ method: "order", args });
        return builder;
      },
      range(...args: unknown[]) {
        operations.push({ method: "range", args });
        return builder;
      },
      maybeSingle() {
        return Promise.resolve(resolveNext(tableQueues[call.name], call));
      },
      single() {
        return Promise.resolve(resolveNext(tableQueues[call.name], call));
      },
      then<TResult1 = MockResponse, TResult2 = never>(
        onfulfilled?: ((value: MockResponse) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
      ): PromiseLike<TResult1 | TResult2> {
        return Promise.resolve(resolveNext(tableQueues[call.name], call)).then(
          onfulfilled,
          onrejected,
        );
      },
    };

    return builder;
  }

  const authOptions = options.auth ?? { user: { id: "11111111-1111-4111-8111-111111111101" } };
  const defaultUser =
    authOptions.user === undefined
      ? { id: "11111111-1111-4111-8111-111111111101", email: "guest1@hotel-sca.test" }
      : authOptions.user;

  const client = {
    auth: {
      async getUser() {
        calls.push({ type: "auth", name: "getUser", operations: [] });
        if (authOptions.getUserError) {
          return { data: { user: null }, error: authOptions.getUserError };
        }
        return { data: { user: defaultUser }, error: null };
      },
      async signInWithPassword(credentials: unknown) {
        calls.push({ type: "auth", name: "signInWithPassword", args: credentials, operations: [] });
        return (
          authOptions.signInResult ?? { data: { user: defaultUser, session: null }, error: null }
        );
      },
      async signUp(credentials: unknown) {
        calls.push({ type: "auth", name: "signUp", args: credentials, operations: [] });
        return (
          authOptions.signUpResult ?? { data: { user: defaultUser, session: null }, error: null }
        );
      },
      async signOut() {
        calls.push({ type: "auth", name: "signOut", operations: [] });
        return { error: authOptions.signOutError ?? null };
      },
    },
    from(table: string) {
      const call: RecordedCall = { type: "table", name: table, operations: [] };
      calls.push(call);
      return makeQuery(call) as never;
    },
    async rpc(name: string, args?: unknown) {
      const call: RecordedCall = { type: "rpc", name, args, operations: [] };
      calls.push(call);
      return resolveNext(rpcQueues[name], call);
    },
  };

  return {
    client: client as unknown as SupabaseClient<Database>,
    calls,
    tableCalls: (table) => calls.filter((call) => call.type === "table" && call.name === table),
    rpcCalls: (name) => calls.filter((call) => call.type === "rpc" && call.name === name),
  };
}
