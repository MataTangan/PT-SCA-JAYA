import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type {
  Payment,
  ReservationRoom,
  ReservationSummary,
  ReservationWithRelations,
  Room,
} from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import type { ListReservationsInput } from "../../../shared/schemas";
import { normalizePagination, totalPages } from "../../shared/utils/pagination";
import { unwrap, unwrapCount, unwrapRequired } from "../../shared/utils/supabase";

const GUEST_SELECT = "guest:profiles!reservations_guest_id_fkey(id,full_name,email,phone)";
const PAYMENT_SELECT = "payment:payments(*)";

export const RESERVATION_SUMMARY_SELECT = `*, ${GUEST_SELECT}, room_type:room_types(*), ${PAYMENT_SELECT}`;
export const RESERVATION_DETAIL_SELECT = `${RESERVATION_SUMMARY_SELECT}, reservation_rooms(*, room:rooms(id,room_number,floor,occupancy_status,housekeeping_status))`;

type RawPayment = Payment | Payment[] | null;
type RawSummary = Omit<ReservationSummary, "payment"> & { payment: RawPayment };
type RawDetail = Omit<ReservationWithRelations, "payment" | "reservation_rooms"> & {
  payment: RawPayment;
  reservation_rooms: Array<
    ReservationRoom & {
      room: Pick<
        Room,
        "id" | "room_number" | "floor" | "occupancy_status" | "housekeeping_status"
      > | null;
    }
  >;
};

function firstPayment(payment: RawPayment): Payment | null {
  return Array.isArray(payment) ? (payment[0] ?? null) : payment;
}

export function createReservationsRepository(client: SupabaseClient<Database>) {
  return {
    async getById(id: string): Promise<ReservationWithRelations> {
      const result = await client
        .from("reservations")
        .select(RESERVATION_DETAIL_SELECT)
        .eq("id", id)
        .maybeSingle();
      const row = unwrapRequired(result, "Reservation not found") as unknown as RawDetail;
      return { ...row, payment: firstPayment(row.payment) };
    },

    async list(input: ListReservationsInput): Promise<Paginated<ReservationSummary>> {
      const { page, pageSize, from, to } = normalizePagination(input.page, input.pageSize);

      let query = client
        .from("reservations")
        .select(RESERVATION_SUMMARY_SELECT, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (input.status) query = query.eq("status", input.status);
      if (input.guestId) query = query.eq("guest_id", input.guestId);
      if (input.roomTypeId) query = query.eq("room_type_id", input.roomTypeId);
      if (input.code) query = query.ilike("reservation_code", `%${input.code}%`);
      if (input.from) query = query.gte("check_out_date", input.from);
      if (input.to) query = query.lte("check_in_date", input.to);

      const result = await query;
      const rows = unwrap(result) as unknown as RawSummary[];
      const total = unwrapCount(result);
      return {
        items: rows.map((row) => ({ ...row, payment: firstPayment(row.payment) })),
        page,
        pageSize,
        total,
        totalPages: totalPages(total, pageSize),
      };
    },

    async create(input: {
      roomTypeId: string;
      checkInDate: string;
      checkOutDate: string;
      adults: number;
      children: number;
      roomCount: number;
      specialRequests?: string | null;
      guestId?: string | null;
    }): Promise<string> {
      const result = await client.rpc("create_reservation", {
        p_room_type_id: input.roomTypeId,
        p_check_in_date: input.checkInDate,
        p_check_out_date: input.checkOutDate,
        p_adults: input.adults,
        p_children: input.children,
        p_room_count: input.roomCount,
        p_special_requests: input.specialRequests ?? null,
        p_guest_id: input.guestId ?? null,
      });
      const row = unwrapRequired(result, "Reservation could not be created");
      return row.id;
    },

    async update(
      id: string,
      patch: Database["public"]["Tables"]["reservations"]["Update"],
    ): Promise<void> {
      const result = await client.from("reservations").update(patch).eq("id", id);
      if (result.error) {
        throw result.error;
      }
    },

    async confirm(id: string): Promise<void> {
      const result = await client.rpc("confirm_reservation", { p_reservation_id: id });
      if (result.error) {
        throw result.error;
      }
    },

    async cancel(id: string, reason?: string): Promise<void> {
      const result = await client.rpc("cancel_reservation", {
        p_reservation_id: id,
        p_reason: reason ?? null,
      });
      if (result.error) {
        throw result.error;
      }
    },
  };
}

export type ReservationsRepository = ReturnType<typeof createReservationsRepository>;
