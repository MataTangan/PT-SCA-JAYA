import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../shared/types/database.types";
import type { Payment } from "../../../shared/types/domain";
import { unwrapMaybe, unwrapRequired } from "../../shared/utils/supabase";

export function createPaymentsRepository(client: SupabaseClient<Database>) {
  return {
    async getByReservation(reservationId: string): Promise<Payment | null> {
      const result = await client
        .from("payments")
        .select("*")
        .eq("reservation_id", reservationId)
        .maybeSingle();
      return unwrapMaybe(result) as unknown as Payment | null;
    },

    async getById(id: string): Promise<Payment> {
      const result = await client.from("payments").select("*").eq("id", id).maybeSingle();
      return unwrapRequired(result, "Payment not found") as unknown as Payment;
    },

    async create(input: {
      reservationId: string;
      amount: number;
      currency: string;
      method: Payment["method"];
      notes?: string | null;
    }): Promise<Payment> {
      const result = await client
        .from("payments")
        .insert({
          reservation_id: input.reservationId,
          amount: input.amount,
          currency: input.currency,
          status: "unpaid",
          method: input.method,
          notes: input.notes ?? null,
        })
        .select("*")
        .single();
      return unwrapRequired(result, "Payment not found") as unknown as Payment;
    },

    async update(
      id: string,
      patch: Database["public"]["Tables"]["payments"]["Update"],
    ): Promise<Payment> {
      const result = await client.from("payments").update(patch).eq("id", id).select("*").single();
      return unwrapRequired(result, "Payment not found") as unknown as Payment;
    },
  };
}

export type PaymentsRepository = ReturnType<typeof createPaymentsRepository>;
