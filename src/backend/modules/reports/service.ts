import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { OccupancyReport, RevenueReport } from "../../../shared/types/domain";
import { reportRangeSchema, type ReportRangeInput } from "../../../shared/schemas";
import { AuthorizationError, mapSupabaseError } from "../../shared/errors";
import { requireUserId } from "../../shared/utils/auth";
import { parseInput } from "../../shared/validators";
import type { TodaySummary } from "./types";

function asRange(input: ReportRangeInput): { p_from: string; p_to: string } {
  return { p_from: input.from, p_to: input.to };
}

interface RoleJoin {
  role: { slug: string } | Array<{ slug: string }> | null;
}

/** The dashboard is an operational surface, not a guest endpoint. */
async function requireOperationalRole(client: SupabaseClient<Database>): Promise<void> {
  const userId = await requireUserId(client);
  const result = await client
    .from("profiles")
    .select("role:roles!profiles_role_id_fkey(slug)")
    .eq("id", userId)
    .maybeSingle();
  if (result.error) {
    throw mapSupabaseError(result.error);
  }
  const row = result.data as unknown as RoleJoin | null;
  const role = Array.isArray(row?.role) ? row?.role[0] : row?.role;
  if (role?.slug !== "receptionist" && role?.slug !== "admin") {
    throw new AuthorizationError("Only receptionist or admin can read the dashboard summary");
  }
}

export function createReportsRepository(client: SupabaseClient<Database>) {
  return {
    async occupancy(range: ReportRangeInput): Promise<OccupancyReport> {
      const { data, error } = await client.rpc("report_occupancy", asRange(range));
      if (error) throw error;
      return data as unknown as OccupancyReport;
    },

    async revenue(range: ReportRangeInput): Promise<RevenueReport> {
      const { data, error } = await client.rpc("report_revenue", asRange(range));
      if (error) throw error;
      return data as unknown as RevenueReport;
    },
  };
}

export interface ReportService {
  getOccupancyReport(input: ReportRangeInput): Promise<OccupancyReport>;
  getRevenueReport(input: ReportRangeInput): Promise<RevenueReport>;
  getTodaySummary(): Promise<TodaySummary>;
}

export function createReportsService(client: SupabaseClient<Database>): ReportService {
  const repository = createReportsRepository(client);

  return {
    async getOccupancyReport(input) {
      const parsed = parseInput(reportRangeSchema, input);
      try {
        return await repository.occupancy(parsed);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async getRevenueReport(input) {
      const parsed = parseInput(reportRangeSchema, input);
      try {
        return await repository.revenue(parsed);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    /** Operational counters for the receptionist/admin dashboard. */
    async getTodaySummary() {
      await requireOperationalRole(client);
      const today = new Date().toISOString().slice(0, 10);

      const roomsResult = await client
        .from("rooms")
        .select("occupancy_status,housekeeping_status")
        .eq("is_active", true);
      if (roomsResult.error) {
        throw mapSupabaseError(roomsResult.error);
      }
      const rooms = (roomsResult.data ?? []) as Array<{
        occupancy_status: string;
        housekeeping_status: string;
      }>;

      const count = (predicate: (row: (typeof rooms)[number]) => boolean) =>
        rooms.filter(predicate).length;

      const [arrivals, inHouse, departures, pendingReservations, unpaidPayments] =
        await Promise.all([
          client
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("check_in_date", today)
            .eq("status", "confirmed"),
          client
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("status", "checked_in"),
          client
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("check_out_date", today)
            .eq("status", "checked_in"),
          client
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          client
            .from("payments")
            .select("*", { count: "exact", head: true })
            .eq("status", "unpaid"),
        ]);

      for (const result of [arrivals, inHouse, departures, pendingReservations, unpaidPayments]) {
        if (result.error) {
          throw mapSupabaseError(result.error);
        }
      }

      return {
        date: today,
        rooms: {
          total: rooms.length,
          available: count((room) => room.occupancy_status === "available"),
          reserved: count((room) => room.occupancy_status === "reserved"),
          occupied: count((room) => room.occupancy_status === "occupied"),
          clean: count((room) => room.housekeeping_status === "clean"),
          dirty: count((room) => room.housekeeping_status === "dirty"),
          cleaning: count((room) => room.housekeeping_status === "cleaning"),
        },
        arrivalsToday: arrivals.count ?? 0,
        inHouse: inHouse.count ?? 0,
        departuresToday: departures.count ?? 0,
        pendingReservations: pendingReservations.count ?? 0,
        unpaidPayments: unpaidPayments.count ?? 0,
      };
    },
  };
}
