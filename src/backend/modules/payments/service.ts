import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Payment } from "../../../shared/types/domain";
import {
  createPaymentRecordSchema,
  updatePaymentStatusSchema,
  type CreatePaymentRecordInput,
  type UpdatePaymentStatusInput,
} from "../../../shared/schemas";
import { uuidSchema } from "../../../shared/schemas/common";
import { ConflictError, NotFoundError, mapSupabaseError } from "../../shared/errors";
import { unwrap } from "../../shared/utils/supabase";
import { parseInput } from "../../shared/validators";
import { createPaymentsRepository } from "./repository";

export function createPaymentsService(client: SupabaseClient<Database>) {
  const repository = createPaymentsRepository(client);

  return {
    /** Look up the single payment record attached to a reservation. */
    async getPaymentByReservation(reservationId: string): Promise<Payment | null> {
      return repository.getByReservation(parseInput(uuidSchema, reservationId));
    },

    /**
     * Create the unpaid payment record for an existing reservation.
     * Amount and currency are taken from the reservation, never from the client.
     */
    async createPaymentRecord(input: CreatePaymentRecordInput): Promise<Payment> {
      const parsed = parseInput(createPaymentRecordSchema, input);

      const reservationResult = await client
        .from("reservations")
        .select("id,total_amount,currency,status")
        .eq("id", parsed.reservationId)
        .maybeSingle();
      const reservation = unwrap(reservationResult);
      if (!reservation) {
        throw new NotFoundError("Reservation not found");
      }
      if (reservation.status === "cancelled") {
        throw new ConflictError("Cannot record a payment for a cancelled reservation");
      }

      const existing = await repository.getByReservation(parsed.reservationId);
      if (existing) {
        throw new ConflictError("A payment record already exists for this reservation");
      }

      try {
        return await repository.create({
          reservationId: parsed.reservationId,
          amount: Number(reservation.total_amount),
          currency: reservation.currency,
          method: parsed.method,
          notes: parsed.notes ?? null,
        });
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },

    async updatePaymentStatus(input: UpdatePaymentStatusInput): Promise<Payment> {
      const parsed = parseInput(updatePaymentStatusSchema, input);
      const patch: Database["public"]["Tables"]["payments"]["Update"] = {
        status: parsed.status,
      };
      if (parsed.method !== undefined) patch.method = parsed.method;
      if (parsed.notes !== undefined) patch.notes = parsed.notes;

      try {
        return await repository.update(parsed.paymentId, patch);
      } catch (error) {
        throw mapSupabaseError(error);
      }
    },
  };
}

export type PaymentsService = ReturnType<typeof createPaymentsService>;
