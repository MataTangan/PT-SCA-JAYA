import { describe, expect, it } from "vitest";
import { createPaymentsService } from "../../src/backend/modules/payments/service";
import { ConflictError, NotFoundError } from "../../src/backend/shared/errors";
import { createMockSupabase } from "../helpers/mock-supabase";

const reservationId = "40000000-0000-4000-8000-000000000001";
const paymentId = "60000000-0000-4000-8000-000000000001";

const reservation = {
  id: reservationId,
  total_amount: 900000,
  currency: "IDR",
  status: "confirmed",
};

const payment = {
  id: paymentId,
  reservation_id: reservationId,
  amount: 900000,
  currency: "IDR",
  status: "unpaid",
  method: "cash",
  paid_at: null,
  recorded_by: null,
  notes: null,
  created_at: "2026-11-05T00:00:00.000Z",
  updated_at: "2026-11-05T00:00:00.000Z",
};

describe("payments service", () => {
  it("rejects a missing reservation", async () => {
    const mock = createMockSupabase({
      tables: { reservations: { data: null, error: null } },
    });
    const service = createPaymentsService(mock.client);

    await expect(
      service.createPaymentRecord({ reservationId, method: "cash" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects payments for cancelled reservations", async () => {
    const mock = createMockSupabase({
      tables: {
        reservations: { data: { ...reservation, status: "cancelled" }, error: null },
      },
    });
    const service = createPaymentsService(mock.client);

    await expect(
      service.createPaymentRecord({ reservationId, method: "cash" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects a second payment record for the same reservation", async () => {
    const mock = createMockSupabase({
      tables: {
        reservations: { data: reservation, error: null },
        payments: { data: payment, error: null },
      },
    });
    const service = createPaymentsService(mock.client);

    await expect(
      service.createPaymentRecord({ reservationId, method: "cash" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("uses the reservation amount and currency, never client values", async () => {
    const mock = createMockSupabase({
      tables: {
        reservations: { data: reservation, error: null },
        payments: [
          { data: null, error: null },
          { data: payment, error: null },
        ],
      },
    });
    const service = createPaymentsService(mock.client);

    const created = await service.createPaymentRecord({ reservationId, method: "bank_transfer" });

    expect(created).toMatchObject({ amount: 900000, currency: "IDR", method: "cash" });
    const insert = mock
      .tableCalls("payments")[1]
      ?.operations.find((operation) => operation.method === "insert");
    expect(insert?.args[0]).toMatchObject({
      reservation_id: reservationId,
      amount: 900000,
      currency: "IDR",
      method: "bank_transfer",
      status: "unpaid",
    });
  });

  it("updates payment status and optional fields", async () => {
    const mock = createMockSupabase({
      tables: {
        payments: { data: { ...payment, status: "paid" }, error: null },
      },
    });
    const service = createPaymentsService(mock.client);

    await service.updatePaymentStatus({
      paymentId,
      status: "paid",
      method: "credit_card",
      notes: "Settled at the front desk",
    });

    const update = mock
      .tableCalls("payments")[0]
      ?.operations.find((operation) => operation.method === "update");
    expect(update?.args[0]).toEqual({
      status: "paid",
      method: "credit_card",
      notes: "Settled at the front desk",
    });
  });
});
