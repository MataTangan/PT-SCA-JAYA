import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Reservation } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import {
  listStayRecordsSchema,
  reservationIdSchema,
  type ListStayRecordsInput,
} from "../../../shared/schemas";
import { mapSupabaseError } from "../../shared/errors";
import { parseInput } from "../../shared/validators";
import { createCheckInOutRepository, type StayRecordWithRoom } from "./repository";

export function createCheckInOutService(client: SupabaseClient<Database>) {
  const repository = createCheckInOutRepository(client);

  return {
    async checkIn(reservationId: string): Promise<Reservation> {
      const parsed = parseInput(reservationIdSchema, { reservationId });
      try {
        return await repository.checkIn(parsed.reservationId);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async checkOut(reservationId: string): Promise<Reservation> {
      const parsed = parseInput(reservationIdSchema, { reservationId });
      try {
        return await repository.checkOut(parsed.reservationId);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    getStayRecords(input: ListStayRecordsInput = {}): Promise<Paginated<StayRecordWithRoom>> {
      return repository.listStayRecords(parseInput(listStayRecordsSchema, input));
    },
  };
}

export type CheckInOutService = ReturnType<typeof createCheckInOutService>;
