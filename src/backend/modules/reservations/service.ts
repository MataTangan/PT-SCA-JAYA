import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { ReservationSummary, ReservationWithRelations } from "../../../shared/types/domain";
import type { Paginated } from "../../../shared/types/contracts";
import {
  cancelReservationSchema,
  confirmReservationSchema,
  createReservationSchema,
  listReservationsSchema,
  updateReservationSchema,
  type CancelReservationInput,
  type CreateReservationInput,
  type ListReservationsInput,
  type UpdateReservationInput,
} from "../../../shared/schemas";
import { uuidSchema } from "../../../shared/schemas/common";
import { mapSupabaseError, ValidationError } from "../../shared/errors";
import { calculateNights } from "../../shared/utils/dates";
import { parseInput } from "../../shared/validators";
import { createReservationsRepository } from "./repository";

export function createReservationsService(client: SupabaseClient<Database>) {
  const repository = createReservationsRepository(client);

  return {
    /**
     * Create a reservation through the transactional database function.
     * The database is authoritative for rate, nights, total, and permissions.
     */
    async createReservation(input: CreateReservationInput): Promise<ReservationWithRelations> {
      const parsed = parseInput(createReservationSchema, input);
      try {
        calculateNights(parsed.checkInDate, parsed.checkOutDate);
      } catch (error) {
        throw new ValidationError(error instanceof Error ? error.message : "Invalid stay dates");
      }

      try {
        const id = await repository.create({
          roomTypeId: parsed.roomTypeId,
          checkInDate: parsed.checkInDate,
          checkOutDate: parsed.checkOutDate,
          adults: parsed.adults,
          children: parsed.children,
          roomCount: parsed.roomCount,
          specialRequests: parsed.specialRequests ?? null,
          guestId: parsed.guestId ?? null,
        });
        return await repository.getById(id);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    getReservationById(id: string): Promise<ReservationWithRelations> {
      return repository.getById(parseInput(uuidSchema, id));
    },

    getReservations(input: ListReservationsInput = {}): Promise<Paginated<ReservationSummary>> {
      return repository.list(parseInput(listReservationsSchema, input));
    },

    /** Update guest-visible / operational fields. Identity and pricing are immutable. */
    async updateReservation(
      id: string,
      input: UpdateReservationInput,
    ): Promise<ReservationWithRelations> {
      const reservationId = parseInput(uuidSchema, id);
      const parsed = parseInput(updateReservationSchema, input);
      const patch: Database["public"]["Tables"]["reservations"]["Update"] = {};
      if (parsed.specialRequests !== undefined) patch.special_requests = parsed.specialRequests;
      if (parsed.adults !== undefined) patch.adults = parsed.adults;
      if (parsed.children !== undefined) patch.children = parsed.children;

      try {
        await repository.update(reservationId, patch);
      } catch (error) {
        throw mapSupabaseError(error);
      }
      return repository.getById(reservationId);
    },

    async confirmReservation(input: { reservationId: string }): Promise<ReservationWithRelations> {
      const parsed = parseInput(confirmReservationSchema, input);
      try {
        await repository.confirm(parsed.reservationId);
      } catch (error) {
        throw mapSupabaseError(error);
      }
      return repository.getById(parsed.reservationId);
    },

    async cancelReservation(input: CancelReservationInput): Promise<ReservationWithRelations> {
      const parsed = parseInput(cancelReservationSchema, input);
      try {
        await repository.cancel(parsed.reservationId, parsed.reason);
      } catch (error) {
        throw mapSupabaseError(error);
      }
      return repository.getById(parsed.reservationId);
    },
  };
}

export type ReservationsService = ReturnType<typeof createReservationsService>;
