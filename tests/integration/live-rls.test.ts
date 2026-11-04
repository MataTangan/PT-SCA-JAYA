import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../../src/shared/types/database.types";

const url = process.env.TEST_SUPABASE_URL;
const anonKey = process.env.TEST_SUPABASE_ANON_KEY;
const enabled = Boolean(url && anonKey);

const GUEST_ONE = "11111111-1111-4111-8111-111111111101";
const GUEST_TWO = "11111111-1111-4111-8111-111111111102";
const SEED_PASSWORD = "Demo1234!";

function makeClient(): SupabaseClient<Database> {
  return createClient<Database>(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function signIn(email: string): Promise<SupabaseClient<Database>> {
  const client = makeClient();
  const { error } = await client.auth.signInWithPassword({ email, password: SEED_PASSWORD });
  if (error) {
    throw error;
  }
  return client;
}

describe.skipIf(!enabled)("live database RLS against the seeded demo project", () => {
  let anon: SupabaseClient<Database>;

  beforeAll(() => {
    anon = makeClient();
  });

  it("lets anonymous visitors read the public catalogue", async () => {
    const { data, error } = await anon.from("room_types").select("code").eq("is_active", true);
    expect(error).toBeNull();
    expect(data?.map((row) => row.code)).toEqual(
      expect.arrayContaining(["standard", "deluxe", "suite"]),
    );
  });

  it("denies anonymous access to reservations and profiles", async () => {
    const reservations = await anon.from("reservations").select("id").limit(1);
    const profiles = await anon.from("profiles").select("id").limit(1);
    expect(reservations.error).not.toBeNull();
    expect(profiles.error).not.toBeNull();
  });

  it("serves availability to anonymous visitors without exposing allocations", async () => {
    const { data, error } = await anon.rpc("check_room_availability", {
      p_room_id: "20000000-0000-4000-8000-000000000101",
      p_check_in: daysFromNow(100),
      p_check_out: daysFromNow(102),
    });

    expect(error).toBeNull();
    expect(typeof data).toBe("boolean");
  });

  it("limits a guest to their own reservations", async () => {
    const guest = await signIn("guest1@hotel-sca.test");
    const { data, error } = await guest.from("reservations").select("guest_id");

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(new Set(data?.map((row) => row.guest_id))).toEqual(new Set([GUEST_ONE]));
  });

  it("prevents a guest from reading another guest's reservation", async () => {
    const guest = await signIn("guest1@hotel-sca.test");
    const { data, error } = await guest
      .from("reservations")
      .select("id,guest_id")
      .eq("guest_id", GUEST_TWO);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("prevents a guest from changing a reservation directly", async () => {
    const guest = await signIn("guest1@hotel-sca.test");
    const { data, error } = await guest
      .from("reservations")
      .update({ special_requests: "changed by guest" })
      .eq("guest_id", GUEST_ONE)
      .select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("allows a receptionist to read all reservations", async () => {
    const receptionist = await signIn("receptionist@hotel-sca.test");
    const { data, error } = await receptionist.from("reservations").select("id");

    expect(error).toBeNull();
    expect(new Set(data?.map((row) => row.id)).size).toBeGreaterThanOrEqual(5);
  });

  it("denies revenue reports to non-admin staff", async () => {
    const receptionist = await signIn("receptionist@hotel-sca.test");
    const { error } = await receptionist.rpc("report_revenue", {
      p_from: "2026-01-01",
      p_to: "2026-12-31",
    });

    expect(error).not.toBeNull();
  });

  it("allows admins to read revenue reports", async () => {
    const admin = await signIn("admin@hotel-sca.test");
    const { data, error } = await admin.rpc("report_revenue", {
      p_from: "2026-01-01",
      p_to: "2026-12-31",
    });

    expect(error).toBeNull();
    expect(data).toHaveProperty("gross_reservation_value");
  });

  it("prevents a guest from seeing housekeeping tasks", async () => {
    const guest = await signIn("guest1@hotel-sca.test");
    const { data, error } = await guest.from("housekeeping_tasks").select("id");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});
