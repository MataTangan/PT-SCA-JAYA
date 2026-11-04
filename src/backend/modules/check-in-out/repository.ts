import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Reservation, StayRecord } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import type { ListStayRecordsInput } from "../../../shared/schemas";
import { normalizePagination, totalPages } from "../../shared/utils/pagination";
import { unwrap, unwrapCount } from "../../shared/utils/supabase";

const STAY_RECORD_SELECT =
  "*, room:rooms(id,room_number,floor,occupancy_status,housekeeping_status)";

export interface StayRecordWithRoom extends StayRecord {
  room: {
    id: string;
    room_number: string;
    floor: number;
    occupancy_status: string;
    housekeeping_status: string;
  } | null;
}

export function createCheckInOutRepository(client: SupabaseClient<Database>) {
  return {
    async checkIn(reservationId: string): Promise<Reservation> {
      const { data, error } = await client.rpc("check_in_reservation", {
        p_reservation_id: reservationId,
      });
      if (error) throw error;
      return data as unknown as Reservation;
    },

    async checkOut(reservationId: string): Promise<Reservation> {
      const { data, error } = await client.rpc("check_out_reservation", {
        p_reservation_id: reservationId,
      });
      if (error) throw error;
      return data as unknown as Reservation;
    },

    async listStayRecords(input: ListStayRecordsInput): Promise<Paginated<StayRecordWithRoom>> {
      const { page, pageSize, from, to } = normalizePagination(input.page, input.pageSize);
      let query = client
        .from("stay_records")
        .select(STAY_RECORD_SELECT, { count: "exact" })
        .order("checked_in_at", { ascending: false })
        .range(from, to);
      if (input.reservationId) query = query.eq("reservation_id", input.reservationId);
      if (input.roomId) query = query.eq("room_id", input.roomId);
      if (input.openOnly) query = query.is("checked_out_at", null);

      const result = await query;
      const items = unwrap(result) as unknown as StayRecordWithRoom[];
      const total = unwrapCount(result);
      return { items, page, pageSize, total, totalPages: totalPages(total, pageSize) };
    },
  };
}

export type CheckInOutRepository = ReturnType<typeof createCheckInOutRepository>;
