import { describe, expect, it } from "vitest";
import { createHousekeepingService } from "../../src/backend/modules/housekeeping/service";
import { createMockSupabase } from "../helpers/mock-supabase";

const roomId = "20000000-0000-4000-8000-000000000101";
const taskId = "80000000-0000-4000-8000-000000000101";
const userId = "22222222-2222-4222-8222-222222222202";

const task = {
  id: taskId,
  room_id: roomId,
  reservation_id: null,
  task_type: "checkout_clean",
  status: "dirty",
  assigned_to: userId,
  notes: "Deep clean",
  created_by: userId,
  started_at: null,
  completed_at: null,
  created_at: "2026-11-05T00:00:00.000Z",
  updated_at: "2026-11-05T00:00:00.000Z",
  room: null,
  assignee: null,
};

describe("housekeeping service", () => {
  it("derives created_by from the authenticated user", async () => {
    const mock = createMockSupabase({
      auth: { user: { id: userId } },
      tables: { housekeeping_tasks: { data: task, error: null } },
    });
    const service = createHousekeepingService(mock.client);

    await service.createHousekeepingTask({
      roomId,
      taskType: "deep_clean",
      notes: "Deep clean",
    });

    const insert = mock
      .tableCalls("housekeeping_tasks")[0]
      ?.operations.find((operation) => operation.method === "insert");
    expect(insert?.args[0]).toMatchObject({
      room_id: roomId,
      task_type: "deep_clean",
      status: "dirty",
      created_by: userId,
    });
  });

  it("rejects creation when unauthenticated", async () => {
    const mock = createMockSupabase({ auth: { user: null } });
    const service = createHousekeepingService(mock.client);

    await expect(service.createHousekeepingTask({ roomId })).rejects.toMatchObject({
      code: "AUTHENTICATION_ERROR",
    });
  });

  it("sends only changed fields on update", async () => {
    const mock = createMockSupabase({
      tables: { housekeeping_tasks: { data: { ...task, status: "cleaning" }, error: null } },
    });
    const service = createHousekeepingService(mock.client);

    await service.updateHousekeepingTask(taskId, { status: "cleaning" });

    const update = mock
      .tableCalls("housekeeping_tasks")[0]
      ?.operations.find((operation) => operation.method === "update");
    expect(update?.args[0]).toEqual({ status: "cleaning" });
  });
});
